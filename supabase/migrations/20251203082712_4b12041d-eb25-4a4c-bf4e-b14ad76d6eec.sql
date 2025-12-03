-- Create a view that excludes the correct_answer column
CREATE VIEW public.quiz_questions_public AS
SELECT id, lesson_id, question_text, options, explanation, order_index, created_at
FROM quiz_questions;

-- Enable RLS on the view
ALTER VIEW public.quiz_questions_public SET (security_invoker = on);

-- Grant access to the view
GRANT SELECT ON public.quiz_questions_public TO authenticated;
GRANT SELECT ON public.quiz_questions_public TO anon;