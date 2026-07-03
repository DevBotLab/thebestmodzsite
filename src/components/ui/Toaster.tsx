'use client'

import { Toaster as HotToaster } from 'react-hot-toast'

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1A1A26',
          color: '#f5f5f5',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
        },
        success: {
          iconTheme: { primary: '#84CC16', secondary: '#1A1A26' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#1A1A26' },
        },
      }}
    />
  )
}
