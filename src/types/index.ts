export interface TelemetryData {
  timestamp: string;
  system: {
    hostname: string;
    os: string;
    uptimeDays: number;
    uptimePercentage: string;
    activeNodes: number;
    totalHostedSites: string;
    datacenterLocation: string;
    networkDDoSProtection: string;
    securityStatus: string;
  };
  cpu: {
    activeModel: string;
    totalCores: number;
    totalThreads: number;
    overallLoadPercent: number;
    clockSpeedGHz: string;
    temperatureCelsius: number;
    loadBreakdown: Array<{ socket: string; usage: number; temp: number }>;
  };
  memory: {
    totalGB: number;
    usedGB: number;
    freeGB: number;
    cachedGB: number;
    type: string;
    usagePercent: number;
  };
  storage: {
    type: string;
    totalTB: number;
    usedTB: number;
    readThroughputMBs: number;
    writeThroughputMBs: number;
    currentIops: number;
  };
  network: {
    throughputInGbps: string;
    throughputOutGbps: string;
    packetPerSecond: string;
    globalLatencyMs: Record<string, string>;
  };
}

export type HealthCheckType = 'HTTP' | 'TCP';
export type HealthCheckStatus = 'healthy' | 'degraded' | 'unhealthy' | 'checking';

export interface HealthCheckHistoryPoint {
  timestamp: string;
  status: HealthCheckStatus;
  latencyMs: number;
  statusCode?: number;
  message: string;
}

export interface HealthCheckProbe {
  id: string;
  containerId: string;
  containerName: string;
  type: HealthCheckType;
  endpoint: string; // e.g. "/api/health" or "8080"
  port: number;
  expectedStatus: number; // e.g. 200
  httpMethod?: 'GET' | 'HEAD';
  intervalSeconds: number; // e.g. 15
  timeoutSeconds: number; // e.g. 3
  healthyThreshold: number; // e.g. 2
  unhealthyThreshold: number; // e.g. 3
  enabled: boolean;
  lastCheckAt?: string;
  lastStatus: HealthCheckStatus;
  lastLatencyMs?: number;
  lastMessage?: string;
  uptimePercentage: number;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  history: HealthCheckHistoryPoint[];
}

export interface ContainerItem {
  id: string;
  name: string;
  domain: string;
  image: string;
  cpuAllocation: string;
  memoryAllocated: string;
  status: 'running' | 'stopped' | 'restarting';
  uptime: string;
  port: number;
  ssl: boolean;
  requestsPerSec: number;
  gitRepo: string;
  branch: string;
  commit: string;
  healthCheck?: {
    id: string;
    type: HealthCheckType;
    status: HealthCheckStatus;
    endpoint: string;
    lastLatencyMs?: number;
    enabled: boolean;
  };
}

export interface K8sPod {
  id: string;
  name: string;
  node: string;
  status: 'Running' | 'Pending' | 'CrashLoopBackOff' | 'Terminating';
  ip: string;
  restarts: number;
  cpuUsage: string;
  memoryUsage: string;
  uptime: string;
}

export interface K8sDeployment {
  id: string;
  name: string;
  namespace: string;
  orchestrator: 'Kubernetes v1.31' | 'Docker Swarm';
  replicas: number;
  availableReplicas: number;
  targetReplicas: number;
  image: string;
  domain: string;
  cpuRequest: string;
  cpuLimit: string;
  memoryRequest: string;
  memoryLimit: string;
  hpaEnabled: boolean;
  hpaMin: number;
  hpaMax: number;
  hpaTargetCpu: number;
  currentCpuPercent: number;
  currentMemoryPercent: number;
  status: 'Healthy' | 'Scaling' | 'Updating' | 'Degraded';
  gitRepo: string;
  gitBranch: string;
  lastCommitSha: string;
  lastDeployedAt: string;
  pods: K8sPod[];
  yamlManifest: string;
}

export interface CiCdPipelineStage {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration: string;
}

export interface CiCdPipelineRun {
  id: string;
  deploymentName: string;
  repo: string;
  branch: string;
  commitSha: string;
  commitMessage: string;
  committer: string;
  status: 'running' | 'success' | 'failed';
  startedAt: string;
  duration: string;
  stages: CiCdPipelineStage[];
  logs: string[];
}

export interface CpuItem {
  id: string;
  brand: string;
  model: string;
  category: string;
  cores: number;
  threads: number;
  clock: string;
  cache: string;
  ramSupport: string;
  tdp: string;
  architecture: string;
  idealFor: string;
  hostingerComparison: string;
  featured: boolean;
}

export interface DomainItem {
  domain: string;
  status: string;
  tld: string;
  registrar: string;
  nameservers: string[];
  sslStatus: string;
  sslExpiry: string;
  dnssec: boolean;
  targetContainer: string;
  dnsRecords: Array<{
    type: string;
    name: string;
    content: string;
    ttl: number;
  }>;
}

export interface DnsResolverCheck {
  id: string;
  name: string;
  provider: 'Google Public DNS' | 'Cloudflare Anycast' | 'Quad9 Secure' | 'OpenDNS' | 'VPSNsA Core Anycast';
  location: string;
  country: string;
  flag: string;
  ip: string;
  recordType: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  status: 'PROPAGATED' | 'PROPAGATING' | 'ERROR';
  resolvedValue: string;
  expectedValue?: string;
  latencyMs: number;
  checkedAt: string;
  isAuthoritativeMatch: boolean;
}

