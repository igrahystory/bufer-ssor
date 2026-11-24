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
        // Теплая гармоничная дизайн-система: Minimal Premium / Soft Modernism
        warm: {
          50: '#FBF9F5',
          100: '#F7F3ED', // Тёплый молочный (основной фон)
          200: '#EFE7DC', // Мягкий кремовый
          300: '#E6D8C7', // Светлый песочный
          400: '#D9C7B2',
          500: '#BAA38D',
          600: '#8E7D6F',
          700: '#665B52', // Тёплый коричнево-серый (второстепенный текст)
          800: '#484039',
          900: '#39332F', // Глубокий кофейный (основной текст)
          950: '#231F1C',
        },
        terracotta: {
          50: '#FAF2EF',
          100: '#F5E6E1',
          200: '#EACCC2',
          300: '#DEB0A1',
          400: '#D49581',
          500: '#C98770', // Приглушённый терракотовый (главный тёплый акцент)
          600: '#B6735C',
          700: '#965A46',
          800: '#794534',
          900: '#5F3527',
          950: '#3D1F16',
        },
        dustyRose: {
          50: '#FAF4F2',
          100: '#F4E9E5',
          200: '#E8D5CE',
          300: '#D8B5A8', // Тёплый пыльно-розовый
          400: '#C79D8E',
          500: '#B58474',
          600: '#9B6C5C',
          700: '#7D5345',
          800: '#644034',
          900: '#4D3027',
        },
        olive: {
          50: '#F6F7F3',
          100: '#EEF1E8',
          200: '#DDE2D2',
          300: '#C6CDB7',
          400: '#A6A88D', // Мягкий оливковый (безопасность, мир)
          500: '#8E9473',
          600: '#737A57',
          700: '#585E42',
          800: '#424630',
          900: '#2E3122',
        },
        // Мягкая темная тема (графитово-кофейная, без кислотности и синевы)
        espresso: {
          800: '#26221E',
          850: '#201C18',
          900: '#1A1714',
          950: '#141210',
        },
        // Мягкие нейтрали для совместимости с существующим кодом
        slate: {
          50: '#FAF7F3',
          100: '#F4EEE5',
          200: '#EAE1D5',
          300: '#D6C8BA',
          400: '#9C8F83',
          500: '#786C61',
          600: '#665B52',
          700: '#4E443C',
          800: '#39332F',
          900: '#27221E',
          950: '#191613',
        },
        zinc: {
          50: '#FAF7F3',
          100: '#F3ECE3',
          200: '#E7DDD0',
          300: '#D3C4B4',
          400: '#9B8E81',
          500: '#776B5F',
          600: '#64594E',
          700: '#4B423A',
          800: '#362F29',
          900: '#231F1C',
          950: '#161311',
        },
        indigo: {
          50: '#FAF2EF',
          100: '#F5E6E1',
          200: '#EACCC2',
          300: '#DEB0A1',
          400: '#D49581',
          500: '#C98770', // замена резкого индиго на благородную терракоту
          600: '#B6735C',
          700: '#965A46',
          800: '#794534',
          900: '#5F3527',
          950: '#3D1F16',
        },
        tg: {
          bg: 'var(--tg-theme-bg-color, #F7F3ED)',
          text: 'var(--tg-theme-text-color, #39332F)',
          hint: 'var(--tg-theme-hint-color, #786C61)',
          link: 'var(--tg-theme-link-color, #C98770)',
          button: 'var(--tg-theme-button-color, #C98770)',
          buttonText: 'var(--tg-theme-button-text-color, #FFFFFF)',
          secondaryBg: 'var(--tg-theme-secondary-bg-color, #EFE7DC)',
          headerBg: 'var(--tg-theme-header-bg-color, #F7F3ED)',
          sectionBg: 'var(--tg-theme-section-bg-color, #FFFFFF)',
          destructive: 'var(--tg-theme-destructive-text-color, #C75D4D)',
        },
      },
      boxShadow: {
        'warm-xs': '0 1px 2px rgba(57, 51, 47, 0.04)',
        'warm-sm': '0 2px 8px -2px rgba(57, 51, 47, 0.06), 0 1px 2px rgba(57, 51, 47, 0.03)',
        'warm-card': '0 8px 24px -4px rgba(57, 51, 47, 0.07), 0 2px 6px -1px rgba(57, 51, 47, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.75)',
        'warm-3d': '0 14px 32px -6px rgba(57, 51, 47, 0.10), 0 3px 8px -2px rgba(57, 51, 47, 0.05), inset 0 1.5px 0 rgba(255, 255, 255, 0.9)',
        'warm-button': '0 10px 24px -4px rgba(201, 135, 112, 0.40), 0 3px 8px -1px rgba(201, 135, 112, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
        'warm-button-subtle': '0 4px 14px -2px rgba(57, 51, 47, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'warm-pill': '0 2px 8px -2px rgba(57, 51, 47, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'warm-inner': 'inset 0 2px 4px rgba(57, 51, 47, 0.06)',
        'dark-card': '0 10px 30px -4px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'dark-3d': '0 16px 36px -6px rgba(0, 0, 0, 0.55), inset 0 1.5px 0 rgba(255, 255, 255, 0.09)',
        'dark-button': '0 10px 24px -4px rgba(201, 135, 112, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.20)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up': 'slideUp 0.36s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float-soft': 'floatSoft 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
    },
  },
  plugins: [],
}
