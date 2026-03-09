"use client";
import { useEffect } from "react";
import {
  registerServiceWorker,
  subscribeUserToPush,
} from "@/lib/pushNotifications";
import { useAuth } from "@/context/AuthContext";

export const PushNotificationInitializer = () => {
  const { token } = useAuth();

  useEffect(() => {
    const initPush = async () => {
      if (!token) return;

      try {
        await registerServiceWorker();

        await subscribeUserToPush(token);
      } catch (error) {
        console.error("Push subscription failed:", error);
      }
    };

    initPush();
  }, [token]);

  return null;
};
