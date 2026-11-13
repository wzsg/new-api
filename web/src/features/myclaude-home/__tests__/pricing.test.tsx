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
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from 'i18next'
import { act } from 'react'
import { afterEach, expect, it, vi } from 'vitest'

import {
  DEFAULT_CURRENCY_CONFIG,
  useSystemConfigStore,
} from '@/stores/system-config-store'

import { registerHomeTranslations } from '../i18n'
import { ModelPricing } from '../pricing'

const originalConfig = useSystemConfigStore.getState().config

afterEach(async () => {
  cleanup()
  useSystemConfigStore.setState({ config: originalConfig })
  localStorage.clear()
  await i18n.changeLanguage('en')
})

it('converts list and discounted prices together without changing the language', async () => {
  registerHomeTranslations(i18n)
  await i18n.changeLanguage('en')
  useSystemConfigStore.getState().setConfig({
    currency: { ...DEFAULT_CURRENCY_CONFIG, usdExchangeRate: 7 },
  })
  const user = userEvent.setup()
  const client = new QueryClient()
  render(
    <QueryClientProvider client={client}>
      <ModelPricing />
    </QueryClientProvider>
  )

  const table = screen.getByRole('table', { name: 'Compare model prices' })
  expect(within(table).getByText('$12.50')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'CNY' }))
  expect(screen.getByRole('button', { name: 'CNY' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  expect(within(table).getByText('¥175.00').tagName).toBe('S')
  expect(within(table).getByText('¥87.50')).toBeVisible()

  await act(() => i18n.changeLanguage('zhCN'))
  expect(screen.getByRole('table', { name: '模型价格对比' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'CNY' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  expect(screen.getByRole('region', { name: '模型价格对比' })).toHaveAttribute(
    'tabindex',
    '0'
  )
  client.clear()
})

it('pairs list and discounted prices in each input and output cell on narrow screens', async () => {
  const matchMedia = window.matchMedia
  vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
    query === '(width < 40rem)'
      ? { ...matchMedia(query), matches: true }
      : matchMedia(query)
  )
  registerHomeTranslations(i18n)
  await i18n.changeLanguage('en')
  useSystemConfigStore.getState().setConfig({
    currency: { ...DEFAULT_CURRENCY_CONFIG, usdExchangeRate: 7 },
  })
  const user = userEvent.setup()
  const client = new QueryClient()
  render(
    <QueryClientProvider client={client}>
      <ModelPricing />
    </QueryClientProvider>
  )

  const table = screen.getByRole('table', { name: 'Compare model prices' })
  const row = within(table).getByRole('row', { name: /^Opus 4\.5 / })
  const [input, output] = within(row).getAllByRole('cell')
  expect(within(row).getAllByRole('cell')).toHaveLength(2)
  expect(within(input).getByText('$5.00').tagName).toBe('S')
  expect(within(input).getByText('$2.50')).toBeVisible()
  expect(within(output).getByText('$25.00').tagName).toBe('S')
  expect(within(output).getByText('$12.50')).toBeVisible()
  expect(
    screen.getByRole('region', { name: 'Compare model prices' })
  ).not.toHaveAttribute('tabindex')

  await user.click(screen.getByRole('button', { name: 'CNY' }))
  expect(within(output).getByText('¥175.00').tagName).toBe('S')
  expect(within(output).getByText('¥87.50')).toBeVisible()
  client.clear()
})
