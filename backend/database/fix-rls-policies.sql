-- Fix RLS Policies for PDFPet
-- Run this in your Supabase SQL editor

-- First, drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can view own folders" ON folders;
DROP POLICY IF EXISTS "Users can manage own folders" ON folders;

DROP POLICY IF EXISTS "Users can view own files" ON files;
DROP POLICY IF EXISTS "Users can manage own files" ON files;

DROP POLICY IF EXISTS "Users can view own history" ON history;
DROP POLICY IF EXISTS "Users can insert own history" ON history;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Folders table policies
CREATE POLICY "Enable all operations for users on own folders" ON folders
    FOR ALL USING (auth.uid() = user_id);

-- Files table policies
CREATE POLICY "Enable all operations for users on own files" ON files
    FOR ALL USING (auth.uid() = user_id);

-- History table policies
CREATE POLICY "Enable all operations for users on own history" ON history
    FOR ALL USING (auth.uid() = user_id);

-- Summaries table policies
CREATE POLICY "Enable all operations for users on own summaries" ON summaries
    FOR ALL USING (auth.uid() = user_id);

-- Embeddings table policies
CREATE POLICY "Enable all operations for users on own embeddings" ON embeddings
    FOR ALL USING (auth.uid() = user_id);

-- Chat sessions table policies
CREATE POLICY "Enable all operations for users on own chat sessions" ON chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Chat messages table policies
CREATE POLICY "Enable all operations for users on own chat messages" ON chat_messages
    FOR ALL USING (auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = session_id));

-- Batch operations table policies
CREATE POLICY "Enable all operations for users on own batch operations" ON batch_operations
    FOR ALL USING (auth.uid() = user_id);

-- OCR results table policies
CREATE POLICY "Enable all operations for users on own OCR results" ON ocr_results
    FOR ALL USING (auth.uid() = user_id);

-- Subscriptions table policies
CREATE POLICY "Enable all operations for users on own subscriptions" ON subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to service role (for server-side operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;