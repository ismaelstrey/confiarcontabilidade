# Design System - Site Institucional Contabilidade

## 🎨 Paleta de Cores

### Cores Primárias
```css
/* Azul Corporativo - Confiança e Profissionalismo */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6; /* Cor principal */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;

/* Verde Sucesso - Crescimento e Estabilidade */
--success-50: #ecfdf5;
--success-100: #d1fae5;
--success-200: #a7f3d0;
--success-300: #6ee7b7;
--success-400: #34d399;
--success-500: #10b981; /* Cor principal */
--success-600: #059669;
--success-700: #047857;
--success-800: #065f46;
--success-900: #064e3b;

/* Dourado Premium - Excelência e Valor */
--accent-50: #fffbeb;
--accent-100: #fef3c7;
--accent-200: #fde68a;
--accent-300: #fcd34d;
--accent-400: #fbbf24;
--accent-500: #f59e0b; /* Cor principal */
--accent-600: #d97706;
--accent-700: #b45309;
--accent-800: #92400e;
--accent-900: #78350f;
```

### Cores Neutras
```css
/* Escala de Cinzas */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Cores Especiais */
--white: #ffffff;
--black: #000000;
--error: #ef4444;
--warning: #f59e0b;
--info: #3b82f6;
```

### Cores Semânticas
```css
/* Estados */
--color-success: var(--success-500);
--color-error: #ef4444;
--color-warning: var(--accent-500);
--color-info: var(--primary-500);

/* Texto */
--text-primary: var(--gray-900);
--text-secondary: var(--gray-600);
--text-muted: var(--gray-500);
--text-inverse: var(--white);

/* Backgrounds */
--bg-primary: var(--white);
--bg-secondary: var(--gray-50);
--bg-muted: var(--gray-100);
--bg-dark: var(--gray-900);
```

## 📝 Tipografia

### Fontes
```css
/* Fonte Principal - Inter (Sans-serif moderna) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

/* Fonte Secundária - Playfair Display (Serif elegante para títulos) */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');

--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-secondary: 'Playfair Display', Georgia, serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Escala Tipográfica
```css
/* Headings */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 3.75rem;    /* 60px */
--text-7xl: 4.5rem;     /* 72px */
--text-8xl: 6rem;       /* 96px */
--text-9xl: 8rem;       /* 128px */

/* Line Heights */
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;
```

### Estilos de Texto
```css
/* Títulos */
.heading-1 {
  font-family: var(--font-secondary);
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

.heading-2 {
  font-family: var(--font-secondary);
  font-size: var(--text-4xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

.heading-3 {
  font-family: var(--font-primary);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
}

/* Corpo do texto */
.body-large {
  font-family: var(--font-primary);
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
}

.body-normal {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-primary);
}

.body-small {
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}
```

## 📏 Espaçamento

### Sistema de Espaçamento (Base 8px)
```css
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
--space-32: 8rem;    /* 128px */
--space-40: 10rem;   /* 160px */
--space-48: 12rem;   /* 192px */
--space-56: 14rem;   /* 224px */
--space-64: 16rem;   /* 256px */
```

## 🔲 Componentes Base

### Botões
```css
/* Botão Primário */
.btn-primary {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-500));
  color: var(--white);
  padding: var(--space-3) var(--space-6);
  border-radius: 0.5rem;
  font-weight: var(--font-medium);
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.25);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--primary-700), var(--primary-600));
  transform: translateY(-2px);
  box-shadow: 0 8px 25px 0 rgba(59, 130, 246, 0.35);
}

/* Botão Secundário */
.btn-secondary {
  background: transparent;
  color: var(--primary-600);
  border: 2px solid var(--primary-600);
  padding: var(--space-3) var(--space-6);
  border-radius: 0.5rem;
  font-weight: var(--font-medium);
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--primary-600);
  color: var(--white);
  transform: translateY(-2px);
}

/* Botão de Sucesso */
.btn-success {
  background: linear-gradient(135deg, var(--success-600), var(--success-500));
  color: var(--white);
  padding: var(--space-3) var(--space-6);
  border-radius: 0.5rem;
  font-weight: var(--font-medium);
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.25);
}
```

### Cards
```css
.card {
  background: var(--white);
  border-radius: 1rem;
  padding: var(--space-6);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid var(--gray-200);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-service {
  background: linear-gradient(135deg, var(--white), var(--gray-50));
  border-radius: 1rem;
  padding: var(--space-8);
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid var(--gray-200);
}

.card-service:hover {
  background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
  border-color: var(--primary-300);
  transform: translateY(-8px);
}
```

### Formulários
```css
.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: var(--text-base);
  transition: all 0.3s ease;
  background: var(--white);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.form-error {
  color: var(--error);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}
```

## 🎭 Animações

### Transições Base
```css
/* Durações */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 750ms;

/* Easing Functions */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Animações Keyframes
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes countUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

## 📱 Breakpoints Responsivos

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Tablets pequenos */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Telas grandes */

/* Media Queries */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

## 🔍 Estados de Componentes

### Estados Interativos
```css
/* Hover States */
.interactive:hover {
  transform: translateY(-2px);
  transition: transform var(--duration-normal) var(--ease-out);
}

/* Focus States */
.focusable:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Active States */
.clickable:active {
  transform: translateY(0);
  transition: transform var(--duration-fast) var(--ease-in);
}

/* Disabled States */
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

### Loading States
```css
.loading {
  position: relative;
  overflow: hidden;
}

.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

## 🎯 Componentes Específicos

### Hero Section
```css
.hero {
  background: linear-gradient(
    135deg,
    var(--primary-900) 0%,
    var(--primary-700) 50%,
    var(--primary-500) 100%
  );
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/patterns/grid.svg') repeat;
  opacity: 0.1;
}
```

### Seção de Estatísticas
```css
.stats-counter {
  font-family: var(--font-secondary);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--primary-600);
  animation: countUp var(--duration-slow) var(--ease-out);
}
```

### Timeline
```css
.timeline-item {
  position: relative;
  padding-left: var(--space-8);
  margin-bottom: var(--space-8);
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: var(--primary-200);
}

.timeline-item::after {
  content: '';
  position: absolute;
  left: -6px;
  top: 0;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--primary-500);
}
```

---

*Este design system serve como base para manter consistência visual em todo o projeto.*