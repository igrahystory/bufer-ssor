import React, { useState, useEffect } from 'react';
import { Shield, MessageCircleHeart, Trash2, UserPlus, ArrowRight, Check } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { api } from '../api/client';
import LegalModal from '../components/LegalModal';
import appLogo from '../assets/logo.png';

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
      <div className="pt-2 pb-4">
        {/* Шапка и логотип */}
        <div className="text-center pt-2 pb-3">
          <div className="flex justify-center mb-3">
            <div className="w-18 h-18 rounded-3xl bg-white dark:bg-espresso-850 border border-neutral-200 dark:border-espresso-700 shadow-warm-card p-1.5 flex items-center justify-center">
              <img
                src={appLogo}
                alt="Буфер Ссор"
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-100 dark:bg-espresso-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-espresso-700 text-xs font-medium mb-3 shadow-warm-xs">
            <span>Безопасное пространство</span>
          </div>

          <h1 className="text-2xl sm:text-[26px] font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight leading-snug">
            Буфер Ссор
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
            ИИ-медиатор для пар в ссоре: бережно выслушает каждого наедине и поможет услышать друг друга
          </p>
        </div>

        {/* 3 главных тезиса безопасности */}
        <div className="space-y-3.5 my-5">
          <div className="warm-card rounded-3xl p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-espresso-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-espresso-700 shadow-warm-xs">
              <Shield size={20} />
            </div>
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm tracking-tight">
                Анонимно
              </div>
              <div className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                Ваши имена и личные данные не передаются во внешние системы и не разглашаются.
              </div>
            </div>
          </div>

          <div className="warm-card rounded-3xl p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-espresso-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-espresso-700 shadow-warm-xs">
              <MessageCircleHeart size={20} />
            </div>
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm tracking-tight">
                ИИ выслушает каждого наедине
              </div>
              <div className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                Партнёр никогда не увидит ваши исходные слова и формулировки.
              </div>
            </div>
          </div>

          <div className="warm-card rounded-3xl p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-espresso-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-espresso-700 shadow-warm-xs">
              <Trash2 size={20} />
            </div>
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm tracking-tight">
                Исходники удаляются
              </div>
              <div className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                Все исходные сообщения безвозвратно стираются сразу после анализа.
              </div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="my-3 p-4 rounded-2xl bg-neutral-100 dark:bg-espresso-900 text-neutral-900 dark:text-neutral-100 text-xs border border-neutral-200 dark:border-espresso-700 shadow-warm-xs">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Нижняя часть: чекбокс 18+ и кнопки */}
      <div className="pt-4 pb-4 space-y-4">
        {/* Чекбокс 18+ */}
        <label className="bg-neutral-100 dark:bg-espresso-900 border border-neutral-200 dark:border-espresso-700 flex items-start gap-3.5 p-4 rounded-2xl cursor-pointer select-none">
          <input
            type="checkbox"
            checked={is18Plus}
            onChange={handleCheckboxChange}
            className="w-4.5 h-4.5 rounded border-neutral-300 dark:border-espresso-700 text-neutral-900 dark:text-neutral-100 accent-neutral-900 dark:accent-neutral-100 shrink-0 mt-0.5 cursor-pointer"
          />
          <span className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
            Мне исполнилось 18 лет, я принимаю{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveModalDoc('terms');
              }}
              className="text-neutral-900 dark:text-neutral-50 font-medium underline underline-offset-2 hover:opacity-80"
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
              className="text-neutral-900 dark:text-neutral-50 font-medium underline underline-offset-2 hover:opacity-80"
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
              className="text-neutral-900 dark:text-neutral-50 font-medium underline underline-offset-2 hover:opacity-80"
            >
              Режим неразглашения
            </button>
            .
          </span>
        </label>

        {/* Кнопки действий */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={!is18Plus || isSubmitting}
            onClick={handleAccept}
            className={`w-full py-3.5 px-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              is18Plus && !isSubmitting
                ? 'btn-warm-primary shadow-warm-button active:scale-[0.985]'
                : 'bg-neutral-200 dark:bg-espresso-850 text-neutral-400 dark:text-neutral-600 cursor-not-allowed border border-neutral-200 dark:border-espresso-800'
            }`}
          >
            <span>{isSubmitting ? 'Сохранение...' : 'Продолжить'}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={handleInvite}
            disabled={isInviting}
            className="btn-warm-secondary w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
          >
            <UserPlus size={16} className="text-neutral-700 dark:text-neutral-300" />
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
