import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, MessageSquare, Shield, TrendingUp, Users } from "lucide-react";

const skills = [
  {
    icon: Shield,
    title: "Compliance Workflows",
    description: "Navigate regulatory requirements with confidence",
    lessons: 24,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: MessageSquare,
    title: "Executive Communication",
    description: "Present ideas clearly to senior leadership",
    lessons: 18,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Brain,
    title: "AI Literacy",
    description: "Understand and leverage AI in your workflow",
    lessons: 32,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: TrendingUp,
    title: "Data Storytelling",
    description: "Turn analytics into compelling narratives",
    lessons: 21,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Users,
    title: "Team Leadership",
    description: "Build and motivate high-performing teams",
    lessons: 27,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: BookOpen,
    title: "Strategic Planning",
    description: "Develop actionable business strategies",
    lessons: 19,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

export const SkillsGrid = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Niche Skills, <span className="text-primary">Real Impact</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our curated collection of professional development paths
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {skills.map((skill, index) => (
            <Card 
              key={skill.title} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${skill.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <skill.icon className={`w-6 h-6 ${skill.color}`} />
                  </div>
                  <Badge variant="secondary" className="font-medium">
                    {skill.lessons} lessons
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {skill.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {skill.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 group-hover:w-full" 
                    style={{ width: '0%' }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
