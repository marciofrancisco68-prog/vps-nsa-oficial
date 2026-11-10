/**
 * vpsNsA Sovereign Platform - GitHub Webhook Logs Mock Service
 * 
 * Provides:
 * 1. `getWebhookLogs(repoId: string)`: Returns exactly 10 entries with fields `id`, `deliveryTime`, and `status` ('success' or 'fail').
 * 2. Helper `simulateRealTimeDeliveryStatus`: Simulates real-time delivery events and live status updates.
 */

export type WebhookStatus = 'success' | 'fail';

export type WebhookEventType = 
  | 'push' 
  | 'pull_request' 
  | 'release' 
  | 'deployment_status' 
  | 'workflow_run' 
  | 'ping';

export interface WebhookLog {
  /** Unique delivery event identifier */
  id: string;
  /** Precise delivery timestamp */
  deliveryTime: string;
  /** Delivery status ('success' or 'fail') */
  status: WebhookStatus;

  /** Extended fields for rich dashboard inspection & zero-leak telemetry */
  eventId?: string;
  event?: WebhookEventType;
  statusCode?: number;
  statusText?: string;
  durationMs?: number;
  branch?: string;
  commitSha?: string;
  commitMessage?: string;
  sender?: string;
  headers?: Record<string, string>;
  responsePayload?: Record<string, any>;
  relativeTime?: string;
  deliveryId?: string;
}

// In-memory cache to maintain live status mutations per repository during session
const repositoryLogsStore = new Map<string, WebhookLog[]>();

/**
 * Base template generator for 10 realistic deliveries for any repoId.
 */
