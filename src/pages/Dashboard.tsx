import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap, 
  Flame, 
  Trophy, 
  BookOpen, 
  TrendingUp,
  LogOut,
  User as UserIcon,
  Sparkles,
  RefreshCw,
  Target
} from "lucide-react";
import { SkillAssessmentModal } from "@/components/SkillAssessmentModal";
import { ThemeToggle } from "@/components/ThemeToggle";

interface UserProfile {
  full_name: string | null;
  job_title: string | null;
  company: string | null;
}

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  total_lessons_completed: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
}

interface RecommendedLesson extends Lesson {
  recommendation_reason: string;
  priority: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [todayLesson, setTodayLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<RecommendedLesson[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    const initializeUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        await fetchUserData(session.user.id);
      }
      
      setIsLoading(false);
    };

    initializeUser();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, job_title, company")
        .eq("id", userId)
        .maybeSingle();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Fetch streak data
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak, total_lessons_completed")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (streakData) {
        setStreak(streakData);
      }

      // Fetch today's lesson (first published lesson)
      const { data: lessonData } = await supabase
        .from("lessons")
        .select("id, title, description, category, difficulty, duration_minutes")
        .eq("is_published", true)
        .order("order_index", { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (lessonData) {
        setTodayLesson(lessonData);
      }

      // Check if user has completed assessment
      const { data: assessmentData } = await supabase
        .from("skill_assessments")
        .select("id")
        .eq("user_id", userId)
        .limit(1);
      
      setHasCompletedAssessment((assessmentData?.length || 0) > 0);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    
    setIsLoadingRecommendations(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-lessons", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) {
        console.error("Error fetching recommendations:", error);
        toast({
          title: "Unable to load recommendations",
          description: "Please try again later.",
          variant: "destructive",
        });
        return;
      }

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        toast({
          title: "Recommendations updated",
          description: `Found ${data.recommendations.length} personalized lessons for you.`,
        });
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to load recommendations.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Fetch recommendations on mount
  useEffect(() => {
    if (user && !isLoading) {
      fetchRecommendations();
    }
  }, [user, isLoading]);

  const handleAssessmentComplete = () => {
    setHasCompletedAssessment(true);
    fetchRecommendations();
    toast({
      title: "Recommendations Updated",
      description: "Your learning path has been personalized based on your assessment.",
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Micro-Learning Mentor</h1>
              <p className="text-xs text-muted-foreground">5-minute daily lessons</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/lessons")}>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Lessons
            </Button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground">{profile?.job_title || "Professional"}</p>
            </div>
            <ThemeToggle />
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{streak?.current_streak || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                days in a row
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
              <BookOpen className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{streak?.total_lessons_completed || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                total lessons
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
              <Trophy className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{streak?.longest_streak || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                personal best
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Lesson */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Lesson</CardTitle>
                <CardDescription>5 minutes to level up your skills</CardDescription>
              </div>
              <Badge variant="secondary">Ready</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {todayLesson ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{todayLesson.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {todayLesson.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {todayLesson.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {todayLesson.difficulty.charAt(0).toUpperCase() + todayLesson.difficulty.slice(1)}
                    </span>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto" 
                    onClick={() => navigate(`/lesson/${todayLesson.id}`)}
                  >
                    Start Today's Lesson
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No lessons available yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Skill Assessment Banner */}
        {!hasCompletedAssessment && (
          <Card className="mb-8 border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Take Your Skill Assessment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete a quick 9-question assessment to get personalized lesson recommendations tailored to your current skill level and career goals.
                  </p>
                  <Button onClick={() => setShowAssessment(true)}>
                    <Target className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>AI-Powered Recommendations</CardTitle>
                </div>
                <CardDescription>
                  {hasCompletedAssessment 
                    ? "Personalized lessons based on your skill assessment and progress"
                    : "Personalized lessons based on your goals and progress"
                  }
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {hasCompletedAssessment && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAssessment(true)}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchRecommendations}
                  disabled={isLoadingRecommendations}
                >
                  {isLoadingRecommendations ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingRecommendations && recommendations.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-secondary/50 rounded w-full mb-3"></div>
                    <div className="h-8 bg-secondary rounded w-32"></div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.slice(0, 3).map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {idx === 0 && (
                            <Badge variant="default" className="text-xs">
                              Top Pick
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {lesson.category.replace(/_/g, " ")}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {lesson.difficulty}
                          </Badge>
                        </div>
                        <h4 className="font-semibold mb-2">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {lesson.description}
                        </p>
                        <p className="text-sm text-primary italic flex items-start gap-2">
                          <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{lesson.recommendation_reason}</span>
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate(`/lesson/${lesson.id}`)}
                        size="sm"
                      >
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Loading personalized recommendations...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Path */}
        <Card>
          <CardHeader>
            <CardTitle>Your Learning Path</CardTitle>
            <CardDescription>Track your progress across skill categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Executive Communication</span>
                <span className="text-sm text-muted-foreground">3/10 lessons</span>
              </div>
              <Progress value={30} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Compliance Workflows</span>
                <span className="text-sm text-muted-foreground">0/8 lessons</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">AI Literacy</span>
                <span className="text-sm text-muted-foreground">0/12 lessons</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Skill Assessment Modal */}
      <SkillAssessmentModal
        open={showAssessment}
        onOpenChange={setShowAssessment}
        onComplete={handleAssessmentComplete}
      />
    </div>
  );
};

export default Dashboard;
