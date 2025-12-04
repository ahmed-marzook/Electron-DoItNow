import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Creates and returns the TanStack Query context.
 *
 * Initializes a new `QueryClient` instance.
 *
 * @returns {Object} An object containing the `queryClient`.
 */
export function getContext() {
  const queryClient = new QueryClient()
  return {
    queryClient,
  }
}

/**
 * A provider component for TanStack Query.
 *
 * Wraps the application with `QueryClientProvider` to enable data fetching capabilities.
 *
 * @param {Object} props Component properties.
 * @param {React.ReactNode} props.children The child components to render.
 * @param {QueryClient} props.queryClient The QueryClient instance to use.
 * @returns {JSX.Element} The provider component.
 */
export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
