import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

export default function CopyButton({ text, label = 'Скопировать', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback для старых WebView
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      try {
        WebApp.HapticFeedback?.notificationOccurred('success');
      } catch {}

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy text:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-warm-xs ${
        copied
          ? 'bg-olive-100 dark:bg-olive-950/70 text-olive-800 dark:text-olive-300 border border-olive-300/80 dark:border-olive-800/60'
          : 'bg-warm-100/90 hover:bg-warm-200/80 dark:bg-espresso-850 dark:hover:bg-espresso-800 text-warm-800 dark:text-warm-200 border border-warm-300/70 dark:border-warm-700/50'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check size={13} className="text-olive-600 dark:text-olive-400" />
          <span>Скопировано!</span>
        </>
      ) : (
        <>
          <Copy size={13} className="text-warm-600 dark:text-warm-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
