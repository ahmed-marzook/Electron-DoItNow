import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import type { QueryClient } from '@tanstack/react-query'

/**
 * Interface defining the global router context.
 */
interface MyRouterContext {
  /**
   * The TanStack Query client instance.
   */
  queryClient: QueryClient
}

/**
 * The root route configuration for the application.
 *
 * This component wraps the entire application, including:
 * - The global `Header` component.
 * - The `Outlet` for rendering child routes.
 * - Development tools (TanStack Router and Query devtools).
 */
export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Header />
      <Outlet />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  ),
})
