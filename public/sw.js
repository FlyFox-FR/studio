self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: "RememberWhen", body: "You have a new notification." };
  const title = data.title;
  const options = {
    body: data.body,
    // icon: 'icon.png', // You can add an icon here
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
