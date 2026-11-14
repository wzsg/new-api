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
import { MessageCircle, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SiCircle, SiMastercard, SiTether, SiVisa } from 'react-icons/si'

import { IconAlipay, IconWeChat } from '@/assets/brand-icons'
import { PublicLayout } from '@/components/layout'
import { Footer } from '@/components/layout/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Home } from '@/features/home'
import { GatewayCard } from '@/features/home/components/gateway-card'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import i18n from '@/i18n/config'
import { getLobeIcon } from '@/lib/lobe-icon'
import { getModuleAccessFromStatus } from '@/lib/nav-modules'

import { HOME_NS, registerHomeTranslations } from './i18n'
import { SubscriptionPlans } from './plans'
import { LiveModelPricing, ModelPricing } from './pricing'

registerHomeTranslations(i18n)

const paymentMethods = [
  {
    name: 'WeChat Pay',
    Icon: IconWeChat,
    color: 'text-green-700 dark:text-green-400',
  },
  {
    name: 'Alipay',
    Icon: IconAlipay,
    color: 'text-blue-700 dark:text-blue-300',
  },
  { name: 'Visa', Icon: SiVisa, color: 'text-blue-800 dark:text-blue-300' },
  {
    name: 'Mastercard',
    Icon: SiMastercard,
    color: 'text-orange-700 dark:text-orange-400',
  },
  { name: 'USDC', Icon: SiCircle, color: 'text-blue-700 dark:text-blue-300' },
  { name: 'USDT', Icon: SiTether, color: 'text-teal-700 dark:text-teal-400' },
] as const

interface LandingPageProps {
  siteName: string
  showClaudeOffers: boolean
}

