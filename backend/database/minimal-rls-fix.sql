-- Minimal RLS fix - drop all policies and recreate clean ones
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable all operations for users on own files" ON files;
DROP POLICY IF EXISTS "Enable all operations for users on own folders" ON folders;
DROP POLICY IF EXISTS "Enable all operations for users on own history" ON history;

-- Disable RLS temporarily to clear any circular references
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE history DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Create minimal policies
CREATE POLICY "users_policy" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "files_policy" ON files FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "folders_policy" ON folders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "history_policy" ON history FOR ALL USING (auth.uid() = user_id);