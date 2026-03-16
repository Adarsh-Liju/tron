"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, className, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props}
            className={cn(
              "bg-[rgba(0,19,24,0.98)] border-2 border-tron-cyan/60 backdrop-blur-md shadow-[0_0_20px_rgba(0,234,255,0.4)] font-mono",
              className
            )}
          >
            <div className="grid gap-1">
              {title && (
                <ToastTitle className="text-tron-cyan font-orbitron uppercase tracking-wider text-xs">
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className="text-tron-cyan/90 text-sm">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-tron-cyan/50 hover:text-tron-cyan" />
          </Toast>
        )
      })}
      <ToastViewport className="top-0 right-0" />
    </ToastProvider>
  )
}
