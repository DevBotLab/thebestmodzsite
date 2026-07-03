import { z } from 'zod'

export const loginSchema = z.object({
  code: z.string().min(1, 'Code is required'),
})

export const createTicketSchema = z.object({
  subject: z.string().min(2, 'Subject must be at least 2 characters').max(200),
  text: z.string().min(1, 'Message text is required').max(5000),
})

export const sendMessageSchema = z.object({
  text: z.string().min(1, 'Message text is required').max(5000),
})

export const createProductSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().max(5000).optional().nullable(),
  categoryId: z.string().min(1),
  platform: z.enum(['Android_NoRoot', 'Android_Root', 'iOS', 'Panel']).optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
})

export const updateProductSchema = createProductSchema.partial()

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().max(500).optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
  icon: z.string().max(200).optional().nullable(),
})

export const addBalanceSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(500).optional(),
})

export const transferBalanceSchema = z.object({
  tgId: z.string().min(1, 'Telegram ID is required'),
  amount: z.number().positive('Amount must be positive').max(100000),
})

export const createReferralSchema = z.object({
  code: z.string().min(3).max(50),
})

export const updateCheatStatusSchema = z.object({
  id: z.string().min(1).optional(),
  gameName: z.string().min(2).max(100),
  cheatName: z.string().min(2).max(100),
  platform: z.string().max(50).optional().nullable(),
  status: z.enum(['SAFE', 'RISKY', 'DANGER', 'UPDATING']),
})

export const createNewsSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(1).max(50000),
  image: z.string().max(500).optional().nullable(),
  isPublished: z.boolean().optional().default(false),
})

export const createBannerSchema = z.object({
  title: z.string().min(2).max(200),
  imageUrl: z.string().min(1).max(500),
  linkUrl: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
})

export const orderCreateSchema = z.object({
  productId: z.string().min(1),
  tariffId: z.string().min(1),
})

export const topUpSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(1000000),
})

export const reviewCreateSchema = z.object({
  text: z.string().min(1).max(1000),
  rating: z.number().int().min(1).max(5),
  productId: z.string().optional().nullable(),
})

export const updateProfileSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  tgUsername: z.string().max(100).optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['CREATED', 'AWAITING_PAYMENT', 'PAID', 'CHECKING', 'COMPLETED', 'CANCELLED', 'REFUNDED']),
})

export const uploadKeysSchema = z.object({
  tariffId: z.string().min(1),
  keys: z.array(z.string().min(1)).min(1, 'At least one key is required'),
})

export const paymentProcessSchema = z.object({
  method: z.string().min(1),
  amount: z.number().positive().max(1000000),
})

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export const exportSchema = z.object({
  type: z.enum(['orders', 'users', 'products']),
  format: z.enum(['csv', 'json']).optional().default('json'),
})