function LandingPage(props: LandingPageProps) {
  const { t } = useTranslation([HOME_NS, 'translation'])
  const { status } = useStatus()
  const { logo } = useSystemConfig()
  const pricing = getModuleAccessFromStatus(status, 'pricing')
  const showLivePricing =
    !props.showClaudeOffers && pricing.enabled && !pricing.requireAuth
  const showPricing = props.showClaudeOffers || showLivePricing
  const docsUrl =
    typeof status?.docs_link === 'string' && status.docs_link
      ? status.docs_link
      : 'https://docs.newapi.pro'
  const supportUrl = props.showClaudeOffers
    ? import.meta.env.VITE_MYCLAUDE_SUPPORT_URL
    : undefined
  const statusUrl = props.showClaudeOffers
    ? import.meta.env.VITE_MYCLAUDE_STATUS_URL
    : undefined
  const guarantees = [
    {
      title: t('Original API guarantee'),
      detail: t('Powered by the official Anthropic API'),
      icon: getLobeIcon('Claude.Color', 38),
    },
    {
      title: t('Authentic models'),
      detail: t('No substitutions or downgrades'),
      icon: (
        <Badge
          variant='outline'
          className='border-green-700 text-green-700 dark:border-green-400 dark:text-green-400'
        >
          REAL
        </Badge>
      ),
    },
    {
      title: t('100× compensation'),
      detail: t('For confirmed model impersonation'),
      icon: (
        <ShieldCheck className='size-10 text-blue-700 dark:text-blue-300' />
      ),
    },
  ]

  const docsLink = {
    title: t('Integration guide'),
    href: docsUrl,
    external: /^https?:/.test(docsUrl),
  }

  return (
    <PublicLayout
      siteName={props.siteName}
      showMainContainer={false}
      showNotifications={false}
      headerProps={{
        preferProvidedNavLinks: true,
        rightContent: (
          <Button size='sm' render={<Link to='/dashboard' />}>
            {t('Console', { ns: 'translation' })}
          </Button>
        ),
        showAuthButtons: false,
      }}
      navLinks={
        props.showClaudeOffers
          ? [{ title: t('Model pricing'), href: '/#model-prices' }, docsLink]
          : []
      }
    >
      <main>
        <section className='via-background relative isolate bg-linear-to-br from-sky-100/75 to-violet-100/75 px-4 pt-28 pb-16 sm:px-6 lg:pt-36 lg:pb-24 dark:from-sky-950/45 dark:to-violet-950/45'>
          <div className='mx-auto grid max-w-6xl items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.85fr)]'>
            <div>
              <h1 className='text-4xl leading-tight font-bold tracking-tight sm:text-5xl'>
                <span className='bg-linear-to-r from-blue-700 to-violet-700 bg-clip-text text-transparent dark:from-sky-300 dark:to-violet-300'>
                  {props.showClaudeOffers ? 'Claude API' : props.siteName}
                </span>
                <br />
                {t('Pay as you go')}
              </h1>
              <p className='text-muted-foreground mt-4 max-w-md'>
                {showPricing
                  ? t('Compare input and output costs per million tokens.')
                  : t('Vast Range of AI Models', { ns: 'translation' })}
              </p>
              <Button className='mt-6 h-11 px-5' render={<Link to='/keys' />}>
                {t('Get an API key')}
              </Button>
            </div>
            {props.showClaudeOffers && <ModelPricing />}
            {showLivePricing && <LiveModelPricing siteName={props.siteName} />}
            {!showPricing && (
              <GatewayCard logo={logo} systemName={props.siteName} />
            )}
          </div>
        </section>

        {props.showClaudeOffers && (
          <div className='mx-auto max-w-6xl space-y-14 px-4 py-12 sm:px-6 lg:space-y-18 lg:py-16'>
            <ul className='bg-card grid divide-y rounded-2xl border md:grid-cols-3 md:divide-x md:divide-y-0'>
              {guarantees.map((item) => (
                <li
                  key={item.title}
                  className='flex items-center gap-4 px-5 py-7'
                >
                  <span
                    aria-hidden='true'
                    className='flex w-12 shrink-0 justify-center'
                  >
                    {item.icon}
                  </span>
                  <div>
                    <h2 className='text-lg font-bold'>{item.title}</h2>
                    <p className='text-muted-foreground mt-1 text-sm'>
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <SubscriptionPlans />
            <section
              aria-labelledby='payments-heading'
              className='flex flex-wrap items-center gap-x-8 gap-y-5 border-y py-6'
            >
              <h2 id='payments-heading' className='text-base font-bold'>
                {t('Payment methods')}
              </h2>
              <ul className='flex flex-wrap items-center gap-x-6 gap-y-4'>
                {paymentMethods.map(({ name, Icon, color }) => (
                  <li
                    key={name}
                    className='flex items-center gap-2 text-sm font-medium'
                  >
                    <Icon aria-hidden='true' className={`size-5 ${color}`} />
                    {t(name, { ns: 'translation' })}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </main>
      <Footer
        name={props.siteName}
        description={
          props.showClaudeOffers ? t('Claude API service') : undefined
        }
        className='bg-muted/35'
        columns={
          props.showClaudeOffers
            ? [
                {
                  title: t('Model pricing'),
                  links: [
                    { text: t('Model pricing'), href: '/#model-prices' },
                    {
                      text: t('Subscription plans'),
                      href: '/#subscription-plans',
                    },
                  ],
                },
                {
                  title: t('Resources', { ns: 'translation' }),
                  links: [
                    { text: t('Integration guide'), href: docsUrl },
                    ...(typeof statusUrl === 'string' &&
                    statusUrl.startsWith('https://')
                      ? [{ text: t('Service status'), href: statusUrl }]
                      : []),
                  ],
                },
              ]
            : []
        }
      />
      {typeof supportUrl === 'string' && supportUrl.startsWith('https://') && (
        <Button
          size='icon-lg'
          className='fixed right-5 bottom-5 z-40 size-12 rounded-full shadow-lg'
          aria-label={t('Contact support')}
          render={<a href={supportUrl} target='_blank' rel='noreferrer' />}
        >
          <MessageCircle aria-hidden='true' className='size-5' />
        </Button>
      )}
    </PublicLayout>
  )
}

export function MyClaudeHome() {
  const { status, loading } = useStatus()
  const isMy28 = status?.system_name === 'MY28'
  return (
    <Home
      fallback={
        loading ? undefined : (
          <LandingPage
            siteName={isMy28 ? 'MY28' : 'MyClaude'}
            showClaudeOffers={!isMy28}
          />
        )
      }
    />
  )
}
