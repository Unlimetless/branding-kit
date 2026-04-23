'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalContents: 0,
    publishedPosts: 0,
    thisMonthPosts: 0,
    plan: 'starter',
  })
  const [recentContent, setRecentContent] = useState<Array<{
    id: string
    type: string
    platform: string
    status: string
    createdAt: string
  }>>([])

  useEffect(() => {
    setStats({
      totalContents: 12,
      publishedPosts: 8,
      thisMonthPosts: 5,
      plan: 'starter',
    })
    setRecentContent([
      { id: '1', type: 'image', platform: 'instagram', status: 'published', createdAt: '2026-04-22' },
      { id: '2', type: 'image', platform: 'facebook', status: 'published', createdAt: '2026-04-21' },
      { id: '3', type: 'video', platform: 'tiktok', status: 'processing', createdAt: '2026-04-23' },
    ])
  }, [])

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
          <Link href="/dashboard" style={{ fontWeight: 'bold', color: '#6366f1' }}>Dashboard</Link>
          <Link href="/contents">Contents</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>demo@brandflow.ge</span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#6366f1',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            D
          </div>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Dashboard</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard title="Total Contents" value={stats.totalContents} />
          <StatCard title="Published Posts" value={stats.publishedPosts} />
          <StatCard title="This Month" value={stats.thisMonthPosts} />
          <StatCard title="Current Plan" value={stats.plan} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Recent Content</h3>
              <Link href="/contents" style={{ color: '#6366f1', fontSize: '0.875rem' }}>
                View all →
              </Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentContent.map((content) => (
                <div key={content.id} style={{
                  padding: '1rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#f3f4f6',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                  }}>
                    {content.type}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'medium' }}>{content.platform}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>{content.createdAt}</div>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    background: content.status === 'published' ? '#d1fae5' : '#fef3c7',
                    color: content.status === 'published' ? '#065f46' : '#92400e',
                  }}>
                    {content.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Actions</h3>
              <Link href="/contents?new=true" style={{
                display: 'block',
                width: '100%',
                padding: '1rem',
                background: '#6366f1',
                color: 'white',
                borderRadius: '0.5rem',
                textAlign: 'center',
                fontWeight: 'medium',
              }}>
                Create New Content
              </Link>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Need More?</h3>
              <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.875rem' }}>
                Upgrade your plan to unlock more features
              </p>
              <Link href="/pricing" style={{
                display: 'block',
                padding: '0.75rem',
                border: '1px solid #6366f1',
                color: '#6366f1',
                borderRadius: '0.5rem',
                textAlign: 'center',
                fontWeight: 'medium',
              }}>
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</div>
    </div>
  )
}