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
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { cleanup, render, screen, within } from '@testing-library/react'
import i18n from 'i18next'
import { afterEach, expect, it, vi } from 'vitest'

import { registerHomeTranslations } from '../i18n'
import { SubscriptionPlans } from '../plans'

afterEach(async () => {
  cleanup()
  await i18n.changeLanguage('en')
})

it('shows each plan’s monthly API credit and links to wallet subscriptions', async () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  registerHomeTranslations(i18n)
  await i18n.changeLanguage('en')
  const root = createRootRoute({ component: Outlet })
  const home = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: SubscriptionPlans,
  })
  const wallet = createRoute({ getParentRoute: () => root, path: '/wallet' })
  const router = createRouter({
    routeTree: root.addChildren([home, wallet]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  render(<RouterProvider router={router} />)

  const section = await screen.findByRole('region', {
    name: 'Subscription plans',
  })
  expect(within(section).getByText('$22 in API credit per month')).toBeVisible()
  expect(
    within(section).getByText('$120 in API credit per month')
  ).toBeVisible()
  expect(
    within(section).getByText('$250 in API credit per month')
  ).toBeVisible()
  expect(within(section).getByText('Recommended')).toBeVisible()
  for (const plan of ['Pro', 'Max', 'Ultra']) {
    expect(
      within(section).getByRole('button', { name: `Choose ${plan}` })
    ).toHaveAttribute('href', '/wallet#wallet-subscriptions')
  }
})
