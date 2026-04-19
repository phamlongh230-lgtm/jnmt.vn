/** Request notification permission and return whether granted */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function canNotify(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

/** Show a local notification via service worker (works when tab is open) */
export async function showNotification(title: string, body: string, tag?: string) {
  if (!canNotify()) return;
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: tag || "jnmt",
    });
  } else {
    new Notification(title, { body, icon: "/favicon.svg" });
  }
}

/** Check D-Day items and fire notifications for today/tomorrow events */
export async function checkDdayNotifications() {
  if (!canNotify()) return;
  try {
    const items: { name: string; date: string; notify?: boolean }[] =
      JSON.parse(localStorage.getItem("jnmt_ddays") || "[]");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of items) {
      if (!item.notify) continue;
      const target = new Date(item.date);
      target.setHours(0, 0, 0, 0);
      const diff = Math.round((target.getTime() - today.getTime()) / 86400000);

      if (diff === 0) {
        await showNotification("📅 Hôm nay!", `${item.name} là hôm nay!`, `dday-${item.date}`);
      } else if (diff === 1) {
        await showNotification("⏰ Ngày mai!", `${item.name} — còn 1 ngày nữa`, `dday-${item.date}`);
      } else if (diff === 3) {
        await showNotification("📌 Sắp đến!", `${item.name} — còn 3 ngày`, `dday-${item.date}`);
      } else if (diff === 7) {
        await showNotification("🗓️ Nhắc nhở", `${item.name} — còn 1 tuần`, `dday-${item.date}`);
      }
    }
  } catch { /* */ }
}

/** Check Notes deadlines and notify for overdue/today items */
export async function checkNotesNotifications() {
  if (!canNotify()) return;
  try {
    const notes: { title: string; dueDate?: string; done?: boolean; priority?: string }[] =
      JSON.parse(localStorage.getItem("jnmt_notes") || "[]");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const urgent = notes.filter(n => {
      if (n.done || !n.dueDate) return false;
      const due = new Date(n.dueDate);
      due.setHours(0, 0, 0, 0);
      const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
      return diff <= 0;
    });

    if (urgent.length > 0) {
      await showNotification(
        "📚 Bài tập quá hạn!",
        urgent.length === 1
          ? `"${urgent[0].title}" đã quá hạn`
          : `${urgent.length} bài tập đã quá hạn`,
        "notes-overdue"
      );
    }
  } catch { /* */ }
}
