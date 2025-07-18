import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MainLayout from '../MainLayout'

vi.mock('../sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}))

vi.mock('../Header', () => ({
  default: ({ onOpenSettings }: any) => (
    <div data-testid="header">
      Header
      <button onClick={onOpenSettings}>Settings</button>
    </div>
  )
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: vi.fn()
  }
})

const mockUseLocation = vi.mocked(await import('react-router-dom')).useLocation

const renderMainLayout = (children = <div>Test Content</div>) => {
  return render(
    <BrowserRouter>
      <MainLayout>{children}</MainLayout>
    </BrowserRouter>
  )
}

describe('MainLayout', () => {
  it('renders sidebar and main content', () => {
    mockUseLocation.mockReturnValue({ pathname: '/calendar' } as any)
    
    renderMainLayout()
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders header when on home page', () => {
    mockUseLocation.mockReturnValue({ pathname: '/home' } as any)
    
    renderMainLayout()
    
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('does not render header when not on home page', () => {
    mockUseLocation.mockReturnValue({ pathname: '/calendar' } as any)
    
    renderMainLayout()
    
    expect(screen.queryByTestId('header')).not.toBeInTheDocument()
  })

  it('has proper layout structure', () => {
    mockUseLocation.mockReturnValue({ pathname: '/home' } as any)
    
    const { container } = renderMainLayout()
    
    const layoutContainer = container.firstChild
    expect(layoutContainer).toHaveClass('h-screen', 'flex')
  })

  it('renders children in main element', () => {
    mockUseLocation.mockReturnValue({ pathname: '/calendar' } as any)
    
    renderMainLayout(<div data-testid="custom-content">Custom Content</div>)
    
    const mainElement = screen.getByRole('main')
    expect(mainElement).toContainElement(screen.getByTestId('custom-content'))
  })
})
