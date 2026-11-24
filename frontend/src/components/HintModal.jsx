import React, { useState } from 'react';
import { X, Heart, Moon, Coffee, HandHeart, CheckCircle2 } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { api } from '../api/client';

const HINTS = [
  {
    type: 'hug',
    title: 'Мне нужны объятия',
    desc: 'Бот мягко подскажет, что тепло и объятия сейчас важнее любых споров',
    icon: Heart,
  },
  {
    type: 'silence',
    title: 'Хочу побыть в тишине',
    desc: 'Бот деликатно передаст просьбу о короткой паузе для отдыха',
    icon: Moon,
  },
  {
    type: 'talk_evening',
    title: 'Давай поговорим вечером',
    desc: 'Бот напомнит партнеру, что вечером вас ждет бережный спокойный диалог',
    icon: Coffee,
  },
  {
    type: 'support',
    title: 'Мне нужна поддержка',
    desc: 'Бот подскажет партнеру проявить сочувствие и побыть на твоей стороне',
    icon: HandHeart,
  },
];

export default function HintModal({ isOpen, onClose }) {
  const [loadingType, setLoadingType] = useState(null);
  const [successType, setSuccessType] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSelectHint = async (type) => {
    setLoadingType(type);
    setErrorMsg(null);
    try {
      WebApp.HapticFeedback?.impactOccurred('medium');
      await api.sendHint(type);
      setSuccessType(type);
      WebApp.HapticFeedback?.notificationOccurred('success');
      setTimeout(() => {
        setSuccessType(null);
        setLoadingType(null);
        onClose();
      }, 1500);
    } catch (err) {
      setLoadingType(null);
      setErrorMsg(err.message || 'Не удалось отправить намек');
      WebApp.HapticFeedback?.notificationOccurred('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="warm-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col shadow-warm-3d animate-slide-up border border-neutral-200 dark:border-espresso-700 bg-white dark:bg-espresso-850"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-espresso-700">
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 text-[15px] tracking-tight flex items-center gap-2">
              <span>💡</span>
              <span>Тонкий намёк</span>
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Бот подскажет от своего имени, не выдавая отправителя
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-espresso-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-4 p-3.5 rounded-2xl bg-neutral-100 dark:bg-espresso-900 text-neutral-900 dark:text-neutral-100 text-xs border border-neutral-200 dark:border-espresso-700 shadow-warm-xs">
            {errorMsg}
          </div>
        )}

        <div className="p-5 space-y-3 pb-safe">
          {HINTS.map((h) => {
            const Icon = h.icon;
            const isSelected = successType === h.type;
            const isLoading = loadingType === h.type;

            return (
              <button
                key={h.type}
                disabled={Boolean(loadingType)}
                onClick={() => handleSelectHint(h.type)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 shadow-warm-xs ${
                  isSelected
                    ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-espresso-800 shadow-warm-card'
                    : 'border-neutral-200 dark:border-espresso-700 bg-white dark:bg-espresso-900/60 hover:bg-neutral-50 dark:hover:bg-espresso-800'
                } ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-neutral-200 dark:border-espresso-700 bg-neutral-100 dark:bg-espresso-800 text-neutral-900 dark:text-neutral-100 shadow-warm-xs">
                  {isSelected ? (
                    <CheckCircle2 size={18} className="text-neutral-900 dark:text-neutral-100" />
                  ) : (
                    <Icon size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm tracking-tight">
                      {h.title}
                    </div>
                    {isSelected && (
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        Отправлено!
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {h.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
