-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'teacher');

-- Create enum for quiz difficulty
CREATE TYPE public.quiz_difficulty AS ENUM ('easy', 'medium', 'hard');

-- Create enum for language support
CREATE TYPE public.supported_language AS ENUM ('english', 'hindi', 'tamil', 'telugu');

-- Create user_roles table (critical for security - roles stored separately)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    department TEXT,
    class_name TEXT,
    subjects TEXT[],
    bio TEXT,
    contact_info TEXT,
    preferred_language supported_language DEFAULT 'english',
    points INTEGER DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study materials table
CREATE TABLE public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    file_url TEXT,
    file_type TEXT,
    content TEXT,
    is_video BOOLEAN DEFAULT false,
    is_interactive BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic TEXT,
    difficulty quiz_difficulty DEFAULT 'medium',
    min_questions INTEGER DEFAULT 5,
    max_questions INTEGER DEFAULT 20,
    is_ai_generated BOOLEAN DEFAULT false,
    is_adaptive BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice',
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty quiz_difficulty DEFAULT 'medium',
    topic TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz attempts table
CREATE TABLE public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    answers JSONB,
    weak_topics TEXT[],
    time_taken INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat conversations table
CREATE TABLE public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    language supported_language DEFAULT 'english',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    response_type TEXT DEFAULT 'short',
    has_images BOOLEAN DEFAULT false,
    image_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning recommendations table
CREATE TABLE public.learning_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recommendation_type TEXT NOT NULL,
    content JSONB NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaderboard view
CREATE TABLE public.leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_points INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    average_score NUMERIC(5,2) DEFAULT 0,
    rank INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role on signup"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for subjects
CREATE POLICY "Subjects are viewable by all authenticated users"
ON public.subjects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Teachers can create subjects"
ON public.subjects FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can update subjects"
ON public.subjects FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for materials
CREATE POLICY "Materials are viewable by all authenticated users"
ON public.materials FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Teachers can create materials"
ON public.materials FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can update their materials"
ON public.materials FOR UPDATE
TO authenticated
USING (created_by = auth.uid() AND public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can delete their materials"
ON public.materials FOR DELETE
TO authenticated
USING (created_by = auth.uid() AND public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for quizzes
CREATE POLICY "Quizzes are viewable by all authenticated users"
ON public.quizzes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Teachers can create quizzes"
ON public.quizzes FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Students can create AI quizzes for themselves"
ON public.quizzes FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'student') AND is_ai_generated = true AND created_by = auth.uid());

CREATE POLICY "Teachers can update their quizzes"
ON public.quizzes FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Teachers can delete their quizzes"
ON public.quizzes FOR DELETE
TO authenticated
USING (created_by = auth.uid() AND public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for quiz_questions
CREATE POLICY "Quiz questions are viewable by all authenticated users"
ON public.quiz_questions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Teachers can manage quiz questions"
ON public.quiz_questions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q 
    WHERE q.id = quiz_id AND q.created_by = auth.uid()
  )
);

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own attempts"
ON public.quiz_attempts FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Users can create their own attempts"
ON public.quiz_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts"
ON public.quiz_attempts FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view their own conversations"
ON public.chat_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.chat_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.chat_conversations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.chat_conversations FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their conversations"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations c 
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their conversations"
ON public.chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations c 
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  )
);

-- RLS Policies for learning_recommendations
CREATE POLICY "Users can view their own recommendations"
ON public.learning_recommendations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations"
ON public.learning_recommendations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their recommendations"
ON public.learning_recommendations FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for leaderboard
CREATE POLICY "Leaderboard is viewable by all authenticated users"
ON public.leaderboard_entries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own leaderboard entry"
ON public.leaderboard_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard"
ON public.leaderboard_entries FOR UPDATE
USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
    BEFORE UPDATE ON public.materials
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at
    BEFORE UPDATE ON public.leaderboard_entries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
    RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();