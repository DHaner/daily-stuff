import { storage, StorageKeys } from '@/lib/storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Reminders are stored as local `yyyy-MM-dd'T'HH:mm`, which `new Date()` reads as local time. */
function parseReminder(reminderAt: string) {
  return new Date(reminderAt);
}

async function ensurePermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return true;
  }

  return (await Notifications.requestPermissionsAsync()).granted;
}

/**
 * Schedules a local notification for a future reminder and returns its id, or `null` when
 * there is nothing to schedule (no reminder, already past, no permission, or web).
 */
export async function scheduleTaskReminder(title: string, reminderAt: string | null) {
  if (!reminderAt || Platform.OS === 'web') {
    return null;
  }

  const date = parseReminder(reminderAt);

  if (date.getTime() <= Date.now()) {
    return null;
  }

  try {
    if (!(await ensurePermission())) {
      return null;
    }

    return await Notifications.scheduleNotificationAsync({
      content: { title: 'Recordatorio', body: title },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
    });
  } catch {
    return null;
  }
}

export async function cancelTaskReminder(notificationId: string | null) {
  if (!notificationId || Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // The notification already fired or was cleared; nothing to cancel.
  }
}

/**
 * Notifications are scheduled by the device, so their ids are stored here rather than on the
 * server: task id -> notification id.
 */
export async function getNotificationIds(): Promise<Record<string, string>> {
  try {
    const raw = await storage.getItem(StorageKeys.reminderIds);

    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export async function setNotificationId(taskId: string, notificationId: string | null) {
  const ids = await getNotificationIds();

  if (notificationId) {
    ids[taskId] = notificationId;
  } else {
    delete ids[taskId];
  }

  await storage.setItem(StorageKeys.reminderIds, JSON.stringify(ids));
}
