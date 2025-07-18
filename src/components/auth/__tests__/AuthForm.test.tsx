import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AuthForm from '../AuthForm'
import { mockSupabaseClient, mockNavigate, mockUseToast } from '@/test/testUtils'

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}))

const renderAuthForm = () => {
  return render(
    <BrowserRouter>
      <AuthForm />
    </BrowserRouter>
  )
}

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email and password fields', () => {
    renderAuthForm()
    
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('renders Google sign-in button', () => {
    renderAuthForm()
    
    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument()
  })

  it('renders waitlist redirect button', () => {
    renderAuthForm()
    
    expect(screen.getByRole('button', { name: 'Need an account? Join the Waitlist!' })).toBeInTheDocument()
  })

  it('handles form submission with email and password', async () => {
    const mockSignInWithPassword = vi.fn().mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    })
    
    vi.mocked(await import('@/integrations/supabase/client')).supabase.auth.signInWithPassword = mockSignInWithPassword

    renderAuthForm()
    
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('displays error message on authentication failure', async () => {
    const mockSignInWithPassword = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' }
    })
    
    vi.mocked(await import('@/integrations/supabase/client')).supabase.auth.signInWithPassword = mockSignInWithPassword

    renderAuthForm()
    
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })

  it('handles Google sign-in', async () => {
    const mockSignInWithOAuth = vi.fn().mockResolvedValue({
      data: {},
      error: null
    })
    
    vi.mocked(await import('@/integrations/supabase/client')).supabase.auth.signInWithOAuth = mockSignInWithOAuth

    renderAuthForm()
    
    const googleButton = screen.getByRole('button', { name: 'Sign in with Google' })
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback')
        }
      })
    })
  })

  it('navigates to waitlist when waitlist button is clicked', () => {
    renderAuthForm()
    
    const waitlistButton = screen.getByRole('button', { name: 'Need an account? Join the Waitlist!' })
    fireEvent.click(waitlistButton)

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })
})
