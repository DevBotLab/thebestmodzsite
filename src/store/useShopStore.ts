import { create } from 'zustand'
import type { CategoryDTO, ProductDTO, ProductTariffDTO } from '@/types'

interface CartItem {
  productId: string
  tariffId: string
  price: number
}

interface ShopState {
  categories: CategoryDTO[]
  products: ProductDTO[]
  tariffs: Record<string, ProductTariffDTO[]>
  cart: CartItem[]
  favorites: string[]
  isCartOpen: boolean
  searchQuery: string

  setCategories: (categories: CategoryDTO[]) => void
  setProducts: (products: ProductDTO[]) => void
  setTariffs: (productId: string, tariffs: ProductTariffDTO[]) => void
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  toggleFavorite: (productId: string) => void
  setCartOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
}

export const useShopStore = create<ShopState>((set) => ({
  categories: [],
  products: [],
  tariffs: {},
  cart: [],
  favorites: [],
  isCartOpen: false,
  searchQuery: '',

  setCategories: (categories) => set({ categories }),

  setProducts: (products) => set({ products }),

  setTariffs: (productId, tariffs) =>
    set((state) => ({
      tariffs: { ...state.tariffs, [productId]: tariffs },
    })),

  addToCart: (item) =>
    set((state) => {
      const exists = state.cart.find((i) => i.productId === item.productId)
      if (exists) return state
      return { cart: [...state.cart, item] }
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.productId !== productId),
    })),

  clearCart: () => set({ cart: [] }),

  toggleFavorite: (productId) =>
    set((state) => ({
      favorites: state.favorites.includes(productId)
        ? state.favorites.filter((id) => id !== productId)
        : [...state.favorites, productId],
    })),

  setCartOpen: (open) => set({ isCartOpen: open }),

  setSearchQuery: (query) => set({ searchQuery: query }),
}))
