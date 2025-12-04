import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'

/**
 * Configuration for the TanStack Query DevTools panel.
 *
 * Exports an object defining the name and the component to render for devtools.
 */
export default {
  name: 'Tanstack Query',
  render: <ReactQueryDevtoolsPanel />,
}
