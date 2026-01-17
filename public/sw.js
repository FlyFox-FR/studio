// This is the service worker file for handling push notifications.

// Listen for push events
self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.');
  
  // Default text if the push message is empty
  const notificationText = event.data ? event.data.text() : 'Standard-Benachrichtigungstext.';

  const title = 'RememberWhen';
  const options = {
    body: notificationText,
    icon: 'icon.png', // This icon should be in the /public folder
    badge: 'icon.png' // This icon should be in the /public folder
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Listen for notification click events
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  // Close the notification
  event.notification.close();

  // Open the app or focus the existing window
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
