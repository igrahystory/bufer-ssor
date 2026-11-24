import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Check, Shield, AlertCircle } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { api } from '../api/client';

export default function PaywallStub({ onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBack = () => {
    try {
      WebApp.HapticFeedback?.impactOccurred('light');
    } catch {}
    onBack();
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);
    try {
      WebApp.HapticFeedback?.impactOccurred('medium');
      const res = await api.createPayment('month_sub');
      if (res && res.confirmation_url) {
        if (WebApp?.openLink) {
          WebApp.openLink(res.confirmation_url);
        } else if (window.Telegram?.WebApp?.openLink) {
          window.Telegram.WebApp.openLink(res.confirmation_url);
        } else {
          window.open(res.confirmation_url, '_blank');
        }
      } else {
        throw new Error('Не удалось получить ссылку для оплаты');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Ошибка создания платежа. Попробуйте позже.');
      WebApp.HapticFeedback?.notificationOccurred('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-5 pt-safe pb-safe max-w-md mx-auto animate-fade-in">
      <div className="pt-2">
        {/* Кнопка назад */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs text-warm-700 hover:text-warm-900 dark:text-warm-300 dark:hover:text-warm-100 mb-4 py-1.5 px-2.5 -ml-2 rounded-xl hover:bg-warm-200/60 dark:hover:bg-espresso-900 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          <span>Назад на главную</span>
        </button>

        {/* Иконка и заголовки с тактильным объёмом */}
        <div className="text-center pt-1 pb-5">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-terracotta-50 dark:bg-terracotta-950/60 text-terracotta-600 dark:text-terracotta-400 flex items-center justify-center border border-terracotta-200/70 dark:border-terracotta-900/50 shadow-warm-3d mb-3.5">
            <Sparkles size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-warm-900 dark:text-warm-50 tracking-tight">
            Оформите подписку для пары
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-warm-700/80 dark:text-warm-300/80 leading-relaxed max-w-xs mx-auto">
            Один тариф на двоих: безлимитные медиации, персональный ИИ-анализ и забота о ваших отношениях.
          </p>
        </div>

        {/* Карточка преимуществ */}
        <div className="warm-card rounded-3xl p-5 space-y-3.5">
          <div className="font-bold text-[11px] text-warm-600 dark:text-warm-400 uppercase tracking-wider">
            Что входит в подписку:
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-olive-100 dark:bg-olive-950/60 text-olive-700 dark:text-olive-300 flex items-center justify-center shrink-0 mt-0.5 shadow-warm-xs">
              <Check size={13} />
            </div>
            <div className="text-xs text-warm-800 dark:text-warm-200 leading-relaxed">
              <span className="font-bold text-warm-900 dark:text-warm-50">Безлимитные медиации ссор</span> — бережный разбор любых разногласий 24/7.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-olive-100 dark:bg-olive-950/60 text-olive-700 dark:text-olive-300 flex items-center justify-center shrink-0 mt-0.5 shadow-warm-xs">
              <Check size={13} />
            </div>
            <div className="text-xs text-warm-800 dark:text-warm-200 leading-relaxed">
              <span className="font-bold text-warm-900 dark:text-warm-50">Персональные шаги примирения</span> — конкретные фразы и действия для спокойного выхода из конфликта.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-olive-100 dark:bg-olive-950/60 text-olive-700 dark:text-olive-300 flex items-center justify-center shrink-0 mt-0.5 shadow-warm-xs">
              <Check size={13} />
            </div>
            <div className="text-xs text-warm-800 dark:text-warm-200 leading-relaxed">
              <span className="font-bold text-warm-900 dark:text-warm-50">Полная тайна исповеди</span> — неизменный строгий информационный барьер.
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-terracotta-50 dark:bg-terracotta-950/40 border border-terracotta-200 dark:border-terracotta-900/60 flex items-center gap-2.5 text-xs text-terracotta-800 dark:text-terracotta-200 shadow-warm-xs">
            <AlertCircle size={15} className="shrink-0 text-terracotta-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Информационный бэйдж */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-warm-600 dark:text-warm-400">
          <Shield size={14} className="text-olive-600 dark:text-olive-400" />
          <span>Безопасная оплата через ЮKassa</span>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="pt-6 pb-2 space-y-2.5">
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="btn-warm-primary w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-warm-button flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles size={16} />
          <span>{isLoading ? 'Подключение к ЮKassa...' : 'Оформить подписку за 199 ₽ / мес'}</span>
        </button>

        <button
          onClick={handleBack}
          className="btn-warm-secondary w-full py-3 px-4 rounded-2xl text-xs font-semibold"
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
}
