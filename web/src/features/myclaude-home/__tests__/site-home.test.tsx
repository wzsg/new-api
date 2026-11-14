/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { cleanup, render, screen } from '@testing-library/react'
import i18n from 'i18next'
import { afterEach, expect, it, vi } from 'vitest'

import { ThemeProvider } from '@/context/theme-provider'
import { api } from '@/lib/api'
import { Route } from '@/routes/index'

afterEach(async () => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
  await i18n.changeLanguage('en')
})

it('renders the shared landing page for MY28 with its own brand and API key entry', async () => {
  await i18n.changeLanguage('en')
  vi.spyOn(api, 'get').mockImplementation(async (url) => ({
    data: {
      success: true,
      data: url === '/api/status' ? { system_name: 'MY28' } : '',
    },
  }))
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const root = createRootRoute({ component: Outlet })
  const home = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: Route.options.component,
  })
  const keys = createRoute({ getParentRoute: () => root, path: '/keys' })
  const router = createRouter({
    routeTree: root.addChildren([home, keys]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  try {
    render(
      <QueryClientProvider client={client}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    )

    expect(
      await screen.findByRole('heading', { name: /MY28.*Pay as you go/ })
    ).toBeVisible()
    expect(screen.getByText('Get an API key')).toHaveAttribute('href', '/keys')
    expect(screen.queryByText('Compare model prices')).toBeNull()
    expect(screen.queryByText('Subscription plans')).toBeNull()
  } finally {
    client.clear()
  }
})
