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
import { Link } from '@tanstack/react-router'
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
import { QUOTA_TYPE_VALUES } from '@/features/pricing/constants'
import { usePricingData } from '@/features/pricing/hooks/use-pricing-data'
import {
  parseTiersFromExpr,
  splitBillingExprAndRequestRules,
  type TierCondition,
} from '@/features/pricing/lib/billing-expr'
import { calculateTokenPrice } from '@/features/pricing/lib/price'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useSystemConfig } from '@/hooks/use-system-config'
import { toIntlLocale } from '@/i18n/languages'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

import { HOME_NS } from './i18n'

type TokenPrices = [input: number, output: number]

type ComparisonRow = {
  key: string
  model: string
  official?: TokenPrices
  site: TokenPrices
  conditions?: TierCondition[]
  hasTiers?: boolean
}

type ModelPricingProps = {
  siteName?: string
  rows?: ComparisonRow[]
  loading?: boolean
  unavailable?: boolean
}

const myClaudeRates: ComparisonRow[] = [
  { key: 'opus', model: 'Opus 4.5', official: [5, 25], site: [2.5, 12.5] },
  { key: 'sonnet', model: 'Sonnet 4.6', official: [3, 15], site: [1.5, 7.5] },
  { key: 'haiku', model: 'Haiku 4.5', official: [1, 5], site: [0.5, 2.5] },
]

// Anthropic's standard USD token prices, per million. MY28 rates come from /api/pricing.
const officialRates: Record<string, TokenPrices> = {
  'claude-fable-5': [10, 50],
  'claude-fable-5-1': [10, 50],
  'claude-fable-5-2': [8, 40],
  'claude-haiku-4-5': [1, 5],
  'claude-haiku-4-5-20251001': [1, 5],
  'claude-opus-4-6': [5, 25],
  'claude-opus-4-7': [5, 25],
  'claude-opus-4-8': [5, 25],
  'claude-opus-5': [5, 25],
  'claude-opus-5-5': [4, 20],
  'claude-sonnet-4-6': [3, 15],
  'claude-sonnet-5': [2, 10],
  'claude-sonnet-5-5': [2, 10],
}

const priceLabels = ['Input', 'Output'] as const
const conditionLabels = {
  len: 'Context',
  p: 'Input tokens',
  c: 'Output tokens',
} as const

export function LiveModelPricing(props: { siteName: string }) {
  const { models, isLoading, error } = usePricingData()
  const rows: ComparisonRow[] = models
    .filter((model) => model.model_name.startsWith('claude-'))
    .sort((a, b) => a.model_name.localeCompare(b.model_name))
    .flatMap((model): ComparisonRow[] => {
      const name = model.model_name
      if (model.billing_mode !== 'tiered_expr') {
        if (model.quota_type !== QUOTA_TYPE_VALUES.TOKEN) return []
        const input = calculateTokenPrice(model, 'input', 1)
        const output = calculateTokenPrice(model, 'output', 1)
        if (!Number.isFinite(input) || !Number.isFinite(output)) return []
        return [
          {
            key: name,
            model: name,
            official: officialRates[name],
            site: [input, output],
          },
        ]
      }

      const parts = splitBillingExprAndRequestRules(model.billing_expr || '')
      const tiers = parseTiersFromExpr(parts.billingExpr)
      return tiers.flatMap((tier, index): ComparisonRow[] => {
        if (
          tier.billingUnit === 'request' ||
          tier.conditionText ||
          typeof tier.inputPrice !== 'number' ||
          typeof tier.outputPrice !== 'number'
        ) {
          return []
        }

        let official = officialRates[name]
        if (name === 'claude-haiku-5-5' && tiers.length === 2) {
          const first = tiers[0].conditions
          if (
            first.length === 1 &&
            first[0].var === 'len' &&
            first[0].op === '>' &&
            first[0].value === 100_000 &&
            tiers[1].conditions.length === 0
          ) {
            official = index === 0 ? [0.5, 2.5] : [0.1, 0.5]
          }
        }
        return [
          {
            key: `${name}-${index}`,
            model: name,
            official,
            site: [tier.inputPrice, tier.outputPrice],
            conditions: tier.conditions,
            hasTiers: tiers.length > 1,
          },
        ]
      })
    })

  return (
    <ModelPricing
      siteName={props.siteName}
      rows={rows}
      loading={isLoading}
      unavailable={!!error && rows.length === 0}
    />
  )
}

