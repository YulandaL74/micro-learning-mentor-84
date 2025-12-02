import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookmarkButtonProps {
  lessonId: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
}

export const BookmarkButton = ({ lessonId, size = "sm", variant = "ghost" }: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkBookmarkStatus();
  }, [lessonId]);

  const checkBookmarkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("lesson_bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (error) throw error;
      setIsBookmarked(!!data);
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  const toggleBookmark = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to bookmark lessons",
          variant: "destructive",
        });
        return;
      }

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from("lesson_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId);

        if (error) throw error;
        
        setIsBookmarked(false);
        toast({
          title: "Bookmark removed",
          description: "Lesson removed from your bookmarks",
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from("lesson_bookmarks")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
          });

        if (error) throw error;
        
        setIsBookmarked(true);
        toast({
          title: "Lesson bookmarked",
          description: "Added to your bookmarks for later",
        });
      }
    } catch (error: any) {
      console.error("Error toggling bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleBookmark}
      disabled={isLoading}
      className="gap-2"
    >
      <Bookmark 
        className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
      />
      {size !== "icon" && (isBookmarked ? "Bookmarked" : "Bookmark")}
    </Button>
  );
};
