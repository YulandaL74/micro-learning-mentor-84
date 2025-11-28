import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap, 
  Search, 
  Filter,
  Clock,
  TrendingUp,
  BookOpen,
  ArrowLeft
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  order_index: number;
}

const categoryLabels: Record<string, string> = {
  executive_communication: "Executive Communication",
  compliance_workflows: "Compliance Workflows",
  ai_literacy: "AI Literacy",
};

const difficultyOrder: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const LessonsLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("order");

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    filterAndSortLessons();
  }, [lessons, searchQuery, selectedCategory, sortBy]);

  const fetchLessons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, description, category, difficulty, duration_minutes, order_index")
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error: any) {
      console.error("Error fetching lessons:", error);
      toast({
        title: "Error",
        description: "Failed to load lessons",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortLessons = () => {
    let filtered = [...lessons];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(query) ||
          lesson.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((lesson) => lesson.category === selectedCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case "difficulty-asc":
        filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case "difficulty-desc":
        filtered.sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
        break;
      case "duration-asc":
        filtered.sort((a, b) => a.duration_minutes - b.duration_minutes);
        break;
      case "duration-desc":
        filtered.sort((a, b) => b.duration_minutes - a.duration_minutes);
        break;
      case "order":
      default:
        filtered.sort((a, b) => a.order_index - b.order_index);
        break;
    }

    setFilteredLessons(filtered);
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
                Back
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Lessons Library</h1>
                  <p className="text-xs text-muted-foreground">{filteredLessons.length} lessons available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="executive_communication">Executive Communication</SelectItem>
                <SelectItem value="compliance_workflows">Compliance Workflows</SelectItem>
                <SelectItem value="ai_literacy">AI Literacy</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order">Default Order</SelectItem>
                <SelectItem value="difficulty-asc">Difficulty: Easy First</SelectItem>
                <SelectItem value="difficulty-desc">Difficulty: Hard First</SelectItem>
                <SelectItem value="duration-asc">Duration: Shortest First</SelectItem>
                <SelectItem value="duration-desc">Duration: Longest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lessons Grid */}
        {filteredLessons.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "all"
                  ? "No lessons match your filters. Try adjusting your search."
                  : "No lessons available yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <Card key={lesson.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className={getCategoryColor(lesson.category)}>
                      {categoryLabels[lesson.category] || lesson.category}
                    </Badge>
                    <Badge variant="outline" className={getDifficultyColor(lesson.difficulty)}>
                      {lesson.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{lesson.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{lesson.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {lesson.duration_minutes} min
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                  >
                    Start Lesson
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LessonsLibrary;
