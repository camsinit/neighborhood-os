import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HomePage from '../HomePage'

vi.mock('@/components/QuickActions', () => ({
  default: () => <div data-testid="quick-actions">Quick Actions</div>
}))

vi.mock('@/components/activity/ActivityFeed', () => ({
  default: () => <div data-testid="activity-feed">Activity Feed</div>
}))

vi.mock('@/components/notifications/NotificationBellOptimized', () => ({
  default: () => <div data-testid="notifications">Notifications</div>
}))

vi.mock('@/hooks/useCurrentNeighborhood', () => ({
  useCurrentNeighborhood: () => ({ id: 'test-neighborhood' })
}))

const renderHomePage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('HomePage', () => {
  it('renders the main layout components', () => {
    renderHomePage()
    
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
    expect(screen.getByTestId('activity-feed')).toBeInTheDocument()
  })

  it('renders section headers', () => {
    renderHomePage()
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Neighborhood Activity')).toBeInTheDocument()
  })
})
