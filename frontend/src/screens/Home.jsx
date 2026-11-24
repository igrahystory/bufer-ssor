import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Flag, 
  Lightbulb, 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning,
  Sparkles,
  CheckCircle2,
  Trash2,
  Lock,
  ArrowRight,
  History,
  MessageCircle,
  Activity,
} from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { api } from '../api/client';
import HintModal from '../components/HintModal';
import ConfirmModal from '../components/ConfirmModal';
import LegalModal from '../components/LegalModal';

export default function Home({ meData, onStartSession, onOpenActiveSession, onStartBalance, onRefreshProfile, onPaywallRequired }) {
  const user = meData?.user || {};
  const couple = meData?.couple || null;
  const activeSession = meData?.active_session || null;
  const latestCompletedSession = meData?.latest_completed_session || null;
  const subscriptionUntil = meData?.subscription_until || couple?.subscription_until;
  const freeSessionsLeft = couple?.free_sessions_left ?? meData?.free_sessions_left ?? 2;
  const isPremium = Boolean(subscriptionUntil && new Date(subscriptionUntil) > new Date());

  // Настроение (1-10)
  const initialMood = couple?.my_mood || 5;
  const [mood, setMood] = useState(initialMood);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const moodDebounceTimer = useRef(null);

  // Модальные окна и индикаторы
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeletingCouple, setIsDeletingCouple] = useState(false);
  const [isConfirmHistoryOpen, setIsConfirmHistoryOpen] = useState(false);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState(null);
  const [whiteFlagSuccess, setWhiteFlagSuccess] = useState(false);
  const [isSendingWhiteFlag, setIsSendingWhiteFlag] = useState(false);
  const [isStartingConflict, setIsStartingConflict] = useState(false);
  const [isStartingBalance, setIsStartingBalance] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Синхронизация локального настроения при обновлении профиля
  useEffect(() => {
    if (couple?.my_mood) {
      setMood(couple.my_mood);
    }
  }, [couple?.my_mood]);

  // Обработка слайдера настроения с задержкой отправки после отпускания
  const handleMoodChange = (e) => {
    const newMood = Number(e.target.value);
    setMood(newMood);

    try {
      WebApp.HapticFeedback?.selectionChanged();
    } catch {}

    if (moodDebounceTimer.current) {
      clearTimeout(moodDebounceTimer.current);
    }

    moodDebounceTimer.current = setTimeout(async () => {
      setIsSavingMood(true);
      try {
        await api.updateMood(newMood);
        try {
          WebApp.HapticFeedback?.notificationOccurred('success');
        } catch {}
      } catch (err) {
        console.warn('Failed to update mood:', err);
      } finally {
        setIsSavingMood(false);
      }
    }, 600);
  };

  // Хелпер для отображения погоды в отношениях (спокойная минималистичная палитра)
  const getMoodDescriptor = (val) => {
    if (val <= 2) return { text: 'Грозовое напряжение', icon: CloudLightning };
    if (val <= 4) return { text: 'Дождливо и тяжело', icon: CloudRain };
    if (val <= 6) return { text: 'Облачно, есть вопросы', icon: Cloud };
    if (val <= 8) return { text: 'Прояснения, тепло', icon: CloudSun };
    return { text: 'Солнечно и спокойно', icon: Sun };
  };

  const moodDesc = getMoodDescriptor(mood);
  const MoodIcon = moodDesc.icon;

  // Запуск разбора конфликта
  const handleStartConflict = async () => {
    if (activeSession && activeSession.id) {
      onOpenActiveSession(activeSession.id);
      return;
    }

    if (!couple || !couple.has_partner) {
      setGlobalError('Для разбора конфликта сначала пригласите партнера в пару');
      return;
    }

    setIsStartingConflict(true);
    setGlobalError(null);

    try {
      WebApp.HapticFeedback?.impactOccurred('medium');
      const res = await api.startConflict();
      onStartSession(res.session_id);
    } catch (err) {
      console.error('Start conflict failed:', err);
      setIsStartingConflict(false);

      if (err.status === 403 && err.message?.includes('Бесплатные разборы закончились')) {
        onPaywallRequired();
      } else {
        setGlobalError(err.message || 'Не удалось запустить сессию');
        WebApp.HapticFeedback?.notificationOccurred('error');
      }
    }
  };

  // Отправка белого флага
  const handleWhiteFlag = async () => {
    if (!couple || !couple.has_partner) {
      setGlobalError('Белый флаг можно поднять только когда к паре подключен партнер');
      return;
    }

    setIsSendingWhiteFlag(true);
    setGlobalError(null);

    try {
      WebApp.HapticFeedback?.impactOccurred('medium');
      await api.sendWhiteFlag();
      setWhiteFlagSuccess(true);
      WebApp.HapticFeedback?.notificationOccurred('success');
      setTimeout(() => setWhiteFlagSuccess(false), 3000);
    } catch (err) {
      setGlobalError(err.message || 'Не удалось отправить сигнал');
      WebApp.HapticFeedback?.notificationOccurred('error');
    } finally {
      setIsSendingWhiteFlag(false);
    }
  };

  // Приглашение партнера (инвайт-ссылка)
  const handleInvitePartner = async () => {
    try {
      WebApp.HapticFeedback?.impactOccurred('light');
      const res = await api.createInvite();
      await onRefreshProfile?.();
      const link = res.invite_link;
      const shareText = 'Давай подключимся к «Буферу Ссор» — здесь можно безопасно и бережно разбирать наши разногласия.';
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
      setGlobalError(err.message || 'Ошибка генерации инвайта');
    }
  };

  const handleStartBalance = async () => {
    if (!couple?.has_partner) {
      setGlobalError('Чтобы пройти баланс отношений вместе, сначала подключите партнёра — нажмите «Пригласить» в карточке пары.');
      return;
    }
    if (isStartingBalance) return;
    setIsStartingBalance(true);
    setGlobalError(null);
    try {
      if (!onStartBalance) throw new Error('Не удалось открыть баланс отношений. Перезагрузите приложение и попробуйте ещё раз.');
      await onStartBalance();
    } catch (err) {
      setGlobalError(err.message || 'Не удалось начать баланс отношений. Попробуйте ещё раз.');
    } finally {
      setIsStartingBalance(false);
    }
  };

  // Удаление пары
  const handleConfirmDelete = async () => {
    setIsDeletingCouple(true);
    try {
      WebApp.HapticFeedback?.notificationOccurred('warning');
      await api.deleteCouple();
      setIsConfirmDeleteOpen(false);
      await onRefreshProfile();
    } catch (err) {
      setGlobalError(err.message || 'Ошибка удаления пары');
      setIsDeletingCouple(false);
    }
  };

  // Очистка истории сессий пары
  const handleConfirmDeleteHistory = async () => {
    setIsDeletingHistory(true);
    try {
      WebApp.HapticFeedback?.notificationOccurred('warning');
      await api.deleteHistory();
      setIsConfirmHistoryOpen(false);
      await onRefreshProfile();
    } catch (err) {
      setGlobalError(err.message || 'Ошибка очистки истории');
      setIsDeletingHistory(false);
    }
  };

  // Связь с поддержкой
  const handleContactSupport = () => {
    try {
      WebApp.HapticFeedback?.impactOccurred('light');
    } catch {}

    const supportUrl = 'https://t.me/Griiikkk';
    if (WebApp?.openTelegramLink) {
      WebApp.openTelegramLink(supportUrl);
    } else if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(supportUrl);
    } else {
      window.open(supportUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-5 pt-safe pb-safe max-w-md mx-auto animate-fade-in">
      <div className="space-y-5 app-home-stack pt-2 pb-6">
        {/* Шапка: логотип, название и статус подписки */}
        <header className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Буфер Ссор"
              className="w-9 h-9 rounded-xl object-cover border border-neutral-200 dark:border-espresso-700 shadow-warm-xs shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <h1 className="font-semibold text-[17px] text-neutral-900 dark:text-neutral-50 tracking-tight leading-snug">
                Буфер Ссор
              </h1>
              <span className="text-[12px] text-neutral-600 dark:text-neutral-400 font-normal leading-tight mt-0.5">
                ИИ-медиатор для пар
              </span>
            </div>
          </div>

          {isPremium ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => onPaywallRequired && onPaywallRequired()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-espresso-850 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-espresso-700 shadow-warm-xs cursor-pointer select-none"
            >
              <Sparkles size={13} className="text-neutral-700 dark:text-neutral-300" />
              <span>Премиум</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onPaywallRequired && onPaywallRequired()}
              className="btn-warm-secondary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0"
            >
              <Sparkles size={13} className="text-neutral-700 dark:text-neutral-300" />
              <span>Премиум</span>
            </button>
          )}
        </header>

        {/* Slim-плашка статуса тарифа */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onPaywallRequired && onPaywallRequired()}
          className="bg-neutral-100 dark:bg-espresso-900 border border-neutral-200 dark:border-espresso-700 flex items-center justify-between px-4 py-2.5 rounded-2xl cursor-pointer group select-none transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-neutral-100 shrink-0" />
            <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
              {isPremium
                ? 'Премиум безлимит'
                : `Осталось разборов: ${freeSessionsLeft}`}
            </span>
          </div>

          <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium group-hover:text-neutral-900 dark:group-hover:text-neutral-200 transition-colors">
            {isPremium ? 'Детали ›' : 'Пополнить ›'}
          </span>
        </div>

        {globalError && (
          <div role="alert" className="p-4 rounded-2xl bg-neutral-100 dark:bg-espresso-900 text-neutral-900 dark:text-neutral-100 text-xs border border-neutral-200 dark:border-espresso-700 flex items-center justify-between gap-2 shadow-warm-xs animate-fade-in">
            <span>{globalError}</span>
            <button
              onClick={() => setGlobalError(null)}
              className="text-neutral-500 hover:text-neutral-900 text-base ml-2 p-1 font-medium"
            >
              ×
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* ЭЛЕМЕНТ 1: Статус-бар пары + Погода в отношениях                    */}
        {/* =================================================================== */}
        <div className="warm-card rounded-3xl p-5 sm:p-6 space-y-5">
          {/* Статус связи */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-espresso-700">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-espresso-800 border border-neutral-200 dark:border-espresso-700 flex items-center justify-center text-neutral-900 dark:text-neutral-100 shrink-0 font-medium text-xs shadow-warm-xs">
                {user.first_name?.[0] || 'Я'}
              </div>
              <div className="min-w-0">
                {couple?.has_partner ? (
                  <>
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {user.first_name || 'Вы'} и {couple?.partner_name || 'Вторая половинка'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">
                        Партнёр на связи
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {user.first_name || 'Вы'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">
                        Вторая половинка ещё не подключена
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {!couple?.has_partner && (
              <button
                onClick={handleInvitePartner}
                className="btn-warm-secondary inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl text-xs font-medium shrink-0"
              >
                <UserPlus size={13} className="text-neutral-700 dark:text-neutral-300" />
                <span>Пригласить</span>
              </button>
            )}
          </div>

          {/* Слайдер «Погода в отношениях» */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-neutral-700 dark:text-neutral-300">
                <MoodIcon size={16} className="text-neutral-900 dark:text-neutral-100" />
                <span>Погода в отношениях</span>
              </div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {mood}/10 — {moodDesc.text}
              </span>
            </div>

            <div className="relative pt-1 pb-1">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={mood}
                onChange={handleMoodChange}
                className="w-full appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              <span>1 (Гроза)</span>
              {couple?.partner_mood ? (
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-espresso-850 border border-neutral-200 dark:border-espresso-700 text-neutral-900 dark:text-neutral-100 font-medium">
                  Оценка партнёра: {couple.partner_mood}/10
                </span>
              ) : (
                <span>5 (Нейтрально)</span>
              )}
              <span>10 (Солнечно)</span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* Баланс отношений карточка                                           */}
        {/* =================================================================== */}
        <button
          type="button"
          onClick={handleStartBalance}
          disabled={isStartingBalance}
          aria-busy={isStartingBalance}
          className="warm-card w-full rounded-3xl p-5 sm:p-6 text-left flex items-center gap-4 group select-none transition-all"
        >
          <span className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-espresso-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-espresso-700 flex items-center justify-center shrink-0 shadow-warm-xs">
            {isStartingBalance ? <Activity size={20} className="animate-spin" /> : <Activity size={20} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Баланс отношений
            </span>
            <span className="block text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
              {isStartingBalance 
                ? 'Открываем ваш баланс…' 
                : couple?.has_partner 
                ? 'Короткий совместный чек-ин и идеи, чем заняться вместе' 
                : 'Подключите партнёра, чтобы пройти вместе'}
            </span>
          </span>
          {couple?.has_partner && !isStartingBalance && (
            <ArrowRight size={18} className="text-neutral-400 dark:text-neutral-500 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-900 dark:group-hover:text-neutral-100" />
          )}
        </button>

        {/* =================================================================== */}
        {/* ЭЛЕМЕНТ 2: Центральная большая кнопка разбора конфликта             */}
        {/* =================================================================== */}
        <div className="space-y-3">
          {latestCompletedSession?.id && (
            <button
              onClick={() => onOpenActiveSession(latestCompletedSession.id)}
              className="warm-card w-full p-4.5 rounded-2xl bg-neutral-100 dark:bg-espresso-900 border border-neutral-200 dark:border-espresso-700 text-left flex items-center justify-between gap-3 group"
            >
              <div>
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-neutral-900 dark:text-neutral-100" />
                  <span>Разбор готов</span>
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Открыть итог и персональную карточку
                </div>
              </div>
              <ArrowRight size={18} className="shrink-0 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}

          {activeSession && activeSession.status !== 'completed' ? (
            /* Кнопка возврата к активному разбору */
            <button
              onClick={() => onOpenActiveSession(activeSession.id)}
              className="w-full p-6 sm:p-7 rounded-3xl bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 shadow-warm-button flex items-center justify-between text-left group transition-all"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 dark:bg-black/10 text-white dark:text-neutral-900 text-[10px] font-semibold tracking-wider uppercase mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-900 animate-pulse" />
                  Сессия в процессе
                </div>
                <div className="text-base sm:text-lg font-semibold leading-tight">
                  Продолжить текущий разбор
                </div>
                <div className="text-xs opacity-80 mt-1">
                  Нажмите, чтобы проверить статус или прочесть готовый анализ
                </div>
              </div>
              <ArrowRight size={20} className="shrink-0 transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            /* Основная центральная кнопка старта нового разбора (Clean Minimal Luxury) */
            <button
              onClick={handleStartConflict}
              disabled={isStartingConflict}
              className="home-conflict-warm w-full p-7 rounded-3xl text-center flex flex-col items-center justify-center gap-3 shadow-warm-button group disabled:opacity-75 disabled:cursor-wait transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-black/10 border border-white/15 dark:border-black/10 flex items-center justify-center text-white dark:text-neutral-900 animate-float-soft">
                <Heart size={24} className="fill-current opacity-80" />
              </div>
              <div>
                <div className="text-xl sm:text-[22px] font-semibold tracking-tight text-white dark:text-neutral-900">
                  {isStartingConflict ? 'Запуск сессии...' : 'У нас конфликт'}
                </div>
                <div className="text-xs text-white/80 dark:text-neutral-600 font-normal mt-1">
                  Разобрать ситуацию бережно через ИИ
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Бейдж тайны исповеди */}
        <div className="bg-neutral-100 dark:bg-espresso-900 border border-neutral-200 dark:border-espresso-700 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-normal text-neutral-600 dark:text-neutral-400 text-center">
          <Lock size={13} className="text-neutral-700 dark:text-neutral-300 shrink-0" />
          <span>Режим тайны исповеди активен: партнёр не увидит ваши слова</span>
        </div>

        {/* =================================================================== */}
        {/* ЭЛЕМЕНТ 3: Две кнопки быстрых сигналов (Белый флаг / Тонкий намёк)   */}
        {/* =================================================================== */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Белый флаг */}
          <button
            onClick={handleWhiteFlag}
            disabled={isSendingWhiteFlag || whiteFlagSuccess}
            className={`p-5 rounded-3xl text-left transition-all flex flex-col justify-between min-h-[120px] ${
              whiteFlagSuccess
                ? 'bg-neutral-100 dark:bg-espresso-900 border border-neutral-300 dark:border-espresso-600 text-neutral-900 dark:text-neutral-100 shadow-warm-card'
                : 'warm-card text-neutral-900 dark:text-neutral-100 hover:border-neutral-300 dark:hover:border-espresso-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🏳️</span>
              {whiteFlagSuccess && (
                <CheckCircle2 size={16} className="text-neutral-900 dark:text-neutral-100" />
              )}
            </div>
            <div className="mt-3">
              <div className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-50">
                {whiteFlagSuccess ? 'Флаг поднят!' : 'Белый флаг'}
              </div>
              <div className="text-[12px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-snug">
                {whiteFlagSuccess ? 'Бот передал сигнал' : 'Злюсь, но люблю'}
              </div>
            </div>
          </button>

          {/* Тонкий намёк */}
          <button
            onClick={() => setIsHintOpen(true)}
            className="warm-card p-5 rounded-3xl text-neutral-900 dark:text-neutral-100 text-left transition-all flex flex-col justify-between min-h-[120px] hover:border-neutral-300 dark:hover:border-espresso-600"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">💡</span>
              <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-espresso-850 border border-neutral-200 dark:border-espresso-700 uppercase tracking-wider">
                4 варианта
              </span>
            </div>
            <div className="mt-3">
              <div className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-50">
                Тонкий намёк
              </div>
              <div className="text-[12px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-snug">
                Мягкая подсказка ботом
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Подвал: Поддержка, ссылки на документы и удаление данных пары */}
      <footer className="pt-6 pb-2 text-center space-y-4">
        {/* Кнопка «Написать в поддержку» */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleContactSupport}
            className="btn-warm-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-medium cursor-pointer shadow-warm-xs"
          >
            <MessageCircle size={14} className="text-neutral-700 dark:text-neutral-300 shrink-0" />
            <span>Написать в поддержку</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 font-normal">
          <button
            onClick={() => setActiveLegalDoc('terms')}
            className="hover:underline hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
          >
            Оферта
          </button>
          <span>•</span>
          <button
            onClick={() => setActiveLegalDoc('privacy')}
            className="hover:underline hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
          >
            Конфиденциальность
          </button>
          <span>•</span>
          <button
            onClick={() => setActiveLegalDoc('nda')}
            className="hover:underline hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
          >
            Тайна исповеди
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 pt-0.5">
          <button
            onClick={() => setIsConfirmHistoryOpen(true)}
            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium py-1 px-2.5 rounded-xl transition-colors"
          >
            <History size={12} />
            <span>Очистить историю</span>
          </button>
          <span className="text-neutral-300 dark:text-espresso-700">•</span>
          <button
            onClick={() => setIsConfirmDeleteOpen(true)}
            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium py-1 px-2.5 rounded-xl transition-colors"
          >
            <Trash2 size={12} />
            <span>Удалить пару</span>
          </button>
        </div>
      </footer>

      {/* Модальные окна */}
      <HintModal
        isOpen={isHintOpen}
        onClose={() => setIsHintOpen(false)}
      />

      <ConfirmModal
        isOpen={isConfirmHistoryOpen}
        onClose={() => setIsConfirmHistoryOpen(false)}
        onConfirm={handleConfirmDeleteHistory}
        isDeleting={isDeletingHistory}
        isSingleStep={true}
        title="Очистить историю пары?"
        description="Удалятся результаты разборов, ответы и результаты баланса отношений, а также оценки настроения. Связка в паре и подписка останутся."
        confirmText="Очистить историю"
      />

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingCouple}
      />

      <LegalModal
        docKey={activeLegalDoc}
        onClose={() => setActiveLegalDoc(null)}
      />
    </div>
  );
}
