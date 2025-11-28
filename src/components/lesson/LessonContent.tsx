import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, CheckCircle2 } from "lucide-react";

interface LessonContentProps {
  content: any;
  scenarioText: string | null;
  onComplete: () => void;
}

export const LessonContent = ({ content, scenarioText, onComplete }: LessonContentProps) => {
  // Content is stored as JSON in the database
  // For now, we'll display it as structured sections
  const sections = Array.isArray(content?.sections) ? content.sections : [];

  return (
    <div className="space-y-6">
      {scenarioText && (
        <Alert>
          <BookOpen className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Scenario:</strong> {scenarioText}
          </AlertDescription>
        </Alert>
      )}

      {sections.length > 0 ? (
        sections.map((section: any, index: number) => (
          <Card key={index} className="p-6">
            {section.title && (
              <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
            )}
            {section.content && (
              <div className="prose prose-sm max-w-none text-foreground">
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            )}
            {section.bullets && Array.isArray(section.bullets) && (
              <ul className="space-y-2 mt-4">
                {section.bullets.map((bullet: string, bulletIndex: number) => (
                  <li key={bulletIndex} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))
      ) : (
        <Card className="p-6">
          <div className="prose prose-sm max-w-none text-foreground">
            <p className="text-muted-foreground leading-relaxed">
              {typeof content === 'string' ? content : 'Lesson content will appear here.'}
            </p>
          </div>
        </Card>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={onComplete} size="lg">
          Continue to Quiz
          <CheckCircle2 className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
