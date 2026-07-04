'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import Link from 'next/link'

interface Banner {
  title: string
  imageUrl: string
  linkUrl?: string | null
}

export function BannerCarousel({ banners }: { banners?: Banner[] }) {
  if (!banners || banners.length === 0) return null
  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      spaceBetween={20}
      slidesPerView={1}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      navigation
      className="rounded-2xl overflow-hidden group"
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.title}>
          <Link href={banner.linkUrl || '#'}>
            <div className="relative h-48 md:h-64 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-dark-200/80 to-dark-200" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
                <span className="badge-purple mb-3">Популярное</span>
                <h2 className="text-2xl md:text-4xl font-bold text-white text-center mb-2">
                  {banner.title}
                </h2>
                <p className="text-sm md:text-base text-gray-400 text-center max-w-md">
                  Популярный товар в нашем магазине
                </p>
                <span className="mt-4 text-xs text-purple-300 inline-flex items-center gap-1.5 hover:text-purple-200 transition-colors">
                  Подробнее
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
