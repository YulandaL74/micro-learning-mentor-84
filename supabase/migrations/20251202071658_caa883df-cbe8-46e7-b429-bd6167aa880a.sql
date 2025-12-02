-- Create lesson_bookmarks table
CREATE TABLE public.lesson_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE public.lesson_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.lesson_bookmarks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
ON public.lesson_bookmarks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.lesson_bookmarks
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_lesson_bookmarks_user_id ON public.lesson_bookmarks(user_id);
CREATE INDEX idx_lesson_bookmarks_lesson_id ON public.lesson_bookmarks(lesson_id);