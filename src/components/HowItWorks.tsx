import { Calendar, CheckCircle, PlayCircle, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    title: "Choose Your Path",
    description: "Select from niche professional skills tailored to your career goals",
    number: "01",
  },
  {
    icon: PlayCircle,
    title: "5-Minute Daily Lesson",
    description: "Engage with scenario-based content designed for busy professionals",
    number: "02",
  },
  {
    icon: CheckCircle,
    title: "Interactive Practice",
    description: "Apply learning through quizzes and role-play simulations",
    number: "03",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Build streaks and watch your expertise grow day by day",
    number: "04",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your path to professional mastery in four simple steps
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <div 
                key={step.title}
                className="relative group animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex gap-6 items-start">
                  <div className="relative flex-shrink-0">
                    <div className="text-6xl font-bold text-primary/10 absolute -top-4 -left-2">
                      {step.number}
                    </div>
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <step.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
