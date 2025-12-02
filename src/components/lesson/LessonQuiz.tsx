import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer?: number; // Optional - validated server-side
  explanation: string | null;
  order_index: number;
}

interface LessonQuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export const LessonQuiz = ({ questions, onComplete }: LessonQuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [serverExplanation, setServerExplanation] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || isValidating) return;
    
    setIsValidating(true);
    
    try {
      // Validate answer server-side
      const { data, error } = await supabase.functions.invoke('validate-quiz-answer', {
        body: {
          questionId: currentQuestion.id,
          selectedAnswer,
        },
      });

      if (error) {
        console.error('Error validating answer:', error);
        setIsValidating(false);
        return;
      }

      setIsCorrect(data.isCorrect);
      setServerExplanation(data.explanation);
      setShowFeedback(true);
      
      if (data.isCorrect) {
        setCorrectAnswers(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      setIsComplete(true);
      onComplete(finalScore);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setServerExplanation(null);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No quiz questions available for this lesson.</p>
        <Button onClick={() => onComplete(100)} className="mt-4">
          Complete Lesson
        </Button>
      </div>
    );
  }

  if (isComplete) {
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    return (
      <div className="text-center py-12 space-y-6">
        <div className="flex justify-center">
          <Trophy className="h-16 w-16 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
          <p className="text-muted-foreground">
            You scored {correctAnswers} out of {questions.length} ({finalScore}%)
          </p>
        </div>
        <Button onClick={() => onComplete(finalScore)} size="lg">
          Finish Lesson
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
        <span>{correctAnswers} correct</span>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">{currentQuestion.question_text}</h3>

        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(value) => !showFeedback && setSelectedAnswer(parseInt(value))}
          className="space-y-3"
          disabled={showFeedback || isValidating}
        >
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 border rounded-lg p-4 transition-all ${
                showFeedback
                  ? isCorrect && index === selectedAnswer
                    ? "border-success bg-success/5"
                    : !isCorrect && index === selectedAnswer
                    ? "border-destructive bg-destructive/5"
                    : "border-border"
                  : "border-border hover:border-primary cursor-pointer"
              }`}
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className="flex-1 cursor-pointer text-base font-normal"
              >
                {option}
              </Label>
              {showFeedback && isCorrect && index === selectedAnswer && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
              {showFeedback && !isCorrect && index === selectedAnswer && (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
          ))}
        </RadioGroup>

        {showFeedback && serverExplanation && (
          <Alert className="mt-6">
            <AlertDescription>
              <strong>Explanation:</strong> {serverExplanation}
            </AlertDescription>
          </Alert>
        )}
      </Card>

      <div className="flex justify-end gap-3">
        {!showFeedback ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null || isValidating}
            size="lg"
          >
            {isValidating ? "Validating..." : "Submit Answer"}
          </Button>
        ) : (
          <Button onClick={handleNext} size="lg">
            {isLastQuestion ? "Complete Quiz" : "Next Question"}
          </Button>
        )}
      </div>
    </div>
  );
};
