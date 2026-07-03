import type { OrderStatus, BalanceTransactionType, PaymentStatus, SupportTicketStatus, CheatStatusEnum, Platform, TariffName } from '@prisma/client'

export interface UserDTO {
  id: string
  tgId: string | null
  tgUsername: string | null
  firstName: string | null
  lastName: string | null
  balance: number
  referralCode: string | null
  referralPercent: number
  isBlocked: boolean
  blockReason: string | null
  isAdmin: boolean
  roleId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AdminRoleDTO {
  id: string
  name: string
  permissions: string[]
}

export interface SessionDTO {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

export interface CategoryDTO {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  parent: CategoryDTO | null
  children: CategoryDTO[]
  sortOrder: number
  icon: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ProductDTO {
  id: string
  name: string
  slug: string
  description: string | null
  categoryId: string
  category: CategoryDTO
  platform: Platform | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface ProductTariffDTO {
  id: string
  productId: string
  name: TariffName
  days: number
  price: number
  createdAt: Date
}

export interface ProductKeyDTO {
  id: string
  productId: string
  tariffId: string
  key: string
  isUsed: boolean
  orderId: string | null
  createdAt: Date
}

export interface OrderDTO {
  id: string
  userId: string
  user: UserDTO
  productId: string
  product: ProductDTO
  tariffId: string | null
  tariff: ProductTariffDTO | null
  totalPrice: number
  status: OrderStatus
  paymentMethod: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BalanceTransactionDTO {
  id: string
  userId: string
  amount: number
  type: BalanceTransactionType
  description: string | null
  relatedUserId: string | null
  orderId: string | null
  createdAt: Date
}

export interface PaymentMethodDTO {
  id: string
  name: string
  code: string
  isActive: boolean
  config: Record<string, unknown>
  sortOrder: number
  createdAt: Date
}

export interface PaymentDTO {
  id: string
  userId: string
  orderId: string | null
  amount: number
  methodId: string
  method: PaymentMethodDTO
  status: PaymentStatus
  externalId: string | null
  createdAt: Date
}

export interface ReferralDTO {
  id: string
  referrerId: string
  referredId: string
  createdAt: Date
}

export interface ReferralTransactionDTO {
  id: string
  referralId: string
  amount: number
  fromPurchaseOrderId: string | null
  createdAt: Date
}

export interface ReviewDTO {
  id: string
  userId: string
  user: UserDTO
  productId: string | null
  product: ProductDTO | null
  rating: number
  text: string | null
  isVerified: boolean
  isApproved: boolean
  createdAt: Date
}

export interface SupportTicketDTO {
  id: string
  userId: string
  user: UserDTO
  subject: string
  status: SupportTicketStatus
  createdAt: Date
  updatedAt: Date
}

export interface TicketMessageDTO {
  id: string
  ticketId: string
  userId: string | null
  isAdmin: boolean
  text: string
  createdAt: Date
}

export interface CheatStatusDTO {
  id: string
  gameName: string
  cheatName: string
  platform: string | null
  status: CheatStatusEnum
  updatedAt: Date
}

export interface NewsDTO {
  id: string
  title: string
  content: string
  image: string | null
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface BannerDTO {
  id: string
  title: string
  imageUrl: string
  linkUrl: string | null
  sortOrder: number
  isActive: boolean
  createdAt: Date
}

export interface FavoriteProductDTO {
  id: string
  userId: string
  productId: string
  createdAt: Date
}

export interface AuditLogDTO {
  id: string
  userId: string | null
  action: string
  details: Record<string, unknown> | null
  ip: string | null
  createdAt: Date
}

export interface SystemSettingDTO {
  id: string
  key: string
  value: Record<string, unknown>
  updatedAt: Date
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type OrderStatusFilter = 'all' | OrderStatus

export interface TokenPair {
  accessToken: string
  refreshToken: string
}
