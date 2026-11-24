import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Heart, Sparkles, LoaderCircle, Check } from 'lucide-react';
import { api } from '../api/client';

const QUESTIONS = [
  'Мне легко говорить с партнёром о том, что для меня важно.',
  'Я чувствую, что партнёр старается понять мою точку зрения.',
  'Нам хватает времени, когда мы можем побыть вместе и не отвлекаться.',
  'Я могу рассчитывать на поддержку партнёра в непростой момент.',
  'Наши повседневные дела и ответственность распределены приемлемо для меня.',
  'В наших отношениях достаточно тепла, внимания и нежности.',
];

const OPTIONS = ['Почти никогда', 'Редко', 'Иногда', 'Часто', 'Почти всегда'];
const DIMENSIONS = ['Разговоры', 'Понимание', 'Время вместе', 'Поддержка', 'Общие дела', 'Тепло'];

export default function RelationshipBalance({ sessionId, onBack }) {
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(0));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const data = await api.getRelationshipBalance(sessionId);
      setSession(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Не удалось загрузить баланс отношений');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  const submit = async () => {
    if (answers.some((answer) => !answer)) return;
    setSubmitting(true);
    setError('');
    try {
      await api.submitRelationshipBalance(sessionId, answers);
      await refresh();
    } catch (err) {
      setError(err.message || 'Не удалось отправить ответы. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const finish = async () => {
    try {
      await api.finishRelationshipBalance(sessionId);
      onBack();
    } catch (err) {
      setError(err.message || 'Не удалось завершить баланс');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-warm-700 dark:text-warm-300 gap-2">
        <LoaderCircle className="animate-spin text-terracotta-500" />
        <span className="text-sm font-medium">Загружаем…</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen text-warm-900 dark:text-warm-100 px-4 pt-safe pb-safe sm:px-5">
      <div className="max-w-md mx-auto space-y-4 app-home-stack pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-warm-700 hover:text-warm-900 dark:text-warm-300 dark:hover:text-warm-100 py-1.5 px-2.5 -ml-2 rounded-xl hover:bg-warm-200/60 dark:hover:bg-espresso-900 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          <span>На главную</span>
        </button>

        <header className="home-conflict-warm rounded-3xl p-6 text-white shadow-warm-button">
          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-3 backdrop-blur-md shadow-inner">
            <Heart size={24} className="text-white fill-white/25" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-xs">
            Баланс отношений
          </h1>
          <p className="mt-1.5 text-xs text-white/90 leading-relaxed font-medium">
            Ответьте каждый отдельно. Партнёр не увидит ваши отдельные ответы — вместе вы получите общий бережный итог и идеи для пары.
          </p>
        </header>

        {error && (
          <div role="alert" className="rounded-2xl bg-terracotta-50 dark:bg-terracotta-950/40 border border-terracotta-200 dark:border-terracotta-900 p-3.5 text-xs text-terracotta-800 dark:text-terracotta-200 shadow-warm-xs">
            {error}
          </div>
        )}

        {session?.status === 'completed' && session.result ? (
          <section className="space-y-4">
            <div className="warm-card rounded-3xl p-5 text-center">
              <div className="text-[11px] font-bold uppercase tracking-widest text-terracotta-600 dark:text-terracotta-400">
                Общий баланс
              </div>
              <div className="text-5xl font-black mt-2 text-warm-900 dark:text-warm-50 tracking-tight">
                {session.result.score}
                <span className="text-xl text-warm-500 font-semibold">/100</span>
              </div>
              <div className="font-bold text-sm mt-2 text-warm-800 dark:text-warm-200">
                {session.result.label}
              </div>
              <p className="text-xs sm:text-sm text-warm-700/80 dark:text-warm-300 mt-2.5 leading-relaxed">
                {session.result.summary}
              </p>
              <p className="text-[11px] text-warm-500/80 dark:text-warm-400/80 mt-3">
                Шкала показывает ваши ответы сегодня — это ориентир для спокойного разговора, не оценка пары.
              </p>
            </div>

            <div className="warm-card rounded-3xl p-5 space-y-3">
              <h2 className="font-bold text-sm text-warm-900 dark:text-warm-100 tracking-tight">
                Темы для общего внимания
              </h2>
              {session.result.dimension_scores?.map((value, index) => (
                <div key={index}>
                  <div className="flex justify-between text-xs mb-1 font-medium text-warm-700 dark:text-warm-300">
                    <span>{DIMENSIONS[index]}</span>
                    <span className="text-warm-500">{value}/5</span>
                  </div>
                  <div className="h-2 rounded-full bg-warm-200/80 dark:bg-espresso-900 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full bg-terracotta-500"
                      style={{ width: `${value * 20}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="warm-card rounded-3xl p-5 space-y-3">
              <h2 className="font-bold text-sm text-warm-900 dark:text-warm-100 flex items-center gap-2 tracking-tight">
                <Sparkles size={16} className="text-terracotta-500" />
                <span>Что можно попробовать</span>
              </h2>
              <ul className="mt-2 space-y-2.5 text-xs sm:text-sm text-warm-800 dark:text-warm-200">
                {session.result.tips?.map((tip, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="text-terracotta-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-2xl bg-warm-100 dark:bg-espresso-900/80 p-3.5 text-xs text-warm-900 dark:text-warm-100 border border-warm-200/60 dark:border-warm-800/40 leading-relaxed shadow-warm-xs">
                <b className="text-terracotta-700 dark:text-terracotta-300">Идея для вас двоих:</b> {session.result.activity_idea}
              </div>
            </div>

            <button
              onClick={finish}
              disabled={session.finish_confirmed_by_me}
              className="btn-warm-primary w-full rounded-2xl py-3.5 font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-warm-button disabled:opacity-60"
            >
              <Check size={18} />
              <span>{session.finish_confirmed_by_me ? 'Ожидаем подтверждение партнёра' : 'Завершить баланс'}</span>
            </button>
            <p className="text-center text-[11px] text-warm-500">
              Результат удалится после подтверждения обоих или автоматически через 48 часов.
            </p>
          </section>
        ) : session?.answered ? (
          <section className="warm-card rounded-3xl p-6 text-center space-y-3">
            <LoaderCircle className="animate-spin mx-auto text-terracotta-500" size={30} />
            <h2 className="font-bold text-base text-warm-900 dark:text-warm-100 tracking-tight">
              Ждём ответы партнёра
            </h2>
            <p className="text-xs text-warm-700/80 dark:text-warm-300 leading-relaxed max-w-xs mx-auto">
              Когда он или она закончит, ИИ подготовит общий результат. Ответы хранятся зашифрованными только до анализа.
            </p>
          </section>
        ) : (
          <section className="space-y-3.5">
            <p className="text-xs text-warm-700/80 dark:text-warm-300 px-1">
              Насколько часто это бывает для вас? Выберите один ответ для каждого утверждения:
            </p>
            {QUESTIONS.map((question, index) => (
              <fieldset key={question} className="warm-card rounded-3xl p-4.5 space-y-2.5">
                <legend className="font-bold text-xs sm:text-sm text-warm-900 dark:text-warm-100 leading-relaxed tracking-tight">
                  {index + 1}. {question}
                </legend>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {OPTIONS.map((option, optionIndex) => {
                    const value = optionIndex + 1;
                    const isSelected = answers[index] === value;
                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-3 rounded-2xl border p-3 text-xs sm:text-sm cursor-pointer transition-all ${
                          isSelected
                            ? 'border-terracotta-500 bg-terracotta-50/70 dark:bg-terracotta-950/40 text-terracotta-900 dark:text-terracotta-100 font-semibold shadow-warm-xs'
                            : 'border-warm-200/80 dark:border-warm-800/60 bg-white/60 dark:bg-espresso-900/60 text-warm-800 dark:text-warm-200 hover:bg-warm-100/60 dark:hover:bg-espresso-850'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${index}`}
                          value={value}
                          checked={isSelected}
                          onChange={() => setAnswers((prev) => prev.map((v, i) => (i === index ? value : v)))}
                          className="accent-terracotta-500 w-4 h-4 cursor-pointer"
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <div className="pt-2 pb-6">
              <button
                disabled={answers.some((answer) => !answer) || submitting}
                onClick={submit}
                className="btn-warm-primary w-full rounded-2xl py-3.5 font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-warm-button disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    <span>Отправляем...</span>
                  </>
                ) : (
                  <span>Отправить ответы</span>
                )}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
