'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      containerClassName="mt-16"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'rgba(18, 18, 26, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: '#F5F5F5',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '10px',
          fontSize: '14px',
          padding: '12px 16px',
          maxWidth: '400px',
        },
        success: {
          iconTheme: {
            primary: '#84CC16',
            secondary: '#F5F5F5',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#F5F5F5',
          },
        },
      }}
    />
  )
}
