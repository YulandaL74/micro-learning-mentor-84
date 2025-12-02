import { Code2, Database, Brain, Cloud, Github, Terminal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const techStack = [
  {
    icon: Code2,
    title: "Frontend Stack",
    items: ["React 18", "TypeScript", "Tailwind CSS", "Vite"],
    color: "text-primary"
  },
  {
    icon: Database,
    title: "Backend & Data",
    items: ["Lovable Cloud", "PostgreSQL", "Real-time Sync", "Row Level Security"],
    color: "text-blue-500"
  },
  {
    icon: Brain,
    title: "AI Integration",
    items: ["AI Recommendations", "Copilot Assistance", "Galaxy AI Anthropic", "Smart Personalization"],
    color: "text-purple-500"
  },
  {
    icon: Github,
    title: "Version Control",
    items: ["GitHub Integration", "Bidirectional Sync", "Code Management", "Collaborative Workflow"],
    color: "text-orange-500"
  },
  {
    icon: Cloud,
    title: "Cloud Services",
    items: ["Serverless Functions", "Authentication", "File Storage", "Auto-scaling"],
    color: "text-green-500"
  },
  {
    icon: Terminal,
    title: "Developer Tools",
    items: ["PowerShell Automation", "CI/CD Pipeline", "ESLint", "Modern Tooling"],
    color: "text-cyan-500"
  }
];

export const TechStack = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Technical Stack & Features
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A showcase of modern web development technologies and best practices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-background ${tech.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-3">{tech.title}</h3>
                      <ul className="space-y-2">
                        {tech.items.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="inline-block border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">Built to demonstrate</p>
              <h3 className="text-xl font-semibold mb-3">Full-Stack Development Expertise</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {["React Patterns", "TypeScript", "Cloud Architecture", "AI Integration", "DevOps", "UX Design"].map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
