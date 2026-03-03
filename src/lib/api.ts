const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.task.urelaa.com/api";

async function request<T = any>(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || "Request failed");
  }
  return data as T;
}

export const Api = {
  request,
  signup: (payload: Record<string, unknown>) =>
    request<{ token: string; user: any }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: Record<string, unknown>) =>
    request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listUsers: (token: string) =>
    request("/users", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getUser: (token: string, id: string) =>
    request(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateUser: (token: string, id: string, payload: Record<string, unknown>) =>
    request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),
  uploadProfileImage: async (token: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/uploads/profile`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Upload failed");
    }
    return data as { path: string };
  },
  uploadFile: async (token: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/uploads/file`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Upload failed");
    }
    return data as {
      path: string;
      filename: string;
      mimeType: string;
      size: number;
      originalName: string;
    };
  },
  listTasks: (token: string) => {
    // Original listTasks might need to be adjusted to accept query params too, for consistency
    // For now, it's used without them.
    return request("/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  getTask: (token: string, id: string) =>
    request(`/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  createTask: (token: string, payload: Record<string, unknown>) =>
    request("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateTask: (token: string, id: string, payload: Record<string, unknown>) =>
    request(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateTaskStatus: (token: string, id: string, status: string) =>
    request(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      headers: { Authorization: `Bearer ${token}` },
    }),
  deleteTask: (token: string, id: string) =>
    request(`/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  getTaskStats: (token: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const queryString = params.toString();
    return request(`/task-stats${queryString ? "?" + queryString : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  reorderTasks: (
    token: string,
    updates: Array<{ taskId: string; position: number; status: string }>,
  ) =>
    request("/tasks/reorder", {
      method: "PATCH",
      body: JSON.stringify({ updates }),
      headers: { Authorization: `Bearer ${token}` },
    }),
  addComment: (token: string, taskId: string, content: string) =>
    request(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateComment: (
    token: string,
    taskId: string,
    commentId: string,
    content: string,
  ) =>
    request(`/tasks/${taskId}/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
      headers: { Authorization: `Bearer ${token}` },
    }),
  deleteComment: (token: string, taskId: string, commentId: string) =>
    request(`/tasks/${taskId}/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  replyToComment: (
    token: string,
    taskId: string,
    commentId: string,
    content: string,
  ) =>
    request(`/tasks/${taskId}/comments/${commentId}/replies`, {
      method: "POST",
      body: JSON.stringify({ content }),
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateReply: (
    token: string,
    taskId: string,
    commentId: string,
    replyId: string,
    content: string,
  ) =>
    request(`/tasks/${taskId}/comments/${commentId}/replies/${replyId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
      headers: { Authorization: `Bearer ${token}` },
    }),
  deleteReply: (
    token: string,
    taskId: string,
    commentId: string,
    replyId: string,
  ) =>
    request(`/tasks/${taskId}/comments/${commentId}/replies/${replyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  // Notification APIs
  getNotifications: (
    token: string,
    limit?: number,
    skip?: number,
    unreadOnly?: boolean,
  ) => {
    const params = new URLSearchParams();
    if (limit) params.set("limit", limit.toString());
    if (skip) params.set("skip", skip.toString());
    if (unreadOnly) params.set("unreadOnly", unreadOnly.toString());
    const queryString = params.toString();
    return request(`/notifications${queryString ? "?" + queryString : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  getNotificationStats: (token: string) =>
    request("/notifications/stats", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  markNotificationAsRead: (token: string, notificationId: string) =>
    request(`/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }),
  markAllNotificationsAsRead: (token: string) =>
    request("/notifications/read-all", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }),
  deleteNotification: (token: string, notificationId: string) =>
    request(`/notifications/${notificationId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};