export function ModelPricing(props: ModelPricingProps = {}) {
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
  const format = (usd: number | undefined) =>
    usd === undefined ? '—' : formatter.format(usd * (converted ? rate : 1))
  const rows = props.rows ?? myClaudeRates
  let emptyMessage = t('No models found', { ns: 'translation' })
  if (props.loading) emptyMessage = t('Loading...', { ns: 'translation' })
  if (props.unavailable) {
    emptyMessage = t('Failed to fetch models', { ns: 'translation' })
  }

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
        {rows.length === 0 ? (
          <p className='text-muted-foreground text-sm' role='status'>
            {emptyMessage}
          </p>
        ) : (
          <div
            className={cn(
              'rounded-md',
              props.rows && 'max-h-104 overflow-y-auto',
              (!compact || props.rows) &&
                'focus-visible:outline-ring focus-visible:outline-2',
              !compact && 'overflow-x-auto'
            )}
            tabIndex={compact && !props.rows ? undefined : 0}
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
              <TableHeader
                className={
                  props.rows ? 'bg-card sticky top-0 z-10' : 'bg-muted/35'
                }
              >
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
                    {props.siteName ?? 'MyClaude'}
                    {!props.rows && (
                      <Badge className='ml-1'>{t('50% off')}</Badge>
                    )}
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
                {rows.map((row) => (
                  <TableRow key={row.key}>
                    <TableHead
                      scope='row'
                      className={cn(
                        'font-semibold',
                        compact && 'px-1.5 whitespace-normal'
                      )}
                    >
                      {row.model}
                      {row.hasTiers && (
                        <span className='text-muted-foreground block text-xs font-normal'>
                          {row.conditions?.length
                            ? row.conditions
                                .map((clause) =>
                                  [
                                    t(conditionLabels[clause.var], {
                                      ns: 'translation',
                                    }),
                                    clause.op,
                                    formatNumber(clause.value, locale),
                                  ].join(' ')
                                )
                                .join(' · ')
                            : t('Other cases', { ns: 'translation' })}
                        </span>
                      )}
                    </TableHead>
                    {!compact &&
                      priceLabels.map((kind, index) => (
                        <TableCell
                          key={kind}
                          className='text-muted-foreground text-center'
                        >
                          {props.rows ? (
                            format(row.official?.[index])
                          ) : (
                            <s>{format(row.official?.[index])}</s>
                          )}
                        </TableCell>
                      ))}
                    {priceLabels.map((kind, index) => (
                      <TableCell
                        key={kind}
                        className={cn(
                          'text-center',
                          compact &&
                            'px-1 py-1.5 whitespace-normal [overflow-wrap:anywhere]'
                        )}
                      >
                        {compact && (
                          <span
                            className={cn(
                              'text-muted-foreground block',
                              !props.rows && 'line-through'
                            )}
                          >
                            <span className='sr-only'>
                              {t('Anthropic list price')}{' '}
                            </span>
                            {props.rows ? (
                              format(row.official?.[index])
                            ) : (
                              <s>{format(row.official?.[index])}</s>
                            )}
                          </span>
                        )}
                        <strong className='font-bold! text-blue-700 dark:text-blue-300'>
                          {format(row.site[index])}
                        </strong>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className='text-muted-foreground mt-4 flex flex-wrap items-center justify-between gap-2 text-sm'>
          <p>
            {t('{{currency}} per million tokens', {
              currency: selectedCurrency,
            })}
          </p>
          {props.rows && (
            <Link className='text-primary hover:underline' to='/pricing'>
              {t('Model Square', { ns: 'translation' })}
            </Link>
          )}
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
