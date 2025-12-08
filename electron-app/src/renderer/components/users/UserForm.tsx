import { Card } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Alert, AlertDescription } from '@renderer/components/ui/alert'

interface UserFormData {
  username: string
  email: string
}

interface UserFormProps {
  title: string
  formData: UserFormData
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  onChange: (data: Partial<UserFormData>) => void
  submitLabel: string
  showCancel?: boolean
  error?: string | null
}

export function UserForm({
  title,
  formData,
  onSubmit,
  onCancel,
  onChange,
  submitLabel,
  showCancel = false,
  error,
}: UserFormProps) {
  return (
    <form onSubmit={onSubmit} className="mb-8 space-y-4">
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {title}
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => onChange({ username: e.target.value })}
              placeholder="Enter username (3-50 characters)"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="user@example.com"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button type="submit" variant="default" className="flex-1">
              {submitLabel}
            </Button>

            {showCancel && onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>
    </form>
  )
}
