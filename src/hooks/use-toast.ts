
import { toast as sonnerToast } from "sonner"

// Define ToastActionElement type
type ToastActionElement = React.ReactElement

// Define the main toast interface
export interface Toast {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"
  duration?: number
}

// Define the toast function interface
export interface ToastOptions {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"
  duration?: number
}

// Create toast function that supports both APIs
// 1. sonner style: toast("Message")
// 2. old style: toast({ title: "Title", description: "Message" })
export const toast = (options: ToastOptions | string) => {
  if (typeof options === "string") {
    return sonnerToast(options)
  }
  
  const { title, description, variant, duration } = options
  
  if (variant === "destructive") {
    return sonnerToast.error(title as string, {
      description: description,
      duration: duration
    })
  }
  
  return sonnerToast(title as string, {
    description: description,
    duration: duration
  })
}

// Create useToast hook that returns toast object
export const useToast = () => {
  return {
    toast,
    // For backwards compatibility with the old toast API
    toasts: [] as Toast[]
  }
}
