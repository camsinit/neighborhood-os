import React from 'react'
import { vi } from 'vitest'

export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  email_confirmed_at: '2024-01-01T00:00:00Z',
  last_sign_in_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  identities: [],
  ...overrides
})

export const createMockProfile = (overrides = {}) => ({
  id: 'profile-123',
  display_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockNeighborhood = (overrides = {}) => ({
  id: 'neighborhood-123',
  name: 'Test Neighborhood',
  timezone: 'America/Los_Angeles',
  ...overrides
})

export const createMockEvent = (overrides = {}) => ({
  id: 'event-123',
  event_id: 'event-123',
  title: 'Test Event',
  description: 'Test event description',
  time: '2024-01-15T18:00:00Z',
  location: 'Test Location',
  host_id: 'host-123',
  is_recurring: false,
  neighborhood_id: 'neighborhood-123',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockActivity = (overrides = {}) => ({
  id: 'activity-123',
  activity_type: 'event_created',
  title: 'Test Activity',
  content_id: 'content-123',
  actor_id: 'user-123',
  created_at: '2024-01-01T00:00:00Z',
  profiles: createMockProfile(),
  ...overrides
})

export const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(() => Promise.resolve({ data: null })),
        single: vi.fn(() => Promise.resolve({ data: { timezone: 'America/Los_Angeles' } }))
      }))
    }))
  })),
  auth: {
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn()
  }
}

export const mockNavigate = vi.fn()

export const mockNavigationService = {
  navigateToItem: vi.fn(() => Promise.resolve({ success: true }))
}

export const mockUseToast = () => ({
  toast: vi.fn()
})

export const mockNeighborhoodContext = {
  currentNeighborhood: createMockNeighborhood(),
  neighborhoods: [createMockNeighborhood()],
  isLoading: false,
  error: null,
  refetch: vi.fn()
}

export const mockSessionContext = {
  isLoading: false,
  session: {
    user: createMockUser(),
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer'
  },
  error: null,
  supabaseClient: mockSupabaseClient
}
