'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/components/analytics/Analytics';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Função para obter rating baseado nos thresholds do Core Web Vitals
const getVitalRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  switch (name) {
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    default:
      return 'good';
  }
};

// Função para enviar métricas para analytics
const sendToAnalytics = (vital: WebVital) => {
  trackEvent({
    action: vital.name,
    category: 'Web Vitals',
    label: vital.rating,
    value: Math.round(vital.value),
  });
};

// Hook para monitorar Web Vitals
export function useWebVitals() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Função para capturar métricas usando PerformanceObserver
    const observePerformance = () => {
      // First Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const paintObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.name === 'first-contentful-paint') {
                const vital: WebVital = {
                  name: 'FCP',
                  value: entry.startTime,
                  rating: getVitalRating('FCP', entry.startTime),
                };
                setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
                sendToAnalytics(vital);
              }
            });
          });
          paintObserver.observe({ entryTypes: ['paint'] });
        } catch (e) {
          console.warn('Paint observer not supported');
        }

        // Largest Contentful Paint
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              const vital: WebVital = {
                name: 'LCP',
                value: lastEntry.startTime,
                rating: getVitalRating('LCP', lastEntry.startTime),
              };
              setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
              sendToAnalytics(vital);
            }
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('LCP observer not supported');
        }

        // First Input Delay
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              const vital: WebVital = {
                name: 'FID',
                value: entry.processingStart - entry.startTime,
                rating: getVitalRating('FID', entry.processingStart - entry.startTime),
              };
              setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
              sendToAnalytics(vital);
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.warn('FID observer not supported');
        }

        // Cumulative Layout Shift
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            const vital: WebVital = {
              name: 'CLS',
              value: clsValue,
              rating: getVitalRating('CLS', clsValue),
            };
            setMetrics(prev => ({ ...prev, cls: clsValue }));
            sendToAnalytics(vital);
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('CLS observer not supported');
        }
      }

      // Time to First Byte usando Navigation Timing
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart;
          const vital: WebVital = {
            name: 'TTFB',
            value: ttfb,
            rating: getVitalRating('TTFB', ttfb),
          };
          setMetrics(prev => ({ ...prev, ttfb }));
          sendToAnalytics(vital);
        }
      }
    };

    // Aguardar o carregamento completo da página
    if (document.readyState === 'complete') {
      observePerformance();
    } else {
      window.addEventListener('load', observePerformance);
    }

    return () => {
      window.removeEventListener('load', observePerformance);
    };
  }, []);

  return metrics;
}

// Componente para monitorar performance (apenas em desenvolvimento)
export function PerformanceMonitor() {
  const metrics = useWebVitals();
  const [showMetrics, setShowMetrics] = useState(false);

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Botão para toggle das métricas */}
      <button
        onClick={() => setShowMetrics(!showMetrics)}
        className="fixed bottom-20 left-4 z-50 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-mono shadow-lg hover:bg-blue-700 transition-colors"
        title="Toggle Performance Metrics"
      >
        📊 Perf
      </button>

      {/* Painel de métricas */}
      {showMetrics && (
        <div className="fixed bottom-32 left-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs font-mono shadow-xl max-w-xs">
          <h3 className="font-bold mb-2 text-yellow-400">Web Vitals</h3>
          <div className="space-y-1">
            {metrics.fcp && (
              <div className={`flex justify-between ${
                getVitalRating('FCP', metrics.fcp) === 'good' ? 'text-green-400' :
                getVitalRating('FCP', metrics.fcp) === 'needs-improvement' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                <span>FCP:</span>
                <span>{Math.round(metrics.fcp)}ms</span>
              </div>
            )}
            {metrics.lcp && (
              <div className={`flex justify-between ${
                getVitalRating('LCP', metrics.lcp) === 'good' ? 'text-green-400' :
                getVitalRating('LCP', metrics.lcp) === 'needs-improvement' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                <span>LCP:</span>
                <span>{Math.round(metrics.lcp)}ms</span>
              </div>
            )}
            {metrics.fid && (
              <div className={`flex justify-between ${
                getVitalRating('FID', metrics.fid) === 'good' ? 'text-green-400' :
                getVitalRating('FID', metrics.fid) === 'needs-improvement' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                <span>FID:</span>
                <span>{Math.round(metrics.fid)}ms</span>
              </div>
            )}
            {metrics.cls !== undefined && (
              <div className={`flex justify-between ${
                getVitalRating('CLS', metrics.cls) === 'good' ? 'text-green-400' :
                getVitalRating('CLS', metrics.cls) === 'needs-improvement' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                <span>CLS:</span>
                <span>{metrics.cls.toFixed(3)}</span>
              </div>
            )}
            {metrics.ttfb && (
              <div className={`flex justify-between ${
                getVitalRating('TTFB', metrics.ttfb) === 'good' ? 'text-green-400' :
                getVitalRating('TTFB', metrics.ttfb) === 'needs-improvement' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                <span>TTFB:</span>
                <span>{Math.round(metrics.ttfb)}ms</span>
              </div>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
            <div>🟢 Good | 🟡 Needs Improvement | 🔴 Poor</div>
          </div>
        </div>
      )}
    </>
  );
}