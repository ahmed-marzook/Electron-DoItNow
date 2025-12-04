--liquibase formatted sql

--changeset system:001-create-todo-table
--comment: Initial schema - Create todos table with indexes

CREATE TABLE
    IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        entity_id SERIAL NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        priority TEXT DEFAULT 'medium',
        due_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW (),
        updated_at TIMESTAMPTZ DEFAULT NOW ()
    );

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date) WHERE due_date IS NOT NULL;

--rollback DROP TABLE IF EXISTS todos CASCADE;
