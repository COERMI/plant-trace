/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 主色（苔绿）
        primary: {
          DEFAULT: '#4A7C59',
          hover: '#3D6649',
          active: '#5A8F6A'
        },
        // 中性色
        neutral: {
          title: '#2A2F2A',   // 标题文字
          body: '#5A5F5A',    // 正文文字
          secondary: '#8A8F8A', // 次要文字
          placeholder: '#B0B5B0', // 占位文字
          border: '#E8EAE8',  // 分割线/边框
          bg: '#F7F8F7'       // 次级背景
        },
        danger: '#C0392B',
        warning: '#F39C12',
        success: '#27AE60'
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'sans-serif'
        ]
      },
      fontSize: {
        // 大标题 24px / 700 / 1.3
        h1: ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        // 页面标题 20px / 600 / 1.4
        h2: ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        // 卡片标题 16px / 600 / 1.4
        h3: ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        // 正文 14px / 400 / 1.6
        'body-l': ['14px', { lineHeight: '1.6' }],
        body: ['14px', { lineHeight: '1.6' }],
        // 辅助文字 12px / 400 / 1.5
        caption: ['12px', { lineHeight: '1.5' }],
        micro: ['11px', { lineHeight: '1.4' }]
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px'
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.06)',
        md: '0 2px 8px rgba(0,0,0,0.08)',
        lg: '0 4px 16px rgba(0,0,0,0.1)',
        xl: '0 8px 32px rgba(0,0,0,0.12)',
        'focus-primary': '0 0 0 3px rgba(74,124,89,0.1)'
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        base: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  },
  plugins: []
}
