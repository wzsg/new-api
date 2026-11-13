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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useSystemConfig } from '@/hooks/use-system-config'
import { toIntlLocale } from '@/i18n/languages'
import { cn } from '@/lib/utils'

import { HOME_NS } from './i18n'

const rates = [
  { model: 'Opus 4.5', input: 5, output: 25 },
  { model: 'Sonnet 4.6', input: 3, output: 15 },
  { model: 'Haiku 4.5', input: 1, output: 5 },
]
const discount = 0.5
const priceLabels = ['Input', 'Output'] as const

export function ModelPricing() {
  const { t, i18n } = useTranslation([HOME_NS, 'translation'])
  const { currency } = useSystemConfig()
  const compact = useMediaQuery('(width < 40rem)')
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'CNY'>('USD')
  const locale = toIntlLocale(i18n.resolvedLanguage)
  const rate = currency.usdExchangeRate
  const canConvert = Number.isFinite(rate) && rate > 0
  const selectedCurrency = canConvert ? displayCurrency : 'USD'
  const converted = selectedCurrency === 'CNY'
  // The currency selector is local to the comparison and independent of the site's billing display.
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: selectedCurrency,
    currencyDisplay: 'narrowSymbol',
  })
  const format = (usd: number) => formatter.format(usd * (converted ? rate : 1))

  return (
    <Card
      id='model-prices'
      className='bg-card/95 min-w-0 scroll-mt-24 gap-0 border-blue-200/70 py-0 shadow-xl shadow-indigo-500/10 dark:border-blue-400/20'
    >
      <CardHeader className='flex flex-wrap items-center justify-between gap-2 px-3 py-4 sm:gap-4 sm:p-7'>
        <h2 id='comparison-heading' className='text-lg font-bold sm:text-2xl'>
          {t('Compare model prices')}
        </h2>
        <ToggleGroup
          aria-label={t('Currency', { ns: 'translation' })}
          value={[selectedCurrency]}
          onValueChange={(values) => {
            const value = values[0]
            if (value === 'USD' || value === 'CNY') setDisplayCurrency(value)
          }}
          className='bg-muted rounded-full p-1'
        >
          {(['USD', 'CNY'] as const).map((code) => (
            <ToggleGroupItem
              key={code}
              value={code}
              disabled={code === 'CNY' && !canConvert}
              className='data-[pressed]:bg-primary data-[pressed]:text-primary-foreground h-8 min-w-11 rounded-full! sm:min-w-14'
            >
              {code}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <CardContent className='px-3 pb-4 sm:px-7 sm:pb-7'>
        <div
          className={cn(
            'rounded-md',
            !compact &&
              'focus-visible:outline-ring overflow-x-auto focus-visible:outline-2'
          )}
          tabIndex={compact ? undefined : 0}
          role='region'
          aria-labelledby='comparison-heading'
        >
          <Table
            withContainer={false}
            className={
              compact
                ? 'table-fixed [&_td]:text-xs [&_th]:text-xs'
                : 'min-w-105'
            }
            aria-labelledby='comparison-heading'
          >
            <TableHeader className='bg-muted/35'>
              <TableRow>
                <TableHead
                  rowSpan={2}
                  scope='col'
                  className={cn(
                    'font-semibold',
                    compact && 'w-2/5 px-1.5 whitespace-normal'
                  )}
                >
                  {t('Model', { ns: 'translation' })}
                </TableHead>
                {!compact && (
                  <TableHead
                    colSpan={2}
                    scope='colgroup'
                    className='text-center'
                  >
                    {t('Anthropic list price')}
                  </TableHead>
                )}
                <TableHead
                  colSpan={2}
                  scope='colgroup'
                  className={cn(
                    'text-center',
                    compact && 'h-8 px-1 whitespace-normal'
                  )}
                >
                  MyClaude <Badge className='ml-1'>{t('50% off')}</Badge>
                </TableHead>
              </TableRow>
              <TableRow>
                {(compact ? ['site'] : ['official', 'site']).map((group) =>
                  priceLabels.map((label) => (
                    <TableHead
                      key={`${group}-${label}`}
                      scope='col'
                      className={cn(
                        'text-center',
                        compact && 'h-7 px-1 whitespace-normal'
                      )}
                    >
                      {t(label, { ns: 'translation' })}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody className={compact ? '[&>tr]:h-auto' : undefined}>
              {rates.map(({ model, input, output }) => (
                <TableRow key={model}>
                  <TableHead
                    scope='row'
                    className={cn(
                      'font-semibold',
                      compact && 'px-1.5 whitespace-normal'
                    )}
                  >
                    {model}
                  </TableHead>
                  {!compact &&
                    Object.entries({ input, output }).map(([kind, price]) => (
                      <TableCell
                        key={kind}
                        className='text-muted-foreground text-center'
                      >
                        <s>{format(price)}</s>
                      </TableCell>
                    ))}
                  {Object.entries({ input, output }).map(([kind, price]) => (
                    <TableCell
                      key={kind}
                      className={cn(
                        'text-center',
                        compact &&
                          'px-1 py-1.5 whitespace-normal [overflow-wrap:anywhere]'
                      )}
                    >
                      {compact && (
                        <s className='text-muted-foreground block'>
                          <span className='sr-only'>
                            {t('Anthropic list price')}{' '}
                          </span>
                          {format(price)}
                        </s>
                      )}
                      <strong className='font-bold! text-blue-700 dark:text-blue-300'>
                        {format(price * discount)}
                      </strong>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className='text-muted-foreground mt-4 flex flex-wrap items-center justify-between gap-2 text-sm'>
          <p>
            {t('{{currency}} per million tokens', {
              currency: selectedCurrency,
            })}
          </p>
          <a
            className='text-primary hover:underline'
            href='https://platform.claude.com/docs/en/about-claude/pricing'
            target='_blank'
            rel='noreferrer'
          >
            {t('Official pricing')} ↗
          </a>
        </div>
        {converted && (
          <p className='text-muted-foreground mt-2 text-xs'>
            {t('Approximate conversion · 1 USD = {{rate}} CNY', {
              rate: new Intl.NumberFormat(locale).format(rate),
            })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
