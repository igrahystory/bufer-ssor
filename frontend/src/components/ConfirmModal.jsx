import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  title = null,
  description = null,
  confirmText = null,
  isSingleStep = false,
}) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleNext = () => {
    try {
      WebApp.HapticFeedback?.impactOccurred('medium');
    } catch {}
    if (!isSingleStep && step === 1) {
      setStep(2);
    } else {
      onConfirm();
    }
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const modalTitle = title || (step === 1 ? 'Удалить пару и данные пары?' : 'Точно удалить пару?');
  const modalDescription = description || (step === 1 ? (
    'Будут удалены связка, профили участников в рабочей базе, сессии, исходные сообщения и результаты разборов. Telegram ID может снова сохраниться при следующем входе. Активная подписка плательщика останется до конца оплаченного срока. Платёжные записи, журнал удаления и резервные копии обрабатываются отдельно — подробности указаны в Политике конфиденциальности.'
  ) : (
    <span className="text-terracotta-700 dark:text-terracotta-300 font-semibold">
      Это действие необратимо: восстановить пару, переписку и результаты разборов будет невозможно. Подписка плательщика останется активна до конца оплаченного срока.
    </span>
  ));
  const buttonLabel = isDeleting
    ? 'Удаление...'
    : confirmText || (step === 1 ? 'Да, я хочу удалить (1/2)' : 'Подтверждаю безвозвратное удаление (2/2)');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/60 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="warm-card w-full max-w-sm rounded-3xl p-5 shadow-warm-3d animate-slide-up border border-terracotta-200/80 dark:border-terracotta-900/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-2xl bg-terracotta-50 dark:bg-terracotta-950/60 text-terracotta-600 dark:text-terracotta-400 flex items-center justify-center border border-terracotta-200/70 dark:border-terracotta-900/50 shadow-warm-xs">
            <AlertTriangle size={20} />
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-warm-500 hover:text-warm-800 dark:hover:text-warm-200 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-3.5">
          <h3 className="font-bold text-warm-900 dark:text-warm-50 text-base tracking-tight">
            {modalTitle}
          </h3>
          <p className="mt-2 text-xs text-warm-700/80 dark:text-warm-300/80 leading-relaxed">
            {modalDescription}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <button
            disabled={isDeleting}
            onClick={handleNext}
            className="btn-warm-primary w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-warm-button disabled:opacity-50"
          >
            <Trash2 size={16} />
            <span>{buttonLabel}</span>
          </button>

          <button
            disabled={isDeleting}
            onClick={handleClose}
            className="btn-warm-secondary w-full py-2.5 px-4 rounded-2xl font-semibold text-xs sm:text-sm"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
