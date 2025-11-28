import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    console.log("Fetching data for user:", user.id);

    // Fetch user profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name, job_title, company")
      .eq("id", user.id)
      .maybeSingle();

    // Fetch user progress
    const { data: progress } = await supabaseClient
      .from("lesson_progress")
      .select("lesson_id, status, score, completed_at")
      .eq("user_id", user.id);

    // Fetch user streaks
    const { data: streaks } = await supabaseClient
      .from("user_streaks")
      .select("current_streak, longest_streak, total_lessons_completed")
      .eq("user_id", user.id)
      .maybeSingle();

    // Fetch user skill assessments
    const { data: assessments } = await supabaseClient
      .from("skill_assessments")
      .select("category, level, confidence_score")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    // Fetch all available lessons
    const { data: allLessons } = await supabaseClient
      .from("lessons")
      .select("id, title, description, category, difficulty, duration_minutes, order_index")
      .eq("is_published", true)
      .order("order_index", { ascending: true });

    // Get completed lesson IDs
    const completedLessonIds = progress
      ?.filter((p) => p.status === "completed")
      .map((p) => p.lesson_id) || [];

    // Get available (not completed) lessons
    const availableLessons = allLessons?.filter(
      (lesson) => !completedLessonIds.includes(lesson.id)
    ) || [];

    console.log(`User has completed ${completedLessonIds.length} lessons`);
    console.log(`${availableLessons.length} lessons available`);

    // Get most recent assessment per category
    const latestAssessments = assessments?.reduce((acc, assessment) => {
      if (!acc[assessment.category]) {
        acc[assessment.category] = assessment;
      }
      return acc;
    }, {} as Record<string, any>) || {};

    // Prepare context for AI
    const userContext = {
      profile: {
        name: profile?.full_name || "User",
        job_title: profile?.job_title || "Professional",
        company: profile?.company || "Organization",
      },
      stats: {
        current_streak: streaks?.current_streak || 0,
        total_completed: streaks?.total_lessons_completed || 0,
      },
      skill_levels: latestAssessments,
      has_assessment: Object.keys(latestAssessments).length > 0,
      completed_lessons_count: completedLessonIds.length,
      available_lessons: availableLessons.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        category: l.category,
        difficulty: l.difficulty,
        duration: l.duration_minutes,
      })),
    };

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert learning advisor for a micro-learning platform focused on professional development. Analyze the user's profile, progress, skill assessment, and available lessons to recommend 3-5 personalized lessons that would be most valuable for their career growth.

Consider:
- User's job title and role
- Skill assessment levels (if available) - match difficulty to assessed level
- Learning progress and streak (consistency matters)
- Lesson difficulty progression (gradual increase from assessed level)
- Category diversity (mix different skill areas)
- Career relevance for their role

IMPORTANT: If skill assessments are available, prioritize lessons that match or slightly exceed the assessed level for each category. For example:
- If assessed as "beginner" in a category, recommend beginner and some intermediate lessons
- If assessed as "intermediate", recommend intermediate and some advanced lessons  
- If assessed as "advanced", focus on advanced lessons in that category

Provide recommendations with clear rationale focusing on career impact and skill development.`;

    let assessmentInfo = "";
    if (userContext.has_assessment) {
      assessmentInfo = `\n\nSkill Assessment Results:
${Object.entries(latestAssessments).map(([cat, data]: [string, any]) => 
  `- ${cat.replace(/_/g, " ")}: ${data.level} (confidence: ${data.confidence_score}/3)`
).join("\n")}

CRITICAL: Use these assessment results to recommend lessons at the appropriate difficulty level for each category.`;
    }

    const userPrompt = `Analyze this user's learning profile and recommend 3-5 specific lessons from the available list:

User Profile:
- Name: ${userContext.profile.name}
- Role: ${userContext.profile.job_title}
- Company: ${userContext.profile.company}
- Current Streak: ${userContext.stats.current_streak} days
- Total Completed: ${userContext.stats.total_completed} lessons${assessmentInfo}

Available Lessons (${availableLessons.length} total):
${JSON.stringify(userContext.available_lessons, null, 2)}

Return a JSON array of 3-5 lesson recommendations. For each recommendation, include:
- lesson_id (from the available lessons)
- reason (one sentence explaining why this lesson is valuable for this user's career and current skill level)
- priority (1-5, where 1 is highest priority)

Format: [{"lesson_id": "...", "reason": "...", "priority": 1}, ...]`;

    console.log("Calling Lovable AI for recommendations...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service requires credits. Please contact support." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";

    console.log("AI response received:", aiContent.substring(0, 200));

    // Parse AI response
    let recommendations = [];
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       aiContent.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent;
      recommendations = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback: recommend first 3 available lessons
      recommendations = availableLessons.slice(0, 3).map((lesson, idx) => ({
        lesson_id: lesson.id,
        reason: "Recommended based on your current progress",
        priority: idx + 1,
      }));
    }

    // Enrich recommendations with full lesson data
    const enrichedRecommendations = recommendations
      .map((rec: any) => {
        const lesson = availableLessons.find((l) => l.id === rec.lesson_id);
        if (!lesson) return null;
        
        return {
          ...lesson,
          recommendation_reason: rec.reason,
          priority: rec.priority,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.priority - b.priority);

    console.log(`Returning ${enrichedRecommendations.length} recommendations`);

    return new Response(
      JSON.stringify({ 
        recommendations: enrichedRecommendations,
        user_context: {
          completed: completedLessonIds.length,
          available: availableLessons.length,
          streak: streaks?.current_streak || 0,
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in recommend-lessons function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        recommendations: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
