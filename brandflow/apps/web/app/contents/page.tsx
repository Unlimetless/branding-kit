'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Content {
  id: string
  type: 'image' | 'video' | 'story'
  platform: string
  status: 'draft' | 'processing' | 'published' | 'failed'
  createdAt: string
  processedUrl?: string
}

export default function ContentsPage() {
  const [contents] = useState<Content[]>([
    { id: '1', type: 'image', platform: 'instagram', status: 'published', createdAt: '2026-04-22' },
    { id: '2', type: 'image', platform: 'facebook', status: 'published', createdAt: '2026-04-21' },
    { id: '3', type: 'video', platform: 'tiktok', status: 'processing', createdAt: '2026-04-23' },
    { id: '4', type: 'story', platform: 'instagram', status: 'draft', createdAt: '2026-04-20' },
  ])
  const [filter, setFilter] = useState<string>('all')

  const filteredContents = filter === 'all' 
    ? contents 
    : contents.filter(c => c.status === filter)

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
          <Link href="/contents" style={{ fontWeight: 'bold', color: '#6366f1' }}>Contents</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Contents</h2>
          <Link href="/contents/new" style={{
            padding: '0.75rem 1.5rem',
            background: '#6366f1',
            color: 'white',
            borderRadius: '0.5rem',
            fontWeight: 'medium',
          }}>
            + Create New
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['all', 'draft', 'processing', 'published', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '0.5rem 1rem',
                background: filter === status ? '#6366f1' : 'white',
                color: filter === status ? 'white' : '#666',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {filteredContents.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '4rem',
            textAlign: 'center',
            borderRadius: '0.5rem',
            color: '#666',
          }}>
            No content found
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filteredContents.map((content) => (
              <div key={content.id} style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <div style={{
                  width: '100%',
                  height: '160px',
                  background: '#f3f4f6',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  color: '#ccc',
                }}>
                  {content.type === 'video' ? '🎬' : '🖼️'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'medium', textTransform: 'capitalize' }}>{content.platform}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{content.createdAt}</div>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    background: content.status === 'published' ? '#d1fae5' : 
                               content.status === 'processing' ? '#fef3c7' :
                               content.status === 'failed' ? '#fee2e2' : '#f3f4f6',
                    color: content.status === 'published' ? '#065f46' : 
                           content.status === 'processing' ? '#92400e' :
                           content.status === 'failed' ? '#991b1b' : '#666',
                  }}>
                    {content.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}