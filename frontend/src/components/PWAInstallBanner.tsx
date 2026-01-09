'use client';

import { useEffect, useState } from 'react';

const DISMISS_KEY = 'pwa-ios-banner-dismissed';

const isIOSDevice = () => {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return isIOS || isIPadOS;
};

const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
};

export default function PWAInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isIOSDevice() || isStandalone()) return;
    if (window.localStorage.getItem(DISMISS_KEY) === '1') return;

    setVisible(true);

    const handleInstalled = () => setVisible(false);
    window.addEventListener('appinstalled', handleInstalled);
    return () => window.removeEventListener('appinstalled', handleInstalled);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setModalOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, '1');
    }
  };

  if (!visible && !modalOpen) return null;

  return (
    <>
      {visible && (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 shadow">
            <div className="text-sm leading-snug">
              Install this app: tap Share, then "Add to Home Screen".
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="ml-auto text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950"
            >
              How to install
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-semibold text-amber-900/70 hover:text-amber-900"
              aria-label="Dismiss install banner"
            >
              x
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Install app on iOS"
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Install on iPhone or iPad</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                aria-label="Close install instructions"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-700">
              1. Tap the Share icon in Safari. 2. Choose "Add to Home Screen".
            </p>
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <img
                src="/pwa-ios-install.svg"
                alt="Safari Share menu with Add to Home Screen highlighted"
                className="h-auto w-full"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