export interface DomainDnsHealthReport {
  domain: string;
  tld: string;
  registrar: string;
  nameservers: string[];
  sslStatus: string;
  dnssec: boolean;
  targetContainer: string;
  overallHealth: 'EXCELLENT' | 'GOOD' | 'PROPAGATING' | 'DEGRADED';
  propagationPercentage: number;
  averageLatencyMs: number;
  lastCheckedAt: string;
  resolverChecks: DnsResolverCheck[];
  recordsSummary: {
    a: { count: number; propagated: boolean; values: string[] };
    cname: { count: number; propagated: boolean; values: string[] };
    mx: { count: number; propagated: boolean; values: string[] };
    txt: { count: number; propagated: boolean; values: string[] };
    ns: { count: number; propagated: boolean; values: string[] };
  };
}

export interface MarketTickerItem {
  currencies: Array<{
    pair: string;
    name: string;
    value: string;
    change: string;
    positive: boolean;
  }>;
  stockExchanges: Array<{
    name: string;
    points: string;
    change: string;
    positive: boolean;
  }>;
  commodities: Array<{
    name: string;
    symbol: string;
    value: string;
    unit: string;
    change: string;
    positive: boolean;
  }>;
}

export interface PaymentTransaction {
  id: string;
  recipient: string;
  account: string;
  amount: number;
  plan: string;
  method: string;
  status: string;
  date: string;
  authArgon2Hash: string;
  brand?: string;
  cardLast4?: string;
  securityScore?: number;
  tokenizedId?: string;
  provisionedHost?: string;
  bankInstitution?: string;
}

export interface IntrusionEvent {
  id: string;
  timestamp: string;
  threatType: 'SQL_INJECTION' | 'XSS_ATTACK' | 'MALFORMED_PAN' | 'BRUTE_FORCE' | 'PAYLOAD_TAMPERING';
  originIp: string;
  blockedPayload: string;
  defenseAction: string;
  severity: 'ALTO' | 'CRÍTICO';
}

export type N8nNodeType =
  | 'webhook'
  | 'mercadopago'
  | 'github'
  | 'postgres'
  | 'supabase'
  | 'k8s_scale'
  | 'telegram'
  | 'discord'
  | 'ai_gemini'
  | 'argon2'
  | 'cron';

export interface N8nNode {
  id: string;
  type: N8nNodeType;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  status: 'idle' | 'running' | 'success' | 'error';
  inputs: number;
  outputs: number;
  position: { x: number; y: number };
  parameters: Record<string, any>;
  lastExecutionTimeMs?: number;
  outputPayload?: any;
}

export interface N8nConnection {
  fromNodeId: string;
  toNodeId: string;
  label?: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  description: string;
  active: boolean;
  triggerType: string;
  lastExecutedAt: string;
  totalExecutions: number;
  successRate: string;
  nodes: N8nNode[];
  connections: N8nConnection[];
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  trigger: string;
  status: 'success' | 'running' | 'error';
  startedAt: string;
  durationMs: number;
  stepsCount: number;
  payloadSummary: string;
}

export interface TelemetryAlert {
  id: string;
  metric: 'cpu' | 'ram' | 'container-memory' | 'container-cpu';
  currentValue: number;
  threshold: number;
  timestamp: string;
  severity: 'warning' | 'critical';
  message: string;
  acknowledged?: boolean;
}

export interface TelemetryAlertConfig {
  cpuThreshold: number;
  ramThreshold: number;
  enabled: boolean;
  soundEnabled: boolean;
}

export type BackupFrequency = 'diaria' | 'semanal';
export type BackupDestination = 's3' | 'local';

export interface BackupSchedule {
  id: string;
  containerId: string;
  containerName: string;
  frequency: BackupFrequency;
  cronExpression: string;
  timeOfDay: string;
  dayOfWeek?: number; // 0 = Domingo, 1 = Segunda, etc.
  destination: BackupDestination;
  s3Config?: {
    bucket: string;
    region: string;
    endpoint?: string;
    storageClass: string;
    prefix: string;
  };
  localPath?: string;
  retentionCopies: number;
  compression: 'zstd' | 'gzip';
  encryption: 'AES-256-GCM + Argon2id';
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  status: 'active' | 'paused' | 'running';
}

export interface BackupSnapshot {
  id: string;
  scheduleId?: string;
  containerId: string;
  containerName: string;
  frequency: BackupFrequency | 'manual';
  destination: BackupDestination;
  destinationPath: string;
  sizeMB: number;
  durationSec: number;
  status: 'completed' | 'in_progress' | 'failed';
  argon2Checksum: string;
  sha256: string;
  createdAt: string;
  restorable: boolean;
}

export interface CurrencyQuote {
  name: string;
  bid: string;
  ask: string;
  pctChange: string;
  high: string;
  low: string;
}

export interface RealMarketData {
  usd: CurrencyQuote;
  eur: CurrencyQuote;
  chf: CurrencyQuote;
  gbp: CurrencyQuote;
  btc?: { name: string; bid: string; pctChange: string; ask?: string };
  brent: { name: string; price: string; pctChange: string };
  wti: { name: string; price: string; pctChange: string };
  ibovespa: { name: string; points: string; pctChange: string };
  sp500: { name: string; points: string; pctChange: string };
  nasdaq: { name: string; points: string; pctChange: string };
}

export type TickerScrollSpeed = 'fast' | 'normal' | 'slow' | 'paused';

export interface ContainerResourceThreshold {
  containerId: string;
  containerName: string;
  memoryThreshold: number;
  cpuThreshold: number;
  enabled: boolean;
}

export interface ContainerThresholdAlert {
  id: string;
  containerId: string;
  containerName: string;
  resource: 'memory' | 'cpu';
  currentValue: number;
  thresholdValue: number;
  timestamp: string;
  message: string;
}

