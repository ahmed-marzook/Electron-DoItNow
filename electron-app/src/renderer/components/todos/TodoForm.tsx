import { Card } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { Select } from '@renderer/components/ui/select'
import { Label } from '@renderer/components/ui/label'
import type { User } from '@shared/types/user.types'

interface TodoFormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  due_date: string
  user_id: number | null
}

interface TodoFormProps {
  title: string
  formData: TodoFormData
  users: User[]
  onSubmit: () => void
  onCancel?: () => void
  onChange: (data: Partial<TodoFormData>) => void
  submitLabel: string
  showCancel?: boolean
}

export function TodoForm({
  title,
  formData,
  users,
  onSubmit,
  onCancel,
  onChange,
  submitLabel,
  showCancel = false,
}: TodoFormProps) {
  return (
    <Card className="mb-6 p-4">
      <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
      <div className="space-y-3">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Enter todo title"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Enter description (optional)"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                onChange({ priority: e.target.value as 'low' | 'medium' | 'high' })
              }
              aria-label="Priority level"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => onChange({ due_date: e.target.value })}
              placeholder="Select a due date"
              aria-label="Due date"
            />
          </div>

          <div>
            <Label htmlFor="user_id">Assign to User (optional)</Label>
            <Select
              id="user_id"
              value={formData.user_id ?? ''}
              onChange={(e) =>
                onChange({ user_id: e.target.value ? Number(e.target.value) : null })
              }
              aria-label="Assign to user"
            >
              <option value="">None</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onSubmit} className="flex-1">
            {submitLabel}
          </Button>
          {showCancel && onCancel && (
            <Button onClick={onCancel} variant="secondary" className="flex-1">
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
