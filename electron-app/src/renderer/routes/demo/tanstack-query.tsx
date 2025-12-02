import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Todo } from '@shared/types/todo.types'

export const Route = createFileRoute('/demo/tanstack-query')({
  component: TodosPage,
})

function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await window.electronAPI.todo.getAll()

      if (response.success && response.data) {
        setTodos(response.data)
      } else {
        setError(response.error || 'Failed to load todos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 border-red-500/40 text-red-200'
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-200'
      case 'low':
        return 'bg-green-500/20 border-green-500/40 text-green-200'
      default:
        return 'bg-gray-500/20 border-gray-500/40 text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-2xl text-gray-700">Loading todos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-2xl text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4 text-white"
      style={{
        backgroundImage:
          'radial-gradient(50% 50% at 95% 5%, #f4a460 0%, #8b4513 70%, #1a0f0a 100%)',
      }}
    >
      <div className="w-full max-w-4xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Todos</h1>
          <button
            onClick={loadTodos}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        {todos.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <p className="text-xl">No todos found</p>
            <p className="text-sm mt-2">Start by creating your first todo!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm shadow-md hover:bg-white/15 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={todo.completed === 1}
                        readOnly
                        className="w-5 h-5 rounded cursor-pointer"
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
                        <span>Due: {new Date(todo.due_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        todo.priority,
                      )}`}
                    >
                      {todo.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
