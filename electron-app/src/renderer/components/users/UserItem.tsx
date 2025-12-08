import { Card } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import type { User } from '@shared/types/user.types'

interface UserItemProps {
  user: User
  isEditing: boolean
  onEdit: (user: User) => void
  onDelete: (id: number) => void
}

export function UserItem({ user, isEditing, onEdit, onDelete }: UserItemProps) {
  return (
    <Card
      className={`p-5 transition-all ${
        isEditing
          ? 'border-purple-500 bg-purple-500/10'
          : 'hover:border-white/30'
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
          <Button
            onClick={() => onEdit(user)}
            variant="default"
            size="sm"
          >
            Edit
          </Button>
          <Button
            onClick={() => onDelete(user.id)}
            variant="destructive"
            size="sm"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}
