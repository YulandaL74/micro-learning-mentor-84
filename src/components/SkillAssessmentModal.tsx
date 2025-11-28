import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

interface AssessmentQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    level: "beginner" | "intermediate" | "advanced";
  }[];
}

interface SkillAssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const assessmentQuestions: Record<string, AssessmentQuestion[]> = {
  executive_communication: [
    {
      id: "ec1",
      question: "How comfortable are you presenting to C-suite executives?",
      options: [
        { value: "1", label: "I avoid it or need significant preparation", level: "beginner" },
        { value: "2", label: "I can present but feel nervous", level: "intermediate" },
        { value: "3", label: "I'm confident and adapt my message to the audience", level: "advanced" },
      ],
    },
    {
      id: "ec2",
      question: "How do you handle difficult conversations or delivering bad news?",
      options: [
        { value: "1", label: "I struggle and often delay these conversations", level: "beginner" },
        { value: "2", label: "I can do it but find it very challenging", level: "intermediate" },
        { value: "3", label: "I handle them with empathy and clarity", level: "advanced" },
      ],
    },
    {
      id: "ec3",
      question: "How effective are you at influencing others without direct authority?",
      options: [
        { value: "1", label: "I rely on authority or struggle to persuade", level: "beginner" },
        { value: "2", label: "I can sometimes influence with the right approach", level: "intermediate" },
        { value: "3", label: "I consistently build consensus and drive action", level: "advanced" },
      ],
    },
  ],
  compliance_workflows: [
    {
      id: "cw1",
      question: "How familiar are you with regulatory frameworks in your industry?",
      options: [
        { value: "1", label: "Limited knowledge or just learning", level: "beginner" },
        { value: "2", label: "Understand basics and key requirements", level: "intermediate" },
        { value: "3", label: "Deep expertise and strategic compliance planning", level: "advanced" },
      ],
    },
    {
      id: "cw2",
      question: "How do you approach risk assessment in compliance?",
      options: [
        { value: "1", label: "React to issues as they arise", level: "beginner" },
        { value: "2", label: "Conduct periodic risk assessments", level: "intermediate" },
        { value: "3", label: "Systematic risk management integrated into strategy", level: "advanced" },
      ],
    },
    {
      id: "cw3",
      question: "How do you communicate compliance to leadership?",
      options: [
        { value: "1", label: "Detailed reports or avoid reporting", level: "beginner" },
        { value: "2", label: "Summaries with key risks highlighted", level: "intermediate" },
        { value: "3", label: "Strategic insights that enable decisions", level: "advanced" },
      ],
    },
  ],
  ai_literacy: [
    {
      id: "ai1",
      question: "How do you currently use AI tools in your work?",
      options: [
        { value: "1", label: "Rarely or never use AI tools", level: "beginner" },
        { value: "2", label: "Use basic AI tools like ChatGPT occasionally", level: "intermediate" },
        { value: "3", label: "Integrate AI strategically across workflows", level: "advanced" },
      ],
    },
    {
      id: "ai2",
      question: "How well do you understand AI limitations and risks?",
      options: [
        { value: "1", label: "Limited understanding of AI capabilities", level: "beginner" },
        { value: "2", label: "Aware of hallucinations and basic risks", level: "intermediate" },
        { value: "3", label: "Comprehensive risk management and governance", level: "advanced" },
      ],
    },
    {
      id: "ai3",
      question: "What's your approach to AI strategy in your organization?",
      options: [
        { value: "1", label: "No formal AI strategy or involvement", level: "beginner" },
        { value: "2", label: "Exploring AI use cases and pilots", level: "intermediate" },
        { value: "3", label: "Leading AI transformation and governance", level: "advanced" },
      ],
    },
  ],
};

const categoryNames: Record<string, string> = {
  executive_communication: "Executive Communication",
  compliance_workflows: "Compliance Workflows",
  ai_literacy: "AI Literacy",
};

export const SkillAssessmentModal = ({ open, onOpenChange, onComplete }: SkillAssessmentModalProps) => {
  const { toast } = useToast();
  const [currentCategory, setCurrentCategory] = useState<string>("executive_communication");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, Record<string, string>>>({
    executive_communication: {},
    compliance_workflows: {},
    ai_literacy: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const categories = Object.keys(assessmentQuestions);
  const currentCategoryIndex = categories.indexOf(currentCategory);
  const questions = assessmentQuestions[currentCategory];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = categories.reduce((acc, cat) => acc + assessmentQuestions[cat].length, 0);
  const answeredQuestions = Object.values(responses).reduce(
    (acc, catResponses) => acc + Object.keys(catResponses).length,
    0
  );
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswer = (value: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentCategory]: {
        ...prev[currentCategory],
        [currentQuestion.id]: value,
      },
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategory(categories[currentCategoryIndex + 1]);
      setCurrentQuestionIndex(0);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentCategoryIndex > 0) {
      const prevCategory = categories[currentCategoryIndex - 1];
      setCurrentCategory(prevCategory);
      setCurrentQuestionIndex(assessmentQuestions[prevCategory].length - 1);
    }
  };

  const calculateLevel = (categoryResponses: Record<string, string>): string => {
    const levels = Object.values(categoryResponses).map((value) => {
      const question = questions.find((q) => 
        q.options.some((opt) => opt.value === value)
      );
      return question?.options.find((opt) => opt.value === value)?.level || "beginner";
    });

    const levelCounts = levels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (levelCounts.advanced >= 2) return "advanced";
    if (levelCounts.intermediate >= 2) return "intermediate";
    return "beginner";
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate levels and confidence for each category
      const assessments = categories.map((category) => {
        const categoryResponses = responses[category];
        const level = calculateLevel(categoryResponses);
        const avgConfidence = Math.round(
          Object.values(categoryResponses).reduce((sum, val) => sum + parseInt(val), 0) / 
          Object.values(categoryResponses).length
        );

        return {
          user_id: user.id,
          category,
          level,
          confidence_score: avgConfidence,
          responses: categoryResponses,
        };
      });

      // Insert all assessments
      const { error } = await supabase
        .from("skill_assessments")
        .insert(assessments);

      if (error) throw error;

      setIsComplete(true);
      toast({
        title: "Assessment Complete! 🎉",
        description: "Your personalized recommendations are being updated.",
      });

      setTimeout(() => {
        onComplete();
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentResponse = responses[currentCategory]?.[currentQuestion?.id];
  const canProceed = !!currentResponse;

  if (isComplete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-success mb-4" />
            <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
            <p className="text-muted-foreground">
              Your skill profile has been updated. We're generating personalized recommendations for you.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>Skill Assessment</DialogTitle>
          </div>
          <DialogDescription>
            Help us understand your current skill level to provide better recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{categoryNames[currentCategory]}</span>
              <span className="text-muted-foreground">
                {answeredQuestions} / {totalQuestions} questions
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{currentQuestion?.question}</h3>
            
            <RadioGroup
              value={currentResponse}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentQuestion?.options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-start space-x-3 space-y-0 border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentCategoryIndex === 0 && currentQuestionIndex === 0}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : currentCategoryIndex === categories.length - 1 &&
                currentQuestionIndex === questions.length - 1 ? (
                "Complete Assessment"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
