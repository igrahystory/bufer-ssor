import React, { useState, useEffect, useCallback, useRef } from 'react';
import WebApp from '@twa-dev/sdk';
import { api, ApiError } from './api/client';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Session from './screens/Session';
import RelationshipBalance from './screens/RelationshipBalance';
import PaywallStub from './components/PaywallStub';
import LandingPage from './screens/LandingPage';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('loading'); // 'loading' | 'onboarding' | 'home' | 'session' | 'paywall'
  const [meData, setMeData] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [balanceSessionId, setBalanceSessionId] = useState(null);
  const [initError, setInitError] = useState(null);
  const inviteHandledRef = useRef(false);
  const inviteCode = new URLSearchParams(window.location.search).get('invite');

  // Инициализация Telegram WebApp и синхронизация темы
  useEffect(() => {
    let themeHandler;
    try {
      if (WebApp) {
        WebApp.ready();
        WebApp.expand();

        const syncTheme = () => {
          const isDark = WebApp.colorScheme === 'dark';
          const background = isDark ? '#141311' : '#FAF9F6';
          document.documentElement.classList.toggle('dark', isDark);
          const themeMeta = document.querySelector('meta[name="theme-color"]');
          if (themeMeta) themeMeta.setAttribute('content', background);
          try {
            WebApp.setHeaderColor?.(background);
            WebApp.setBackgroundColor?.(background);
          } catch {}
        };
        syncTheme();
        themeHandler = syncTheme;
        WebApp.onEvent('themeChanged', themeHandler);
      }
    } catch (e) {
      console.warn('WebApp initialization error:', e);
    }
    return () => {
      if (themeHandler) WebApp.offEvent('themeChanged', themeHandler);
    };
  }, []);

  // Загрузка профиля пользователя и пары
  const loadProfile = useCallback(async () => {
    setInitError(null);
    try {
      const data = await api.getMe();
      setMeData(data);

      // Server is authoritative: the local cache can outlive a deleted/recreated user profile.
      const hasAcceptedLegal = Boolean(data.user?.accepted_legal_at);

      if (!hasAcceptedLegal) {
        setCurrentScreen('onboarding');
      } else {
        // Если уже есть активная сессия в статусе waiting или analyzing — остаемся на главной с бейджем,
        // либо пользователь может продолжить по кнопке
        setCurrentScreen('home');
        if (inviteCode && !inviteHandledRef.current) {
          inviteHandledRef.current = true;
          try {
            await api.joinCouple(inviteCode);
            const url = new URL(window.location.href);
            url.searchParams.delete('invite');
            window.history.replaceState({}, '', url);
            const refreshed = await api.getMe();
            setMeData(refreshed);
          } catch (err) {
            inviteHandledRef.current = false;
            try { WebApp.showAlert(err.message || 'Не удалось подключиться к паре'); } catch {}
          }
        }
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setInitError(err);
      setCurrentScreen('error');
    }
  }, [inviteCode]);

  const isInsideTelegram = Boolean(
    typeof window !== 'undefined' &&
    ((window.Telegram?.WebApp?.initData && window.Telegram.WebApp.initData.length > 0) ||
     window.__DEV_INIT_DATA__)
  );

  useEffect(() => {
    if (!isInsideTelegram) return;
    loadProfile();
  }, [loadProfile, isInsideTelegram]);

  // Если приложение открыто в обычном браузере вне Telegram — отображаем публичный лендинг
  if (!isInsideTelegram) {
    return <LandingPage />;
  }

  // Экран загрузки
  if (currentScreen === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50 dark:bg-espresso-950 text-center animate-fade-in">
        <div className="w-13 h-13 rounded-2xl bg-white dark:bg-espresso-850 border border-neutral-200 dark:border-espresso-700 text-neutral-900 dark:text-neutral-100 flex items-center justify-center shadow-warm-card mb-4">
          <Sparkles size={22} className="animate-pulse" />
        </div>
        <div className="text-[17px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Буфер Ссор
        </div>
        <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          Подключение к защищённому каналу...
        </div>
      </div>
    );
  }

  // Экран ошибки инициализации
  if (currentScreen === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50 dark:bg-espresso-950 text-center animate-fade-in">
        <div className="w-13 h-13 rounded-2xl bg-white dark:bg-espresso-850 border border-neutral-200 dark:border-espresso-700 text-neutral-900 dark:text-neutral-100 flex items-center justify-center shadow-warm-card mb-4">
          <AlertCircle size={22} />
        </div>
        <div className="text-[17px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Не удалось загрузить приложение
        </div>
        <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 max-w-xs leading-relaxed">
          {initError?.message || 'Пожалуйста, откройте приложение заново через Telegram-бота @BufferSsorBot'}
        </div>
        <button
          onClick={loadProfile}
          className="mt-5 inline-flex items-center gap-2 py-2.5 px-4 btn-warm-primary rounded-xl text-xs font-semibold"
        >
          <RefreshCw size={13} />
          <span>Попробовать снова</span>
        </button>
      </div>
    );
  }

  const handleLegalAccepted = async (legalRes) => {
    // Мгновенно обновляем стейт и переключаем экран на главную страницу
    setMeData((prev) => ({
      ...prev,
      user: {
        ...(prev?.user || {}),
        accepted_legal_at: legalRes?.accepted_legal_at || new Date().toISOString(),
      },
    }));
    setCurrentScreen('home');
    try {
      await loadProfile();
    } catch (err) {
      console.warn('Silent refresh after legal accept failed:', err);
    }
  };

  // ЭКРАН 1: Онбординг и согласие
  if (currentScreen === 'onboarding') {
    return (
      <Onboarding
        initialCouple={meData?.couple}
        onAccepted={handleLegalAccepted}
      />
    );
  }

  // ЭКРАН ЗАГЛУШКИ ОПЛАТЫ / ПЕЙВОЛЛ
  if (currentScreen === 'paywall') {
    return (
      <PaywallStub
        onBack={() => {
          setCurrentScreen('home');
          loadProfile();
        }}
      />
    );
  }

  // ЭКРАН 3: Разбор конфликта
  if (currentScreen === 'session' && activeSessionId) {
    return (
      <Session
        sessionId={activeSessionId}
        onBack={() => {
          setCurrentScreen('home');
          loadProfile();
        }}
      />
    );
  }

  if (currentScreen === 'balance' && balanceSessionId) {
    return <RelationshipBalance sessionId={balanceSessionId} onBack={() => { setCurrentScreen('home'); loadProfile(); }} />;
  }

  // ЭКРАН 2: Главный экран
  return (
    <Home
      meData={meData}
      onStartSession={(sessionId) => {
        setActiveSessionId(sessionId);
        setCurrentScreen('session');
      }}
      onStartBalance={async () => {
        const balance = await api.startRelationshipBalance();
        if (!balance?.id) throw new Error('Сервер не вернул данные баланса. Попробуйте ещё раз.');
        setBalanceSessionId(balance.id);
        setCurrentScreen('balance');
      }}
      onOpenActiveSession={(sessionId) => {
        setActiveSessionId(sessionId);
        setCurrentScreen('session');
      }}
      onRefreshProfile={loadProfile}
      onPaywallRequired={() => {
        setCurrentScreen('paywall');
      }}
    />
  );
}
