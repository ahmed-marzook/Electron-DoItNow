import type { User } from '@shared/types/user.types'
import { UserItem } from './UserItem'
import { Alert, AlertDescription } from '@renderer/components/ui/alert'

interface UserListProps {
  users: User[]
  isLoading: boolean
  error: string | null
  editingId: number | null
  onEdit: (user: User) => void
  onDelete: (id: number) => void
}

export function UserList({ users, isLoading, error, editingId, onEdit, onDelete }: UserListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-white/60">
        Loading users...
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-white/60">
        No users yet. Create your first user above!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UserItem
          key={user.id}
          user={user}
          isEditing={editingId === user.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
