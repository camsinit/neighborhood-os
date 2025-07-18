import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import EventCard from '../EventCard'

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null })),
          single: vi.fn(() => Promise.resolve({ data: { timezone: 'America/Los_Angeles' } }))
        }))
      }))
    }))
  }
}))

// Mock the auth hook
vi.mock('@supabase/auth-helpers-react', () => ({
  useUser: () => null
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}))

// Mock the navigation service
vi.mock('@/services/navigation/ItemNavigationService', () => ({
  createItemNavigationService: () => ({
    navigateToItem: vi.fn()
  })
}))

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    title: 'Neighborhood BBQ',
    time: '2024-01-15T18:00:00Z',
    host_id: 'host-123',
    neighborhood_id: 'neighborhood-1',
    created_at: '2024-01-01T00:00:00Z'
  }

  it('renders event title', () => {
    render(<EventCard event={mockEvent} />)

    expect(screen.getByText('Neighborhood BBQ')).toBeInTheDocument()
  })

  it('displays the event as clickable', () => {
    render(<EventCard event={mockEvent} />)

    // Find the parent div that contains the cursor-pointer class
    const eventCard = screen.getByText('Neighborhood BBQ').closest('[data-event-id]')
    expect(eventCard).toHaveClass('cursor-pointer')
  })
})
