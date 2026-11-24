import React, { useState, useEffect } from 'react';
import { Shield, MessageCircleHeart, Trash2, UserPlus, ArrowRight, Check } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { api } from '../api/client';
import LegalModal from '../components/LegalModal';

export default function Onboarding({ onAccepted, initialCouple }) {
  const [is18Plus, setIs18Plus] = useState(false);
  const [activeModalDoc, setActiveModalDoc] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Интеграция с нативной MainButton Telegram
  useEffect(() => {
    try {
      if (WebApp && WebApp.MainButton) {
        WebApp.MainButton.setText('Продолжить');
        if (is18Plus && !isSubmitting) {
          WebApp.MainButton.enable();
          WebApp.MainButton.show();
        } else {
          WebApp.MainButton.disable();
          WebApp.MainButton.hide();
        }

        const handleMainButtonClick = () => {
          handleAccept();
        };

        WebApp.MainButton.onClick(handleMainButtonClick);
        return () => {
          WebApp.MainButton.offClick(handleMainButtonClick);
          WebApp.MainButton.hide();
        };
      }
    } catch (e) {
      console.warn('MainButton integration error:', e);
    }
  }, [is18Plus, isSubmitting]);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIs18Plus(checked);
    try {
      WebApp.HapticFeedback?.selectionChanged();
    } catch {}
  };

  const handleAccept = async () => {
    if (!is18Plus || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      WebApp.HapticFeedback?.impactOccurred('medium');
      const res = await api.acceptLegal(true, true);

      WebApp.HapticFeedback?.notificationOccurred('success');

      // Передаем управление родительскому роутеру для перехода на следующий шаг
      if (typeof onAccepted === 'function') {
        await onAccepted(res);
      }
    } catch (err) {
      console.error('Legal accept failed:', err);
      setErrorMsg(err.message || 'Не удалось сохранить согласие');
      WebApp.HapticFeedback?.notificationOccurred('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async () => {
    setIsInviting(true);
    setErrorMsg(null);

    try {
      WebApp.HapticFeedback?.impactOccurred('light');
      let link = inviteLink;
      if (!link) {
        const res = await api.createInvite();
        link = res.invite_link;
        setInviteLink(link);
      }

      // Нативный шаринг ссылки через Telegram
      const shareText = 'Давай подключимся к «Буферу Ссор» — здесь можно безопасно и бережно разбирать наши разногласия с помощью ИИ.';
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`;

      try {
        if (WebApp.openTelegramLink) {
          WebApp.openTelegramLink(shareUrl);
        } else {
          window.open(shareUrl, '_blank');
        }
      } catch {
        window.open(shareUrl, '_blank');
      }
    } catch (err) {
      console.error('Invite generation failed:', err);
      if (err.status === 403) {
        setErrorMsg('Сначала подтвердите возраст 18+ и нажмите «Продолжить»');
      } else {
        setErrorMsg(err.message || 'Не удалось сформировать ссылку-приглашение');
      }
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-5 pt-safe pb-safe max-w-md mx-auto animate-fade-in">
      <div className="pt-2">
        {/* Шапка и логотип с мягким 3D-контейнером */}
        <div className="text-center pt-2 pb-4">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-white dark:bg-espresso-900 border border-warm-300/70 dark:border-warm-700/50 shadow-warm-3d p-1.5 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Буфер Ссор"
                  className="w-full h-full rounded-2xl object-cover shadow-xs"
                />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-200/70 dark:bg-espresso-900/60 text-terracotta-700 dark:text-terracotta-300 border border-warm-300/60 dark:border-warm-800/50 text-xs font-semibold mb-2.5 shadow-warm-xs">
            <span>🤍 Безопасное пространство</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-warm-900 dark:text-warm-50 tracking-tight">
            Буфер Ссор
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-warm-700/80 dark:text-warm-300/80 max-w-xs mx-auto leading-relaxed">
            ИИ-медиатор для пар в ссоре: бережно выслушает каждого наедине и поможет услышать друг друга
          </p>
        </div>

        {/* 3 главных тезиса безопасности */}
        <div className="space-y-3 my-4">
          <div className="warm-card rounded-3xl p-4 flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-terracotta-50 dark:bg-terracotta-950/60 text-terracotta-600 dark:text-terracotta-400 flex items-center justify-center shrink-0 border border-terracotta-200/70 dark:border-terracotta-900/50 shadow-warm-xs">
              <Shield size={20} />
            </div>
            <div>
              <div className="font-bold text-warm-900 dark:text-warm-100 text-sm tracking-tight">
                Анонимно
              </div>
              <div className="text-xs text-warm-700/80 dark:text-warm-400 mt-0.5 leading-relaxed">
                Ваши имена и личные данные не передаются во внешние системы и не разглашаются.
              </div>
            </div>
          </div>

          <div className="warm-card rounded-3xl p-4 flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-dustyRose-100 dark:bg-dustyRose-950/60 text-dustyRose-600 dark:text-dustyRose-400 flex items-center justify-center shrink-0 border border-dustyRose-200/70 dark:border-dustyRose-900/50 shadow-warm-xs">
              <MessageCircleHeart size={20} />
            </div>
            <div>
              <div className="font-bold text-warm-900 dark:text-warm-100 text-sm tracking-tight">
                ИИ выслушает каждого наедине
              </div>
              <div className="text-xs text-warm-700/80 dark:text-warm-400 mt-0.5 leading-relaxed">
                Партнёр никогда не увидит ваши исходные слова и формулировки.
              </div>
            </div>
          </div>

          <div className="warm-card rounded-3xl p-4 flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-olive-100 dark:bg-olive-950/60 text-olive-600 dark:text-olive-400 flex items-center justify-center shrink-0 border border-olive-200/70 dark:border-olive-900/50 shadow-warm-xs">
              <Trash2 size={20} />
            </div>
            <div>
              <div className="font-bold text-warm-900 dark:text-warm-100 text-sm tracking-tight">
                Исходники удаляются
              </div>
              <div className="text-xs text-warm-700/80 dark:text-warm-400 mt-0.5 leading-relaxed">
                Все исходные сообщения безвозвратно стираются сразу после анализа.
              </div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="my-3 p-3.5 rounded-2xl bg-terracotta-50 dark:bg-terracotta-950/40 text-terracotta-800 dark:text-terracotta-200 text-xs border border-terracotta-200 dark:border-terracotta-900 shadow-warm-xs">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Нижняя часть: чекбокс 18+ и кнопки */}
      <div className="pt-4 pb-2 space-y-3.5">
        {/* Чекбокс 18+ */}
        <label className="warm-card-subtle flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer select-none">
          <input
            type="checkbox"
            checked={is18Plus}
            onChange={handleCheckboxChange}
            className="w-5 h-5 rounded-md border-warm-300 dark:border-warm-700 text-terracotta-500 focus:ring-terracotta-400 shrink-0 mt-0.5 cursor-pointer accent-terracotta-500"
          />
          <span className="text-xs text-warm-800 dark:text-warm-200 leading-snug">
            Мне исполнилось 18 лет, я принимаю{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveModalDoc('terms');
              }}
              className="text-terracotta-600 dark:text-terracotta-400 font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Пользовательское соглашение (оферту)
            </button>
            ,{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveModalDoc('privacy');
              }}
              className="text-terracotta-600 dark:text-terracotta-400 font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Политику конфиденциальности
            </button>{' '}
            и{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveModalDoc('nda');
              }}
              className="text-terracotta-600 dark:text-terracotta-400 font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Режим неразглашения
            </button>
            .
          </span>
        </label>

        {/* Кнопки действий */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={!is18Plus || isSubmitting}
            onClick={handleAccept}
            className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              is18Plus && !isSubmitting
                ? 'btn-warm-primary shadow-warm-button active:scale-[0.98]'
                : 'bg-warm-200/80 dark:bg-espresso-900 text-warm-400 dark:text-warm-600 cursor-not-allowed border border-warm-300/40 dark:border-warm-800/40'
            }`}
          >
            <span>{isSubmitting ? 'Сохранение...' : 'Продолжить'}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={handleInvite}
            disabled={isInviting}
            className="btn-warm-secondary w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
          >
            <UserPlus size={16} className="text-terracotta-500" />
            <span>{isInviting ? 'Генерация ссылки...' : 'Пригласить партнёра'}</span>
          </button>
        </div>
      </div>

      {/* Модальное окно с документами */}
      <LegalModal
        docKey={activeModalDoc}
        onClose={() => setActiveModalDoc(null)}
      />
    </div>
  );
}
