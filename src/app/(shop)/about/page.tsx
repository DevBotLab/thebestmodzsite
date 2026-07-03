'use client'

import { ShoppingBag, Shield, Zap, HeadphonesIcon, Mail, MapPin } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'

export default function AboutPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">О сервисе</h1>
        <BackButton />
      </div>

      <div className="space-y-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-8 h-8 text-lime-400" />
            <h2 className="text-xl font-bold text-white">TheBestMods</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            TheBestMods — это ведущий магазин читов и ключей для мобильных игр. 
            Мы предоставляем доступ к лучшим читам для PUBG MOBILE, Mobile Legends, 
            Standoff 2 и других популярных игр. Все продукты проходят тщательную 
            проверку на безопасность и работоспособность.
          </p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-xl font-bold text-white mb-4">Как работать с сервисом</h2>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Регистрация', desc: 'Авторизуйтесь через Telegram — это займёт 1 секунду' },
              { step: 2, title: 'Выбор товара', desc: 'Найдите нужный чит в каталоге и выберите подходящий тариф' },
              { step: 3, title: 'Оплата', desc: 'Оплатите удобным способом: СБП, карта, криптовалюта' },
              { step: 4, title: 'Получение ключа', desc: 'Ключ придёт моментально в личный кабинет' },
              { step: 5, title: 'Активация', desc: 'Следуйте инструкции по активации и наслаждайтесь игрой' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-xl font-bold text-white mb-4">Контакты</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">support@thebestmods.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">@TheBestModsBot — Telegram бот</span>
            </div>
            <div className="flex items-center gap-3">
              <HeadphonesIcon className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">Поддержка 24/7 в Telegram</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
