'use client'

import { useState } from 'react'
import Link from 'next/link'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    nameKa: 'სტარტერი',
    nameRu: 'Стартер',
    price: 49,
    currency: 'GEL',
    postsPerMonth: 30,
    platforms: 2,
    features: [
      'AI caption generation',
      'Background removal',
      'Multi-platform posting',
      'Basic templates',
      'Email support',
    ],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    nameKa: 'პროფესიონალი',
    nameRu: 'Профессионал',
    price: 149,
    currency: 'GEL',
    postsPerMonth: 100,
    platforms: 5,
    features: [
      'Everything in Starter',
      'Priority AI processing',
      'Brand kit customization',
      'Analytics dashboard',
      'Advanced templates',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    nameKa: 'ენტერფრაიზი',
    nameRu: 'Корпоративный',
    price: 499,
    currency: 'GEL',
    postsPerMonth: -1,
    platforms: -1,
    features: [
      'Everything in Professional',
      'Unlimited posts',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    popular: false,
  },
]

export default function PricingPage() {
  const [locale, setLocale] = useState<'ka' | 'ru' | 'en'>('ka')

  const getPlanName = (plan: typeof plans[0]) => {
    if (locale === 'ka') return plan.nameKa
    if (locale === 'ru') return plan.nameRu
    return plan.name
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <header style={{
        background: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>BrandFlow</h1>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/contents">Contents</Link>
          <Link href="/pricing" style={{ fontWeight: 'bold', color: '#6366f1' }}>Pricing</Link>
        </nav>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['ka', 'ru', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              style={{
                padding: '0.25rem 0.75rem',
                background: locale === l ? '#6366f1' : 'transparent',
                color: locale === l ? 'white' : '#666',
                border: '1px solid #e5e5e5',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      <main style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            {locale === 'ka' ? 'აირჩიე შენი გეგმა' : 
             locale === 'ru' ? 'Выберите ваш план' : 
             'Choose Your Plan'}
          </h2>
          <p style={{ color: '#666', fontSize: '1.125rem' }}>
            {locale === 'ka' ? 'დაიწყე უფასოდ, აიყარე შეზღუდვები პრემიუმ გეგმით' :
             locale === 'ru' ? 'Начните бесплатно, разблокируйте без ограничений с премиум планом' :
             'Start free, unlock unlimited with premium plan'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: plan.popular ? '0 20px 40px rgba(99,102,241,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
              border: plan.popular ? '2px solid #6366f1' : '1px solid #e5e5e5',
              transform: plan.popular ? 'scale(1.05)' : 'none',
              position: 'relative',
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#6366f1',
                  color: 'white',
                  padding: '0.25rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 'medium',
                }}>
                  {locale === 'ka' ? 'პოპულარული' : locale === 'ru' ? 'Популярный' : 'Popular'}
                </div>
              )}

              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{getPlanName(plan)}</h3>
              
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>{plan.price}</span>
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>{plan.currency}/{locale === 'ka' ? 'თვე' : locale === 'ru' ? 'мес' : 'mo'}</span>
              </div>

              <div style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.875rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  {plan.postsPerMonth === -1 
                    ? (locale === 'ka' ? 'ულემოვნება პოსტები' : locale === 'ru' ? 'Безлимитные посты' : 'Unlimited posts')
                    : `${plan.postsPerMonth} ${locale === 'ka' ? 'პოსტი/თვე' : locale === 'ru' ? 'постов/мес' : 'posts/mo'}`
                  }
                </div>
                <div>
                  {plan.platforms === -1 
                    ? (locale === 'ka' ? 'ყველა პლატფორმა' : locale === 'ru' ? 'Все платформы' : 'All platforms')
                    : `${plan.platforms} ${locale === 'ka' ? 'პლატფორმა' : locale === 'ru' ? 'платформ' : 'platforms'}`
                  }
                </div>
              </div>

              <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <span style={{ color: '#10b981' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button style={{
                width: '100%',
                padding: '1rem',
                background: plan.popular ? '#6366f1' : 'transparent',
                color: plan.popular ? 'white' : '#6366f1',
                border: plan.popular ? 'none' : '2px solid #6366f1',
                borderRadius: '0.5rem',
                fontWeight: 'medium',
                cursor: 'pointer',
              }}>
                {locale === 'ka' ? 'აირჩიე' : locale === 'ru' ? 'Выбрать' : 'Choose'}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}