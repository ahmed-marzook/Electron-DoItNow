-- ===========================
-- Add user relationship to todos table
-- ===========================
ALTER TABLE todos
ADD COLUMN user_id INTEGER;

-- Add foreign key constraint
ALTER TABLE todos
ADD CONSTRAINT fk_todos_user_id
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- Index for faster user lookup on todos
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos (user_id);
