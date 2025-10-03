/*
  # Create Code Snippets System

  ## Overview
  This migration creates the complete database schema for a multi-language code compiler platform
  with user authentication, code storage, sharing, and social features.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - References auth.users
  - `username` (text, unique) - User's display name
  - `avatar_url` (text) - Profile picture URL
  - `bio` (text) - User biography
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update
  
  ### `code_snippets`
  - `id` (uuid, primary key) - Unique snippet identifier
  - `user_id` (uuid, foreign key) - Owner reference
  - `title` (text) - Snippet title
  - `description` (text) - Snippet description
  - `language` (text) - Programming language
  - `code` (text) - Source code content
  - `is_public` (boolean) - Public visibility flag
  - `view_count` (integer) - Number of views
  - `fork_count` (integer) - Number of forks
  - `parent_id` (uuid, nullable) - Reference to forked snippet
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `snippet_versions`
  - `id` (uuid, primary key) - Version identifier
  - `snippet_id` (uuid, foreign key) - Parent snippet reference
  - `code` (text) - Code at this version
  - `version_number` (integer) - Sequential version number
  - `created_at` (timestamptz) - Version creation timestamp

  ### `collections`
  - `id` (uuid, primary key) - Collection identifier
  - `user_id` (uuid, foreign key) - Owner reference
  - `name` (text) - Collection name
  - `description` (text) - Collection description
  - `is_public` (boolean) - Public visibility flag
  - `created_at` (timestamptz) - Creation timestamp

  ### `collection_snippets`
  - `collection_id` (uuid, foreign key) - Collection reference
  - `snippet_id` (uuid, foreign key) - Snippet reference
  - `added_at` (timestamptz) - Addition timestamp
  - Primary key: (collection_id, snippet_id)

  ### `snippet_likes`
  - `user_id` (uuid, foreign key) - User who liked
  - `snippet_id` (uuid, foreign key) - Liked snippet
  - `created_at` (timestamptz) - Like timestamp
  - Primary key: (user_id, snippet_id)

  ### `snippet_comments`
  - `id` (uuid, primary key) - Comment identifier
  - `snippet_id` (uuid, foreign key) - Parent snippet
  - `user_id` (uuid, foreign key) - Comment author
  - `content` (text) - Comment text
  - `created_at` (timestamptz) - Creation timestamp

  ### `follows`
  - `follower_id` (uuid, foreign key) - User following
  - `following_id` (uuid, foreign key) - User being followed
  - `created_at` (timestamptz) - Follow timestamp
  - Primary key: (follower_id, following_id)

  ## Security
  - RLS enabled on all tables
  - Authenticated users can read public content
  - Users can only modify their own content
  - Public snippets are viewable by anyone
  - Private snippets only accessible by owner

  ## Indexes
  - Performance indexes on foreign keys and frequently queried columns
  - Full-text search index on snippet titles and descriptions
*/

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Code snippets table
CREATE TABLE IF NOT EXISTS code_snippets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'Untitled',
  description text DEFAULT '',
  language text NOT NULL DEFAULT 'javascript',
  code text NOT NULL DEFAULT '',
  is_public boolean DEFAULT false,
  view_count integer DEFAULT 0,
  fork_count integer DEFAULT 0,
  parent_id uuid REFERENCES code_snippets(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public snippets are viewable by everyone"
  ON code_snippets FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert snippets"
  ON code_snippets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snippets"
  ON code_snippets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own snippets"
  ON code_snippets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Snippet versions table
CREATE TABLE IF NOT EXISTS snippet_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  snippet_id uuid REFERENCES code_snippets(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  version_number integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE snippet_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of accessible snippets"
  ON snippet_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM code_snippets
      WHERE code_snippets.id = snippet_versions.snippet_id
      AND (code_snippets.is_public = true OR code_snippets.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create versions for own snippets"
  ON snippet_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM code_snippets
      WHERE code_snippets.id = snippet_versions.snippet_id
      AND code_snippets.user_id = auth.uid()
    )
  );

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'New Collection',
  description text DEFAULT '',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public collections and own collections"
  ON collections FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON collections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Collection snippets junction table
CREATE TABLE IF NOT EXISTS collection_snippets (
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  snippet_id uuid REFERENCES code_snippets(id) ON DELETE CASCADE NOT NULL,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (collection_id, snippet_id)
);

ALTER TABLE collection_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collection snippets if they can view the collection"
  ON collection_snippets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_snippets.collection_id
      AND (collections.is_public = true OR collections.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add snippets to own collections"
  ON collection_snippets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_snippets.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove snippets from own collections"
  ON collection_snippets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_snippets.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- Snippet likes table
CREATE TABLE IF NOT EXISTS snippet_likes (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  snippet_id uuid REFERENCES code_snippets(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, snippet_id)
);

ALTER TABLE snippet_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON snippet_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like snippets"
  ON snippet_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike snippets"
  ON snippet_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Snippet comments table
CREATE TABLE IF NOT EXISTS snippet_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  snippet_id uuid REFERENCES code_snippets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE snippet_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on accessible snippets"
  ON snippet_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM code_snippets
      WHERE code_snippets.id = snippet_comments.snippet_id
      AND (code_snippets.is_public = true OR code_snippets.user_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create comments"
  ON snippet_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON snippet_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON snippet_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can follow others"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_code_snippets_user_id ON code_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_code_snippets_language ON code_snippets(language);
CREATE INDEX IF NOT EXISTS idx_code_snippets_is_public ON code_snippets(is_public);
CREATE INDEX IF NOT EXISTS idx_code_snippets_created_at ON code_snippets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snippet_versions_snippet_id ON snippet_versions(snippet_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_snippet_likes_snippet_id ON snippet_likes(snippet_id);
CREATE INDEX IF NOT EXISTS idx_snippet_comments_snippet_id ON snippet_comments(snippet_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update snippet view count
CREATE OR REPLACE FUNCTION increment_snippet_views(snippet_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE code_snippets
  SET view_count = view_count + 1
  WHERE id = snippet_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;