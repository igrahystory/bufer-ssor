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
          const background = isDark ? '#161412' : '#F7F3ED';
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-warm-100 dark:bg-espresso-950 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-espresso-900 border border-warm-300/60 dark:border-warm-700/30 text-terracotta-500 dark:text-terracotta-400 flex items-center justify-center shadow-warm-3d animate-pulse mb-3.5">
          <Sparkles size={24} />
        </div>
        <div className="text-base font-bold text-warm-900 dark:text-warm-50 tracking-tight">
          Буфер Ссор
        </div>
        <div className="text-xs text-warm-700/70 dark:text-warm-300/60 mt-1">
          Подключение к защищённому каналу...
        </div>
      </div>
    );
  }

  // Экран ошибки инициализации
  if (currentScreen === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-warm-100 dark:bg-espresso-950 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-espresso-900 border border-terracotta-200 dark:border-terracotta-800/40 text-terracotta-600 dark:text-terracotta-400 flex items-center justify-center shadow-warm-3d mb-3.5">
          <AlertCircle size={24} />
        </div>
        <div className="text-sm font-bold text-warm-900 dark:text-warm-50 tracking-tight">
          Не удалось загрузить приложение
        </div>
        <div className="text-xs text-warm-700 dark:text-warm-300 mt-1 max-w-xs leading-relaxed">
          {initError?.message || 'Пожалуйста, откройте приложение заново через Telegram-бота @BufferSsorBot'}
        </div>
        <button
          onClick={loadProfile}
          className="mt-4 inline-flex items-center gap-1.5 py-2.5 px-4 btn-warm-primary rounded-xl text-xs font-semibold shadow-warm-button"
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
