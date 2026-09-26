const DEVICE_ID_KEY = 'entwin.deviceId';
const NEW_DEVICE_FLAG = 'entwin.newDevice';
const NEW_DEVICE_LABEL = 'entwin.deviceLabel';

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function getDeviceLabel(): string {
  try {
    return navigator.userAgent.slice(0, 180);
  } catch {
    return 'Unknown device';
  }
}

export function deviceHeaders(): { [header: string]: string } {
  return {
    'X-Device-Id': getDeviceId(),
    'X-Device-Label': getDeviceLabel(),
  };
}

export function captureNewDeviceFlag(isNew: boolean | undefined): void {
  if (!isNew) {
    return;
  }
  try {
    sessionStorage.setItem(NEW_DEVICE_FLAG, '1');
    sessionStorage.setItem(NEW_DEVICE_LABEL, getDeviceLabel());
  } catch {
    /* private mode */
  }
}

export function consumeNewDeviceLabel(): string | null {
  try {
    if (sessionStorage.getItem(NEW_DEVICE_FLAG) !== '1') {
      return null;
    }
    const label = sessionStorage.getItem(NEW_DEVICE_LABEL) || 'Unknown device';
    sessionStorage.removeItem(NEW_DEVICE_FLAG);
    sessionStorage.removeItem(NEW_DEVICE_LABEL);
    return label;
  } catch {
    return null;
  }
}
