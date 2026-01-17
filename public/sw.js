self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "RememberWhen";
  const options = {
    body: data.body || "You have a new reminder.",
    icon: "icon.png",
    badge: "icon.png",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
