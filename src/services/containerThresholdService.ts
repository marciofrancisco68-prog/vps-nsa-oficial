import { ContainerResourceThreshold, ContainerThresholdAlert } from '../types';

const STORAGE_KEY_THRESHOLDS = 'vpsnsa_container_thresholds';
const STORAGE_KEY_ALERTS = 'vpsnsa_container_threshold_alerts';

export function getStoredThresholds(): Record<string, ContainerResourceThreshold> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THRESHOLDS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getContainerThreshold(containerId: string, defaultName: string): ContainerResourceThreshold {
  const all = getStoredThresholds();
  return (
    all[containerId] || {
      containerId,
      containerName: defaultName,
      memoryThreshold: 80,
      cpuThreshold: 75,
      enabled: true,
    }
  );
}

export function saveContainerThreshold(threshold: ContainerResourceThreshold): void {
  try {
    const all = getStoredThresholds();
    all[threshold.containerId] = threshold;
    localStorage.setItem(STORAGE_KEY_THRESHOLDS, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('vpsnsa-threshold-update', { detail: threshold }));
  } catch (err) {
    console.error('Erro ao salvar limiar de container:', err);
  }
}

export function getStoredContainerAlerts(): ContainerThresholdAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function dispatchContainerAlert(alert: ContainerThresholdAlert): void {
  try {
    const current = getStoredContainerAlerts();
    // Evita duplicatas frequentes (janela de 20s para o mesmo container e recurso)
    const isDuplicate = current.some(
      a =>
        a.containerId === alert.containerId &&
        a.resource === alert.resource &&
        Date.now() - new Date(a.timestamp).getTime() < 20000
    );
    if (!isDuplicate) {
      const updated = [alert, ...current].slice(0, 25);
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('vpsnsa-container-alert', { detail: alert }));
    }
  } catch (err) {
    console.error('Erro ao emitir alerta de container:', err);
  }
}

export function dismissContainerAlert(alertId: string): void {
  try {
    const current = getStoredContainerAlerts();
    const updated = current.filter(a => a.id !== alertId);
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vpsnsa-container-alert-cleared', { detail: alertId }));
  } catch (err) {
    console.error('Erro ao descartar alerta:', err);
  }
}

export function clearAllContainerAlerts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ALERTS);
    window.dispatchEvent(new CustomEvent('vpsnsa-container-alert-cleared'));
  } catch (err) {
    console.error('Erro ao limpar alertas:', err);
  }
}