function generateInitialEntries(repoId: string): WebhookLog[] {
  const cleanId = repoId.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

  const presets: Array<{
    event: WebhookEventType;
    status: WebhookStatus;
    statusCode: number;
    statusText: string;
    msg: string;
    branch: string;
    duration: number;
    minutesAgo: number;
    sender: string;
  }> = [
    {
      event: 'push',
      status: 'success',
      statusCode: 200,
      statusText: '200 OK',
      msg: 'Harden Argon2id auth middleware & Mercado Pago webhook verify',
      branch: 'main',
      duration: 142,
      minutesAgo: 2,
      sender: 'VPSNsA-Bot',
    },
    {
      event: 'deployment_status',
      status: 'success',
      statusCode: 200,
      statusText: '200 OK',
      msg: 'Optimize memory tensor engine for NVIDIA GH200 Sovereign Node',
      branch: 'main',
      duration: 98,
      minutesAgo: 34,
      sender: 'VPSNsA-Bot',
    },
    {
      event: 'push',
      status: 'fail',
      statusCode: 504,
      statusText: '504 Gateway Timeout',
      msg: 'Stress testing high concurrency edge cache under 50k req/sec',
      branch: 'staging',
      duration: 10005,
      minutesAgo: 105,
      sender: 'devops-lead',
    },
    {
      event: 'pull_request',
      status: 'success',
      statusCode: 200,
      statusText: '200 OK',
      msg: 'Merge PR #14: Automated invoice generation & PIX QR engine',
      branch: 'feat/mercado-pago-pix',
      duration: 112,
      minutesAgo: 180,
      sender: 'marcio_francisco',
    },
    {
      event: 'push',
      status: 'success',
      statusCode: 200,
      statusText: '200 OK',
      msg: 'Update Cloudflare CDN Edge Cache rules & Brotli compression',
      branch: 'main',
      duration: 124,
      minutesAgo: 300,
      sender: 'VPSNsA-Bot',
    },
    {
      event: 'workflow_run',
      status: 'success',
      statusCode: 200,
      statusText: '200 OK',
      msg: 'CI: Unit tests & Argon2id memory verification suites',
      branch: 'main',
      duration: 185,
      minutesAgo: 430,
      sender: 'github-actions[bot]',
    },
    {
      event: 'push',
      status: 'fail',
      statusCode: 400,
      statusText: '400 Bad Request',
      msg: 'Draft experimental API endpoint with invalid HMAC signature',
      branch: 'dev',
      duration: 45,
      minutesAgo: 660,
      sender: 'external-contributor',
    },
    {
      event: 'release',
      status: 'success',
      statusCode: 201,
      statusText: '201 Created',
      msg: 'Release v2.4.0: Hyperscale Sovereign Cluster zero-downtime',
      branch: 'main',
      duration: 230,
      minutesAgo: 840,
      sender: 'marcio_francisco',
    },
    {
      event: 'push',
      status: 'success',
      statusCode: 200,
      statusText: '200 OK',
      msg: 'Update MariaDB & PostgreSQL connection pool limits',
      branch: 'main',
      duration: 135,
      minutesAgo: 1080,
      sender: 'VPSNsA-Bot',
    },
    {
      event: 'push',
      status: 'success',
      statusCode: 200,
      statusText: '200 OK',
      msg: "Initialize Let's Encrypt Wildcard TLS 1.3 automated pipeline",
      branch: 'main',
      duration: 140,
      minutesAgo: 1320,
      sender: 'VPSNsA-Bot',
    },
  ];

  return presets.map((preset, index) => {
    const id = `evt_${cleanId}_${String(index + 1).padStart(2, '0')}`;
    const deliveryUuid = `del_${cleanId}_${(1000 + index).toString(16)}-9c02-${Date.now().toString(16).slice(-8)}`;
    const eventDate = new Date(Date.now() - preset.minutesAgo * 60000);
    const deliveryTime = eventDate.toLocaleString('pt-BR', {
      timeZone: 'UTC',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' UTC';

    return {
      id,
      eventId: id,
      deliveryId: deliveryUuid,
      deliveryTime,
      status: preset.status,
      event: preset.event,
      statusCode: preset.statusCode,
      statusText: preset.statusText,
      durationMs: preset.duration,
      branch: preset.branch,
      commitSha: Math.random().toString(36).substring(2, 9),
      commitMessage: preset.msg,
      sender: preset.sender,
      relativeTime: `Há ${preset.minutesAgo >= 60 ? Math.floor(preset.minutesAgo / 60) + 'h' : preset.minutesAgo + ' min'}`,
      headers: {
        'content-type': 'application/json',
        'user-agent': 'GitHub-Hookshot/vpsnsa-enterprise',
        'x-github-delivery': deliveryUuid,
        'x-github-event': preset.event,
        'x-hub-signature-256': `sha256=${Math.random().toString(36).substring(2, 18)}...`,
      },
      responsePayload: preset.status === 'success'
        ? {
            status: 'accepted',
            cluster: 'vpsnsa-sp01',
            argon2idVerified: true,
            latencyMs: preset.duration,
          }
        : {
            error: preset.statusCode === 504 
              ? 'Gateway timeout after 10000ms. Node failover triggered.' 
              : 'HMAC signature invalid. Request rejected.',
          },
    };
  });
}

/**
 * Returns exactly 10 webhook delivery log entries with fields:
 * - `id`: string
 * - `deliveryTime`: string
 * - `status`: 'success' | 'fail'
 * 
 * @param repoId The repository identifier (e.g., 'vpsnsa/ecommerce-enterprise')
 */
export function getWebhookLogs(repoId: string): WebhookLog[] {
  const normalizedKey = (repoId || '').toLowerCase().trim();
  if (!repositoryLogsStore.has(normalizedKey)) {
    repositoryLogsStore.set(normalizedKey, generateInitialEntries(normalizedKey));
  }
  return [...repositoryLogsStore.get(normalizedKey)!];
}

/**
 * Helper to simulate real-time delivery status for these events.
 * 
 * Sets up an active timer that periodically simulates a live delivery status transition
 * (e.g. retrying a failed delivery to 'success', or receiving a fresh incoming GitHub webhook delivery).
 * Returns an unsubscribe/cleanup function.
 * 
 * @param repoId Repository ID to simulate
 * @param onUpdate Callback fired whenever a delivery status is updated or a new event arrives
 * @param intervalMs Frequency of simulated live status updates in milliseconds (default: 4500ms)
 */
export function simulateRealTimeDeliveryStatus(
  repoId: string,
  onUpdate: (updatedLogs: WebhookLog[], latestChanged: WebhookLog) => void,
  intervalMs = 4500
): () => void {
  // Ensure logs are initialized
  const currentLogs = getWebhookLogs(repoId);

  const timer = setInterval(() => {
    const logs = getWebhookLogs(repoId);
    const now = new Date();
    const formattedNow = now.toLocaleString('pt-BR', {
      timeZone: 'UTC',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' UTC';

    // 50% chance: Heal a previously failed delivery to 'success' (simulating automated retry)
    const failedItemIndex = logs.findIndex((l) => l.status === 'fail');
    if (failedItemIndex !== -1 && Math.random() > 0.4) {
      const target = logs[failedItemIndex];
      const updatedItem: WebhookLog = {
        ...target,
        status: 'success',
        statusCode: 200,
        statusText: '200 OK (Retry Live)',
        deliveryTime: formattedNow,
        relativeTime: 'Agora mesmo (Auto-Retry)',
        durationMs: 90 + Math.floor(Math.random() * 40),
        responsePayload: {
          ...target.responsePayload,
          autoRetrySuccess: true,
          recoveredAt: now.toISOString(),
        },
      };
      logs[failedItemIndex] = updatedItem;
      repositoryLogsStore.set(repoId, [...logs]);
      onUpdate([...logs], updatedItem);
      return;
    }

    // Otherwise: Simulate an incoming real-time delivery (push, ping, or workflow_run)
    const isNewSuccess = Math.random() > 0.15; // 85% success rate
    const newId = `evt_live_${Date.now().toString(36)}`;
    const newEntry: WebhookLog = {
      id: newId,
      eventId: newId,
      deliveryId: `del_live_${Math.random().toString(36).substring(2, 10)}`,
      deliveryTime: formattedNow,
      status: isNewSuccess ? 'success' : 'fail',
      event: Math.random() > 0.5 ? 'push' : 'deployment_status',
      statusCode: isNewSuccess ? 200 : 504,
      statusText: isNewSuccess ? '200 OK (Live Delivered)' : '504 Gateway Timeout (Live)',
      durationMs: isNewSuccess ? 80 + Math.floor(Math.random() * 60) : 10000,
      branch: 'main',
      commitSha: Math.random().toString(36).substring(2, 9),
      commitMessage: isNewSuccess 
        ? 'Live event: Container health probe & traffic routing' 
        : 'Live event: Edge heartbeat timeout detected',
      sender: 'VPSNsA-Bot',
      relativeTime: 'Agora mesmo (Live)',
      headers: {
        'content-type': 'application/json',
        'x-github-event': 'push',
        'x-github-delivery': `live-${Date.now()}`,
        'x-hub-signature-256': `sha256=${Math.random().toString(36).substring(2, 20)}...`,
      },
      responsePayload: isNewSuccess 
        ? { liveDelivered: true, status: '200_OK_DELIVERED' } 
        : { error: 'Live delivery failed' },
    };

    // Maintain exactly 10 entries in the log list
    const updatedList = [newEntry, ...logs.slice(0, 9)];
    repositoryLogsStore.set(repoId, updatedList);
    onUpdate(updatedList, newEntry);
  }, intervalMs);

  return () => clearInterval(timer);
}

/**
 * Helper to manually trigger an immediate re-delivery or status flip for a specific event
 */
export function redeliverWebhook(repoId: string, logId: string): WebhookLog {
  const logs = getWebhookLogs(repoId);
  const index = logs.findIndex((l) => l.id === logId || l.eventId === logId);
  const now = new Date();
  const formattedNow = now.toLocaleString('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + ' UTC';

  if (index !== -1) {
    const updated: WebhookLog = {
      ...logs[index],
      status: 'success',
      statusCode: 200,
      statusText: '200 OK (Redelivered)',
      deliveryTime: formattedNow,
      relativeTime: 'Agora mesmo (Reenviado)',
      durationMs: 85 + Math.floor(Math.random() * 30),
      responsePayload: {
        ...logs[index].responsePayload,
        redelivered: true,
        redeliveredAt: now.toISOString(),
      },
    };
    logs[index] = updated;
    repositoryLogsStore.set(repoId, [...logs]);
    return updated;
  }

  return logs[0];
}

/**
 * Helper to dispatch a simulated GitHub Ping event
 */
export function sendTestPing(repoId: string): WebhookLog {
  const logs = getWebhookLogs(repoId);
  const now = new Date();
  const formattedNow = now.toLocaleString('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + ' UTC';

  const newPing: WebhookLog = {
    id: `evt_ping_${Date.now()}`,
    eventId: `evt_ping_${Date.now()}`,
    deliveryId: `del_ping_${Math.random().toString(36).substring(2, 10)}`,
    deliveryTime: formattedNow,
    status: 'success',
    event: 'ping',
    statusCode: 200,
    statusText: '200 OK (Ping Test)',
    durationMs: 78,
    branch: 'main',
    commitSha: 'ping-ok',
    commitMessage: '⚡ Webhook Ping Test from vpsNsA Sovereign Dashboard',
    sender: 'vpsnsa-admin (Marcito Root)',
    relativeTime: 'Agora mesmo',
    headers: {
      'content-type': 'application/json',
      'x-github-event': 'ping',
      'x-github-delivery': `ping-${Date.now()}`,
      'x-hub-signature-256': `sha256=${Math.random().toString(36).substring(2, 22)}...`,
    },
    responsePayload: {
      zen: 'Approachable is better than simple.',
      hook_id: 489201,
      status: 'active',
      clusterLatency: '0.78ms',
      securityLevel: 'Argon2id + Let\'s Encrypt TLS 1.3',
    },
  };

  const updatedList = [newPing, ...logs.slice(0, 9)];
  repositoryLogsStore.set(repoId, updatedList);
  return newPing;
}

/**
 * Default export containing all webhook logs capabilities
 */
export const webhookLogsService = {
  getWebhookLogs,
  simulateRealTimeDeliveryStatus,
  redeliverWebhook,
  sendTestPing,
};

export default webhookLogsService;
