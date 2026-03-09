self.addEventListener("push", function (event) {
  console.log("Push received!");
  if (!event.data) return;

  const data = JSON.parse(event.data.text());

  console.log("data", data);
  const options = {
    body: data.message || "A new notification",
    icon: "/notification.png",
    // badge: "/notification.png",
    data: {
      url: data.taskId ? `/tasks/${data.taskId}` : "/dashboard",
    },
  };

  try {
    event.waitUntil(
      self.registration.showNotification("notification", options),
    );
  } catch (err) {
    console.log("error -> ", err);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const url = event.notification.data.url;

  event.waitUntil(clients.openWindow(url));
});
