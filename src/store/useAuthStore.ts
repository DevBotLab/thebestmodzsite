import { create } from 'zustand'
import type { UserDTO } from '@/types'

interface AuthState {
  user: UserDTO | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: UserDTO) => void
  logout: () => void
  checkAuth: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user: UserDTO) => {
    set({ user, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true })
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data) {
          set({ user: data.data, isAuthenticated: true, isLoading: false })
          return
        }
      }
      set({ user: null, isAuthenticated: false, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
