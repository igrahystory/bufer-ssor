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
      <div className="min-h-screen flex items-center justify-center text-neutral-700 dark:text-neutral-300 gap-2">
        <LoaderCircle className="animate-spin text-neutral-900 dark:text-neutral-100" />
        <span className="text-sm font-medium">Загружаем…</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen text-neutral-900 dark:text-neutral-100 px-5 pt-safe pb-safe">
      <div className="max-w-md mx-auto space-y-5 app-home-stack pt-2 pb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 py-1.5 px-2.5 -ml-2 rounded-xl transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          <span>На главную</span>
        </button>

        <header className="home-conflict-warm rounded-3xl p-6 sm:p-7 text-neutral-50 shadow-warm-button">
          <div className="w-11 h-11 rounded-2xl bg-white/10 dark:bg-black/10 border border-white/15 dark:border-black/10 flex items-center justify-center mb-3">
            <Heart size={22} className="fill-current opacity-80" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white dark:text-neutral-900">
            Баланс отношений
          </h1>
          <p className="mt-1.5 text-xs text-white/80 dark:text-neutral-700 leading-relaxed font-normal">
            Ответьте каждый отдельно. Партнёр не увидит ваши отдельные ответы — вместе вы получите общий бережный итог и идеи для пары.
          </p>
        </header>

        {error && (
          <div role="alert" className="rounded-2xl bg-neutral-100 dark:bg-espresso-900 border border-neutral-200 dark:border-espresso-700 p-4 text-xs text-neutral-900 dark:text-neutral-100 shadow-warm-xs">
            {error}
          </div>
        )}

        {session?.status === 'completed' && session.result ? (
          <section className="space-y-4">
            <div className="warm-card rounded-3xl p-6 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Общий баланс
              </div>
              <div className="text-5xl font-semibold mt-2 text-neutral-900 dark:text-neutral-50 tracking-tight">
                {session.result.score}
                <span className="text-xl text-neutral-400 font-normal">/100</span>
              </div>
              <div className="font-semibold text-sm sm:text-base mt-2 text-neutral-900 dark:text-neutral-100">
                {session.result.label}
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                {session.result.summary}
              </p>
              <p className="text-[11px] text-neutral-400 mt-3">
                Шкала показывает ваши ответы сегодня — это ориентир для спокойного разговора, не оценка пары.
              </p>
            </div>

            <div className="warm-card rounded-3xl p-5 sm:p-6 space-y-3.5">
              <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 tracking-tight">
                Темы для общего внимания
              </h2>
              {session.result.dimension_scores?.map((value, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <span>{DIMENSIONS[index]}</span>
                    <span className="text-neutral-500">{value}/5</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-200 dark:bg-espresso-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-neutral-900 dark:bg-neutral-100 transition-all duration-500"
                      style={{ width: `${value * 20}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="warm-card rounded-3xl p-5 sm:p-6 space-y-3.5">
              <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2 tracking-tight">
                <Sparkles size={16} className="text-neutral-700 dark:text-neutral-300" />
                <span>Что можно попробовать</span>
              </h2>
              <ul className="mt-2 space-y-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                {session.result.tips?.map((tip, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="text-neutral-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-2xl bg-neutral-100 dark:bg-espresso-900 p-4 text-xs text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-espresso-700 leading-relaxed shadow-warm-xs">
                <b className="font-semibold">Идея для вас двоих:</b> {session.result.activity_idea}
              </div>
            </div>

            <button
              onClick={finish}
              disabled={session.finish_confirmed_by_me}
              className="btn-warm-primary w-full rounded-2xl py-3.5 font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-warm-button disabled:opacity-60"
            >
              <Check size={18} />
              <span>{session.finish_confirmed_by_me ? 'Ожидаем подтверждение партнёра' : 'Завершить баланс'}</span>
            </button>
            <p className="text-center text-[11px] text-neutral-500">
              Результат удалится после подтверждения обоих или автоматически через 48 часов.
            </p>
          </section>
        ) : session?.answered ? (
          <section className="warm-card rounded-3xl p-6 sm:p-7 text-center space-y-3">
            <LoaderCircle className="animate-spin mx-auto text-neutral-900 dark:text-neutral-100" size={28} />
            <h2 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 tracking-tight">
              Ждём ответы партнёра
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
              Когда он или она закончит, ИИ подготовит общий результат. Ответы хранятся зашифрованными только до анализа.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            <p className="text-xs text-neutral-600 dark:text-neutral-400 px-1">
              Насколько часто это бывает для вас? Выберите один ответ для каждого утверждения:
            </p>
            {QUESTIONS.map((question, index) => (
              <fieldset key={question} className="warm-card rounded-3xl p-5 sm:p-6 space-y-3">
                <legend className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed tracking-tight">
                  {index + 1}. {question}
                </legend>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {OPTIONS.map((option, optionIndex) => {
                    const value = optionIndex + 1;
                    const isSelected = answers[index] === value;
                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-3 rounded-2xl border p-3.5 text-xs sm:text-sm cursor-pointer transition-all ${
                          isSelected
                            ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-espresso-850 text-neutral-900 dark:text-neutral-100 font-medium shadow-warm-xs'
                            : 'border-neutral-200 dark:border-espresso-700 bg-white/80 dark:bg-espresso-900/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-espresso-850'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${index}`}
                          value={value}
                          checked={isSelected}
                          onChange={() => setAnswers((prev) => prev.map((v, i) => (i === index ? value : v)))}
                          className="accent-neutral-900 dark:accent-neutral-100 w-4 h-4 cursor-pointer"
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
                className="btn-warm-primary w-full rounded-2xl py-3.5 font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-warm-button disabled:opacity-50"
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
