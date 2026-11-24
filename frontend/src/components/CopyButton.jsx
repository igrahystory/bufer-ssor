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
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shadow-warm-xs ${
        copied
          ? 'bg-neutral-100 dark:bg-espresso-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-espresso-600'
          : 'bg-white hover:bg-neutral-50 dark:bg-espresso-850 dark:hover:bg-espresso-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-espresso-700'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check size={13} className="text-neutral-900 dark:text-neutral-100" />
          <span>Скопировано!</span>
        </>
      ) : (
        <>
          <Copy size={13} className="text-neutral-600 dark:text-neutral-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
