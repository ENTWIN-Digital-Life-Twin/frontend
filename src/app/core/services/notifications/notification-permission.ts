import { PushNotifications } from '@capacitor/push-notifications';
import { isNativeApp } from '../../platform';

/** Shows the Android notification permission dialog on the first launch. */
export async function requestNotificationPermission(): Promise<void> {
  if (!isNativeApp()) {
    return;
  }
  const current = await PushNotifications.checkPermissions();
  if (current.receive === 'granted') {
    await PushNotifications.register();
    return;
  }
  const result = await PushNotifications.requestPermissions();
  if (result.receive === 'granted') {
    await PushNotifications.register();
  }
}
