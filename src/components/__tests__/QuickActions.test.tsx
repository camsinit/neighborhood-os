import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import QuickActions from '../QuickActions'
import { mockNavigate } from '@/test/testUtils'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('../AddEventDialog', () => ({
  default: ({ open, onOpenChange }: any) => 
    open ? <div data-testid="add-event-dialog">Add Event Dialog</div> : null
}))

vi.mock('../safety/AddSafetyUpdateDialogNew', () => ({
  default: ({ open, onOpenChange }: any) => 
    open ? <div data-testid="add-safety-dialog">Add Safety Dialog</div> : null
}))

vi.mock('../skills/AddSkillPopover', () => ({
  default: ({ open, onOpenChange }: any) => 
    open ? <div data-testid="add-skill-popover">Add Skill Popover</div> : null
}))

vi.mock('../goods/GoodsForm', () => ({
  default: ({ initialRequestType }: any) => (
    <div data-testid="goods-form">
      Goods Form - {initialRequestType}
    </div>
  )
}))

const renderQuickActions = () => {
  return render(
    <BrowserRouter>
      <QuickActions />
    </BrowserRouter>
  )
}

describe('QuickActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all action sections', () => {
    renderQuickActions()
    
    expect(screen.getByText('Freebies')).toBeInTheDocument()
    expect(screen.getByText('Skill Sharing')).toBeInTheDocument()
    expect(screen.getByText('Events & Updates')).toBeInTheDocument()
  })

  it('renders goods action buttons', () => {
    renderQuickActions()
    
    expect(screen.getByText('Share an item')).toBeInTheDocument()
    expect(screen.getByText('Request an item')).toBeInTheDocument()
  })

  it('renders skills action buttons', () => {
    renderQuickActions()
    
    expect(screen.getByText('Share a skill')).toBeInTheDocument()
    expect(screen.getByText('Request a skill')).toBeInTheDocument()
  })

  it('renders events and safety action buttons', () => {
    renderQuickActions()
    
    expect(screen.getByText('Add Event')).toBeInTheDocument()
    expect(screen.getByText('Add Safety Update')).toBeInTheDocument()
  })

  it('opens add event dialog when Add Event is clicked', () => {
    renderQuickActions()
    
    const addEventButton = screen.getByText('Add Event')
    fireEvent.click(addEventButton)
    
    expect(screen.getByTestId('add-event-dialog')).toBeInTheDocument()
  })

  it('opens safety update dialog when Add Safety Update is clicked', () => {
    renderQuickActions()
    
    const addSafetyButton = screen.getByText('Add Safety Update')
    fireEvent.click(addSafetyButton)
    
    expect(screen.getByTestId('add-safety-dialog')).toBeInTheDocument()
  })

  it('opens skill popover when Share a skill is clicked', () => {
    renderQuickActions()
    
    const shareSkillButton = screen.getByText('Share a skill')
    fireEvent.click(shareSkillButton)
    
    expect(screen.getByTestId('add-skill-popover')).toBeInTheDocument()
  })

  it('opens skill popover when Request a skill is clicked', () => {
    renderQuickActions()
    
    const requestSkillButton = screen.getByText('Request a skill')
    fireEvent.click(requestSkillButton)
    
    expect(screen.getByTestId('add-skill-popover')).toBeInTheDocument()
  })

  it('opens goods sheet with offer type when Share an item is clicked', () => {
    renderQuickActions()
    
    const shareItemButton = screen.getByText('Share an item')
    fireEvent.click(shareItemButton)
    
    expect(screen.getByText('Goods Form - offer')).toBeInTheDocument()
  })

  it('opens goods sheet with need type when Request an item is clicked', () => {
    renderQuickActions()
    
    const requestItemButton = screen.getByText('Request an item')
    fireEvent.click(requestItemButton)
    
    expect(screen.getByText('Goods Form - need')).toBeInTheDocument()
  })
})
