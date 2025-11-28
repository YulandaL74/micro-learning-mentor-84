import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container px-4 py-20 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-secondary/50 backdrop-blur-sm border border-border">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">5-Minute Daily Lessons</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent leading-tight">
            Master Professional Skills
            <br />
            <span className="text-foreground">In Just 5 Minutes</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Bite-sized, scenario-based lessons tailored for busy professionals. 
            Upskill without the time commitment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth">
              <Button size="lg" className="group text-lg px-8 shadow-lg hover:shadow-xl transition-all">
                Start Learning Today
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">5-Min Lessons</h3>
              <p className="text-sm text-muted-foreground">Quick daily sessions that fit your schedule</p>
            </div>
            
            <div className="flex flex-col items-center gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Target className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Scenario-Based</h3>
              <p className="text-sm text-muted-foreground">Real-world situations you'll actually face</p>
            </div>
            
            <div className="flex flex-col items-center gap-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                <Zap className="w-7 h-7 text-success" />
              </div>
              <h3 className="font-semibold text-lg">Interactive</h3>
              <p className="text-sm text-muted-foreground">Quizzes and role-play simulations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
