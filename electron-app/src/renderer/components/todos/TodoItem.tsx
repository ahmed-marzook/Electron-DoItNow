import { Card } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Badge } from '@renderer/components/ui/badge'
import type { Todo } from '@shared/types/todo.types'

interface TodoItemProps {
  todo: Todo
  userName: string | null
  onToggleComplete: (todo: Todo) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: number) => void
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getPriorityVariant = (priority: string): 'high' | 'medium' | 'low' | 'default' => {
  if (priority === 'high') return 'high'
  if (priority === 'medium') return 'medium'
  if (priority === 'low') return 'low'
  return 'default'
}

export function TodoItem({ todo, userName, onToggleComplete, onEdit, onDelete }: TodoItemProps) {
  return (
    <Card className="p-4 hover:bg-white/15 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Checkbox
              checked={todo.completed === 1}
              onChange={() => onToggleComplete(todo)}
              title="Mark todo as complete"
              aria-label={`Mark "${todo.title}" as complete`}
              id={`todo-checkbox-${todo.id}`}
            />
            <h3
              className={`text-lg font-semibold ${
                todo.completed === 1
                  ? 'line-through text-white/50'
                  : 'text-white'
              }`}
            >
              {todo.title}
            </h3>
          </div>
          {todo.description && (
            <p className="text-white/80 text-sm ml-8 mb-2">
              {todo.description}
            </p>
          )}
          <div className="flex items-center gap-3 ml-8 text-xs text-white/60">
            <span>Created: {formatDate(todo.created_at)}</span>
            {todo.due_date && (
              <span>
                Due: {new Date(todo.due_date).toLocaleDateString()}
              </span>
            )}
            {userName && (
              <span className="text-blue-300">
                Assigned to: {userName}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={getPriorityVariant(todo.priority)}>
            {todo.priority.toUpperCase()}
          </Badge>
          <div className="flex gap-2">
            <Button
              onClick={() => onEdit(todo)}
              variant="default"
              size="sm"
              title="Edit todo"
            >
              Edit
            </Button>
            <Button
              onClick={() => onDelete(todo.id)}
              variant="destructive"
              size="sm"
              title="Delete todo"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
