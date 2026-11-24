/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Clean Minimalism / Warm Neutral / Premium Minimal UI
        // Основная нейтральная палитра (белые, молочные, бежевые, тёплые графитовые оттенки)
        neutral: {
          50: '#FAF9F6',  // Основной фон (молочно-белый)
          100: '#F5F2EC', // Альтернативный фон / Вторичные поверхности
          150: '#F0EDE7', // Поверхности карточек (вторичные)
          200: '#EAE7E1', // Нежные тонкие разделители и рамки
          300: '#DCD7CE', // Рамки при наведении
          400: '#C9BDAA', // Тонкие акценты (шампань / бежевый)
          500: '#B8B4AC', // Неактивные элементы / плейсхолдеры
          600: '#858078', // Вторичный текст
          700: '#5C5851', // Промежуточный текст
          800: '#3D3A34', // Насыщенный текст
          900: '#292824', // Основной текст / Тёмные акцентные кнопки
          950: '#1A1917', // Глубокий тёплый тёмный
        },
        // Алиас warm -> neutral для строгой визуальной целостности
        warm: {
          50: '#FAF9F6',
          100: '#F5F2EC',
          150: '#F0EDE7',
          200: '#EAE7E1',
          300: '#DCD7CE',
          400: '#C9BDAA',
          500: '#B8B4AC',
          600: '#858078',
          700: '#5C5851',
          800: '#3D3A34',
          900: '#292824',
          950: '#1A1917',
        },
        // Тёмная тема: глубокие нейтральные кофейно-графитовые оттенки (без синевы)
        espresso: {
          700: '#33302B',
          800: '#2A2723',
          850: '#211F1C',
          900: '#1B1917',
          950: '#141311',
        },
        // Нейтрализация всех устаревших цветовых шкал в единую бежево-графитовую гамму
        terracotta: {
          50: '#FAF9F6',
          100: '#F5F2EC',
          200: '#EAE7E1',
          300: '#DCD7CE',
          400: '#C9BDAA',
          500: '#292824',
          600: '#292824',
          700: '#292824',
          800: '#292824',
          900: '#1A1917',
          950: '#141311',
        },
        dustyRose: {
          50: '#FAF9F6',
          100: '#F5F2EC',
          200: '#EAE7E1',
          300: '#DCD7CE',
          400: '#C9BDAA',
          500: '#858078',
          600: '#5C5851',
          700: '#3D3A34',
          800: '#292824',
          900: '#1A1917',
        },
        olive: {
          50: '#FAF9F6',
          100: '#F5F2EC',
          200: '#EAE7E1',
          300: '#DCD7CE',
          400: '#C9BDAA',
          500: '#5C5851',
          600: '#3D3A34',
          700: '#292824',
          800: '#1A1917',
          900: '#141311',
        },
        slate: {
          50: '#FAF9F6',
          100: '#F5F2EC',
          200: '#EAE7E1',
          300: '#DCD7CE',
          400: '#B8B4AC',
          500: '#858078',
          600: '#5C5851',
          700: '#3D3A34',
          800: '#292824',
          900: '#1A1917',
          950: '#141311',
        },
        zinc: {
          50: '#FAF9F6',
          100: '#F5F2EC',
          200: '#EAE7E1',
          300: '#DCD7CE',
          400: '#B8B4AC',
          500: '#858078',
          600: '#5C5851',
          700: '#3D3A34',
          800: '#292824',
          900: '#1A1917',
          950: '#141311',
        },
        indigo: {
          50: '#FAF9F6',
          100: '#F5F2EC',
          200: '#EAE7E1',
          300: '#DCD7CE',
          400: '#C9BDAA',
          500: '#292824',
          600: '#292824',
          700: '#292824',
          800: '#292824',
          900: '#1A1917',
          950: '#141311',
        },
        tg: {
          bg: 'var(--tg-theme-bg-color, #FAF9F6)',
          text: 'var(--tg-theme-text-color, #292824)',
          hint: 'var(--tg-theme-hint-color, #858078)',
          link: 'var(--tg-theme-link-color, #292824)',
          button: 'var(--tg-theme-button-color, #292824)',
          buttonText: 'var(--tg-theme-button-text-color, #FAF9F6)',
          secondaryBg: 'var(--tg-theme-secondary-bg-color, #F5F2EC)',
          headerBg: 'var(--tg-theme-header-bg-color, #FAF9F6)',
          sectionBg: 'var(--tg-theme-section-bg-color, #FFFFFF)',
          destructive: 'var(--tg-theme-destructive-text-color, #858078)',
        },
      },
      boxShadow: {
        'warm-xs': '0 1px 2px rgba(41, 40, 36, 0.03)',
        'warm-sm': '0 2px 6px rgba(41, 40, 36, 0.04), 0 1px 2px rgba(41, 40, 36, 0.02)',
        'warm-card': '0 2px 10px rgba(41, 40, 36, 0.035), 0 1px 2px rgba(41, 40, 36, 0.02)',
        'warm-3d': '0 8px 24px -4px rgba(41, 40, 36, 0.06), 0 2px 6px -1px rgba(41, 40, 36, 0.03)',
        'warm-button': '0 6px 18px -2px rgba(41, 40, 36, 0.16), 0 2px 4px -1px rgba(41, 40, 36, 0.08)',
        'warm-button-subtle': '0 1px 3px rgba(41, 40, 36, 0.04)',
        'warm-pill': '0 1px 4px rgba(41, 40, 36, 0.04)',
        'warm-inner': 'inset 0 1px 2px rgba(41, 40, 36, 0.04)',
        'dark-card': '0 4px 16px rgba(0, 0, 0, 0.35)',
        'dark-3d': '0 10px 28px -4px rgba(0, 0, 0, 0.45)',
        'dark-button': '0 6px 18px -2px rgba(0, 0, 0, 0.3)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up': 'slideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float-soft': 'floatSoft 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(3px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
      },
    },
  },
  plugins: [],
}
