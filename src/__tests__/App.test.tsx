import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'
import { createMockUser, mockSessionContext, mockNeighborhoodContext } from '@/test/testUtils'

vi.mock('@supabase/auth-helpers-react', () => ({
  SessionContextProvider: ({ children }: any) => <div>{children}</div>,
  useUser: vi.fn(),
  useSessionContext: vi.fn()
}))

vi.mock('@/contexts/neighborhood', () => ({
  NeighborhoodProvider: ({ children }: any) => <div>{children}</div>,
  useNeighborhood: vi.fn()
}))

vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(() => ({})),
  QueryClientProvider: ({ children }: any) => <div>{children}</div>
}))

vi.mock('@/components/auth/ProtectedRoute', () => ({
  default: ({ children }: any) => <div data-testid="protected-route">{children}</div>
}))

vi.mock('@/components/layout/MainLayout', () => ({
  default: ({ children }: any) => <div data-testid="main-layout">{children}</div>
}))

vi.mock('@/pages/LandingPage', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>
}))

vi.mock('@/pages/Login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}))

vi.mock('@/pages/HomePage', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}))

vi.mock('@/components/ErrorBoundary', () => ({
  default: ({ children }: any) => <div data-testid="error-boundary">{children}</div>
}))

const mockUseUser = vi.mocked(await import('@supabase/auth-helpers-react')).useUser
const mockUseSessionContext = vi.mocked(await import('@supabase/auth-helpers-react')).useSessionContext
const mockUseNeighborhood = vi.mocked(await import('@/contexts/neighborhood')).useNeighborhood

Object.defineProperty(window, 'location', {
  value: {
    pathname: '/',
    search: '',
    hash: '',
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000'
  },
  writable: true
})

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseUser.mockReturnValue(null)
    mockUseSessionContext.mockReturnValue(mockSessionContext)
    mockUseNeighborhood.mockReturnValue(mockNeighborhoodContext)
  })

  it('renders without crashing', () => {
    render(<App />)
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
  })

  it('renders landing page at root path', () => {
    window.location.pathname = '/'
    
    render(<App />)
    
    expect(screen.getByTestId('landing-page')).toBeInTheDocument()
  })

  it('renders login page at /login path', () => {
    window.location.pathname = '/login'
    
    render(<App />)
    
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })

  it('wraps protected routes with ProtectedRoute component', () => {
    mockUseUser.mockReturnValue(createMockUser())
    window.location.pathname = '/home'
    
    render(<App />)
    
    expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    expect(screen.getByTestId('main-layout')).toBeInTheDocument()
  })

  it('includes context providers', () => {
    render(<App />)
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
  })
})
