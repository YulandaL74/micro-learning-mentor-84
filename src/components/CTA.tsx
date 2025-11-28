import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent overflow-hidden shadow-2xl animate-fade-in">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">Start Your Journey</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
                Ready to Level Up Your Skills?
              </h2>
              
              <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who are mastering new skills, 5 minutes at a time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="group text-lg px-8 shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
                >
                  View Demo Lesson
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
