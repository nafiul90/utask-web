export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) return null;

  const registration = await navigator.serviceWorker.register("/sw.js");

  return registration;
};

export const subscribeUserToPush = async (token: string) => {
  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });
    console.log("New push subscription created");
  } else {
    console.log("Existing subscription found");
  }

  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ subscription }),
  });
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
