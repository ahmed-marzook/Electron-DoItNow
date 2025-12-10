-- ===========================
-- Add assigned_to column to todos table
-- ===========================
ALTER TABLE todos
ADD COLUMN assigned_to VARCHAR(255);

-- Add comment to explain the column purpose
COMMENT ON COLUMN todos.assigned_to IS 'Username or identifier of the person assigned to this todo (can be internal user or external user)';

-- Optional: Create index for faster lookups if needed
CREATE INDEX IF NOT EXISTS idx_todos_assigned_to ON todos (assigned_to);
