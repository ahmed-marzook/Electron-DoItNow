import type { Todo } from '@shared/types/todo.types'
import type { User } from '@shared/types/user.types'
import { TodoItem } from './TodoItem'
import { EmptyState } from './EmptyState'

interface TodoListProps {
  todos: Todo[]
  users: User[]
  onToggleComplete: (todo: Todo) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: number) => void
}

export function TodoList({ todos, users, onToggleComplete, onEdit, onDelete }: TodoListProps) {
  const getUserName = (userId: number | null) => {
    if (!userId) return null
    const user = users.find(u => u.id === userId)
    return user ? user.username : `User #${userId}`
  }

  if (todos.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          userName={getUserName(todo.user_id)}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
