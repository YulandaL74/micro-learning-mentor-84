import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Linkedin, Twitter, Facebook } from "lucide-react";

interface SocialShareProps {
  lessonTitle: string;
  score?: number;
  category: string;
}

export const SocialShare = ({ lessonTitle, score, category }: SocialShareProps) => {
  const appUrl = window.location.origin;
  const shareText = score 
    ? `Just completed "${lessonTitle}" with a score of ${score}% on Micro-Learning Mentor! 🎓✨`
    : `Currently learning: "${lessonTitle}" on Micro-Learning Mentor! 📚`;
  
  const hashtags = ["MicroLearning", "ProfessionalDevelopment", category.replace(/_/g, '')];

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&hashtags=${hashtags.join(',')}&url=${encodeURIComponent(appUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText)}`,
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Share Your Progress</CardTitle>
        </div>
        <CardDescription>
          Inspire others by sharing your learning journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('twitter')}
            className="flex items-center gap-2"
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('linkedin')}
            className="flex items-center gap-2"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('facebook')}
            className="flex items-center gap-2"
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
