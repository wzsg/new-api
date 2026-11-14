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
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

it('shows configured MY28 prices and both context tiers in USD and CNY', async () => {
  await i18n.changeLanguage('en')
  const status = {
    system_name: 'MY28',
    usd_exchange_rate: 7,
    HeaderNavModules: JSON.stringify({
      pricing: { enabled: true, requireAuth: false },
    }),
  }
  const pricing = [
    {
      model_name: 'claude-haiku-5-5',
      billing_mode: 'tiered_expr',
      billing_expr:
        'len > 100000 ? tier("long", p * 0.7 + c * 3.5) : tier("base", p * 0.2 + c * 0.8)',
      enable_groups: ['default'],
    },
  ]
  vi.spyOn(api, 'get').mockImplementation(async (url) => {
    if (url === '/api/pricing') {
      return {
        data: {
          success: true,
          data: pricing,
          vendors: [],
          group_ratio: { default: 1 },
        },
      }
    }
    return {
      data: { success: true, data: url === '/api/status' ? status : '' },
    }
  })
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
      await screen.findByRole('heading', { name: /Claude API.*Pay as you go/ })
    ).toBeVisible()
    expect(within(screen.getByRole('banner')).getByTitle('MY28')).toBeVisible()
    expect(screen.getByText('Get an API key')).toHaveAttribute('href', '/keys')
    expect(
      await screen.findByRole('table', { name: 'Compare model prices' })
    ).toBeVisible()
    expect(screen.getByText('$3.50')).toBeVisible()
    expect(screen.getByText('$0.80')).toBeVisible()
    expect(screen.getByText('Context > 100,000')).toBeVisible()
    expect(screen.getByText('Other cases')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'CNY' }))
    expect(screen.getByText('¥24.50')).toBeVisible()
    expect(screen.getByText('¥5.60')).toBeVisible()
    expect(screen.queryByText('Model pricing')).toBeNull()
    expect(screen.queryByText('Integration guide')).toBeNull()
    expect(screen.queryByText('Model Square')).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Toggle navigation menu' })
    ).toBeNull()
    expect(screen.queryByText('50% off')).toBeNull()
    expect(screen.queryByText('Subscription plans')).toBeNull()
  } finally {
    client.clear()
  }
})
