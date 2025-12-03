import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/demo/')({
  component: App,
})

function App() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4 text-white"
      style={{
        backgroundImage:
          'radial-gradient(50% 50% at 95% 5%, #f4a460 0%, #8b4513 70%, #1a0f0a 100%)',
      }}
    >
      IN-COMING
    </div>
  )
}
