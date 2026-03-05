// Service Worker for Web Push Notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      { action: 'open-task', title: 'Open Task' }
    ]
  };
  event.waitUntil(self.registration.showNotification(data.title || 'uTask', options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/tasks';
  event.waitUntil(clients.openWindow(url));
});
