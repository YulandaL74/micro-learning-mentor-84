import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, CheckCircle2 } from "lucide-react";

interface LessonContentProps {
  content: any;
  scenarioText: string | null;
  onComplete: () => void;
}

export const LessonContent = ({ content, scenarioText, onComplete }: LessonContentProps) => {
  // Content is stored as JSON in the database
  const sections = Array.isArray(content?.sections) ? content.sections : [];

  return (
    <div className="space-y-6">
      {/* Lesson Introduction */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-primary">Lesson Content</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Read through the lesson material carefully. A quiz will follow to test your understanding.
        </p>
      </div>

      {scenarioText && (
        <Alert className="border-l-4 border-l-accent">
          <BookOpen className="h-5 w-5 text-accent" />
          <AlertDescription>
            <p className="font-semibold mb-2 text-accent-foreground">Real-World Scenario</p>
            <p className="text-sm text-muted-foreground">{scenarioText}</p>
          </AlertDescription>
        </Alert>
      )}

      {sections.length > 0 ? (
        <Accordion type="multiple" defaultValue={sections.map((_, i) => `section-${i}`)} className="space-y-4">
          {sections.map((section: any, index: number) => (
            <AccordionItem key={index} value={`section-${index}`} className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  {section.title && (
                    <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                {section.content && (
                  <div className="prose prose-sm max-w-none mb-4">
                    <p className="text-base text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                )}
                {section.bullets && Array.isArray(section.bullets) && section.bullets.length > 0 && (
                  <div className="mt-4 bg-muted/30 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-3 text-foreground">Key Points:</p>
                    <ul className="space-y-3">
                      {section.bullets.map((bullet: string, bulletIndex: number) => (
                        <li key={bulletIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {typeof content === 'string' ? content : 'Lesson content is being prepared.'}
          </p>
        </Card>
      )}

      {/* Clear separator before quiz button */}
      <div className="pt-6 border-t">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-accent/5 rounded-lg">
          <div>
            <p className="font-semibold text-foreground">Ready to test your knowledge?</p>
            <p className="text-sm text-muted-foreground">Complete the quiz to finish this lesson</p>
          </div>
          <Button onClick={onComplete} size="lg" className="w-full sm:w-auto">
            Continue to Quiz
            <CheckCircle2 className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
