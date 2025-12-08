import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Todo } from '@shared/types/todo.types'
import type { User } from '@shared/types/user.types'
import { todoService } from '@renderer/services/todoService'
import { userService } from '@renderer/services/userService'
import { Button } from '@renderer/components/ui/button'
import { Alert, AlertDescription } from '@renderer/components/ui/alert'
import { LoadingState } from '@renderer/components/todos/LoadingState'
import { ErrorState } from '@renderer/components/todos/ErrorState'
import { TodoForm } from '@renderer/components/todos/TodoForm'
import { TodoList } from '@renderer/components/todos/TodoList'

export const Route = createFileRoute('/')({
  component: TodosPage,
})

function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null)
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
    user_id: null as number | null,
  })
  const [editTodo, setEditTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
    user_id: null as number | null,
  })

  useEffect(() => {
    loadTodos()
    loadUsers()
  }, [])

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

  const loadUsers = async () => {
    try {
      const data = await userService.getAll()
      setUsers(data)
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} />
  }

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
        user_id: todo.user_id,
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
        user_id: newTodo.user_id,
      })

      setTodos((prevTodos) => [createdTodo, ...prevTodos])
      setNewTodo({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        user_id: null,
      })
      setShowCreateForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      setError(null)
      await todoService.delete(id)
      setTodos((prevTodos) => prevTodos.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const startEditingTodo = (todo: Todo) => {
    setEditingTodoId(todo.id)
    setEditTodo({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      due_date: todo.due_date || '',
      user_id: todo.user_id,
    })
    setShowCreateForm(false)
  }

  const cancelEditing = () => {
    setEditingTodoId(null)
    setEditTodo({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      user_id: null,
    })
  }

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
        user_id: editTodo.user_id,
      })

      setTodos((prevTodos) =>
        prevTodos.map((t) => (t.id === id ? updatedTodo : t)),
      )
      cancelEditing()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const manualSync = async () => {
    window.electronAPI.todo.manualSync()
  }

  const editingTodo = editingTodoId ? todos.find(t => t.id === editingTodoId) : null

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
            <Button
              onClick={() => {
                setShowCreateForm(!showCreateForm)
                if (!showCreateForm) {
                  cancelEditing()
                }
              }}
              variant={showCreateForm ? 'secondary' : 'success'}
            >
              {showCreateForm ? 'Cancel' : 'New Todo'}
            </Button>
            <Button
              onClick={loadTodos}
              variant="outline"
            >
              Refresh
            </Button>
            <Button
              onClick={manualSync}
              variant="default"
            >
              Sync Cloud
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showCreateForm && (
          <TodoForm
            title="Create New Todo"
            formData={newTodo}
            users={users}
            onSubmit={createTodo}
            onChange={(data) => setNewTodo({ ...newTodo, ...data })}
            submitLabel="Create Todo"
          />
        )}

        {editingTodo && (
          <TodoForm
            title="Edit Todo"
            formData={editTodo}
            users={users}
            onSubmit={() => updateTodo(editingTodo.id)}
            onCancel={cancelEditing}
            onChange={(data) => setEditTodo({ ...editTodo, ...data })}
            submitLabel="Save Changes"
            showCancel
          />
        )}

        <TodoList
          todos={todos}
          users={users}
          onToggleComplete={toggleTodoCompletion}
          onEdit={startEditingTodo}
          onDelete={deleteTodo}
        />
      </div>
    </div>
  )
}
