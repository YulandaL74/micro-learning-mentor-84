import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Award, Download, Calendar, Target } from "lucide-react";
import { CertificateGenerator } from "@/components/lesson/CertificateGenerator";

interface CompletedLesson {
  id: string;
  lesson_id: string;
  score: number;
  completed_at: string;
  lesson: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
  };
}

const categoryLabels: Record<string, string> = {
  executive_communication: "Executive Communication",
  compliance_workflows: "Compliance Workflows",
  ai_literacy: "AI Literacy",
  leadership: "Leadership",
  negotiation: "Negotiation",
};

const Certificates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [completedLessons, setCompletedLessons] = useState<CompletedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<CompletedLesson | null>(null);

  useEffect(() => {
    fetchCompletedLessons();
  }, []);

  const fetchCompletedLessons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch user profile for name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle();

      setUserName(profileData?.full_name || profileData?.email || "Learner");

      // Fetch completed lessons with lesson details
      const { data, error } = await supabase
        .from("lesson_progress")
        .select(`
          id,
          lesson_id,
          score,
          completed_at,
          lessons:lesson_id (
            id,
            title,
            category,
            difficulty
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "completed")
        .not("score", "is", null)
        .order("completed_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformed = (data || []).map(item => ({
        id: item.id,
        lesson_id: item.lesson_id,
        score: item.score!,
        completed_at: item.completed_at!,
        lesson: Array.isArray(item.lessons) ? item.lessons[0] : item.lessons,
      })).filter(item => item.lesson);

      setCompletedLessons(transformed);
    } catch (error: any) {
      console.error("Error fetching completed lessons:", error);
      toast({
        title: "Error",
        description: "Failed to load certificates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-success/10 text-success border-success/20";
      case "intermediate":
        return "bg-warning/10 text-warning border-warning/20";
      case "advanced":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "executive_communication":
        return "bg-primary/10 text-primary border-primary/20";
      case "compliance_workflows":
        return "bg-accent/10 text-accent border-accent/20";
      case "ai_literacy":
        return "bg-secondary/10 text-secondary-foreground border-secondary/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">My Certificates</h1>
                  <p className="text-xs text-muted-foreground">
                    {completedLessons.length} certificate{completedLessons.length !== 1 ? 's' : ''} earned
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {selectedLesson ? (
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setSelectedLesson(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Certificates
            </Button>
            <CertificateGenerator
              userName={userName}
              lessonTitle={selectedLesson.lesson.title}
              category={selectedLesson.lesson.category}
              score={selectedLesson.score}
              completionDate={selectedLesson.completed_at}
            />
          </div>
        ) : completedLessons.length === 0 ? (
          <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                  <Award className="w-10 h-10 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">No Certificates Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Complete lessons to earn certificates and showcase your achievements
                </p>
                <Button onClick={() => navigate("/lessons")}>
                  Browse Lessons
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedLessons.map((completed) => (
              <Card 
                key={completed.id} 
                className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedLesson(completed)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className={getCategoryColor(completed.lesson.category)}>
                      {categoryLabels[completed.lesson.category] || completed.lesson.category}
                    </Badge>
                    <Badge variant="outline" className={getDifficultyColor(completed.lesson.difficulty)}>
                      {completed.lesson.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {completed.lesson.title}
                  </CardTitle>
                  <CardDescription className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4" />
                      Score: {completed.score}%
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(completed.completed_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-end">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLesson(completed);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    View Certificate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Certificates;
