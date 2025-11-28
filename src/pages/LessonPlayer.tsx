import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonQuiz } from "@/components/lesson/LessonQuiz";

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: any;
  category: string;
  difficulty: string;
  duration_minutes: number;
  scenario_text: string | null;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  order_index: number;
}

const LessonPlayer = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState<'content' | 'quiz'>('content');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);

      // Fetch quiz questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("order_index");

      if (questionsError) throw questionsError;
      
      // Transform the data to match our interface
      const transformedQuestions: QuizQuestion[] = (questionsData || []).map(q => ({
        id: q.id,
        question_text: q.question_text,
        options: (Array.isArray(q.options) ? q.options : []) as string[],
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        order_index: q.order_index,
      }));
      
      setQuestions(transformedQuestions);

      // Update or create progress entry
      const { error: progressError } = await supabase
        .from("lesson_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId!,
          status: "in_progress",
          last_accessed_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,lesson_id"
        });

      if (progressError) throw progressError;

    } catch (error: any) {
      console.error("Error fetching lesson:", error);
      toast({
        title: "Error",
        description: "Failed to load lesson",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentComplete = () => {
    if (questions.length > 0) {
      setCurrentStep('quiz');
    } else {
      handleLessonComplete(100);
    }
  };

  const handleQuizComplete = async (score: number) => {
    await handleLessonComplete(score);
  };

  const handleLessonComplete = async (score: number) => {
    if (isSaving) return; // Prevent duplicate submissions
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Update lesson progress
      const { error: progressError } = await supabase
        .from("lesson_progress")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          score: score,
          time_spent_seconds: timeSpent,
        })
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);

      if (progressError) {
        console.error("Progress update error:", progressError);
        throw progressError;
      }

      // Update streak data
      const today = new Date().toISOString().split('T')[0];
      const { data: streakData, error: streakFetchError } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (streakFetchError) {
        console.error("Streak fetch error:", streakFetchError);
        throw streakFetchError;
      }

      if (streakData) {
        const lastActivityDate = streakData.last_activity_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = streakData.current_streak;
        
        // Only update streak if this is a new day
        if (lastActivityDate === yesterdayStr) {
          // Consecutive day - increment streak
          newStreak += 1;
        } else if (lastActivityDate !== today) {
          // Missed a day - reset streak
          newStreak = 1;
        }
        // If lastActivityDate === today, keep current streak (same day completion)

        const longestStreak = Math.max(newStreak, streakData.longest_streak);

        const { error: streakUpdateError } = await supabase
          .from("user_streaks")
          .update({
            current_streak: newStreak,
            longest_streak: longestStreak,
            total_lessons_completed: streakData.total_lessons_completed + 1,
            last_activity_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (streakUpdateError) {
          console.error("Streak update error:", streakUpdateError);
          throw streakUpdateError;
        }
      }

      // Show success message with streak info
      const message = streakData && streakData.last_activity_date !== today
        ? `You scored ${score}%. Streak: ${streakData.current_streak + 1} days! 🔥`
        : `You scored ${score}%. Great work!`;

      toast({
        title: "Lesson Complete! 🎉",
        description: message,
      });

      // Small delay to let the user see the completion message
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("Error completing lesson:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save progress. Please try again.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Lesson not found</p>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{lesson.category.replace('_', ' ')}</Badge>
              <Badge variant="outline">{lesson.difficulty}</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-2">
          <Progress value={currentStep === 'content' ? 50 : 100} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                <CardDescription className="text-base">{lesson.description}</CardDescription>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                <Clock className="h-4 w-4" />
                {lesson.duration_minutes} min
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isSaving ? (
              <div className="text-center py-12 space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <p className="text-muted-foreground">Saving your progress...</p>
              </div>
            ) : currentStep === 'content' ? (
              <LessonContent
                content={lesson.content}
                scenarioText={lesson.scenario_text}
                onComplete={handleContentComplete}
              />
            ) : (
              <LessonQuiz
                questions={questions}
                onComplete={handleQuizComplete}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LessonPlayer;
