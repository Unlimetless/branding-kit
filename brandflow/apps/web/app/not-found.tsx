import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: '#1a1a2e' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#666' }}>Page Not Found</h2>
      <Link href="/" style={{
        padding: '0.75rem 1.5rem',
        background: '#6366f1',
        color: 'white',
        borderRadius: '0.5rem',
        textDecoration: 'none',
      }}>
        Go Home
      </Link>
    </div>
  )
}