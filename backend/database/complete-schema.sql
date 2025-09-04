-- PDFPet Complete Database Schema (Phase 1 + Phase 2)
-- Run this in your Supabase SQL editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folders table for file organization
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for folder
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table (enhanced with Phase 2 features)
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    version INTEGER DEFAULT 1,
    parent_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    extracted_text TEXT,
    has_ocr BOOLEAN DEFAULT FALSE,
    has_summary BOOLEAN DEFAULT FALSE,
    has_embeddings BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- History table (for tracking user operations)
CREATE TABLE IF NOT EXISTS history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('upload', 'merge', 'split', 'compress', 'convert', 'download', 'delete', 'ocr', 'summarize')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Summaries table for AI-generated summaries
CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    summary_type VARCHAR(50) DEFAULT 'auto' CHECK (summary_type IN ('auto', 'brief', 'detailed')),
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Embeddings table for PDF chat functionality
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    vector vector(1536), -- OpenAI embedding dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions table for PDF conversations
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'PDF Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batch operations table for queue management
CREATE TABLE IF NOT EXISTS batch_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    operations JSONB NOT NULL, -- Array of operations to perform
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0, -- 0-100
    result_files JSONB DEFAULT '[]', -- Array of resulting file IDs
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OCR results table
CREATE TABLE IF NOT EXISTS ocr_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    extracted_text TEXT NOT NULL,
    confidence_score DECIMAL(5,4), -- OCR confidence 0-1
    language VARCHAR(10) DEFAULT 'eng',
    page_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table (for future use)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_folders_user_parent ON folders(user_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_name ON folders(name);

CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);
CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_tags ON files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_files_extracted_text ON files USING GIN(to_tsvector('english', extracted_text));

CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_action ON history(action);

CREATE INDEX IF NOT EXISTS idx_summaries_user_file ON summaries(user_id, file_id);
CREATE INDEX IF NOT EXISTS idx_summaries_type ON summaries(summary_type);

CREATE INDEX IF NOT EXISTS idx_embeddings_user_file ON embeddings(user_id, file_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat (vector vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_file ON chat_sessions(user_id, file_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

CREATE INDEX IF NOT EXISTS idx_batch_operations_user_status ON batch_operations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_batch_operations_created_at ON batch_operations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ocr_results_user_file ON ocr_results(user_id, file_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_summaries_updated_at BEFORE UPDATE ON summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batch_operations_updated_at BEFORE UPDATE ON batch_operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

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

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Folders policies
CREATE POLICY "Users can manage own folders" ON folders
    FOR ALL USING (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can view own files" ON files
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files" ON files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files" ON files
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON files
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all files" ON files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- History policies
CREATE POLICY "Users can view own history" ON history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all history" ON history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Summaries policies
CREATE POLICY "Users can view own summaries" ON summaries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries" ON summaries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summaries" ON summaries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own summaries" ON summaries
    FOR DELETE USING (auth.uid() = user_id);

-- Embeddings policies
CREATE POLICY "Users can view own embeddings" ON embeddings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own embeddings" ON embeddings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own embeddings" ON embeddings
    FOR DELETE USING (auth.uid() = user_id);

-- Chat sessions policies
CREATE POLICY "Users can manage own chat sessions" ON chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view own chat messages" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE id = chat_messages.session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE id = chat_messages.session_id AND user_id = auth.uid()
        )
    );

-- Batch operations policies
CREATE POLICY "Users can manage own batch operations" ON batch_operations
    FOR ALL USING (auth.uid() = user_id);

-- OCR results policies
CREATE POLICY "Users can manage own OCR results" ON ocr_results
    FOR ALL USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to search files by text content
CREATE OR REPLACE FUNCTION search_files_by_content(
    search_query TEXT,
    user_uuid UUID
)
RETURNS TABLE (
    file_id UUID,
    filename TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.filename,
        ts_rank(to_tsvector('english', f.extracted_text), plainto_tsquery('english', search_query)) as rank
    FROM files f
    WHERE f.user_id = user_uuid
    AND f.extracted_text IS NOT NULL
    AND to_tsvector('english', f.extracted_text) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find similar documents using embeddings
CREATE OR REPLACE FUNCTION find_similar_documents(
    query_vector vector(1536),
    user_uuid UUID,
    similarity_threshold FLOAT DEFAULT 0.7,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    file_id UUID,
    chunk_text TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.file_id,
        e.chunk_text,
        1 - (e.vector <=> query_vector) as similarity
    FROM embeddings e
    WHERE e.user_id = user_uuid
    AND 1 - (e.vector <=> query_vector) > similarity_threshold
    ORDER BY e.vector <=> query_vector
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin user function (run this after creating your first user)
-- Replace 'your-email@example.com' with your actual email
/*
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
*/