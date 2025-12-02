import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Share2, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CertificateGeneratorProps {
  userName: string;
  lessonTitle: string;
  category: string;
  score: number;
  completionDate: string;
}

export const CertificateGenerator = ({
  userName,
  lessonTitle,
  category,
  score,
  completionDate,
}: CertificateGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [certificateUrl, setCertificateUrl] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    generateCertificate();
  }, [userName, lessonTitle, category, score, completionDate]);

  const generateCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 850;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#1e293b");
    gradient.addColorStop(0.5, "#334155");
    gradient.addColorStop(1, "#1e293b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 12;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Inner border
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Title
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 60px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Certificate of Completion", canvas.width / 2, 150);

    // Decorative line
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 180);
    ctx.lineTo(900, 180);
    ctx.stroke();

    // "This certifies that"
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "italic 28px Georgia, serif";
    ctx.fillText("This certifies that", canvas.width / 2, 250);

    // User name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px Georgia, serif";
    ctx.fillText(userName || "Learner", canvas.width / 2, 320);

    // User name underline
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const nameWidth = ctx.measureText(userName || "Learner").width;
    ctx.moveTo(canvas.width / 2 - nameWidth / 2 - 20, 335);
    ctx.lineTo(canvas.width / 2 + nameWidth / 2 + 20, 335);
    ctx.stroke();

    // "has successfully completed"
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "italic 28px Georgia, serif";
    ctx.fillText("has successfully completed", canvas.width / 2, 390);

    // Lesson title
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 36px Georgia, serif";
    const maxWidth = 900;
    const words = lessonTitle.split(" ");
    let line = "";
    let y = 460;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, canvas.width / 2, y);
        line = words[i] + " ";
        y += 45;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, y);

    // Category badge
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "24px Georgia, serif";
    const categoryText = category.replace(/_/g, " ").toUpperCase();
    ctx.fillText(categoryText, canvas.width / 2, y + 70);

    // Score
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 32px Georgia, serif";
    ctx.fillText(`Score: ${score}%`, canvas.width / 2, y + 120);

    // Date
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "italic 24px Georgia, serif";
    const date = new Date(completionDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    ctx.fillText(`Completed on ${date}`, canvas.width / 2, canvas.height - 120);

    // Award icon (simplified star)
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 60;
    const radius = 25;
    
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      const innerAngle = angle + Math.PI / 5;
      const innerX = centerX + Math.cos(innerAngle) * (radius * 0.4);
      const innerY = centerY + Math.sin(innerAngle) * (radius * 0.4);
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL("image/png");
    setCertificateUrl(dataUrl);
  };

  const handleDownload = () => {
    if (!certificateUrl) return;

    const link = document.createElement("a");
    const fileName = `${lessonTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_certificate.png`;
    link.download = fileName;
    link.href = certificateUrl;
    link.click();

    toast({
      title: "Certificate downloaded!",
      description: "Your achievement has been saved",
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share && certificateUrl) {
        // Convert data URL to blob for sharing
        const response = await fetch(certificateUrl);
        const blob = await response.blob();
        const file = new File([blob], "certificate.png", { type: "image/png" });

        await navigator.share({
          title: "My Learning Achievement",
          text: `I just completed "${lessonTitle}" on Micro-Learning Mentor!`,
          files: [file],
        });
      } else {
        // Fallback: copy certificate URL to clipboard
        navigator.clipboard.writeText(window.location.origin);
        toast({
          title: "Link copied!",
          description: "Share your achievement with others",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Download instead",
        description: "Use the download button to save your certificate",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Your Achievement Certificate</CardTitle>
        </div>
        <CardDescription>
          Download and share your accomplishment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden canvas for generation */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Certificate preview */}
        {certificateUrl && (
          <div className="border rounded-lg overflow-hidden bg-muted">
            <img 
              src={certificateUrl} 
              alt="Certificate" 
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Certificate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
