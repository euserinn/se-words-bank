-- 프로필 테이블 (사용자 정보)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- 그룹 테이블 (단어 그룹)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "groups_select_own" ON public.groups;
DROP POLICY IF EXISTS "groups_insert_own" ON public.groups;
DROP POLICY IF EXISTS "groups_update_own" ON public.groups;
DROP POLICY IF EXISTS "groups_delete_own" ON public.groups;

CREATE POLICY "groups_select_own" ON public.groups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "groups_insert_own" ON public.groups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "groups_update_own" ON public.groups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "groups_delete_own" ON public.groups FOR DELETE USING (auth.uid() = user_id);

-- 단어 테이블
CREATE TABLE IF NOT EXISTS public.words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "words_select_own" ON public.words;
DROP POLICY IF EXISTS "words_insert_own" ON public.words;
DROP POLICY IF EXISTS "words_update_own" ON public.words;
DROP POLICY IF EXISTS "words_delete_own" ON public.words;

CREATE POLICY "words_select_own" ON public.words FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "words_insert_own" ON public.words FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "words_update_own" ON public.words FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "words_delete_own" ON public.words FOR DELETE USING (auth.uid() = user_id);

-- 회원가입시 자동 프로필 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  -- 기본 그룹 생성
  INSERT INTO public.groups (user_id, name)
  VALUES 
    (NEW.id, '업무용어'),
    (NEW.id, '생활용어');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
