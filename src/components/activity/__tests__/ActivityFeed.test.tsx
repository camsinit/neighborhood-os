import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ActivityFeed from '../ActivityFeed'
import { createMockActivity } from '@/test/testUtils'

vi.mock('@/hooks/useActivities', () => ({
  useActivities: vi.fn()
}))

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn()
      }))
    })),
    removeChannel: vi.fn()
  }
}))

vi.mock('../ActivityItem', () => ({
  default: ({ activity, onAction }: any) => (
    <div data-testid={`activity-item-${activity.id}`} onClick={() => onAction(activity)}>
      {activity.title}
    </div>
  )
}))

vi.mock('../ActivityDetailsSheet', () => ({
  default: ({ activity, open }: any) => 
    open && activity ? <div data-testid="activity-details-sheet">{activity.title}</div> : null
}))

const mockUseActivities = vi.fn()
const mockedUseActivities = vi.mocked(await import('@/hooks/useActivities')).useActivities

const renderActivityFeed = () => {
  return render(
    <BrowserRouter>
      <ActivityFeed />
    </BrowserRouter>
  )
}

describe('ActivityFeed', () => {
  const mockRefetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockedUseActivities.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetch,
      isRefetching: false,
      error: null,
      isError: false,
      isSuccess: true,
      status: 'success'
    } as any)
  })

  it('shows loading skeletons when loading', () => {
    mockedUseActivities.mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: mockRefetch,
      isRefetching: false,
      error: null,
      isError: false,
      isSuccess: false,
      status: 'loading'
    } as any)

    const { container } = renderActivityFeed()
    
    const skeletonElements = container.querySelectorAll('.animate-pulse')
    expect(skeletonElements).toHaveLength(16) // 4 skeleton rows × 4 skeleton elements per row
  })

  it('shows empty state when no activities', () => {
    mockedUseActivities.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetch,
      isRefetching: false,
      error: null,
      isError: false,
      isSuccess: true,
      status: 'success'
    } as any)

    renderActivityFeed()
    
    expect(screen.getByText(/no new neighborhood activity/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
  })

  it('renders activities when data is available', () => {
    const mockActivities = [
      createMockActivity({ id: '1', title: 'Activity 1' }),
      createMockActivity({ id: '2', title: 'Activity 2' })
    ]

    mockedUseActivities.mockReturnValue({
      data: mockActivities as any,
      isLoading: false,
      refetch: mockRefetch,
      isRefetching: false,
      error: null,
      isError: false,
      isSuccess: true,
      status: 'success'
    } as any)

    renderActivityFeed()
    
    expect(screen.getByTestId('activity-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('activity-item-2')).toBeInTheDocument()
    expect(screen.getByText('Activity 1')).toBeInTheDocument()
    expect(screen.getByText('Activity 2')).toBeInTheDocument()
  })

  it('filters out deleted activities', () => {
    const mockActivities = [
      createMockActivity({ id: '1', title: 'Active Activity' }),
      createMockActivity({ 
        id: '2', 
        title: 'Deleted Activity',
        metadata: { deleted: true }
      })
    ]

    mockedUseActivities.mockReturnValue({
      data: mockActivities as any,
      isLoading: false,
      refetch: mockRefetch,
      isRefetching: false,
      error: null,
      isError: false,
      isSuccess: true,
      status: 'success'
    } as any)

    renderActivityFeed()
    
    expect(screen.getByTestId('activity-item-1')).toBeInTheDocument()
    expect(screen.queryByTestId('activity-item-2')).not.toBeInTheDocument()
    expect(screen.getByText('Active Activity')).toBeInTheDocument()
    expect(screen.queryByText('Deleted Activity')).not.toBeInTheDocument()
  })

  it('shows load more button when there are more activities', () => {
    const mockActivities = Array.from({ length: 10 }, (_, i) => 
      createMockActivity({ id: `${i + 1}`, title: `Activity ${i + 1}` })
    )

    mockedUseActivities.mockReturnValue({
      data: mockActivities as any,
      isLoading: false,
      refetch: mockRefetch,
      isRefetching: false,
      error: null,
      isError: false,
      isSuccess: true,
      status: 'success'
    } as any)

    renderActivityFeed()
    
    expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument()
  })

  it('loads more activities when load more button is clicked', () => {
    const mockActivities = Array.from({ length: 10 }, (_, i) => 
      createMockActivity({ id: `${i + 1}`, title: `Activity ${i + 1}` })
    )

    mockedUseActivities.mockReturnValue({
      data: mockActivities as any,
      isLoading: false,
      refetch: mockRefetch,
      isRefetching: false,
      error: null,
      isError: false,
      isSuccess: true,
      status: 'success'
    } as any)

    renderActivityFeed()
    
    expect(screen.getAllByTestId(/activity-item-/)).toHaveLength(4)
    
    const loadMoreButton = screen.getByRole('button', { name: /load more/i })
    fireEvent.click(loadMoreButton)
    
    expect(screen.getAllByTestId(/activity-item-/)).toHaveLength(8)
  })

  it('opens activity details sheet when activity is clicked', () => {
    const mockActivity = createMockActivity({ id: '1', title: 'Test Activity' })

    mockedUseActivities.mockReturnValue({
      data: [mockActivity] as any,
      isLoading: false,
      refetch: mockRefetch,
      isRefetching: false,
      error: null,
      isError: false,
      isSuccess: true,
      status: 'success'
    } as any)

    renderActivityFeed()
    
    const activityItem = screen.getByTestId('activity-item-1')
    fireEvent.click(activityItem)
    
    expect(screen.getByTestId('activity-details-sheet')).toBeInTheDocument()
    expect(screen.getByTestId('activity-details-sheet')).toHaveTextContent('Test Activity')
  })

  it('calls refetch when refresh button is clicked', () => {
    mockedUseActivities.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetch,
      isRefetching: false,
      error: null,
      isError: false,
      isSuccess: true,
      status: 'success'
    } as any)

    renderActivityFeed()
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)
    
    expect(mockRefetch).toHaveBeenCalled()
  })
})
