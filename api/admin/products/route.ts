import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, error, validationError } from '@/lib/api-response'
import { createProductSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'
import slugify from 'slugify'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const skip = (page - 1) * limit
  const categoryId = searchParams.get('categoryId')
  const search = searchParams.get('search')

  const where: Prisma.ProductWhereInput = {}
  if (categoryId) where.categoryId = categoryId
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        tariffs: true,
        _count: { select: { orders: true, keys: true } },
      },
      orderBy: { sortOrder: 'asc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return success({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const body = await req.json()
  const parsed = createProductSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const { name, description, categoryId, platform, sortOrder } = parsed.data
  const baseSlug = slugify(name, { lower: true, strict: true })
  let slug = baseSlug
  let counter = 1
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  const product = await prisma.product.create({
    data: { name, slug, description, categoryId, platform, sortOrder },
    include: { category: true, tariffs: true },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'PRODUCT_CREATE',
      details: { productId: product.id, name },
    },
  })

  return success(product, 201)
}
