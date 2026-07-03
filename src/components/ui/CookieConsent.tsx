'use client'
import { useState, useEffect } from 'react'
import { Cookie, Check, ChevronDown } from 'lucide-react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [optional, setOptional] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  const accept = (acceptOptional: boolean) => {
    localStorage.setItem('cookie_consent', acceptOptional ? 'all' : 'required')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slide-up">
      <div className="max-w-2xl mx-auto glass-card p-6 border border-white/10">
        <div className="flex items-start gap-4">
          <Cookie className="w-8 h-8 text-purple-400 shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-2">Мы используем cookies</h3>
            <p className="text-sm text-gray-400 mb-4">
              Чтобы обеспечить работу сайта, мы используем обязательные cookies.
              Дополнительные cookies используются только с вашего согласия.
            </p>

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 mb-3"
            >
              Настроить
              <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>

            {expanded && (
              <div className="space-y-3 mb-4">
                <label className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <input type="checkbox" checked={true} disabled className="mt-1 accent-purple-600" />
                  <div>
                    <span className="text-sm font-medium text-white">Обязательные</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Необходимы для работы сайта: сессии, авторизация, защита от CSRF. Эти данные мы собираем в любом случае.
                    </p>
                  </div>
                </label>
                <label
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer"
                  onClick={() => setOptional(!optional)}
                >
                  <input type="checkbox" checked={optional} readOnly className="mt-1 accent-purple-600" />
                  <div>
                    <span className="text-sm font-medium text-white">Необязательные</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Аналитика и улучшение сервиса: Google Analytics, Яндекс.Метрика, рекламные cookie. Мы НЕ собираем эти данные, но оставляем возможность включить.
                    </p>
                  </div>
                </label>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button onClick={() => accept(false)} className="btn-primary text-sm px-5 py-2.5">
                <Check className="w-4 h-4 inline mr-1" />
                Принять выбранные
              </button>
              <button onClick={() => accept(true)} className="btn-lime text-sm px-5 py-2.5">
                Принять все
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
