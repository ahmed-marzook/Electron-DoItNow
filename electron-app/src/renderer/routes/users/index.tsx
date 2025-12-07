import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { userService } from '@renderer/services/userService'
import type { User } from '@shared/types/user.types'

export const Route = createFileRoute('/users/')({
  component: UsersPage,
})

function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state for creating/editing users
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const loadedUsers = await userService.getAll()
      setUsers(loadedUsers)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validate form
    if (!username.trim()) {
      setFormError('Username is required')
      return
    }
    if (!email.trim()) {
      setFormError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address')
      return
    }

    try {
      if (editingId !== null) {
        // Update existing user
        const updatedUser = await userService.update(editingId, {
          username: username.trim(),
          email: email.trim(),
        })
        setUsers(users.map(u => u.id === editingId ? updatedUser : u))
        setEditingId(null)
      } else {
        // Create new user
        const newUser = await userService.create({
          username: username.trim(),
          email: email.trim(),
        })
        setUsers([...users, newUser])
      }

      // Reset form
      setUsername('')
      setEmail('')
    } catch (err) {
      setFormError((err as Error).message)
    }
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setUsername(user.username)
    setEmail(user.email)
    setFormError(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setUsername('')
    setEmail('')
    setFormError(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their todos.')) {
      return
    }

    try {
      await userService.delete(id)
      setUsers(users.filter(u => u.id !== id))

      // If we were editing this user, clear the form
      if (editingId === id) {
        handleCancelEdit()
      }
    } catch (err) {
      alert(`Failed to delete user: ${(err as Error).message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-8">User Management</h1>

          {/* Create/Edit User Form */}
          <form onSubmit={handleSubmit} className="mb-8 space-y-4">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                {editingId !== null ? 'Edit User' : 'Create New User'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-2">
                    Username *
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username (3-50 characters)"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {formError && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                    {formError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    {editingId !== null ? 'Update User' : 'Create User'}
                  </button>

                  {editingId !== null && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>

          {/* Users List */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">All Users</h2>

            {isLoading ? (
              <div className="text-center py-12 text-white/60">
                Loading users...
              </div>
            ) : error ? (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
                Error: {error}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                No users yet. Create your first user above!
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`bg-white/5 rounded-xl p-5 border transition-all ${
                      editingId === user.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {user.username}
                          </h3>
                          <span className="text-xs text-white/40">
                            ID: {user.id}
                          </span>
                        </div>
                        <p className="text-white/70 mb-2">
                          {user.email}
                        </p>
                        <p className="text-xs text-white/40">
                          Created: {new Date(user.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
