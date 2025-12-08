import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { userService } from '@renderer/services/userService'
import type { User } from '@shared/types/user.types'
import { UserForm } from '@renderer/components/users/UserForm'
import { UserList } from '@renderer/components/users/UserList'

export const Route = createFileRoute('/users/')({
  component: UsersPage,
})

function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
  })
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

    if (!formData.username.trim()) {
      setFormError('Username is required')
      return
    }
    if (!formData.email.trim()) {
      setFormError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address')
      return
    }

    try {
      if (editingId !== null) {
        const updatedUser = await userService.update(editingId, {
          username: formData.username.trim(),
          email: formData.email.trim(),
        })
        setUsers(users.map(u => u.id === editingId ? updatedUser : u))
        setEditingId(null)
      } else {
        const newUser = await userService.create({
          username: formData.username.trim(),
          email: formData.email.trim(),
        })
        setUsers([...users, newUser])
      }

      setFormData({ username: '', email: '' })
    } catch (err) {
      setFormError((err as Error).message)
    }
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setFormData({
      username: user.username,
      email: user.email,
    })
    setFormError(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({ username: '', email: '' })
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

          <UserForm
            title={editingId !== null ? 'Edit User' : 'Create New User'}
            formData={formData}
            onSubmit={handleSubmit}
            onCancel={editingId !== null ? handleCancelEdit : undefined}
            onChange={(data) => setFormData({ ...formData, ...data })}
            submitLabel={editingId !== null ? 'Update User' : 'Create User'}
            showCancel={editingId !== null}
            error={formError}
          />

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">All Users</h2>
            <UserList
              users={users}
              isLoading={isLoading}
              error={error}
              editingId={editingId}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
