-- PDFPet Phase 2 - AI & Advanced Features Database Schema
-- Run this after the initial schema to add AI features

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

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
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
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

-- Update files table to add new columns
ALTER TABLE files ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE files ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE files ADD COLUMN IF NOT EXISTS parent_file_id UUID REFERENCES files(id) ON DELETE SET NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS extracted_text TEXT;
ALTER TABLE files ADD COLUMN IF NOT EXISTS has_ocr BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS has_summary BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS has_embeddings BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_summaries_user_file ON summaries(user_id, file_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_user_file ON embeddings(user_id, file_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat (vector vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_folders_user_parent ON folders(user_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_file ON chat_sessions(user_id, file_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_batch_operations_user_status ON batch_operations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ocr_results_user_file ON ocr_results(user_id, file_id);
CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_tags ON files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_files_extracted_text ON files USING GIN(to_tsvector('english', extracted_text));

-- Update triggers for updated_at
CREATE TRIGGER update_summaries_updated_at BEFORE UPDATE ON summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batch_operations_updated_at BEFORE UPDATE ON batch_operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for new tables

-- Summaries policies
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own summaries" ON summaries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries" ON summaries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summaries" ON summaries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own summaries" ON summaries
    FOR DELETE USING (auth.uid() = user_id);

-- Embeddings policies
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own embeddings" ON embeddings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own embeddings" ON embeddings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own embeddings" ON embeddings
    FOR DELETE USING (auth.uid() = user_id);

-- Folders policies
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own folders" ON folders
    FOR ALL USING (auth.uid() = user_id);

-- Chat sessions policies
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own chat sessions" ON chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Chat messages policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

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
ALTER TABLE batch_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own batch operations" ON batch_operations
    FOR ALL USING (auth.uid() = user_id);

-- OCR results policies
ALTER TABLE ocr_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own OCR results" ON ocr_results
    FOR ALL USING (auth.uid() = user_id);

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