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
    <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
      Это действие необратимо: восстановить пару, переписку и результаты разборов будет невозможно. Подписка плательщика останется активна до конца оплаченного срока.
    </span>
  ));
  const buttonLabel = isDeleting
    ? 'Удаление...'
    : confirmText || (step === 1 ? 'Да, я хочу удалить (1/2)' : 'Подтверждаю безвозвратное удаление (2/2)');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="warm-card w-full max-w-sm rounded-3xl p-6 shadow-warm-3d animate-slide-up border border-neutral-200 dark:border-espresso-700 bg-white dark:bg-espresso-850"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-espresso-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center border border-neutral-200 dark:border-espresso-700 shadow-warm-xs">
            <AlertTriangle size={20} />
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 text-base tracking-tight">
            {modalTitle}
          </h3>
          <p className="mt-2 text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {modalDescription}
          </p>
        </div>

        <div className="mt-6 space-y-2.5">
          <button
            disabled={isDeleting}
            onClick={handleNext}
            className="btn-warm-primary w-full py-3 px-4 rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={16} />
            <span>{buttonLabel}</span>
          </button>

          <button
            disabled={isDeleting}
            onClick={handleClose}
            className="btn-warm-secondary w-full py-2.5 px-4 rounded-2xl font-medium text-xs sm:text-sm"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
