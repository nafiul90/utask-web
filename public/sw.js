self.addEventListener("push", function (event) {
  console.log("Push received!");
  if (!event.data) return;

  const data = JSON.parse(event.data.text());

  console.log("data", data);
  const options = {
    body: data.message || "A new notification",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: {
      url: data.taskId ? `/tasks/${data.taskId}` : "/dashboard",
    },
  };

  // send message to open tabs
  self.clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "NEW_NOTIFICATION",
          payload: data,
        });
      });
    });

  event.waitUntil(self.registration.showNotification("notification", options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const url = event.notification.data.url;

  event.waitUntil(clients.openWindow(url));
});
