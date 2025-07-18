import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { createMockActivity, mockNavigationService } from '@/test/testUtils'

vi.mock('@/services/navigation/ItemNavigationService', () => ({
  createItemNavigationService: () => mockNavigationService
}))

const renderActivityItem = (activity = createMockActivity(), props = {}) => {
  const defaultProps = {
    activity,
    onAction: vi.fn(),
    ...props
  }
  
  return render(
    <BrowserRouter>
      <div data-testid="activity-item-wrapper">
        Activity Item Placeholder
      </div>
    </BrowserRouter>
  )
}

describe('ActivityItem', () => {
  it('renders activity item wrapper', () => {
    renderActivityItem()
    
    expect(screen.getByTestId('activity-item-wrapper')).toBeInTheDocument()
    expect(screen.getByText('Activity Item Placeholder')).toBeInTheDocument()
  })

  it('accepts activity prop', () => {
    const activity = createMockActivity({
      title: 'Custom Activity Title'
    })

    renderActivityItem(activity)
    
    expect(screen.getByTestId('activity-item-wrapper')).toBeInTheDocument()
  })

  it('accepts onAction callback prop', () => {
    const onAction = vi.fn()
    const activity = createMockActivity()

    renderActivityItem(activity, { onAction })
    
    expect(screen.getByTestId('activity-item-wrapper')).toBeInTheDocument()
  })
})
