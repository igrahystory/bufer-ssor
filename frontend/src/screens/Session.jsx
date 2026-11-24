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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-warm-100 dark:bg-espresso-950 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-espresso-900 border border-warm-300/60 dark:border-warm-700/40 text-terracotta-500 dark:text-terracotta-400 flex items-center justify-center shadow-warm-3d animate-pulse mb-3.5">
          <Sparkles size={24} />
        </div>
        <div className="text-sm font-bold text-warm-900 dark:text-warm-100">
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
    <div className="min-h-screen flex flex-col justify-between px-4 pt-safe pb-safe sm:px-5 max-w-md mx-auto animate-fade-in">
      <div className="space-y-4 app-home-stack pt-2">
        {/* Верхняя навигация */}
        <div className="flex items-center justify-between pb-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-warm-700 hover:text-warm-900 dark:text-warm-300 dark:hover:text-warm-100 py-1.5 px-2.5 -ml-2 rounded-xl hover:bg-warm-200/60 dark:hover:bg-espresso-900 transition-colors font-medium"
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
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta-700 dark:text-terracotta-300 bg-terracotta-50 dark:bg-terracotta-950/50 border border-terracotta-200/80 dark:border-terracotta-900/50 py-1 px-2.5 rounded-xl transition-all shadow-warm-xs active:scale-[0.98]"
              title="Экстренно закрыть"
            >
              <XCircle size={14} />
              <span>Быстро закрыть</span>
            </button>
            <span className="text-[10px] text-warm-500/80 dark:text-warm-400/70 font-mono tracking-wider">
              ID: {sessionId.slice(0, 8)}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-terracotta-50 dark:bg-terracotta-950/40 text-terracotta-800 dark:text-terracotta-200 text-xs border border-terracotta-200 dark:border-terracotta-900 flex items-center gap-2 shadow-warm-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* СТАТУС 1: Ждём версию партнёра (waiting_partner_2)                  */}
        {/* =================================================================== */}
        {status === 'waiting_partner_2' && (
          <div className="warm-card rounded-3xl p-6 text-center space-y-4 my-4 animate-fade-in">
            <div className="w-15 h-15 mx-auto rounded-3xl bg-warm-100 dark:bg-espresso-900 text-terracotta-600 dark:text-terracotta-400 flex items-center justify-center border border-warm-300/60 dark:border-warm-700/40 shadow-warm-3d animate-pulse">
              <Clock size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-warm-900 dark:text-warm-50 tracking-tight">
                Ждём версию партнёра
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-warm-700/80 dark:text-warm-300/80 leading-relaxed max-w-xs mx-auto">
                Бот уже отправил партнёру деликатное сообщение. Как только он расскажет свою сторону — ИИ сразу приступит к анализу.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-warm-50 dark:bg-espresso-900/60 text-[11px] text-warm-700 dark:text-warm-300 border border-warm-200/60 dark:border-warm-800/40 leading-normal">
              💡 Напомните партнёру проверить чат с ботом{' '}
              <span className="font-semibold text-warm-900 dark:text-warm-100">@BufferSsorBot</span>
            </div>

            <div className="pt-1">
              <button
                onClick={() => fetchSessionStatus(false)}
                className="inline-flex items-center gap-1.5 text-xs text-terracotta-600 dark:text-terracotta-400 font-semibold hover:underline"
              >
                <RefreshCw size={12} className="animate-spin" />
                <span>Обновляем статус каждые 5 сек...</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* СТАТУС 2: ИИ анализирует ситуацию (analyzing)                       */}
        {/* =================================================================== */}
        {['analyzing', 'processing'].includes(status) && (
          <div className="warm-card rounded-3xl p-6 text-center space-y-4 my-4 animate-fade-in">
            <div className="w-15 h-15 mx-auto rounded-3xl bg-terracotta-50 dark:bg-terracotta-950/50 text-terracotta-600 dark:text-terracotta-400 flex items-center justify-center border border-terracotta-200/60 dark:border-terracotta-900/40 shadow-warm-3d">
              <Sparkles size={28} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-warm-900 dark:text-warm-50 tracking-tight">
                ИИ анализирует ситуацию
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-warm-700/80 dark:text-warm-300/80 leading-relaxed max-w-xs mx-auto">
                Обе версии получены. Медиатор сопоставляет потребности, проверяет конфиденциальный барьер и готовит бережные рекомендации.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-terracotta-600 dark:text-terracotta-400 font-semibold">
              <RefreshCw size={13} className="animate-spin" />
              <span>Осталось совсем немного...</span>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* СТАТУСЫ ОШИБОК / ТАЙМАУТА: failed или expired                       */}
        {/* =================================================================== */}
        {status === 'finished' && (
          <div className="my-5 p-5 rounded-3xl bg-olive-50 dark:bg-olive-950/30 border border-olive-200/80 dark:border-olive-900/50 text-center text-xs sm:text-sm text-olive-900 dark:text-olive-200 shadow-warm-xs leading-relaxed">
            Карточка больше недоступна: данные конфликта удалены после взаимного подтверждения или по истечении 48 часов.
          </div>
        )}

        {(status === 'failed' || status === 'expired') && (
          <div className="warm-card rounded-3xl p-6 text-center space-y-4 my-4 animate-fade-in">
            <div className="w-15 h-15 mx-auto rounded-3xl bg-warm-100 dark:bg-espresso-900 text-terracotta-600 dark:text-terracotta-400 flex items-center justify-center border border-warm-300/60 dark:border-warm-700/40 shadow-warm-3d">
              <AlertCircle size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-warm-900 dark:text-warm-50 tracking-tight">
                {status === 'expired' ? 'Время ожидания истекло' : 'Сессия не завершена'}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-warm-700/80 dark:text-warm-300/80 leading-relaxed max-w-xs mx-auto">
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
                className="btn-warm-primary w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold shadow-warm-button"
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
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-olive-50 dark:bg-olive-950/40 text-olive-900 dark:text-olive-200 border border-olive-200/80 dark:border-olive-900/50 text-xs font-semibold shadow-warm-xs">
              <CheckCircle2 size={16} className="text-olive-600 dark:text-olive-400 shrink-0" />
              <span>Ваш персональный разбор готов</span>
            </div>

            {session?.finish_confirmed_by_me ? (
              <div className="p-3.5 rounded-2xl bg-warm-100 dark:bg-espresso-900/60 text-warm-800 dark:text-warm-200 text-xs sm:text-sm border border-warm-300/60 dark:border-warm-800/40">
                Вы подтвердили завершение. Данные удалятся, когда партнёр тоже подтвердит.
              </div>
            ) : (
              <div className="space-y-2">
                {finishError && <p className="text-xs text-terracotta-600">{finishError}</p>}
                <button
                  type="button"
                  disabled={isFinishing}
                  onClick={handleFinishConflict}
                  className="btn-warm-secondary w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-warm-sm"
                >
                  {isFinishing ? 'Сохраняем...' : 'Завершить конфликт'}
                </button>
                <p className="text-center text-[11px] text-warm-600/70 dark:text-warm-400">
                  После подтверждения обоими партнёрами карточки и данные конфликта удалятся.
                </p>
              </div>
            )}

            {/* ВЕТКА БЕЗОПАСНОСТИ: RISK_LEVEL == HIGH */}
            {riskLevel === 'high' ? (
              <div className="warm-card rounded-3xl p-5 border-2 border-terracotta-300 dark:border-terracotta-800 space-y-4">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 text-terracotta-700 dark:text-terracotta-300">
                    <ShieldAlert size={22} className="shrink-0" />
                    <h3 className="font-bold text-sm sm:text-base">
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
                  className="btn-warm-primary w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-warm-button"
                >
                  <XCircle size={18} />
                  <span>Быстро закрыть</span>
                </button>

                <p className="text-xs sm:text-sm text-warm-800 dark:text-warm-200 leading-relaxed">
                  {session.safety_note ||
                    'В текущей ситуации первостепенное значение имеет ваша личная безопасность. Мы не даем стандартных советов по примирению, когда есть риск насилия или давления.'}
                </p>

                {personalAdvice?.validation && (
                  <div className="p-3.5 rounded-2xl bg-terracotta-50/70 dark:bg-terracotta-950/30 text-xs text-terracotta-900 dark:text-terracotta-200 border border-terracotta-200/60 dark:border-terracotta-900/40 italic">
                    «{personalAdvice.validation}»
                  </div>
                )}

                <div className="pt-2 border-t border-warm-200/60 dark:border-warm-800/40 space-y-2">
                  <div className="text-xs font-bold text-warm-900 dark:text-warm-100">
                    Экстренная и кризисная помощь (бесплатно, анонимно):
                  </div>

                  <a
                    href="tel:112"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-semibold text-xs shadow-warm-button transition-colors"
                  >
                    <span>Единый номер экстренных служб (круглосуточно)</span>
                    <span className="font-bold flex items-center gap-1">
                      <PhoneCall size={14} /> 112
                    </span>
                  </a>

                  <a
                    href="tel:88007000600"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-warm-100 hover:bg-warm-200/80 dark:bg-espresso-900 dark:hover:bg-espresso-850 text-warm-900 dark:text-warm-100 text-xs font-semibold border border-warm-300/60 dark:border-warm-700/40 transition-colors shadow-warm-xs"
                  >
                    <span>Телефон доверия для женщин, пострадавших от насилия</span>
                    <span className="font-bold text-terracotta-600 dark:text-terracotta-400">
                      8-800-7000-600
                    </span>
                  </a>
                </div>

                <div className="text-[11px] text-warm-500 text-center pt-1">
                  Перед запуском проверьте актуальность номеров на сайтах организаций.
                </div>
              </div>
            ) : (
              /* ВЕТКА ОБЫЧНОГО РАЗБОРА: RISK_LEVEL == NONE ИЛИ ELEVATED */
              <div className="space-y-3.5">
                {/* Мягкий safety_note сверху при elevated */}
                {riskLevel === 'elevated' && session.safety_note && (
                  <div className="p-3.5 rounded-2xl bg-warm-100 dark:bg-espresso-900 text-warm-900 dark:text-warm-100 border border-warm-300/80 dark:border-warm-700/50 text-xs leading-relaxed flex items-start gap-2.5 shadow-warm-xs">
                    <ShieldAlert size={16} className="text-terracotta-600 dark:text-terracotta-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Обратите внимание:</div>
                      <div className="mt-0.5 text-warm-700 dark:text-warm-300">{session.safety_note}</div>
                    </div>
                  </div>
                )}

                {/* БЛОК 1: Понимание чувств (Validation) */}
                {personalAdvice?.validation && (
                  <div className="warm-card rounded-3xl p-4.5 sm:p-5 space-y-2">
                    <div className="flex items-center gap-2 text-dustyRose-600 dark:text-dustyRose-400 font-bold text-xs uppercase tracking-wider">
                      <HeartHandshake size={16} />
                      <span>Понимание ваших чувств</span>
                    </div>
                    <p className="text-xs sm:text-sm text-warm-900 dark:text-warm-100 leading-relaxed">
                      {personalAdvice.validation}
                    </p>
                  </div>
                )}

                {/* БЛОК 2: Взгляд партнёра (Partner Perspective) */}
                {personalAdvice?.partner_perspective && (
                  <div className="warm-card rounded-3xl p-4.5 sm:p-5 space-y-2">
                    <div className="flex items-center gap-2 text-terracotta-600 dark:text-terracotta-400 font-bold text-xs uppercase tracking-wider">
                      <Eye size={16} />
                      <span>Взгляд партнёра (гипотеза)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-warm-900 dark:text-warm-100 leading-relaxed">
                      {personalAdvice.partner_perspective}
                    </p>
                  </div>
                )}

                {/* БЛОК 3: Точка роста (Blind Spot) */}
                {personalAdvice?.blind_spot && (
                  <div className="warm-card rounded-3xl p-4.5 sm:p-5 space-y-2">
                    <div className="flex items-center gap-2 text-warm-700 dark:text-warm-300 font-bold text-xs uppercase tracking-wider">
                      <Lightbulb size={16} />
                      <span>Точка роста</span>
                    </div>
                    <p className="text-xs sm:text-sm text-warm-900 dark:text-warm-100 leading-relaxed">
                      {personalAdvice.blind_spot}
                    </p>
                  </div>
                )}

                {/* БЛОК 4: Скрипты примирения (Action Scripts) */}
                {personalAdvice?.action_scripts && personalAdvice.action_scripts.length > 0 && (
                  <div className="warm-card rounded-3xl p-4.5 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2 text-olive-700 dark:text-olive-300 font-bold text-xs uppercase tracking-wider">
                      <MessageSquare size={16} />
                      <span>Скрипты примирения (от 1-го лица)</span>
                    </div>
                    <p className="text-[11px] text-warm-600 dark:text-warm-400 leading-snug">
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
                            className="p-4 rounded-2xl bg-warm-50 dark:bg-espresso-900/60 border border-warm-200/80 dark:border-warm-800/50 flex flex-col justify-between gap-2.5 shadow-warm-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-olive-800 dark:text-olive-300 px-2.5 py-0.5 rounded-full bg-olive-100/80 dark:bg-olive-950/60 border border-olive-200/80 dark:border-olive-800/40">
                                {label}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm text-warm-900 dark:text-warm-100 leading-relaxed italic">
                              «{text}»
                            </div>
                            {session?.script_hints?.[idx] && (
                              <div className="text-[11px] text-warm-600/80 dark:text-warm-400 leading-normal">
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
                  <div className="warm-card rounded-3xl p-5 border border-terracotta-200/80 dark:border-terracotta-900/50 space-y-3.5 bg-gradient-to-br from-warm-50/80 to-terracotta-50/40 dark:from-espresso-900/80 dark:to-espresso-850/60">
                    <div className="flex items-center gap-2 text-terracotta-700 dark:text-terracotta-300 font-bold text-xs uppercase tracking-wider">
                      <Users2 size={16} />
                      <span>Для вас двоих (общий итог)</span>
                    </div>

                    {sharedSummary.situation_overview && (
                      <div>
                        <div className="text-[11px] font-bold text-warm-900 dark:text-warm-100">
                          Общая динамика:
                        </div>
                        <p className="text-xs sm:text-sm text-warm-800 dark:text-warm-200 mt-0.5 leading-relaxed">
                          {sharedSummary.situation_overview}
                        </p>
                      </div>
                    )}

                    {sharedSummary.shared_advice && (
                      <div>
                        <div className="text-[11px] font-bold text-warm-900 dark:text-warm-100">
                          Совместный шаг навстречу:
                        </div>
                        <p className="text-xs sm:text-sm text-warm-800 dark:text-warm-200 mt-0.5 leading-relaxed">
                          {sharedSummary.shared_advice}
                        </p>
                      </div>
                    )}

                    {sharedSummary.conversation_starter && (
                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-espresso-900/90 border border-warm-200/80 dark:border-warm-800/40 space-y-2 shadow-warm-xs">
                        <div className="text-[11px] font-bold text-warm-900 dark:text-warm-100">
                          Фраза для совместного старта диалога:
                        </div>
                        <div className="text-xs sm:text-sm text-warm-900 dark:text-warm-100 italic leading-relaxed">
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
          className="btn-warm-secondary w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-semibold shadow-warm-sm"
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
}
