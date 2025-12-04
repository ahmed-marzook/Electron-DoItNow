import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Todo } from '@shared/types/todo.types'
import { todoService } from '../services/todoService'

/**
 * Route configuration for the root path ('/').
 * Renders the TodosPage component.
 */
export const Route = createFileRoute('/')({
  component: TodosPage,
})

/**
 * The main page component for displaying and managing Todos.
 *
 * Features:
 * - Lists all existing todos.
 * - Form to create new todos.
 * - Inline editing of existing todos.
 * - Deletion and completion toggling.
 */
function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null)
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  })
  const [editTodo, setEditTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  })

  useEffect(() => {
    loadTodos()
  }, [])

  /**
   * Fetches all todos from the service and updates state.
   */
  const loadTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await todoService.getAll()
      setTodos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Formats a date string into a readable format.
   *
   * @param {string} dateString The date string to format.
   * @returns {string} The formatted date string.
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Returns the Tailwind CSS classes for a given priority level.
   *
   * @param {string} priority The priority level ('low', 'medium', 'high').
   * @returns {string} The CSS class string.
   */
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

  /**
   * Toggles the completion status of a todo.
   * Optimistically updates the UI before calling the service.
   *
   * @param {Todo} todo The todo item to toggle.
   */
  const toggleTodoCompletion = async (todo: Todo) => {
    try {
      const newCompletedStatus = todo.completed === 1 ? 0 : 1

      // Optimistically update UI
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.id === todo.id
            ? { ...t, completed: newCompletedStatus as 0 | 1 }
            : t,
        ),
      )

      // Update in database
      await todoService.update(todo.id, {
        title: todo.title,
        description: todo.description,
        completed: newCompletedStatus as 0 | 1,
        priority: todo.priority,
        due_date: todo.due_date,
      })
    } catch (err) {
      // Revert on error
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.id === todo.id ? { ...t, completed: todo.completed } : t,
        ),
      )
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  /**
   * Creates a new todo based on form input.
   */
  const createTodo = async () => {
    if (!newTodo.title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setError(null)
      const createdTodo = await todoService.create({
        title: newTodo.title,
        description: newTodo.description || null,
        completed: 0,
        priority: newTodo.priority,
        due_date: newTodo.due_date || null,
      })

      setTodos((prevTodos) => [createdTodo, ...prevTodos])
      setNewTodo({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
      })
      setShowCreateForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  /**
   * Deletes a todo by ID.
   *
   * @param {number} id The ID of the todo to delete.
   */
  const deleteTodo = async (id: number) => {
    try {
      setError(null)
      await todoService.delete(id)
      setTodos((prevTodos) => prevTodos.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  /**
   * Prepares the form for editing an existing todo.
   *
   * @param {Todo} todo The todo to edit.
   */
  const startEditingTodo = (todo: Todo) => {
    setEditingTodoId(todo.id)
    setEditTodo({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      due_date: todo.due_date || '',
    })
    setShowCreateForm(false)
  }

  /**
   * Cancels the editing mode.
   */
  const cancelEditing = () => {
    setEditingTodoId(null)
    setEditTodo({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
    })
  }

  /**
   * Saves the changes made to a todo in edit mode.
   *
   * @param {number} id The ID of the todo being updated.
   */
  const updateTodo = async (id: number) => {
    if (!editTodo.title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setError(null)
      const todo = todos.find((t) => t.id === id)
      if (!todo) {
        setError('Todo not found')
        return
      }

      const updatedTodo = await todoService.update(id, {
        title: editTodo.title,
        description: editTodo.description || null,
        completed: todo.completed,
        priority: editTodo.priority,
        due_date: editTodo.due_date || null,
      })

      setTodos((prevTodos) =>
        prevTodos.map((t) => (t.id === id ? updatedTodo : t)),
      )
      cancelEditing()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
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
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm)
                if (!showCreateForm) {
                  cancelEditing()
                }
              }}
              className="px-4 py-2 bg-green-600/80 hover:bg-green-600 border border-green-500/40 rounded-lg transition-colors"
            >
              {showCreateForm ? 'Cancel' : 'New Todo'}
            </button>
            <button
              onClick={loadTodos}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="mb-6 p-4 bg-white/10 border border-white/20 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Create New Todo</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter todo title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={newTodo.description}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description (optional)"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) =>
                      setNewTodo({
                        ...newTodo,
                        priority: e.target.value as 'low' | 'medium' | 'high',
                      })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Priority level"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTodo.due_date}
                    onChange={(e) =>
                      setNewTodo({ ...newTodo, due_date: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Select a due date"
                    aria-label="Due date"
                  />
                </div>
              </div>
              <button
                onClick={createTodo}
                className="w-full px-4 py-2 bg-blue-600/80 hover:bg-blue-600 border border-blue-500/40 rounded-lg transition-colors font-medium"
              >
                Create Todo
              </button>
            </div>
          </div>
        )}

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
                {editingTodoId === todo.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold mb-3">Edit Todo</h2>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={editTodo.title}
                        onChange={(e) =>
                          setEditTodo({ ...editTodo, title: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter todo title"
                        aria-label="Todo title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={editTodo.description}
                        onChange={(e) =>
                          setEditTodo({
                            ...editTodo,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter description (optional)"
                        rows={3}
                        aria-label="Todo description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Priority
                        </label>
                        <select
                          value={editTodo.priority}
                          onChange={(e) =>
                            setEditTodo({
                              ...editTodo,
                              priority: e.target.value as
                                | 'low'
                                | 'medium'
                                | 'high',
                            })
                          }
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Priority level"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={editTodo.due_date}
                          onChange={(e) =>
                            setEditTodo({ ...editTodo, due_date: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Select a due date"
                          aria-label="Due date"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateTodo(todo.id)}
                        className="flex-1 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 border border-blue-500/40 rounded-lg transition-colors font-medium"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 px-4 py-2 bg-gray-600/80 hover:bg-gray-600 border border-gray-500/40 rounded-lg transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={todo.completed === 1}
                          onChange={() => toggleTodoCompletion(todo)}
                          className="w-5 h-5 rounded cursor-pointer"
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditingTodo(todo)}
                          className="px-3 py-1 bg-blue-600/80 hover:bg-blue-600 border border-blue-500/40 rounded-lg text-xs transition-colors"
                          title="Edit todo"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="px-3 py-1 bg-red-600/80 hover:bg-red-600 border border-red-500/40 rounded-lg text-xs transition-colors"
                          title="Delete todo"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
