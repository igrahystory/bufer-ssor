import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  HeartHandshake, 
  Eye, 
  Lightbulb, 
  MessageSquare, 
  Users2, 
  PhoneCall, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { api } from '../api/client';
import CopyButton from '../components/CopyButton';

export default function Session({ sessionId, onBack }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState(null);
  const pollerRef = useRef(null);
  const completedHapticSessionRef = useRef(null);

  // Нативная кнопка BackButton Telegram
  useEffect(() => {
    try {
      if (WebApp && WebApp.BackButton) {
        WebApp.BackButton.show();
        const handleBack = () => {
          onBack();
        };
        WebApp.BackButton.onClick(handleBack);
        return () => {
          WebApp.BackButton.offClick(handleBack);
          WebApp.BackButton.hide();
        };
      }
    } catch (e) {
      console.warn('BackButton error:', e);
    }
  }, [onBack]);

  // Загрузка и поллинг статуса сессии
  const fetchSessionStatus = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      const data = await api.getConflict(sessionId);
      setSession(data);
      setErrorMsg(null);

      if (data.status === 'completed' && completedHapticSessionRef.current !== sessionId) {
        completedHapticSessionRef.current = sessionId;
        try {
          WebApp.HapticFeedback?.notificationOccurred('success');
        } catch {}
      }

      if (['failed', 'expired', 'finished'].includes(data.status)) {
        if (pollerRef.current) {
          clearInterval(pollerRef.current);
          pollerRef.current = null;
        }
      }
    } catch (err) {
      if (err?.status === 404 || err?.status === 410) {
        setSession({ status: 'finished', personal_advice: null, shared_summary: null });
        setErrorMsg(null);
        if (pollerRef.current) {
          clearInterval(pollerRef.current);
          pollerRef.current = null;
        }
        return;
      }
      console.error('Fetch session error:', err);
      setErrorMsg(err.message || 'Ошибка загрузки статуса сессии');
      if (pollerRef.current) {
        clearInterval(pollerRef.current);
        pollerRef.current = null;
      }
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionStatus(true);

    pollerRef.current = setInterval(() => {
      fetchSessionStatus(false);
    }, 5000);

    return () => {
      if (pollerRef.current) {
        clearInterval(pollerRef.current);
        pollerRef.current = null;
      }
    };
  }, [sessionId]);

  // Экран первичной загрузки
  if (isLoading && !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50 dark:bg-espresso-950 text-center animate-fade-in">
        <div className="w-13 h-13 rounded-2xl bg-white dark:bg-espresso-850 border border-neutral-200 dark:border-espresso-700 text-neutral-900 dark:text-neutral-100 flex items-center justify-center shadow-warm-card mb-4">
          <Sparkles size={22} className="animate-pulse" />
        </div>
        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Загрузка сессии...
        </div>
      </div>
    );
  }

  const status = session?.status || 'waiting_partner_2';
  const riskLevel = session?.risk_level || 'none';
  const personalAdvice = session?.personal_advice || {};
  const sharedSummary = session?.shared_summary || {};

  const handleFinishConflict = async () => {
    setIsFinishing(true);
    setFinishError(null);
    try {
      const result = await api.confirmConflictFinished(sessionId);
      if (result.finished) {
        setSession({ status: 'finished', personal_advice: null, shared_summary: null });
      } else {
        setSession((current) => ({ ...current, finish_confirmed_by_me: true }));
      }
    } catch (err) {
      setFinishError(err.message || 'Не удалось подтвердить завершение');
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-5 pt-safe pb-safe max-w-md mx-auto animate-fade-in">
      <div className="space-y-5 app-home-stack pt-2 pb-6">
        {/* Верхняя навигация */}
        <div className="flex items-center justify-between pb-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 py-1.5 px-2.5 -ml-2 rounded-xl transition-colors font-medium"
          >
            <ArrowLeft size={16} />
            <span>На главную</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                try {
                  if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.close();
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-espresso-850 border border-neutral-200 dark:border-espresso-700 py-1 px-2.5 rounded-xl transition-all shadow-warm-xs active:scale-[0.985]"
              title="Экстренно закрыть"
            >
              <XCircle size={14} />
              <span>Быстро закрыть</span>
            </button>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono tracking-wider">
              ID: {sessionId.slice(0, 8)}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-espresso-900 text-neutral-900 dark:text-neutral-100 text-xs border border-neutral-200 dark:border-espresso-700 flex items-center gap-2.5 shadow-warm-xs">
            <AlertCircle size={16} className="shrink-0 text-neutral-700 dark:text-neutral-300" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* СТАТУС 1: Ждём версию партнёра (waiting_partner_2)                  */}
        {/* =================================================================== */}
        {status === 'waiting_partner_2' && (
          <div className="warm-card rounded-3xl p-6 sm:p-7 text-center space-y-4 my-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 dark:bg-espresso-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center border border-neutral-200 dark:border-espresso-700 shadow-warm-xs">
              <Clock size={26} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                Ждём версию партнёра
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Бот уже отправил партнёру деликатное сообщение. Как только он расскажет свою сторону — ИИ сразу приступит к анализу.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-espresso-900 text-xs text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-espresso-700 leading-relaxed">
              💡 Напомните партнёру проверить чат с ботом{' '}
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">@BufferSsorBot</span>
            </div>

            <div className="pt-1">
              <button
                onClick={() => fetchSessionStatus(false)}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-900 dark:text-neutral-100 font-medium hover:underline"
              >
                <RefreshCw size={12} className="animate-spin text-neutral-600" />
                <span>Обновляем статус каждые 5 сек...</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* СТАТУС 2: ИИ анализирует ситуацию (analyzing)                       */}
        {/* =================================================================== */}
        {['analyzing', 'processing'].includes(status) && (
          <div className="warm-card rounded-3xl p-6 sm:p-7 text-center space-y-4 my-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 dark:bg-espresso-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center border border-neutral-200 dark:border-espresso-700 shadow-warm-xs">
              <Sparkles size={26} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                ИИ анализирует ситуацию
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Обе версии получены. Медиатор сопоставляет потребности, проверяет конфиденциальный барьер и готовит бережные рекомендации.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
              <RefreshCw size={13} className="animate-spin text-neutral-500" />
              <span>Осталось совсем немного...</span>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* СТАТУСЫ ОШИБОК / ТАЙМАУТА: failed или expired                       */}
        {/* =================================================================== */}
        {status === 'finished' && (
          <div className="my-5 p-5 rounded-3xl bg-neutral-100 dark:bg-espresso-900 border border-neutral-200 dark:border-espresso-700 text-center text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 shadow-warm-xs leading-relaxed">
            Карточка больше недоступна: данные конфликта удалены после взаимного подтверждения или по истечении 48 часов.
          </div>
        )}

        {(status === 'failed' || status === 'expired') && (
          <div className="warm-card rounded-3xl p-6 sm:p-7 text-center space-y-4 my-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 dark:bg-espresso-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center border border-neutral-200 dark:border-espresso-700 shadow-warm-xs">
              <AlertCircle size={26} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                {status === 'expired' ? 'Время ожидания истекло' : 'Сессия не завершена'}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                {status === 'expired'
                  ? (session?.result_expired
                    ? 'Конфликт не был завершён обоими партнёрами за 48 часов. Карточки и данные конфликта удалены.'
                    : 'Партнёр не успел ответить в течение 48 часов. Срок действия сессии завершился.')
                  : 'Для полноценного анализа нужны ответы обоих партнёров. Бесплатный разбор не списан.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onBack}
                className="btn-warm-primary w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-semibold"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* СТАТУС 3: ЗАВЕРШЕНО (completed)                                     */}
        {/* =================================================================== */}
        {status === 'completed' && (
          <div className="space-y-4 animate-fade-in">
            {/* Заголовок готовности */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-neutral-100 dark:bg-espresso-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-espresso-700 text-xs font-medium shadow-warm-xs">
              <CheckCircle2 size={16} className="text-neutral-900 dark:text-neutral-100 shrink-0" />
              <span>Ваш персональный разбор готов</span>
            </div>

            {session?.finish_confirmed_by_me ? (
              <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-espresso-900 text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm border border-neutral-200 dark:border-espresso-700 leading-relaxed">
                Вы подтвердили завершение. Данные удалятся, когда партнёр тоже подтвердит.
              </div>
            ) : (
              <div className="space-y-2">
                {finishError && <p className="text-xs text-neutral-900 font-medium">{finishError}</p>}
                <button
                  type="button"
                  disabled={isFinishing}
                  onClick={handleFinishConflict}
                  className="btn-warm-secondary w-full py-3.5 px-4 rounded-2xl font-semibold text-xs sm:text-sm shadow-warm-xs"
                >
                  {isFinishing ? 'Сохраняем...' : 'Завершить конфликт'}
                </button>
                <p className="text-center text-[11px] text-neutral-500 dark:text-neutral-400">
                  После подтверждения обоими партнёрами карточки и данные конфликта удалятся.
                </p>
              </div>
            )}

            {/* ВЕТКА БЕЗОПАСНОСТИ: RISK_LEVEL == HIGH */}
            {riskLevel === 'high' ? (
              <div className="warm-card rounded-3xl p-6 border-2 border-neutral-900 dark:border-neutral-100 space-y-4">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 text-neutral-900 dark:text-neutral-100">
                    <ShieldAlert size={22} className="shrink-0" />
                    <h3 className="font-semibold text-sm sm:text-base">
                      Безопасность превыше всего
                    </h3>
                  </div>
                </div>

                {/* Кнопка "Быстро закрыть" */}
                <button
                  type="button"
                  onClick={() => {
                    try {
                      if (window.Telegram?.WebApp) {
                        window.Telegram.WebApp.close();
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="btn-warm-primary w-full py-3.5 px-4 rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  <span>Быстро закрыть</span>
                </button>

                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {session.safety_note ||
                    'В текущей ситуации первостепенное значение имеет ваша личная безопасность. Мы не даем стандартных советов по примирению, когда есть риск насилия или давления.'}
                </p>

                {personalAdvice?.validation && (
                  <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-espresso-900 text-xs text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-espresso-700 italic leading-relaxed">
                    «{personalAdvice.validation}»
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-200 dark:border-espresso-700 space-y-2.5">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Экстренная и кризисная помощь (бесплатно, анонимно):
                  </div>

                  <a
                    href="tel:112"
                    className="flex items-center justify-between p-4 rounded-2xl btn-warm-primary font-semibold text-xs transition-colors"
                  >
                    <span>Единый номер экстренных служб (круглосуточно)</span>
                    <span className="font-bold flex items-center gap-1">
                      <PhoneCall size={14} /> 112
                    </span>
                  </a>

                  <a
                    href="tel:88007000600"
                    className="flex items-center justify-between p-4 rounded-2xl btn-warm-secondary text-neutral-900 dark:text-neutral-100 text-xs font-semibold transition-colors"
                  >
                    <span>Телефон доверия для женщин, пострадавших от насилия</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      8-800-7000-600
                    </span>
                  </a>
                </div>

                <div className="text-[11px] text-neutral-500 text-center pt-1">
                  Перед запуском проверьте актуальность номеров на сайтах организаций.
                </div>
              </div>
            ) : (
              /* ВЕТКА ОБЫЧНОГО РАЗБОРА: RISK_LEVEL == NONE ИЛИ ELEVATED */
              <div className="space-y-4">
                {/* Мягкий safety_note сверху при elevated */}
                {riskLevel === 'elevated' && session.safety_note && (
                  <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-espresso-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-espresso-700 text-xs leading-relaxed flex items-start gap-3 shadow-warm-xs">
                    <ShieldAlert size={16} className="text-neutral-900 dark:text-neutral-100 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Обратите внимание:</div>
                      <div className="mt-0.5 text-neutral-700 dark:text-neutral-300">{session.safety_note}</div>
                    </div>
                  </div>
                )}

                {/* БЛОК 1: Понимание чувств (Validation) */}
                {personalAdvice?.validation && (
                  <div className="warm-card rounded-3xl p-5 sm:p-6 space-y-2.5">
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                      <HeartHandshake size={16} />
                      <span>Понимание ваших чувств</span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed">
                      {personalAdvice.validation}
                    </p>
                  </div>
                )}

                {/* БЛОК 2: Взгляд партнёра (Partner Perspective) */}
                {personalAdvice?.partner_perspective && (
                  <div className="warm-card rounded-3xl p-5 sm:p-6 space-y-2.5">
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                      <Eye size={16} />
                      <span>Взгляд партнёра (гипотеза)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed">
                      {personalAdvice.partner_perspective}
                    </p>
                  </div>
                )}

                {/* БЛОК 3: Точка роста (Blind Spot) */}
                {personalAdvice?.blind_spot && (
                  <div className="warm-card rounded-3xl p-5 sm:p-6 space-y-2.5">
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                      <Lightbulb size={16} />
                      <span>Точка роста</span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed">
                      {personalAdvice.blind_spot}
                    </p>
                  </div>
                )}

                {/* БЛОК 4: Скрипты примирения (Action Scripts) */}
                {personalAdvice?.action_scripts && personalAdvice.action_scripts.length > 0 && (
                  <div className="warm-card rounded-3xl p-5 sm:p-6 space-y-3.5">
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                      <MessageSquare size={16} />
                      <span>Скрипты примирения (от 1-го лица)</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">
                      Готовые фразы для мягкого возобновления диалога. Нажмите, чтобы скопировать:
                    </p>

                    <div className="space-y-3">
                      {personalAdvice.action_scripts.map((script, idx) => {
                        const isObj = typeof script === 'object' && script !== null;
                        const label = isObj ? script.label : (idx === 0 ? 'Сообщение прямо сейчас' : 'Предложение на сегодня или завтра');
                        const text = isObj ? script.text : script;

                        return (
                          <div
                            key={idx}
                            className="p-4.5 rounded-2xl bg-neutral-100 dark:bg-espresso-900 border border-neutral-200 dark:border-espresso-700 flex flex-col justify-between gap-3 shadow-warm-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold text-neutral-900 dark:text-neutral-100 px-2.5 py-0.5 rounded-full bg-white dark:bg-espresso-800 border border-neutral-200 dark:border-espresso-700">
                                {label}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed italic">
                              «{text}»
                            </div>
                            {session?.script_hints?.[idx] && (
                              <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-normal">
                                {session.script_hints[idx]}
                              </div>
                            )}
                            <div className="flex justify-end pt-1">
                              <CopyButton text={text} label="Скопировать фразу" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* БЛОК 5: Для вас двоих (Shared Summary) */}
                {sharedSummary && (sharedSummary.situation_overview || sharedSummary.shared_advice) && (
                  <div className="warm-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-espresso-700 space-y-4 bg-neutral-100/60 dark:bg-espresso-900/60">
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                      <Users2 size={16} />
                      <span>Для вас двоих (общий итог)</span>
                    </div>

                    {sharedSummary.situation_overview && (
                      <div>
                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          Общая динамика:
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
                          {sharedSummary.situation_overview}
                        </p>
                      </div>
                    )}

                    {sharedSummary.shared_advice && (
                      <div>
                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          Совместный шаг навстречу:
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
                          {sharedSummary.shared_advice}
                        </p>
                      </div>
                    )}

                    {sharedSummary.conversation_starter && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-espresso-850 border border-neutral-200 dark:border-espresso-700 space-y-2.5 shadow-warm-xs">
                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          Фраза для совместного старта диалога:
                        </div>
                        <div className="text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 italic leading-relaxed">
                          «{sharedSummary.conversation_starter}»
                        </div>
                        <div className="flex justify-end pt-1">
                          <CopyButton text={sharedSummary.conversation_starter} label="Скопировать" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Кнопка внизу экрана */}
      <div className="pt-6 pb-2">
        <button
          onClick={onBack}
          className="btn-warm-secondary w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-medium shadow-warm-xs"
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
}
