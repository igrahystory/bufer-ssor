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
    color: 'text-terracotta-600 bg-terracotta-50 dark:bg-terracotta-950/50 border-terracotta-200/70 dark:border-terracotta-900/50',
  },
  {
    type: 'silence',
    title: 'Хочу побыть в тишине',
    desc: 'Бот деликатно передаст просьбу о короткой паузе для отдыха',
    icon: Moon,
    color: 'text-warm-700 bg-warm-100 dark:bg-espresso-900 border-warm-300/60 dark:border-warm-700/50',
  },
  {
    type: 'talk_evening',
    title: 'Давай поговорим вечером',
    desc: 'Бот напомнит партнеру, что вечером вас ждет бережный спокойный диалог',
    icon: Coffee,
    color: 'text-dustyRose-600 bg-dustyRose-50 dark:bg-dustyRose-950/50 border-dustyRose-200/70 dark:border-dustyRose-900/50',
  },
  {
    type: 'support',
    title: 'Мне нужна поддержка',
    desc: 'Бот подскажет партнеру проявить сочувствие и побыть на твоей стороне',
    icon: HandHeart,
    color: 'text-olive-700 bg-olive-50 dark:bg-olive-950/50 border-olive-200/70 dark:border-olive-900/50',
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-warm-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="warm-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col shadow-warm-3d animate-slide-up border border-warm-300/70 dark:border-warm-700/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4.5 border-b border-warm-200/60 dark:border-warm-800/40">
          <div>
            <h3 className="font-bold text-warm-900 dark:text-warm-50 text-sm tracking-tight flex items-center gap-1.5">
              <span>💡</span>
              <span>Тонкий намёк</span>
            </h3>
            <p className="text-[11px] text-warm-700/80 dark:text-warm-400 mt-0.5">
              Бот подскажет от своего имени, не выдавая отправителя
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-warm-500 hover:text-warm-800 dark:hover:text-warm-200 hover:bg-warm-100 dark:hover:bg-espresso-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-terracotta-50 dark:bg-terracotta-950/40 text-terracotta-800 dark:text-terracotta-200 text-xs border border-terracotta-200 dark:border-terracotta-900 shadow-warm-xs">
            {errorMsg}
          </div>
        )}

        <div className="p-4 space-y-2.5 pb-safe">
          {HINTS.map((h) => {
            const Icon = h.icon;
            const isSelected = successType === h.type;
            const isLoading = loadingType === h.type;

            return (
              <button
                key={h.type}
                disabled={Boolean(loadingType)}
                onClick={() => handleSelectHint(h.type)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 shadow-warm-xs ${
                  isSelected
                    ? 'border-olive-500 bg-olive-50/80 dark:bg-olive-950/50 shadow-warm-card'
                    : 'border-warm-200/80 dark:border-warm-800/50 bg-white/70 dark:bg-espresso-900/60 hover:bg-warm-50 dark:hover:bg-espresso-850'
                } ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-warm-xs ${h.color}`}>
                  {isSelected ? (
                    <CheckCircle2 size={18} className="text-olive-600 dark:text-olive-400" />
                  ) : (
                    <Icon size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-warm-900 dark:text-warm-100 text-xs sm:text-sm tracking-tight">
                      {h.title}
                    </div>
                    {isSelected && (
                      <span className="text-[11px] font-bold text-olive-700 dark:text-olive-300">
                        Отправлено!
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-warm-700/80 dark:text-warm-400 mt-0.5 line-clamp-2 leading-relaxed">
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
