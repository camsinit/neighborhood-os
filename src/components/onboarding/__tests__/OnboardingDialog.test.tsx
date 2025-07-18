import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import OnboardingDialog from '../OnboardingDialog'
import { createMockUser, mockNavigate, mockUseToast } from '@/test/testUtils'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}))

vi.mock('@supabase/auth-helpers-react', () => ({
  useUser: vi.fn()
}))

vi.mock('@/hooks/useFormSubmission', () => ({
  useFormSubmission: vi.fn()
}))

vi.mock('../hooks/usePendingInviteHandler', () => ({
  usePendingInviteHandler: vi.fn()
}))

vi.mock('./survey/SurveyDialog', () => ({
  default: ({ open, onOpenChange, onComplete, isTestMode }: any) => {
    if (!open) return null
    
    return (
      <div role="dialog" data-testid="survey-dialog">
        <div>Survey Dialog Content</div>
        <button 
          onClick={() => onComplete({ displayName: 'Test User' })}
          data-testid="complete-button"
        >
          Complete Survey
        </button>
        {isTestMode && <div data-testid="test-mode">Test Mode Active</div>}
      </div>
    )
  }
}))

const mockUseUser = vi.mocked(await import('@supabase/auth-helpers-react')).useUser
const mockUseFormSubmission = vi.mocked(await import('@/hooks/useFormSubmission')).useFormSubmission
const mockUsePendingInviteHandler = vi.mocked(await import('../hooks/usePendingInviteHandler')).usePendingInviteHandler

const renderOnboardingDialog = (props = {}) => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    ...props
  }
  
  return render(
    <BrowserRouter>
      <OnboardingDialog {...defaultProps} />
    </BrowserRouter>
  )
}

describe('OnboardingDialog', () => {
  const mockSubmitForm = vi.fn()
  const mockClearPendingInvite = vi.fn()
  const mockToast = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseUser.mockReturnValue(createMockUser())
    mockUseFormSubmission.mockReturnValue({
      submitForm: mockSubmitForm,
      submissionState: { 
        isSubmitting: false,
        progress: 0,
        error: null,
        success: false
      },
      resetSubmission: vi.fn()
    })
    mockUsePendingInviteHandler.mockReturnValue({
      hasPendingInvite: false,
      pendingInviteCode: '',
      clearPendingInvite: mockClearPendingInvite
    })
  })


  it('renders dialog when open', () => {
    renderOnboardingDialog()
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderOnboardingDialog({ open: false })
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders with test mode prop', () => {
    renderOnboardingDialog({ isTestMode: true })
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
