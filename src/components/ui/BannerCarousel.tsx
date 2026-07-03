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

const defaultBanners: Banner[] = [
  { title: 'PUBG MOBILE ЧИТЫ', imageUrl: '/banners/pubg.jpg', linkUrl: '/catalog/pubg-mobile' },
  { title: 'MOBILE LEGENDS ЧИТЫ', imageUrl: '/banners/mlbb.jpg', linkUrl: '/catalog/mobile-legends' },
  { title: 'СТЭНДОФФ 2 ЧИТЫ', imageUrl: '/banners/standoff.jpg', linkUrl: '/catalog/standoff-2' },
]

export function BannerCarousel({ banners = defaultBanners }: { banners?: Banner[] }) {
  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      spaceBetween={20}
      slidesPerView={1}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      navigation
      className="rounded-2xl overflow-hidden"
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.title}>
          <Link href={banner.linkUrl || '#'}>
            <div
              className="relative h-48 md:h-64 bg-gradient-to-r from-purple-900/80 to-dark-200 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent" />
              <h2 className="text-2xl md:text-4xl font-heading text-white text-center z-10 px-4">
                {banner.title}
              </h2>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
