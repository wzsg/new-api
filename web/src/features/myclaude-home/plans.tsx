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
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toIntlLocale } from '@/i18n/languages'
import { cn } from '@/lib/utils'

import { HOME_NS } from './i18n'

const plans = [
  {
    name: 'Pro',
    price: 20,
    credit: 22,
    label: 'Light use',
    description: 'Occasional use with smaller requests.',
  },
  {
    name: 'Max',
    price: 100,
    credit: 120,
    label: 'Frequent use',
    description: 'Regular use with more requests throughout the day.',
  },
  {
    name: 'Ultra',
    price: 200,
    credit: 250,
    label: 'Intensive use',
    description: 'Extended use with larger requests.',
  },
] as const

export function SubscriptionPlans() {
  const { t, i18n } = useTranslation(HOME_NS)
  const priceFormat = new Intl.NumberFormat(
    toIntlLocale(i18n.resolvedLanguage),
    {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0,
    }
  )

  return (
    <section
      id='subscription-plans'
      className='scroll-mt-24'
      aria-labelledby='plans-heading'
    >
      <h2 id='plans-heading' className='mb-6 text-3xl font-bold tracking-tight'>
        {t('Subscription plans')}
      </h2>
      <p className='text-muted-foreground -mt-3 mb-6 text-sm'>
        {t(
          'Use any available Claude model at MyClaude rates. Unused credit expires at the end of the month.'
        )}
      </p>
      <div className='grid gap-4 md:grid-cols-3'>
        {plans.map((plan) => {
          const featured = plan.name === 'Max'
          return (
            <Card
              key={plan.name}
              className={cn(
                'gap-4 p-6 sm:p-8',
                featured &&
                  'border-2 border-blue-500 bg-indigo-50 shadow-lg shadow-blue-500/15 dark:bg-indigo-950/45'
              )}
            >
              <div>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <h3 className='text-3xl font-bold'>{plan.name}</h3>
                  {featured && <Badge>{t('Recommended')}</Badge>}
                </div>
                <p className='mt-1 text-sm font-semibold'>{t(plan.label)}</p>
              </div>
              <p
                className={cn(
                  'text-5xl font-bold tracking-tight',
                  featured && 'text-blue-700 dark:text-blue-300'
                )}
              >
                {priceFormat.format(plan.price)}{' '}
                <span className='text-muted-foreground text-sm font-normal'>
                  {t('USD / month')}
                </span>
              </p>
              <p className='text-sm font-semibold'>
                {t('{{amount}} in API credit per month', {
                  amount: priceFormat.format(plan.credit),
                })}
              </p>
              <p className='text-muted-foreground flex-1 text-sm'>
                {t(plan.description)}
              </p>
              <Button
                size='lg'
                variant={featured ? 'default' : 'outline'}
                render={<Link to='/wallet' hash='wallet-subscriptions' />}
              >
                {t('Choose {{plan}}', { plan: plan.name })}
              </Button>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
