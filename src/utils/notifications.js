// Real OS-level notifications, using the service worker vite-plugin-pwa
// already registers for you (see registerSW.js in the build output).
//
// Honest caveat: this fires from the client, so it only works while the
// app/tab is still alive in the background (not fully force-quit). True
// "closed app, anytime" push needs a small server with VAPID keys sending
// through the Push API — this covers the common case (she's on her phone,
// app's backgrounded or another tab's open) without needing a backend.

export const isNotificationSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;

export const getNotificationPermission = () =>
  isNotificationSupported() ? Notification.permission : 'unsupported';

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
};

/**
 * Fire a real notification via the active service worker.
 * Silently no-ops if unsupported / not permitted — never throws,
 * never blocks the in-app message bubble.
 */
export const pushNotification = async (title, body, { tag, icon = './icon-192.png' } = {}) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon,
      badge: icon,
      tag: tag || 'nini-message',
      renotify: true,
      vibrate: [80, 40, 80],
    });
    return true;
  } catch {
    return false;
  }
};
