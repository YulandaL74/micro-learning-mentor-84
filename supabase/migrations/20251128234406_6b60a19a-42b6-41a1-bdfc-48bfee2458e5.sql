-- Create skill assessments table to store user assessment results
CREATE TABLE public.skill_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  level TEXT NOT NULL, -- beginner, intermediate, advanced
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 1 AND confidence_score <= 5),
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, completed_at)
);

-- Enable RLS
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;

-- Users can view their own assessments
CREATE POLICY "Users can view their own assessments"
ON public.skill_assessments
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own assessments
CREATE POLICY "Users can insert their own assessments"
ON public.skill_assessments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessments
CREATE POLICY "Users can update their own assessments"
ON public.skill_assessments
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_skill_assessments_user_id ON public.skill_assessments(user_id);
CREATE INDEX idx_skill_assessments_category ON public.skill_assessments(category);
CREATE INDEX idx_skill_assessments_completed_at ON public.skill_assessments(completed_at DESC);