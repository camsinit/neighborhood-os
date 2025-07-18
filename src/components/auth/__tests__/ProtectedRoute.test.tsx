import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'
import { mockNeighborhoodContext, mockSessionContext, createMockUser } from '@/test/testUtils'

vi.mock('@supabase/auth-helpers-react', () => ({
  useUser: vi.fn(),
  useSessionContext: vi.fn()
}))

vi.mock('@/contexts/neighborhood', () => ({
  useNeighborhood: vi.fn()
}))

vi.mock('../hooks/useOnboardingStatus', () => ({
  useOnboardingStatus: vi.fn()
}))

vi.mock('../hooks/useGuestOnboardingMode', () => ({
  useGuestOnboardingMode: vi.fn()
}))

const mockUseUser = vi.mocked(await import('@supabase/auth-helpers-react')).useUser
const mockUseSessionContext = vi.mocked(await import('@supabase/auth-helpers-react')).useSessionContext
const mockUseNeighborhood = vi.mocked(await import('@/contexts/neighborhood')).useNeighborhood
const mockUseOnboardingStatus = vi.mocked(await import('../hooks/useOnboardingStatus')).useOnboardingStatus
const mockUseGuestOnboardingMode = vi.mocked(await import('../hooks/useGuestOnboardingMode')).useGuestOnboardingMode

const renderProtectedRoute = (children = <div>Protected Content</div>) => {
  return render(
    <BrowserRouter>
      <ProtectedRoute>{children}</ProtectedRoute>
    </BrowserRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseSessionContext.mockReturnValue(mockSessionContext)
    mockUseNeighborhood.mockReturnValue(mockNeighborhoodContext)
    mockUseOnboardingStatus.mockReturnValue({
      isCheckingOnboarding: false,
      needsOnboarding: false
    })
    mockUseGuestOnboardingMode.mockReturnValue({
      isGuestOnboardingMode: false
    })
  })

  it('renders children when user is authenticated and has neighborhood', () => {
    mockUseUser.mockReturnValue(createMockUser())
    
    renderProtectedRoute()
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('shows loading spinner when authentication is loading', () => {
    mockUseUser.mockReturnValue(null)
    mockUseSessionContext.mockReturnValue({
      ...mockSessionContext,
      isLoading: true,
      session: null
    })
    
    renderProtectedRoute()
    
    expect(screen.getByText(/checking authentication/i)).toBeInTheDocument()
  })

  it('shows loading spinner when neighborhood is loading', () => {
    mockUseUser.mockReturnValue(createMockUser())
    mockUseNeighborhood.mockReturnValue({
      ...mockNeighborhoodContext,
      isLoading: true
    })
    
    renderProtectedRoute()
    
    expect(screen.getByText(/loading neighborhood/i)).toBeInTheDocument()
  })

  it('shows loading spinner when onboarding status is being checked', () => {
    mockUseUser.mockReturnValue(createMockUser())
    mockUseOnboardingStatus.mockReturnValue({
      isCheckingOnboarding: true,
      needsOnboarding: false
    })
    
    renderProtectedRoute()
    
    expect(screen.getByText(/checking onboarding status/i)).toBeInTheDocument()
  })

  it('shows loading when user has no neighborhood', () => {
    mockUseUser.mockReturnValue(createMockUser())
    mockUseNeighborhood.mockReturnValue({
      ...mockNeighborhoodContext,
      currentNeighborhood: null
    })
    
    renderProtectedRoute()
    
    expect(screen.getByText(/setting up your neighborhood/i)).toBeInTheDocument()
  })
})
