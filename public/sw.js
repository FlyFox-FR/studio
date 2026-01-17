// This file is intentionally left blank. 
// It's needed to register the service worker for push notifications.

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  
  const pushData = event.data ? event.data.json() : {};

  const title = pushData.title || 'RememberWhen';
  const options = {
    body: pushData.body || 'Dies ist eine Test-Benachrichtigung.',
    icon: 'icon.png',
    badge: 'icon.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});
