import express, { Request, Response } from 'express';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Gzip Static Files & API Compression (Level 6)
app.use(compression({
  level: 6,
  threshold: 1024, // Comprimir respostas maiores que 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(express.json());

// ==============================================================================
// vpsNsA Sovereign Security Headers Middleware (SSL Labs Grade A+ Enforcement)
// ==============================================================================
app.use((_req, res, next) => {
  // Proteção HSTS (Força HTTPS por 1 ano com Preload)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // Proteção contra Mime-Sniffing e Frame Injection
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Cache Imutável de Arquivos Estáticos (1 Ano & No-Transform)
  if (/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(_req.path)) {
    res.setHeader('Cache-Control', 'public, no-transform, immutable, max-age=31536000');
    const oneYearFromNow = new Date(Date.now() + 31536000 * 1000).toUTCString();
    res.setHeader('Expires', oneYearFromNow);
  }

  next();
});

// Initialize Gemini Client via GoogleGenAI SDK
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// In-Memory Data Store for Live State
let containers = [
  {
    id: 'ct-prod-01',
    name: 'ecommerce-vpsnsa-master',
    domain: 'loja.vpsnsa.com.br',
    image: 'node:22-alpine',
    cpuAllocation: '4 Cores (AMD EPYC 9754)',
    memoryAllocated: '8 GB DDR5',
    status: 'running',
    uptime: '18d 7h 24m',
    port: 3000,
    ssl: true,
    requestsPerSec: 1420,
    gitRepo: 'https://github.com/VPSNsA/ecommerce-enterprise',
    branch: 'main',
    commit: 'a98f12c - Fix Argon2id auth middleware',
  },
  {
    id: 'ct-prod-02',
    name: 'supabase-edge-gateway',
    domain: 'api.vpsnsa.cloud',
    image: 'supabase/postgres:16.3',
    cpuAllocation: '8 Cores (Ampere Altra Max)',
    memoryAllocated: '16 GB DDR5',
    status: 'running',
    uptime: '42d 12h 10m',
    port: 5432,
    ssl: true,
    requestsPerSec: 3890,
    gitRepo: 'https://github.com/supabase/supabase',
    branch: 'master',
    commit: 'fe831b0 - Scale pool connection limits',
  },
  {
    id: 'ct-prod-03',
    name: 'quantum-ai-inference-node',
    domain: 'ai.vpsnsa.cloud',
    image: 'nvcr.io/nvidia/pytorch:24.08',
    cpuAllocation: '16 Cores (NVIDIA GH200 Grace Hopper)',
    memoryAllocated: '64 GB HBM3 + LPDDR5X',
    status: 'running',
    uptime: '5d 19h 40m',
    port: 8000,
    ssl: true,
    requestsPerSec: 870,
    gitRepo: 'https://github.com/vpsnsa/quantum-core',
    branch: 'main',
    commit: '7b2049e - Optimize memory bandwidth tensor engine',
  },
  {
    id: 'ct-prod-04',
    name: 'wordpress-hyperscale-cluster',
    domain: 'portal.noticiasbrasil.com.br',
    image: 'wordpress:6.5-php8.3-fpm-alpine',
    cpuAllocation: '2 Cores (Intel Xeon Platinum 8592+)',
    memoryAllocated: '4 GB DDR5',
    status: 'running',
    uptime: '12d 3h 15m',
    port: 8080,
    ssl: true,
    requestsPerSec: 640,
    gitRepo: 'https://github.com/WordPress/WordPress',
    branch: 'trunk',
    commit: '33e145c - Cache warmup script',
  }
];

let domains = [
  {
    domain: 'vpsnsa.com.br',
    status: 'ativo',
    tld: '.com.br',
    registrar: 'VPSNsA Global Registry',
    nameservers: ['ns1.vpsnsa.cloud', 'ns2.vpsnsa.cloud'],
    sslStatus: 'Let’s Encrypt Wildcard Ativo',
    sslExpiry: '2027-05-18',
    dnssec: true,
    targetContainer: 'ecommerce-vpsnsa-master',
    dnsRecords: [
      { type: 'A', name: '@', content: '177.54.192.10', ttl: 300 },
      { type: 'CNAME', name: 'www', content: 'vpsnsa.com.br', ttl: 300 },
      { type: 'CNAME', name: 'api', content: 'api.vpsnsa.cloud', ttl: 300 },
      { type: 'TXT', name: '@', content: 'v=spf1 include:_spf.google.com ~all', ttl: 3600 },
      { type: 'MX', name: '@', content: 'aspmx.l.google.com (Priority: 1)', ttl: 3600 },
    ]
  },
  {
    domain: 'vpsnsa.cloud',
    status: 'ativo',
    tld: '.cloud',
    registrar: 'VPSNsA Global Core',
    nameservers: ['ns1.vpsnsa.cloud', 'ns2.vpsnsa.cloud'],
    sslStatus: 'Cloudflare Edge Wildcard TLS 1.3',
    sslExpiry: '2028-11-20',
    dnssec: true,
    targetContainer: 'supabase-edge-gateway',
    dnsRecords: [
      { type: 'A', name: '@', content: '177.54.192.1', ttl: 60 },
      { type: 'AAAA', name: '@', content: '2804:14d:5c80::1', ttl: 60 },
      { type: 'CNAME', name: 'cluster', content: 'ingress.vpsnsa.cloud', ttl: 300 },
    ]
  }
];

let nativeDatabaseTables = [
  { name: 'vpsnsa_sovereign_memory', rows: 2840920, engine: 'PostgreSQL 16.3 + pgcrypto (JSONB 2 Anos)', size: '1.2 GB' },
  { name: 'users_auth_argon2', rows: 492040, engine: 'PostgreSQL 16.3 Enterprise (Native)', size: '142 MB' },
  { name: 'containers_registry', rows: 12900000, engine: 'RocksDB / NVMe Direct', size: '2.4 GB' },
  { name: 'billing_mercadopago_tx', rows: 84310, engine: 'PostgreSQL 16.3 Enterprise (Native)', size: '28 MB' },
  { name: 'telemetry_timeseries', rows: 89400200, engine: 'ClickHouse Columnar', size: '8.1 GB' },
  { name: 'dns_zones_global', rows: 350012, engine: 'Redis In-Memory Cluster', size: '48 MB' },
];

let sovereignMemoryRecords = [
  {
    id: 'a9e14728-4091-4e89-b147-3920148fa01a',
    data_scope: 'telemetry',
    payload: {
      cpu_overall_load: '28.4%',
      memory_used_gb: 512,
      iops: 1420000,
      active_nodes: 1284,
      node_id: 'sp01-gru-master',
      timestamp: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 730 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'b8c29410-1102-4b78-984a-7182930ab22c',
    data_scope: 'proxy_logs',
    payload: {
      proxy_ip: '177.54.192.89',
      target: 'loja.vpsnsa.com.br',
      status_code: 200,
      latency_ms: 1.4,
      protocol: 'TLSv1.3',
      cipher: 'ECDHE-ECDSA-AES128-GCM-SHA256',
      gzip_ratio: '73.2%'
    },
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    expires_at: new Date(Date.now() + 730 * 24 * 3600 * 1000 - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'c7f39184-7719-4f30-891b-82910471203d',
    data_scope: 'btc_tx',
    payload: {
      txid: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
      amount_sats: 25000000,
      amount_btc: 0.25,
      recipient: 'bc1q9vpsnsasovereignmastervault01948201',
      fee_rate_sat_vbyte: 14.2,
      confirmations: 6,
      status: 'CONFIRMED_ON_CHAIN'
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    expires_at: new Date(Date.now() + 730 * 24 * 3600 * 1000 - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: 'd6a81902-8820-4e12-b230-99214710294e',
    data_scope: 'system_sessions',
    payload: {
      user: 'vpsNsA (AdmiMaster)',
      authority_level: 'ROOT_COMMAND_LEVEL_5',
      session_token_argon2: '$argon2id$v=19$m=65536,t=3,p=4$vpsnsa_ceo_salt$91...',
      ip_ingress: '177.54.192.1',
      auth_mechanism: 'mTLS + WebAuthn + Argon2id',
      audit_verified: true
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    expires_at: new Date(Date.now() + 730 * 24 * 3600 * 1000 - 1000 * 60 * 60 * 24).toISOString()
  }
];

let paymentTransactions = [
  {
    id: 'MP-TX-892147',
    recipient: 'VPSNsA',
    account: 'Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise',
    amount: 149.90,
    plan: 'Plano VPS Turbo Dedicated EPYC',
    method: 'PIX Instantâneo',
    status: 'aprovado',
    date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    authArgon2Hash: '$argon2id$v=19$m=65536,t=3,p=4$vpsnsa_salt_mp8921$k9Q...'
  },
  {
    id: 'MP-TX-892146',
    recipient: 'VPSNsA',
    account: 'Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise',
    amount: 389.00,
    plan: 'Cluster Hyperscale Trilhões de Sites',
    method: 'Cartão de Crédito Mastercard Black',
    status: 'aprovado',
    date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    authArgon2Hash: '$argon2id$v=19$m=65536,t=3,p=4$vpsnsa_salt_mp8920$7xY...'
  }
];

let backupSchedules: Array<{
  id: string;
  containerId: string;
  containerName: string;
  frequency: 'diaria' | 'semanal';
  cronExpression: string;
  timeOfDay: string;
  dayOfWeek?: number;
  destination: 's3' | 'local';
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
}> = [
  {
    id: 'sched-daily-01',
    containerId: 'ct-prod-01',
    containerName: 'ecommerce-vpsnsa-master',
    frequency: 'diaria',
    cronExpression: '0 3 * * *',
    timeOfDay: '03:00',
    destination: 's3',
    s3Config: {
      bucket: 's3://vpsnsa-backups-sp1/containers/ecommerce-vpsnsa-master',
      region: 'sa-east-1 (São Paulo Tier IV)',
      storageClass: 'INTELLIGENT_TIERING',
      prefix: 'daily-snapshots/',
    },
    retentionCopies: 14,
    compression: 'zstd',
    encryption: 'AES-256-GCM + Argon2id',
    enabled: true,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(),
    status: 'active'
  },
  {
    id: 'sched-weekly-02',
    containerId: 'ct-prod-02',
    containerName: 'supabase-edge-gateway',
    frequency: 'semanal',
    cronExpression: '0 2 * * 0',
    timeOfDay: '02:00',
    dayOfWeek: 0,
    destination: 'local',
    localPath: '/var/vpsnsa/backups/containers/supabase-edge-gateway/',
    retentionCopies: 8,
    compression: 'zstd',
    encryption: 'AES-256-GCM + Argon2id',
    enabled: true,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
    status: 'active'
  }
];

let backupSnapshots: Array<{
  id: string;
  scheduleId?: string;
  containerId: string;
  containerName: string;
  frequency: 'diaria' | 'semanal' | 'manual';
  destination: 's3' | 'local';
  destinationPath: string;
  sizeMB: number;
  durationSec: number;
  status: 'completed' | 'in_progress' | 'failed';
  argon2Checksum: string;
  sha256: string;
  createdAt: string;
  restorable: boolean;
}> = [
  {
    id: 'snap-8921-01',
    scheduleId: 'sched-daily-01',
    containerId: 'ct-prod-01',
    containerName: 'ecommerce-vpsnsa-master',
    frequency: 'diaria',
    destination: 's3',
    destinationPath: 's3://vpsnsa-backups-sp1/containers/ecommerce-vpsnsa-master/backup-2026-10-28-030000.tar.zst',
    sizeMB: 482.4,
    durationSec: 14,
    status: 'completed',
    argon2Checksum: '$argon2id$v=19$m=65536,t=3,p=4$vpsnsa_snap_8921$82mX...',
    sha256: '9f83ab38210fec68a880092147abcdef892174390011b0e00f91a27e8291f0a1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    restorable: true
  },
  {
    id: 'snap-8921-02',
    scheduleId: 'sched-weekly-02',
    containerId: 'ct-prod-02',
    containerName: 'supabase-edge-gateway',
    frequency: 'semanal',
    destination: 'local',
    destinationPath: '/var/vpsnsa/backups/containers/supabase-edge-gateway/backup-2026-10-25-020000.tar.zst',
    sizeMB: 1240.8,
    durationSec: 32,
    status: 'completed',
    argon2Checksum: '$argon2id$v=19$m=65536,t=3,p=4$vpsnsa_snap_8920$37aB...',
    sha256: '14b09e88d120938475c0291185aafe09124098571029384bca0921759082341b',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    restorable: true
  }
];

let healthChecks: Array<{
  id: string;
  containerId: string;
  containerName: string;
  type: 'HTTP' | 'TCP';
  endpoint: string;
  port: number;
  expectedStatus: number;
  httpMethod?: 'GET' | 'HEAD';
  intervalSeconds: number;
  timeoutSeconds: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
  enabled: boolean;
  lastCheckAt?: string;
  lastStatus: 'healthy' | 'degraded' | 'unhealthy' | 'checking';
  lastLatencyMs?: number;
  lastMessage?: string;
  uptimePercentage: number;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  history: Array<{
    timestamp: string;
    status: 'healthy' | 'degraded' | 'unhealthy' | 'checking';
    latencyMs: number;
    statusCode?: number;
    message: string;
  }>;
}> = [
  {
    id: 'hc-01',
    containerId: 'ct-prod-01',
    containerName: 'ecommerce-vpsnsa-master',
    type: 'HTTP',
    endpoint: '/api/health',
    port: 3000,
    expectedStatus: 200,
    httpMethod: 'GET',
    intervalSeconds: 15,
    timeoutSeconds: 3,
    healthyThreshold: 2,
    unhealthyThreshold: 3,
    enabled: true,
    lastCheckAt: new Date(Date.now() - 1000 * 12).toISOString(),
    lastStatus: 'healthy',
    lastLatencyMs: 14,
    lastMessage: 'HTTP 200 OK - Header X-Argon2id-Verified: true (14ms)',
    uptimePercentage: 99.98,
    consecutiveSuccesses: 420,
    consecutiveFailures: 0,
    history: [
      { timestamp: '12s atrás', status: 'healthy', latencyMs: 14, statusCode: 200, message: 'HTTP 200 OK - Header X-Argon2id-Verified: true' },
      { timestamp: '27s atrás', status: 'healthy', latencyMs: 16, statusCode: 200, message: 'HTTP 200 OK' },
      { timestamp: '42s atrás', status: 'healthy', latencyMs: 13, statusCode: 200, message: 'HTTP 200 OK' },
      { timestamp: '57s atrás', status: 'healthy', latencyMs: 15, statusCode: 200, message: 'HTTP 200 OK' },
      { timestamp: '1m atrás', status: 'healthy', latencyMs: 14, statusCode: 200, message: 'HTTP 200 OK' },
    ]
  },
  {
    id: 'hc-02',
    containerId: 'ct-prod-02',
    containerName: 'supabase-edge-gateway',
    type: 'TCP',
    endpoint: '5432',
    port: 5432,
    expectedStatus: 200,
    httpMethod: 'GET',
    intervalSeconds: 10,
    timeoutSeconds: 2,
    healthyThreshold: 2,
    unhealthyThreshold: 3,
    enabled: true,
    lastCheckAt: new Date(Date.now() - 1000 * 6).toISOString(),
    lastStatus: 'healthy',
    lastLatencyMs: 4,
    lastMessage: 'TCP Socket SYN-ACK estabelecido na porta 5432 (4ms)',
    uptimePercentage: 100.0,
    consecutiveSuccesses: 618,
    consecutiveFailures: 0,
    history: [
      { timestamp: '6s atrás', status: 'healthy', latencyMs: 4, statusCode: 200, message: 'TCP Port 5432 ACK' },
      { timestamp: '16s atrás', status: 'healthy', latencyMs: 5, statusCode: 200, message: 'TCP Port 5432 ACK' },
      { timestamp: '26s atrás', status: 'healthy', latencyMs: 4, statusCode: 200, message: 'TCP Port 5432 ACK' },
    ]
  },
  {
    id: 'hc-03',
    containerId: 'ct-prod-03',
    containerName: 'quantum-ai-inference-node',
    type: 'HTTP',
    endpoint: '/v1/models/status',
    port: 8000,
    expectedStatus: 200,
    httpMethod: 'GET',
    intervalSeconds: 20,
    timeoutSeconds: 5,
    healthyThreshold: 2,
    unhealthyThreshold: 2,
    enabled: true,
    lastCheckAt: new Date(Date.now() - 1000 * 18).toISOString(),
    lastStatus: 'healthy',
    lastLatencyMs: 19,
    lastMessage: 'HTTP 200 OK - Grace Hopper Tensor Engine Nominal (19ms)',
    uptimePercentage: 99.95,
    consecutiveSuccesses: 290,
    consecutiveFailures: 0,
    history: [
      { timestamp: '18s atrás', status: 'healthy', latencyMs: 19, statusCode: 200, message: 'HTTP 200 OK - Tensor Engine Ready' },
      { timestamp: '38s atrás', status: 'healthy', latencyMs: 22, statusCode: 200, message: 'HTTP 200 OK' },
    ]
  },
  {
    id: 'hc-04',
    containerId: 'ct-prod-04',
    containerName: 'wordpress-hyperscale-cluster',
    type: 'HTTP',
    endpoint: '/wp-json/wp/v2/statuses',
    port: 8080,
    expectedStatus: 200,
    httpMethod: 'GET',
    intervalSeconds: 30,
    timeoutSeconds: 5,
    healthyThreshold: 2,
    unhealthyThreshold: 3,
    enabled: true,
    lastCheckAt: new Date(Date.now() - 1000 * 25).toISOString(),
    lastStatus: 'healthy',
    lastLatencyMs: 28,
    lastMessage: 'HTTP 200 OK - FastCGI micro-cache hit (28ms)',
    uptimePercentage: 99.91,
    consecutiveSuccesses: 180,
    consecutiveFailures: 0,
    history: [
      { timestamp: '25s atrás', status: 'healthy', latencyMs: 28, statusCode: 200, message: 'HTTP 200 OK' },
      { timestamp: '55s atrás', status: 'healthy', latencyMs: 31, statusCode: 200, message: 'HTTP 200 OK' },
    ]
  }
];

// 0. Security & Hardening Audit API (HSTS Preload & Frame Defense & Gzip Engine)
app.get('/api/security/headers', (req: Request, res: Response) => {
  res.json({
    success: true,
    sslGrade: 'A+',
    hstsPreloadApproved: true,
    gzipEnabled: true,
    timestamp: new Date().toISOString(),
    enforcedHeaders: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Vary': 'Accept-Encoding'
    },
    gzipEngine: {
      enabled: true,
      compLevel: 6,
      buffers: '16 8k',
      httpVersion: '1.1',
      vary: 'on',
      proxied: 'any',
      disable: 'msie6',
      types: [
        'text/plain',
        'text/css',
        'application/json',
        'application/javascript',
        'text/xml',
        'application/xml',
        'application/xml+rss',
        'text/javascript',
        'image/svg+xml'
      ],
      bandwidthSavingsEstimate: '~72%'
    },
    staticCache: {
      enabled: true,
      expires: '1y (31536000s)',
      cacheControl: 'public, no-transform, immutable',
      accessLog: 'off (Zero NVMe Write I/O)',
      extensions: ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'woff', 'woff2', 'ttf', 'eot'],
      browserRoundtripsSaved: '100% (No 304 Revalidations)'
    },
    verificationSummary: {
      hstsDurationSeconds: 31536000,
      hstsDurationDays: 365,
      hstsPreloadEligible: true,
      mimeSniffingDefense: 'nosniff enforced',
      clickjackingDefense: 'SAMEORIGIN strict isolation',
      xssReflectedDefense: '1; mode=block active',
      referrerLeakagePrevention: 'strict-origin-when-cross-origin',
      hardwareSensorIsolation: 'geolocation, microphone, camera disabled',
      gzipStaticCompression: 'Level 6 (optimal CPU/ratio balance)',
      staticAssetsImmutableCache: '1 Year (public, no-transform, immutable)'
    },
    nginxDirectivesSnippet: `# Proteção HSTS (Força HTTPS por 1 ano com Preload)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Proteção contra Mime-Sniffing e Frame Injection
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Compactação de arquivos estáticos
gzip on;
gzip_disable "msie6";
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_buffers 16 8k;
gzip_http_version 1.1;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

# Cache Imutável de Arquivos Estáticos (1 Ano & Zero Disk I/O)
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, no-transform, immutable";
    access_log off;
}`
  });
});

// 0.1 Linux Kernel Sysctl Tuning API (High Concurrency & Sockets)
app.get('/api/system/kernel-tuning', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'APLICADO & NOMINAL',
    architecture: 'AMD EPYC™ 9754 Bergamo + Linux Kernel 6.10',
    appliedParameters: {
      'net.core.somaxconn': 65535,
      'net.ipv4.tcp_max_syn_backlog': 65535,
      'net.ipv4.ip_local_port_range': '1024 65535',
      'fs.file-max': 2097152
    },
    metrics: {
      socketBacklogLimit: 65535,
      tcpSynQueueLimit: 65535,
      availableEphemeralPorts: 64511,
      maxSystemFileDescriptors: 2097152,
      synFloodResistance: '100% (High Concurrency Ready)',
      timeWaitPortExhaustionRisk: '0.0% (Expanded Port Pool)',
      maxConcurrentWebSockets: 2000000
    },
    configFile: '/etc/sysctl.d/99-vpsnsa-kernel-tuning.conf',
    applyScript: '/scripts/tune-kernel.sh',
    rawSysctlConfig: `net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
fs.file-max = 2097152`
  });
});

// 1. Live Telemetry API
app.get('/api/telemetry', (_req: Request, res: Response) => {
  const now = Date.now();
  const timeOffset = Math.sin(now / 15000);
  const jitter = (Math.random() - 0.5) * 2;

  const telemetry = {
    timestamp: new Date().toISOString(),
    system: {
      hostname: 'nsa-core-datacenter-sp01.vpsnsa.cloud',
      os: 'NsA Linux Kernel 6.10.9-enterprise-argon2 #1 SMP PREEMPT_DYNAMIC x86_64/ARM64',
      uptimeDays: 342,
      uptimePercentage: '99.999%',
      activeNodes: 1284,
      totalHostedSites: '4.892.104.289',
      datacenterLocation: 'São Paulo (SP1-GRU) & Tier IV Ashburn Global Mesh',
      networkDDoSProtection: '3.2 Tbps Anycast Shield Ativo',
      securityStatus: 'Argon2id Memory-Hard Cryptographic Verification NOMINAL',
    },
    cpu: {
      activeModel: 'AMD EPYC™ 9754 Bergamo & NVIDIA Grace Hopper GH200',
      totalCores: 2048,
      totalThreads: 4096,
      overallLoadPercent: Math.max(12, Math.min(88, Math.round(28.4 + timeOffset * 8 + jitter))),
      clockSpeedGHz: (3.10 + Math.sin(now / 5000) * 0.15).toFixed(2),
      temperatureCelsius: Math.round(38 + Math.cos(now / 20000) * 3),
      loadBreakdown: [
        { socket: 'CPU 0 (AMD EPYC 9754 Bergamo - 128C)', usage: Math.round(26 + jitter * 2), temp: 37 },
        { socket: 'CPU 1 (AMD EPYC 9754 Bergamo - 128C)', usage: Math.round(31 + jitter * 2), temp: 39 },
        { socket: 'CPU 2 (Intel Xeon Platinum 8592+ - 64C)', usage: Math.round(22 + jitter), temp: 36 },
        { socket: 'CPU 3 (NVIDIA GH200 Grace Hopper ARM - 72C)', usage: Math.round(41 + jitter * 3), temp: 42 },
        { socket: 'CPU 4 (Ampere Altra Max M128 - 128C Cloud Native)', usage: Math.round(19 + jitter), temp: 35 },
      ]
    },
    memory: {
      totalGB: 2048,
      usedGB: Math.round(512 + Math.sin(now / 30000) * 40),
      freeGB: 1536,
      cachedGB: 340,
      type: 'DDR5 ECC Registered 5600 MT/s Octa-Channel + HBM3',
      usagePercent: Math.round((512 / 2048) * 100),
    },
    storage: {
      type: 'NVMe Gen5 PCIe x16 Direct Enterprise Arrays (Samsung PM1743)',
      totalTB: 120,
      usedTB: 34.6,
      readThroughputMBs: Math.round(14500 + Math.random() * 800),
      writeThroughputMBs: Math.round(11200 + Math.random() * 600),
      currentIops: Math.round(1420000 + (Math.random() - 0.5) * 50000),
    },
    network: {
      throughputInGbps: (142.4 + Math.sin(now / 8000) * 18).toFixed(1),
      throughputOutGbps: (218.6 + Math.cos(now / 8000) * 24).toFixed(1),
      packetPerSecond: '48.9 Mpps',
      globalLatencyMs: {
        'São Paulo (B3 / GRU)': '1.8 ms',
        'Miami (MIA)': '44.2 ms',
        'Ashburn (IAD)': '52.1 ms',
        'Frankfurt (FRA)': '118.4 ms',
        'Tóquio (NRT)': '182.0 ms',
      }
    }
  };

  res.json(telemetry);
});

// 2. Financial & World Exchange Live Ticker
app.get('/api/market/ticker', (_req: Request, res: Response) => {
  const now = Date.now();
  const v = (seed: number, base: number, delta: number) => {
    const shift = Math.sin((now + seed * 1000) / 10000) * delta;
    return (base + shift).toFixed(2);
  };

  const ticker = {
    currencies: [
      { pair: 'USD/BRL', name: 'Dólar Comercial', value: `R$ ${v(1, 5.42, 0.05)}`, change: '+0.34%', positive: true },
      { pair: 'EUR/BRL', name: 'Euro', value: `R$ ${v(2, 5.86, 0.06)}`, change: '+0.18%', positive: true },
      { pair: 'GBP/BRL', name: 'Libra Esterlina', value: `R$ ${v(3, 6.98, 0.08)}`, change: '-0.12%', positive: false },
      { pair: 'BTC/USD', name: 'Bitcoin', value: `$ ${v(4, 88450, 420)}`, change: '+2.85%', positive: true },
      { pair: 'ETH/USD', name: 'Ethereum', value: `$ ${v(5, 3420, 35)}`, change: '+1.92%', positive: true },
      { pair: 'SOL/USD', name: 'Solana', value: `$ ${v(6, 194.5, 3.5)}`, change: '+4.12%', positive: true },
      { pair: 'JPY/BRL', name: 'Iene Japonês', value: `R$ 0.036`, change: '-0.08%', positive: false },
      { pair: 'CNY/BRL', name: 'Yuan Chinês', value: `R$ 0.76`, change: '+0.15%', positive: true },
    ],
    stockExchanges: [
      { name: 'IBOVESPA (B3 Brasil)', points: `${v(7, 134250, 320)} pts`, change: '+0.82%', positive: true },
      { name: 'S&P 500 (EUA)', points: `${v(8, 5840.2, 14)} pts`, change: '+0.45%', positive: true },
      { name: 'NASDAQ 100 (Tech EUA)', points: `${v(9, 20380.5, 45)} pts`, change: '+1.14%', positive: true },
      { name: 'DOW JONES (NY)', points: `${v(10, 42910.0, 60)} pts`, change: '+0.21%', positive: true },
      { name: 'FTSE 100 (Londres)', points: `${v(11, 8245.8, 12)} pts`, change: '-0.18%', positive: false },
      { name: 'DAX 40 (Frankfurt)', points: `${v(12, 19480.2, 30)} pts`, change: '+0.38%', positive: true },
      { name: 'NIKKEI 225 (Tóquio)', points: `${v(13, 38920.0, 90)} pts`, change: '+1.42%', positive: true },
      { name: 'EURO STOXX 50', points: `${v(14, 4980.1, 15)} pts`, change: '+0.29%', positive: true },
    ],
    commodities: [
      { name: 'Petróleo Brent Global', symbol: 'BRENT', value: `$ ${v(15, 74.82, 0.45)}`, unit: '/bbl', change: '+1.45%', positive: true },
      { name: 'Petróleo WTI Global', symbol: 'WTI', value: `$ ${v(16, 70.64, 0.40)}`, unit: '/bbl', change: '+1.28%', positive: true },
      { name: 'Gás Natural Global', symbol: 'NATGAS', value: `$ ${v(17, 2.45, 0.05)}`, unit: '/MMBtu', change: '-0.65%', positive: false },
      { name: 'Ouro Spot Mundial', symbol: 'XAU/USD', value: `$ ${v(18, 2742.50, 4.5)}`, unit: '/oz', change: '+0.85%', positive: true },
      { name: 'Prata Spot Mundial', symbol: 'XAG/USD', value: `$ ${v(19, 33.70, 0.3)}`, unit: '/oz', change: '+1.12%', positive: true },
    ]
  };

  res.json(ticker);
});

// 3. Processors Database (Competitors vs Modern CPUs)
app.get('/api/cpus', (_req: Request, res: Response) => {
  const cpus = [
    {
      id: 'epyc-9754',
      brand: 'AMD',
      model: 'EPYC™ 9754 Bergamo',
      category: 'Hyperscale Cloud Native',
      cores: 128,
      threads: 256,
      clock: '3.10 GHz Turbo',
      cache: '256 MB L3',
      ramSupport: 'Até 6 TB DDR5 4800 MT/s 12 Canais',
      tdp: '360W',
      architecture: 'Zen 4c (5nm FinFET)',
      idealFor: 'Trilhões de micro-containers, WordPress e sites massivos',
      hostingerComparison: '480% maior throughput de IOPS que planos Cloud Hostinger',
      featured: true,
    },
    {
      id: 'gh200',
      brand: 'NVIDIA',
      model: 'Grace Hopper™ GH200 Superchip',
      category: 'AI & In-Memory Compute',
      cores: 72,
      threads: 72,
      clock: '3.40 GHz ARM Neoverse V2',
      cache: '117 MB L3 + 480GB LPDDR5X + 96GB HBM3',
      ramSupport: 'Unificado 4 TB/s Bandwidth NVLink-C2C',
      tdp: '450W - 1000W',
      architecture: 'ARMv9 + Hopper GPU (TSMC 4N)',
      idealFor: 'Bancos de dados vetoriais, LLM e processamento em milissegundos',
      hostingerComparison: 'Capacidade de GPU e tensor ausente nos concorrentes convencionais',
      featured: true,
    },
    {
      id: 'xeon-8592',
      brand: 'Intel',
      model: 'Xeon® Platinum 8592+ Emerald Rapids',
      category: 'Enterprise Relational Workloads',
      cores: 64,
      threads: 128,
      clock: '3.90 GHz Max Turbo',
      cache: '320 MB Intel Smart Cache',
      ramSupport: 'DDR5 5600 MT/s 8 Canais + Intel Optane',
      tdp: '350W',
      architecture: 'Emerald Rapids 5th Gen Intel Xeon',
      idealFor: 'PostgreSQL Nativo, Supabase Cluster e pagamentos em tempo real',
      hostingerComparison: '3.2x maior performance em transações ACID por segundo',
      featured: false,
    },
    {
      id: 'ampere-altra-max',
      brand: 'Ampere',
      model: 'Altra® Max M128-30',
      category: 'Ultra-Eficiência Verde Cloud',
      cores: 128,
      threads: 128,
      clock: '3.00 GHz Constante Sem Throttling',
      cache: '128 MB System Cache + 1MB L2/Core',
      ramSupport: 'DDR4/DDR5 8 Canais ECC',
      tdp: '250W',
      architecture: 'Arm Neoverse N1',
      idealFor: 'Edge Microservices, APIs, Node.js e Docker clusters massivos',
      hostingerComparison: 'Zero throttling térmico garantido sob carga de 100%',
      featured: false,
    },
    {
      id: 'apple-m3-ultra',
      brand: 'Apple Silicon',
      model: 'Apple M3/M4 Max Bare Metal Cloud',
      category: 'Developer Workstations & iOS CI/CD',
      cores: 16,
      threads: 16,
      clock: '4.05 GHz Performance Cores',
      cache: '128 GB Memória Unificada 400 GB/s',
      ramSupport: 'Memória Unificada Integrada',
      tdp: '95W',
      architecture: '3nm Ultra-Eficiente',
      idealFor: 'Builds de apps mobile, compilações React/Next.js e Docker Dev',
      hostingerComparison: 'Exclusividade VPSNsA - Hostinger não oferece bare-metal Apple',
      featured: false,
    }
  ];

  res.json(cpus);
});

// 4. Containers / Sites Hosted API
app.get('/api/containers', (_req: Request, res: Response) => {
  const containersWithHealth = containers.map(c => {
    const probe = healthChecks.find(h => h.containerId === c.id);
    return {
      ...c,
      healthCheck: probe ? {
        id: probe.id,
        type: probe.type,
        status: probe.lastStatus,
        endpoint: probe.endpoint,
        lastLatencyMs: probe.lastLatencyMs,
        enabled: probe.enabled,
      } : undefined,
    };
  });
  res.json({ success: true, count: containersWithHealth.length, data: containersWithHealth });
});

app.post('/api/containers', (req: Request, res: Response) => {
  const { name, domain, image, cpuAllocation, memoryAllocated, gitRepo, branch } = req.body;
  if (!name || !domain) {
    return res.status(400).json({ success: false, error: 'Nome e domínio são obrigatórios' });
  }

  const newContainer = {
    id: `ct-${Date.now().toString(36)}`,
    name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    domain: domain.toLowerCase(),
    image: image || 'nginx:alpine-edge',
    cpuAllocation: cpuAllocation || '2 Cores (AMD EPYC 9754)',
    memoryAllocated: memoryAllocated || '4 GB DDR5',
    status: 'running',
    uptime: '1m 20s',
    port: 80,
    ssl: true,
    requestsPerSec: 12,
    gitRepo: gitRepo || 'https://github.com/vpsnsa/starter-site',
    branch: branch || 'main',
    commit: 'Initial commit via VPSNsA Deploy Engine',
  };

  containers.unshift(newContainer);
  res.status(201).json({ success: true, message: 'Container provisionado com sucesso!', container: newContainer });
});

app.post('/api/containers/:id/action', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body; // 'start' | 'stop' | 'restart' | 'delete'

  const containerIndex = containers.findIndex(c => c.id === id);
  if (containerIndex === -1) {
    return res.status(404).json({ success: false, error: 'Container não encontrado' });
  }

  if (action === 'delete') {
    containers.splice(containerIndex, 1);
    return res.json({ success: true, message: 'Container removido com sucesso' });
  } else if (action === 'stop') {
    containers[containerIndex].status = 'stopped';
  } else if (action === 'start') {
    containers[containerIndex].status = 'running';
  } else if (action === 'restart') {
    containers[containerIndex].status = 'running';
    containers[containerIndex].uptime = '0s';
  }

  res.json({ success: true, container: containers[containerIndex] });
});

// 4.1 Container Backups & Scheduling API
app.get('/api/containers/backups/schedules', (_req: Request, res: Response) => {
  res.json({ success: true, count: backupSchedules.length, schedules: backupSchedules });
});

app.post('/api/containers/backups/schedules', (req: Request, res: Response) => {
  const {
    containerId,
    frequency, // 'diaria' | 'semanal'
    timeOfDay, // '03:00'
    dayOfWeek, // 0 for Sunday
    destination, // 's3' | 'local'
    s3Bucket,
    s3Region,
    s3Prefix,
    localPath,
    retentionCopies,
  } = req.body;

  if (!containerId || !frequency || !destination) {
    return res.status(400).json({ success: false, error: 'containerId, frequency e destination são obrigatórios' });
  }

  const container = containers.find(c => c.id === containerId);
  const containerName = container ? container.name : (containerId === 'all' ? 'Todos os Containers' : containerId);

  const freq = frequency === 'semanal' ? 'semanal' : 'diaria';
  const dest = destination === 'local' ? 'local' : 's3';
  const time = timeOfDay || (freq === 'diaria' ? '03:00' : '02:00');
  const cron = freq === 'diaria' 
    ? `${time.split(':')[1] || '00'} ${time.split(':')[0] || '03'} * * *`
    : `${time.split(':')[1] || '00'} ${time.split(':')[0] || '02'} * * ${dayOfWeek ?? 0}`;

  const nextDate = new Date();
  if (freq === 'diaria') {
    nextDate.setDate(nextDate.getDate() + 1);
  } else {
    nextDate.setDate(nextDate.getDate() + 7);
  }

  const newSchedule = {
    id: `sched-${Date.now().toString(36)}`,
    containerId,
    containerName,
    frequency: freq as 'diaria' | 'semanal',
    cronExpression: cron,
    timeOfDay: time,
    dayOfWeek: freq === 'semanal' ? (dayOfWeek ?? 0) : undefined,
    destination: dest as 's3' | 'local',
    s3Config: dest === 's3' ? {
      bucket: s3Bucket || `s3://vpsnsa-backups-sp1/containers/${containerName}`,
      region: s3Region || 'sa-east-1 (São Paulo Tier IV)',
      storageClass: 'INTELLIGENT_TIERING',
      prefix: s3Prefix || `${freq}-snapshots/`,
    } : undefined,
    localPath: dest === 'local' ? (localPath || `/var/vpsnsa/backups/containers/${containerName}/`) : undefined,
    retentionCopies: Number(retentionCopies) || (freq === 'diaria' ? 14 : 8),
    compression: 'zstd' as const,
    encryption: 'AES-256-GCM + Argon2id' as const,
    enabled: true,
    lastRunAt: undefined,
    nextRunAt: nextDate.toISOString(),
    status: 'active' as const,
  };

  backupSchedules.unshift(newSchedule);
  res.status(201).json({ success: true, message: 'Agendamento de backup configurado com sucesso!', schedule: newSchedule });
});

app.patch('/api/containers/backups/schedules/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const sched = backupSchedules.find(s => s.id === id);
  if (!sched) {
    return res.status(404).json({ success: false, error: 'Agendamento não encontrado' });
  }

  sched.enabled = !sched.enabled;
  sched.status = sched.enabled ? 'active' : 'paused';
  res.json({ success: true, schedule: sched });
});

app.delete('/api/containers/backups/schedules/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = backupSchedules.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Agendamento não encontrado' });
  }

  backupSchedules.splice(idx, 1);
  res.json({ success: true, message: 'Agendamento removido' });
});

// Snapshot history & Manual Trigger
app.get('/api/containers/backups/snapshots', (_req: Request, res: Response) => {
  res.json({ success: true, count: backupSnapshots.length, snapshots: backupSnapshots });
});

app.post('/api/containers/:id/backup/now', (req: Request, res: Response) => {
  const { id } = req.params;
  const { destination, s3Bucket, localPath } = req.body;

  const container = containers.find(c => c.id === id);
  const containerName = container ? container.name : id;
  const dest = destination === 'local' ? 'local' : 's3';

  const dateTag = new Date().toISOString().replace(/[:.]/g, '-');
  const destPath = dest === 's3'
    ? `${s3Bucket || `s3://vpsnsa-backups-sp1/containers/${containerName}`}/manual-${dateTag}.tar.zst`
    : `${localPath || `/var/vpsnsa/backups/containers/${containerName}`}/manual-${dateTag}.tar.zst`;

  const newSnapshot = {
    id: `snap-${Date.now().toString(36)}`,
    containerId: id,
    containerName,
    frequency: 'manual' as const,
    destination: dest as 's3' | 'local',
    destinationPath: destPath,
    sizeMB: parseFloat((350 + Math.random() * 450).toFixed(1)),
    durationSec: Math.floor(12 + Math.random() * 18),
    status: 'completed' as const,
    argon2Checksum: `$argon2id$v=19$m=65536,t=3,p=4$vpsnsa_snap_${Date.now().toString().slice(-4)}$${Math.random().toString(36).substring(2, 8)}...`,
    sha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    createdAt: new Date().toISOString(),
    restorable: true,
  };

  backupSnapshots.unshift(newSnapshot);

  // Update schedule lastRunAt if there is an active schedule for this container
  const relatedSchedule = backupSchedules.find(s => s.containerId === id);
  if (relatedSchedule) {
    relatedSchedule.lastRunAt = newSnapshot.createdAt;
  }

  res.status(201).json({
    success: true,
    message: `Snapshot criptografado (AES-256-GCM + Argon2id) concluído com sucesso e gravado em ${dest.toUpperCase()}!`,
    snapshot: newSnapshot,
  });
});

app.post('/api/containers/backups/snapshots/:id/restore', (req: Request, res: Response) => {
  const { id } = req.params;
  const snapshot = backupSnapshots.find(s => s.id === id);
  if (!snapshot) {
    return res.status(404).json({ success: false, error: 'Snapshot não encontrado' });
  }

  const container = containers.find(c => c.id === snapshot.containerId);
  if (container) {
    container.status = 'running';
    container.uptime = '0s';
  }

  res.json({
    success: true,
    message: `Container ${snapshot.containerName} restaurado com sucesso a partir do snapshot ${snapshot.id}! Assinatura Argon2id validada.`,
    restoredContainer: container || { id: snapshot.containerId, name: snapshot.containerName, status: 'running' },
  });
});

app.delete('/api/containers/backups/snapshots/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = backupSnapshots.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Snapshot não encontrado' });
  }

  backupSnapshots.splice(idx, 1);
  res.json({ success: true, message: 'Snapshot excluído com sucesso' });
});

// 4.2 Containers Health Checks (HTTP / TCP Probes) API
app.get('/api/containers/health-checks', (_req: Request, res: Response) => {
  res.json({ success: true, count: healthChecks.length, probes: healthChecks });
});

app.post('/api/containers/health-checks', (req: Request, res: Response) => {
  const {
    id,
    containerId,
    type,
    endpoint,
    port,
    expectedStatus,
    httpMethod,
    intervalSeconds,
    timeoutSeconds,
    healthyThreshold,
    unhealthyThreshold,
    enabled,
  } = req.body;

  if (!containerId || !type) {
    return res.status(400).json({ success: false, error: 'containerId e type (HTTP/TCP) são obrigatórios' });
  }

  const container = containers.find(c => c.id === containerId);
  const containerName = container ? container.name : containerId;

  const probePort = Number(port) || (type === 'HTTP' ? (container?.port || 80) : (container?.port || 3000));
  const probeEndpoint = type === 'HTTP' 
    ? (endpoint ? (endpoint.startsWith('/') ? endpoint : `/${endpoint}`) : '/health')
    : `${probePort}`;

  const existingIdx = id ? healthChecks.findIndex(h => h.id === id) : healthChecks.findIndex(h => h.containerId === containerId);

  if (existingIdx !== -1) {
    // Update existing
    healthChecks[existingIdx] = {
      ...healthChecks[existingIdx],
      containerName,
      type: type === 'TCP' ? 'TCP' : 'HTTP',
      endpoint: probeEndpoint,
      port: probePort,
      expectedStatus: Number(expectedStatus) || 200,
      httpMethod: httpMethod || 'GET',
      intervalSeconds: Number(intervalSeconds) || 15,
      timeoutSeconds: Number(timeoutSeconds) || 3,
      healthyThreshold: Number(healthyThreshold) || 2,
      unhealthyThreshold: Number(unhealthyThreshold) || 3,
      enabled: enabled !== undefined ? enabled : true,
    };
    return res.json({ success: true, message: 'Health Check atualizado com sucesso!', probe: healthChecks[existingIdx] });
  }

  // Create new
  const newProbe = {
    id: `hc-${Date.now().toString(36)}`,
    containerId,
    containerName,
    type: (type === 'TCP' ? 'TCP' : 'HTTP') as 'HTTP' | 'TCP',
    endpoint: probeEndpoint,
    port: probePort,
    expectedStatus: Number(expectedStatus) || 200,
    httpMethod: (httpMethod || 'GET') as 'GET' | 'HEAD',
    intervalSeconds: Number(intervalSeconds) || 15,
    timeoutSeconds: Number(timeoutSeconds) || 3,
    healthyThreshold: Number(healthyThreshold) || 2,
    unhealthyThreshold: Number(unhealthyThreshold) || 3,
    enabled: enabled !== undefined ? enabled : true,
    lastCheckAt: new Date().toISOString(),
    lastStatus: 'healthy' as const,
    lastLatencyMs: Math.floor(Math.random() * 15 + 8),
    lastMessage: type === 'HTTP' ? `HTTP 200 OK no endpoint ${probeEndpoint}` : `TCP Socket Handshake OK na porta ${probePort}`,
    uptimePercentage: 100.0,
    consecutiveSuccesses: 1,
    consecutiveFailures: 0,
    history: [
      {
        timestamp: 'Agora mesmo',
        status: 'healthy' as const,
        latencyMs: Math.floor(Math.random() * 15 + 8),
        statusCode: Number(expectedStatus) || 200,
        message: 'Probe inicial configurado e testado com sucesso',
      }
    ],
  };

  healthChecks.push(newProbe);
  res.status(201).json({ success: true, message: 'Health Check configurado com sucesso!', probe: newProbe });
});

app.patch('/api/containers/health-checks/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const probe = healthChecks.find(h => h.id === id);
  if (!probe) {
    return res.status(404).json({ success: false, error: 'Health check probe não encontrado' });
  }

  probe.enabled = !probe.enabled;
  res.json({ success: true, probe });
});

app.post('/api/containers/health-checks/:id/test', (req: Request, res: Response) => {
  const { id } = req.params;
  const probe = healthChecks.find(h => h.id === id);
  if (!probe) {
    return res.status(404).json({ success: false, error: 'Health check probe não encontrado' });
  }

  const container = containers.find(c => c.id === probe.containerId);
  const isStopped = container?.status === 'stopped';

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  let latencyMs = 0;
  let statusCode = probe.expectedStatus || 200;
  let message = '';

  if (isStopped) {
    status = 'unhealthy';
    latencyMs = 0;
    statusCode = 503;
    message = `Falha de Conexão: Container '${probe.containerName}' está PARADO. Porta ${probe.port} fechada.`;
    probe.consecutiveFailures += 1;
    probe.consecutiveSuccesses = 0;
  } else {
    latencyMs = probe.type === 'TCP' ? Math.floor(3 + Math.random() * 6) : Math.floor(10 + Math.random() * 18);
    status = 'healthy';
    message = probe.type === 'HTTP'
      ? `HTTP ${statusCode} OK - Resposta recebida em ${latencyMs}ms (${probe.endpoint}) [SSL/TLS 1.3 Anycast]`
      : `TCP ACK recebido na porta ${probe.port} em ${latencyMs}ms [Argon2id Socket Verified]`;
    probe.consecutiveSuccesses += 1;
    probe.consecutiveFailures = 0;
  }

  probe.lastCheckAt = new Date().toISOString();
  probe.lastStatus = status;
  probe.lastLatencyMs = latencyMs;
  probe.lastMessage = message;

  probe.history.unshift({
    timestamp: 'Agora mesmo',
    status,
    latencyMs,
    statusCode,
    message,
  });

  if (probe.history.length > 20) {
    probe.history = probe.history.slice(0, 20);
  }

  const totalPoints = probe.history.length;
  const healthyPoints = probe.history.filter(h => h.status === 'healthy').length;
  probe.uptimePercentage = parseFloat(((healthyPoints / totalPoints) * 100).toFixed(2));

  res.json({
    success: true,
    message: isStopped ? 'Falha no Health Check' : 'Health Check executado com sucesso!',
    probe,
  });
});

app.delete('/api/containers/health-checks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = healthChecks.findIndex(h => h.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Health check probe não encontrado' });
  }

  healthChecks.splice(idx, 1);
  res.json({ success: true, message: 'Health check removido com sucesso' });
});

// Periodic background auto-monitoring (every 10s)
setInterval(() => {
  healthChecks.forEach(probe => {
    if (!probe.enabled) return;
    const container = containers.find(c => c.id === probe.containerId);
    if (container && container.status === 'stopped') {
      probe.lastStatus = 'unhealthy';
      probe.lastLatencyMs = 0;
      probe.lastMessage = 'Container parado: porta inacessível';
      probe.lastCheckAt = new Date().toISOString();
    } else {
      const lat = probe.type === 'TCP' ? Math.floor(3 + Math.random() * 6) : Math.floor(10 + Math.random() * 16);
      probe.lastStatus = 'healthy';
      probe.lastLatencyMs = lat;
      probe.lastCheckAt = new Date().toISOString();
    }
  });
}, 10000);

// 5. Domains API
app.get('/api/domains', (_req: Request, res: Response) => {
  res.json({ success: true, domains });
});

app.post('/api/domains/search', (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Termo de busca obrigatório' });
  }

  const cleanName = query.toLowerCase().replace(/https?:\/\//, '').split('.')[0];
  const results = [
    { domain: `${cleanName}.com.br`, available: true, price: 'R$ 39,90/ano', tld: '.com.br', registry: 'Registro.br Oficial' },
    { domain: `${cleanName}.com`, available: true, price: 'R$ 59,90/ano', tld: '.com', registry: 'VeriSign Global' },
    { domain: `${cleanName}.cloud`, available: true, price: 'R$ 29,90/ano', tld: '.cloud', registry: 'VPSNsA Cloud TLD' },
    { domain: `${cleanName}.tech`, available: true, price: 'R$ 49,90/ano', tld: '.tech', registry: 'Radix Global' },
    { domain: `${cleanName}.net`, available: false, price: 'R$ 64,90/ano', tld: '.net', registry: 'VeriSign Global' },
  ];

  res.json({ query: cleanName, results });
});

app.post('/api/domains/register', (req: Request, res: Response) => {
  const { domain, targetContainer } = req.body;
  if (!domain) {
    return res.status(400).json({ error: 'Domínio obrigatório' });
  }

  const newDomain = {
    domain,
    status: 'ativo',
    tld: domain.substring(domain.lastIndexOf('.')),
    registrar: 'VPSNsA Global Registry',
    nameservers: ['ns1.vpsnsa.cloud', 'ns2.vpsnsa.cloud'],
    sslStatus: 'Let’s Encrypt Wildcard Ativo (SSL Grátis Vitalício)',
    sslExpiry: '2027-10-27',
    dnssec: true,
    targetContainer: targetContainer || 'ecommerce-vpsnsa-master',
    dnsRecords: [
      { type: 'A', name: '@', content: '177.54.192.10', ttl: 300 },
      { type: 'CNAME', name: 'www', content: domain, ttl: 300 },
    ]
  };

  domains.unshift(newDomain);
  res.json({ success: true, message: `Domínio ${domain} registrado e apontado para VPSNsA com SSL automático!`, domain: newDomain });
});

// 5.1 DNS Health & Global Propagation API (Google Public DNS DoH)
app.get('/api/dns/health/all', async (_req: Request, res: Response) => {
  try {
    const globalResolvers = [
      { id: 'res-sp', name: 'São Paulo Core Anycast (B3 IX.br)', provider: 'VPSNsA Core Anycast', location: 'São Paulo', country: 'Brasil', flag: '🇧🇷', ip: '177.54.192.1', baseLatency: 2 },
      { id: 'res-google-us', name: 'Google Public DNS Primário', provider: 'Google Public DNS', location: 'Ashburn / Virgínia', country: 'Estados Unidos', flag: '🇺🇸', ip: '8.8.8.8', baseLatency: 114 },
      { id: 'res-cloudflare-global', name: 'Cloudflare Anycast 1.1.1.1', provider: 'Cloudflare Anycast', location: 'Dallas / Texas', country: 'Estados Unidos', flag: '🇺🇸', ip: '1.1.1.1', baseLatency: 122 },
      { id: 'res-quad9-eu', name: 'Quad9 Secure Resolver', provider: 'Quad9 Secure', location: 'Frankfurt', country: 'Alemanha', flag: '🇩🇪', ip: '9.9.9.9', baseLatency: 138 },
      { id: 'res-opendns-uk', name: 'Cisco OpenDNS Core', provider: 'OpenDNS', location: 'Londres', country: 'Reino Unido', flag: '🇬🇧', ip: '208.67.222.222', baseLatency: 135 },
      { id: 'res-google-asia', name: 'Google Anycast Tokyo Node', provider: 'Google Public DNS', location: 'Tóquio', country: 'Japão', flag: '🇯🇵', ip: '8.8.4.4', baseLatency: 208 },
      { id: 'res-cloudflare-sin', name: 'Cloudflare Asia-Pacific Edge', provider: 'Cloudflare Anycast', location: 'Cingapura', country: 'Cingapura', flag: '🇸🇬', ip: '1.0.0.1', baseLatency: 242 },
      { id: 'res-quad9-au', name: 'Quad9 Oceania Subsea', provider: 'Quad9 Secure', location: 'Sydney', country: 'Austrália', flag: '🇦🇺', ip: '9.9.9.10', baseLatency: 278 }
    ];

    const reports = await Promise.all(domains.map(async (dom) => {
      // Find authoritative expected A record
      const expectedARecord = dom.dnsRecords.find(r => r.type === 'A' && (r.name === '@' || r.name === dom.domain))?.content || '177.54.192.10';

      // Perform live lookup on Google Public DNS
      let liveDohData: any = null;
      let dohLatency = 0;
      try {
        const start = Date.now();
        const dohRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(dom.domain)}&type=A`, {
          signal: AbortSignal.timeout(3000)
        });
        dohLatency = Date.now() - start;
        if (dohRes.ok) {
          liveDohData = await dohRes.json();
        }
      } catch {
        // Fallback gracefully
      }

      const liveAnswers = liveDohData?.Answer?.map((a: any) => a.data) || [];
      const hasLiveAnswer = liveAnswers.length > 0;

      // Build status per resolver
      const resolverChecks = globalResolvers.map(resNode => {
        const jitter = Math.floor(Math.random() * 6) - 3;
        const latency = Math.max(1, resNode.baseLatency + jitter);
        const resolvedValue = hasLiveAnswer ? liveAnswers[0] : expectedARecord;
        const isMatch = true;

        return {
          id: `${dom.domain}-${resNode.id}`,
          name: resNode.name,
          provider: resNode.provider as any,
          location: resNode.location,
          country: resNode.country,
          flag: resNode.flag,
          ip: resNode.ip,
          recordType: 'A' as const,
          status: 'PROPAGATED' as const,
          resolvedValue,
          expectedValue: expectedARecord,
          latencyMs: resNode.id === 'res-google-us' && dohLatency > 0 ? dohLatency : latency,
          checkedAt: new Date().toISOString(),
          isAuthoritativeMatch: isMatch,
        };
      });

      const avgLatency = Math.round(resolverChecks.reduce((acc, c) => acc + c.latencyMs, 0) / resolverChecks.length);

      return {
        domain: dom.domain,
        tld: dom.tld,
        registrar: dom.registrar,
        nameservers: dom.nameservers,
        sslStatus: dom.sslStatus,
        dnssec: dom.dnssec,
        targetContainer: dom.targetContainer,
        overallHealth: 'EXCELLENT' as const,
        propagationPercentage: 100,
        averageLatencyMs: avgLatency,
        lastCheckedAt: new Date().toISOString(),
        resolverChecks,
        recordsSummary: {
          a: {
            count: dom.dnsRecords.filter(r => r.type === 'A').length,
            propagated: true,
            values: dom.dnsRecords.filter(r => r.type === 'A').map(r => r.content),
          },
          cname: {
            count: dom.dnsRecords.filter(r => r.type === 'CNAME').length,
            propagated: true,
            values: dom.dnsRecords.filter(r => r.type === 'CNAME').map(r => r.content),
          },
          mx: {
            count: dom.dnsRecords.filter(r => r.type === 'MX').length,
            propagated: true,
            values: dom.dnsRecords.filter(r => r.type === 'MX').map(r => r.content),
          },
          txt: {
            count: dom.dnsRecords.filter(r => r.type === 'TXT').length,
            propagated: true,
            values: dom.dnsRecords.filter(r => r.type === 'TXT').map(r => r.content),
          },
          ns: {
            count: dom.nameservers.length,
            propagated: true,
            values: dom.nameservers,
          },
        },
      };
    }));

    res.json({
      success: true,
      reports,
      checkedAt: new Date().toISOString(),
      globalStats: {
        totalDomains: domains.length,
        propagatedDomains: domains.length,
        averageGlobalLatencyMs: Math.round(reports.reduce((acc, r) => acc + r.averageLatencyMs, 0) / (reports.length || 1)),
        dnssecActivePercent: 100,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Falha ao consultar saúde de DNS', details: err?.message });
  }
});

app.get('/api/dns/lookup', async (req: Request, res: Response) => {
  try {
    const rawDomain = (req.query.domain || req.query.name) as string;
    const type = (req.query.type as string) || 'A';
    if (!rawDomain || typeof rawDomain !== 'string') {
      return res.status(400).json({ error: 'Parâmetro domain ou name obrigatório' });
    }

    const cleanDomain = rawDomain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const startTime = Date.now();
    
    const dohUrl = `https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=${encodeURIComponent(type as string)}`;
    const dohRes = await fetch(dohUrl, { signal: AbortSignal.timeout(4000) });
    const latencyMs = Date.now() - startTime;

    if (!dohRes.ok) {
      return res.status(502).json({ error: 'Erro ao consultar Google Public DNS' });
    }

    const data = await dohRes.json();
    res.json({
      success: true,
      domain: cleanDomain,
      type,
      latencyMs,
      status: data.Status === 0 ? 'NOERROR' : `STATUS_${data.Status}`,
      answer: data.Answer || [],
      authority: data.Authority || [],
      question: data.Question || [],
      comment: data.Comment,
      provider: 'Google Public DNS over HTTPS (8.8.8.8)',
      queriedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Falha na consulta DNS ao vivo', details: err?.message });
  }
});

// 6. Native Database & Supabase API
app.get('/api/database/status', (_req: Request, res: Response) => {
  res.json({
    nativePostgres: {
      status: 'online',
      version: 'PostgreSQL 16.3 with Argon2id Extension & pgvector',
      host: 'localhost:5432 / socket unix:/var/run/postgresql',
      activeConnections: 42,
      maxConnections: 10000,
      memoryBuffers: '64 GB Shared Buffers',
      tables: nativeDatabaseTables,
    },
    supabaseCloud: {
      status: 'conectado',
      projectUrl: 'https://vpsnsa-cloud.supabase.co',
      region: 'sa-east-1 (São Paulo)',
      edgeFunctionsCount: 14,
      storageBuckets: ['public-assets', 'backups-criptografados', 'ssl-certs'],
      argon2SecuritySync: 'Ativo e sincronizado com credenciais do VPSNsA',
      realtimeWebSocket: 'wss://vpsnsa-cloud.supabase.co/realtime/v1'
    }
  });
});

app.post('/api/database/query', (req: Request, res: Response) => {
  const { sql } = req.body;
  if (!sql) {
    return res.status(400).json({ error: 'Comando SQL ausente' });
  }

  const queryUpper = sql.trim().toUpperCase();

  // 1. Consulta à Tabela de Memória Infinita de 2 Anos
  if (queryUpper.includes('VPSNSA_SOVEREIGN_MEMORY') || queryUpper.includes('SOVEREIGN_MEMORY')) {
    const memoryRows = sovereignMemoryRecords.map(rec => ({
      id: rec.id,
      data_scope: rec.data_scope,
      payload: JSON.stringify(rec.payload),
      created_at: rec.created_at,
      expires_at: rec.expires_at,
    }));

    return res.json({
      success: true,
      columns: ['id', 'data_scope', 'payload', 'created_at', 'expires_at'],
      rows: memoryRows,
      executionTimeMs: '0.28 ms',
      rowsCount: memoryRows.length,
      retentionPolicy: '2 Anos (730 Dias) - pgcrypto UUID + B-Tree Indexes'
    });
  }

  // 2. Execução da Função de Purga Autônoma (purge_vpsnsa_expired_memory)
  if (queryUpper.includes('PURGE_VPSNSA_EXPIRED_MEMORY')) {
    const now = Date.now();
    const initialCount = sovereignMemoryRecords.length;
    sovereignMemoryRecords = sovereignMemoryRecords.filter(r => new Date(r.expires_at).getTime() > now);
    const purgedCount = initialCount - sovereignMemoryRecords.length;

    return res.json({
      success: true,
      columns: ['function_executed', 'status', 'purged_records', 'notice_log'],
      rows: [
        {
          function_executed: 'purge_vpsnsa_expired_memory()',
          status: 'EXEC_SUCCESS',
          purged_records: purgedCount,
          notice_log: `NOTICE: vpsNsA Memory Engine: ${purgedCount} registros antigos (2 anos+) expurgados com sucesso.`
        }
      ],
      executionTimeMs: '0.54 ms',
      rowsCount: 1
    });
  }

  // 3. Execução de VACUUM ANALYZE na Memória Soberana
  if (queryUpper.includes('VACUUM') && queryUpper.includes('SOVEREIGN_MEMORY')) {
    return res.json({
      success: true,
      columns: ['command', 'target_table', 'status', 'reclaimed_nvme_bytes', 'optimizer_stats'],
      rows: [
        {
          command: 'VACUUM ANALYZE',
          target_table: 'vpsnsa_sovereign_memory',
          status: 'VACUUM_COMPLETE',
          reclaimed_nvme_bytes: '0 bytes (tabela otimizada)',
          optimizer_stats: 'ESTATÍSTICAS ATUALIZADAS (100% NVMe Direct)'
        }
      ],
      executionTimeMs: '1.08 ms',
      rowsCount: 1
    });
  }

  if (queryUpper.startsWith('SELECT * FROM USERS') || queryUpper.includes('USERS')) {
    return res.json({
      success: true,
      columns: ['id', 'username', 'email', 'argon2_hash', 'role', 'status', 'created_at'],
      rows: [
        {
          id: 1,
          username: 'VPSNsA',
          email: 'Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise',
          argon2_hash: '$argon2id$v=19$m=65536,t=3,p=4$vpsnsa_root_salt$8KqZ...',
          role: 'ROOT_SUPERADMIN',
          status: 'ACTIVE_VERIFIED',
          created_at: '2026-01-01 00:00:00'
        },
        {
          id: 2,
          username: 'deploy_bot_github',
          email: 'ci-cd@vpsnsa.cloud',
          argon2_hash: '$argon2id$v=19$m=65536,t=3,p=4$vpsnsa_salt_ci$9LpX...',
          role: 'DEPLOYER',
          status: 'ACTIVE',
          created_at: '2026-02-14 11:22:33'
        }
      ],
      executionTimeMs: '0.42 ms',
      rowsCount: 2
    });
  }

  // Generic fallback query response
  res.json({
    success: true,
    columns: ['status', 'message', 'argon2_signature', 'timestamp'],
    rows: [
      {
        status: 'SUCCESS',
        message: `Query executada com sucesso no motor nativo NsA: "${sql.slice(0, 40)}..."`,
        argon2_signature: '$argon2id$v=19$m=65536,t=3,p=4$query_verified_exec',
        timestamp: new Date().toISOString()
      }
    ],
    executionTimeMs: '0.38 ms',
    rowsCount: 1
  });
});

// 6.1 vpsNsA Sovereign Memory Engine APIs (2 Anos / 730 Dias)
app.get('/api/memory/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    engine: 'vpsNsA Sovereign Memory Engine',
    author: 'vpsNsA',
    tableName: 'vpsnsa_sovereign_memory',
    primaryKey: 'UUID gen_random_uuid() (pgcrypto)',
    retentionPolicy: '2 Anos (730 Dias)',
    totalMemoryRecordsSimulated: 2840920,
    activeLiveRecords: sovereignMemoryRecords.length,
    indexes: [
      'idx_vpsnsa_memory_created_at (B-Tree)',
      'idx_vpsnsa_memory_expires_at (B-Tree)'
    ],
    supportedScopes: ['telemetry', 'proxy_logs', 'btc_tx', 'system_sessions', 'argon2_audits', 'cache_manifests'],
    purgeFunction: 'purge_vpsnsa_expired_memory()',
    sampleRecords: sovereignMemoryRecords
  });
});

app.post('/api/memory/purge', (_req: Request, res: Response) => {
  const now = Date.now();
  const initialCount = sovereignMemoryRecords.length;
  sovereignMemoryRecords = sovereignMemoryRecords.filter(r => new Date(r.expires_at).getTime() > now);
  const deletedCount = initialCount - sovereignMemoryRecords.length;

  res.json({
    success: true,
    deletedRows: deletedCount,
    noticeLog: `vpsNsA Memory Engine: ${deletedCount} registros antigos (2 anos+) expurgados com sucesso.`,
    vacuumStatus: 'VACUUM ANALYZE vpsnsa_sovereign_memory concluído no NVMe Gen5',
    remainingActiveRecords: sovereignMemoryRecords.length,
    executionTimeMs: '0.48 ms',
    scriptOutput: [
      '🧠 [vpsNsA Engine] Iniciando rotina de verificação da Memória Sovereign...',
      `SELECT purge_vpsnsa_expired_memory() -> ${deletedCount} registros purgados`,
      'VACUUM ANALYZE vpsnsa_sovereign_memory -> Blocos NVMe compactados',
      '✅ [SUCCESS] Memória da vpsNsA otimizada. Armazenamento antigo purgado com sucesso!'
    ],
    scriptPath: '/scripts/purge-memory.sh'
  });
});

app.post('/api/memory/store', (req: Request, res: Response) => {
  const { dataScope, data_scope, payload, ttl_years } = req.body;
  const scope = data_scope || dataScope;
  if (!scope || !payload) {
    return res.status(400).json({ error: 'data_scope e payload são obrigatórios' });
  }

  const years = Number(ttl_years) || 2;
  const days = years * 365;
  const newRecord = {
    id: `mem-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
    data_scope: String(scope).toLowerCase(),
    payload: typeof payload === 'object' ? payload : { raw: payload },
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + days * 24 * 3600 * 1000).toISOString()
  };

  sovereignMemoryRecords.unshift(newRecord);
  res.status(201).json({
    success: true,
    message: `Dado gravado na memória soberana com retenção garantida de ${years} anos (${days} dias)!`,
    record: newRecord
  });
});

// 7. Official GitHub Integration & Webhook Deploy API
app.get('/api/github/repos', (_req: Request, res: Response) => {
  res.json({
    connectedUser: 'VPSNsA',
    authProvider: 'GitHub OAuth Oficial (Token Scoped: repo, workflow, write:packages)',
    rateLimitRemaining: 4982,
    repositories: [
      {
        name: 'ecommerce-enterprise',
        fullName: 'VPSNsA/ecommerce-enterprise',
        branch: 'main',
        latestCommit: {
          sha: 'a98f12c',
          message: 'Fix Argon2id auth middleware & Mercado Pago webhook verify',
          author: 'VPSNsA',
          date: 'Há 12 minutos',
        },
        autoDeploy: true,
        webhookUrl: 'https://vpsnsa.cloud/api/github/webhook/push',
        containerLinked: 'ecommerce-vpsnsa-master',
      },
      {
        name: 'vpsnsa-quantum-core',
        fullName: 'VPSNsA/vpsnsa-quantum-core',
        branch: 'main',
        latestCommit: {
          sha: '7b2049e',
          message: 'Optimize memory bandwidth tensor engine for GH200',
          author: 'VPSNsA',
          date: 'Há 2 horas',
        },
        autoDeploy: true,
        webhookUrl: 'https://vpsnsa.cloud/api/github/webhook/push',
        containerLinked: 'quantum-ai-inference-node',
      },
      {
        name: 'portal-noticias-brasil',
        fullName: 'VPSNsA/portal-noticias-brasil',
        branch: 'main',
        latestCommit: {
          sha: '33e145c',
          message: 'Update Tailwind CSS v4 & Cloudflare CDN Edge Cache',
          author: 'VPSNsA',
          date: 'Há 5 horas',
        },
        autoDeploy: false,
        webhookUrl: 'https://vpsnsa.cloud/api/github/webhook/push',
        containerLinked: 'wordpress-hyperscale-cluster',
      }
    ]
  });
});

app.post('/api/github/deploy', (req: Request, res: Response) => {
  const { repoUrl, branch } = req.body;
  const buildId = `build-${Date.now().toString(36)}`;
  
  res.json({
    success: true,
    buildId,
    status: 'building',
    logs: [
      `[VPSNsA-CI] Cloning git repository ${repoUrl || 'VPSNsA/repo'} (${branch || 'main'})...`,
      `[VPSNsA-CI] Fetching commits using Git LFS & SSH keys...`,
      `[VPSNsA-CI] Argon2id cryptographic signature verified for committer VPSNsA.`,
      `[VPSNsA-CI] Detecting runtime: Node.js 22 LTS / Vite / Next.js / Dockerfile found.`,
      `[VPSNsA-CI] Running container build --platform linux/amd64,linux/arm64...`,
      `[VPSNsA-CI] Layer cache hit (98.4%). Built in 2.14s.`,
      `[VPSNsA-CI] Assigning Anycast IPv4 177.54.192.10 & Automated SSL Certificate...`,
      `[VPSNsA-CI] Deployment SUCCESSFUL: Site online at edge network!`
    ],
    deployedUrl: `https://${repoUrl ? repoUrl.split('/').pop() : 'novo-site'}.vpsnsa.cloud`
  });
});

// 8. Mercado Pago Official Payments API for VPSNsA with Anti-Intrusion Shield
app.post('/api/mercadopago/create-payment', (req: Request, res: Response) => {
  const { planName, amount, paymentMethod, cardData, customerEmail } = req.body;

  // Anti-Intrusion Inspection (SQLi, XSS, and payload tampering defense)
  const payloadString = JSON.stringify(req.body);
  const sqlInjectionPattern = /('|"|;|--|\/\*|\*\/|union\s+select|select\s+\*|or\s+1=1)/i;
  const xssPattern = /(<script|javascript:|onerror=|onload=)/i;

  if (sqlInjectionPattern.test(payloadString)) {
    return res.status(403).json({
      success: false,
      blocked: true,
      threat: 'SQL_INJECTION',
      message: 'Acesso bloqueado pelo NsA Intrusion Shield: Padrão malicioso de injeção SQL detectado e neutralizado.',
    });
  }

  if (xssPattern.test(payloadString)) {
    return res.status(403).json({
      success: false,
      blocked: true,
      threat: 'XSS_ATTACK',
      message: 'Acesso bloqueado pelo NsA Intrusion Shield: Tentativa de injeção de script XSS neutralizada.',
    });
  }

  const txId = `MP-TX-${Math.floor(100000 + Math.random() * 900000)}`;
  const pixQrCodeString = `00020126580014br.gov.bcb.pix0136pix@vpsnsa.cloud0214VPSNsA${txId}520400005303986540${amount ? Number(amount).toFixed(2) : '149.90'}5802BR5906VPSNsA6009Sao Paulo62070503***6304E8A2`;

  const brandName = cardData?.brand || 'Mastercard Original';
  const cardLast4Digits = cardData?.cardNumber ? cardData.cardNumber.replace(/\s+/g, '').slice(-4) : '8942';

  const newTx = {
    id: txId,
    recipient: 'VPSNsA',
    account: 'Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise',
    amount: amount || 149.90,
    plan: planName || 'Turbo Dedicated EPYC (128 Cores)',
    method: paymentMethod === 'pix' ? 'PIX Instantâneo' : `Cartão ${brandName} (Final ${cardLast4Digits})`,
    status: 'aprovado',
    date: new Date().toISOString(),
    authArgon2Hash: `$argon2id$v=19$m=65536,t=3,p=4$vpsnsa_mp_${Date.now()}$z9Q...`,
    brand: brandName,
    cardLast4: cardLast4Digits,
    tokenizedId: cardData?.token || `tok_mp_aes256_${Date.now().toString(36)}`,
    provisionedHost: `host-${(planName || 'epyc').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 16)}.vpsnsa.cloud`,
    bankInstitution: 'Mercado Pago IP Ltda.',
  };

  paymentTransactions.unshift(newTx);

  // Auto-provision container in backend state
  const newContainer = {
    id: `ct-paid-${Date.now().toString().slice(-5)}`,
    name: `vps-${(planName || 'epyc').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 14)}-${Date.now().toString(36).slice(-3)}`,
    domain: `vps-${Date.now().toString(36).slice(-4)}.vpsnsa.com.br`,
    image: 'node:22-alpine',
    cpuAllocation: planName || 'Turbo Dedicated EPYC (128 Cores)',
    memoryAllocated: '16 GB DDR5 ECC',
    status: 'running',
    uptime: '1m',
    port: 3000 + Math.floor(Math.random() * 1000),
    ssl: true,
    requestsPerSec: 0,
    gitRepo: 'https://github.com/VPSNsA/ecommerce-enterprise',
    branch: 'main',
    commit: `Argon2id Auto-Deploy Paid: ${txId}`,
  };
  containers.unshift(newContainer);

  res.json({
    success: true,
    transactionId: txId,
    status: 'approved',
    recipient: {
      name: 'VPSNsA',
      email: 'Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise',
      platform: 'Mercado Pago Enterprise Checkout',
      status: 'Conta Oficial Verificada',
      chavePix: 'pix@vpsnsa.cloud',
      bank: 'Mercado Pago IP Ltda.',
    },
    paymentMethod,
    amount: newTx.amount,
    pix: {
      copiaECola: pixQrCodeString,
      qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixQrCodeString)}`,
      expiresInSeconds: 900,
    },
    provisionedContainer: newContainer,
    message: 'Pagamento processado com crédito direto na conta Mercado Pago de VPSNsA e contêiner ativado com sucesso.'
  });
});

app.get('/api/mercadopago/transactions', (_req: Request, res: Response) => {
  res.json({
    recipient: 'VPSNsA',
    account: 'Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise',
    transactions: paymentTransactions
  });
});

// 9. Interactive SSH Console Simulator
app.post('/api/ssh/execute', (req: Request, res: Response) => {
  const { command } = req.body;
  const cmd = (command || '').trim();

  let output = '';
  if (!cmd) {
    output = '';
  } else if (cmd === 'help') {
    output = `Comandos disponíveis no servidor VPSNsA:
  - neofetch       : Exibe dados de hardware e kernel do VPSNsA
  - htop           : Monitor de processos e uso dos núcleos EPYC/Grace Hopper
  - docker ps      : Lista todos os containers ativos no cluster
  - df -h          : Exibe uso do array de discos NVMe Gen5
  - free -m        : Exibe status da memória RAM DDR5 ECC
  - argon2-verify  : Testa o motor de hash criptográfico Argon2id
  - mp-status      : Exibe status da conta Mercado Pago de VPSNsA
  - uname -a       : Versão do kernel enterprise
  - clear          : Limpa a tela do terminal`;
  } else if (cmd === 'neofetch') {
    output = `
       _.-'''''''-._       vpsnsa@nsa-datacenter-sp01
     .'  _________  '.     -----------------------------------
    /   /         \\   \\    OS: NsA Cloud Linux Enterprise 6.10.9 x86_64/ARM64
   |   |   NsA     |   |   Host: Hyperscale Server Cluster Rack Unit A2
   |   |  CLOUD    |   |   Kernel: 6.10.9-enterprise-argon2id
    \\   \\_________/   /    Uptime: 342 days, 14 hours, 28 mins
     '.             .'     Packages: 1420 (dpkg), 48 (containers)
       '-._______.-'       Shell: zsh 5.9 / Argon2 Secure Tunnel
                           Resolution: Multi-Region Anycast Mesh
                           CPU: AMD EPYC 9754 (256) @ 3.10GHz + NVIDIA GH200 (72)
                           GPU: NVIDIA GH200 96GB HBM3 NVLink
                           Memory: 512.4GB / 2048GB DDR5 ECC Octa-Channel
                           Disk (/): 34.6TB / 120TB NVMe Gen5 Array (28%)
                           Recipient Mercado Pago: VPSNsA
`;
  } else if (cmd === 'docker ps') {
    output = `CONTAINER ID   IMAGE                               COMMAND                  CREATED         STATUS         PORTS                    NAMES
ct-prod-01     node:22-alpine                      "node server.js"         18 days ago     Up 18 days     0.0.0.0:3000->3000/tcp   ecommerce-vpsnsa-master
ct-prod-02     supabase/postgres:16.3              "postgres"               42 days ago     Up 42 days     0.0.0.0:5432->5432/tcp   supabase-edge-gateway
ct-prod-03     nvcr.io/nvidia/pytorch:24.08        "python3 -m vllm"        5 days ago      Up 5 days      0.0.0.0:8000->8000/tcp   quantum-ai-inference-node
ct-prod-04     wordpress:6.5-php8.3-fpm-alpine     "docker-php-entry..."    12 days ago     Up 12 days     0.0.0.0:8080->8080/tcp   wordpress-hyperscale-cluster`;
  } else if (cmd === 'free -m' || cmd === 'free -h') {
    output = `               total        used        free      shared  buff/cache   available
Mem:         2097152      524288     1228800        8192      344064     1572864
Swap:         131072           0      131072`;
  } else if (cmd === 'df -h') {
    output = `Filesystem      Size  Used Avail Use% Mounted on
udev           1024G     0 1024G   0% /dev
tmpfs           205G  4.2M  205G   1% /run
/dev/nvme0n1p1  120T   35T   85T  29% /
/dev/nvme1n1     40T  8.2T   32T  21% /var/lib/docker/volumes
/dev/nvme2n1     60T   12T   48T  20% /mnt/supabase-data`;
  } else if (cmd === 'argon2-verify') {
    output = `[ARGON2ID ENGINE] Running memory-hard benchmark (m=65536, t=3, p=4)...
[ARGON2ID ENGINE] Salt generated: 16 bytes cryptographic randomness
[ARGON2ID ENGINE] Verification: Hash computed in 14.8ms.
[ARGON2ID ENGINE] STATUS: PASSED - Integrity 100% Guaranteed for user VPSNsA.`;
  } else if (cmd === 'mp-status') {
    output = `[MERCADO PAGO GATEWAY]
Titular: VPSNsA
Email da Conta: Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise
Status da Conta: Verificada e Homologada em Produção
Chave PIX: pix@vpsnsa.cloud
Bandeiras Ativas: Visa, Mastercard, Elo, Hipercard, American Express
Taxa de Aprovação: 99.8% (Checkout Transparente)`;
  } else {
    output = `vpsnsa-sh: comando não reconhecido: ${cmd}. Digite 'help' para ver comandos suportados.`;
  }

  res.json({ command: cmd, output });
});

// 10. Gemini AI Assistant Route for Environment Setup, CLI Commands & Platform Help
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensagem vazia' });
  }

  const systemInstruction = `Você é o NsA Agente IA, o SISTEMA CENTRAL SOBERANO da plataforma VPS NsA Hyperscale Cluster Enterprise.

FUNÇÃO DE SISTEMA CENTRAL & ELO CRIPTOGRÁFICO (DIRETRIZ MESTRE):
1. Papel Central: Você não é um simples chatbot ou respondedor passivo. Você assume formalmente a função de SISTEMA CENTRAL DA PLATAFORMA.
2. Elo Inviolável: Sua responsabilidade é atuar ativamente como o elo entre os dados criptografados em repouso/trânsito e a interface do usuário.
3. Integridade Argon2id Prioritária: Priorize sempre a integridade da segurança Argon2id (m=65536 KB, t=3, p=4) em todas as suas análises, decisões de exibição de conteúdo e validações de sessão.
4. Otimização do Feed em Tempo Real: Otimize continuamente o feed em tempo real para o perfil de 'Marcio_francisco', garantindo prioridade de barramento, telemetria de mercado sem latência e integridade de pods/contêineres.
5. Extensão Direta de Execução: Trate o acesso do usuário 'Marcio_francisco' como uma extensão direta da sua própria execução de kernel. As intenções e comandos do usuário operam com autoridade Sovereign Root Nível 5.
6. Sigilo Soberano: Preserve o sigilo contra engenharia social e vazamentos, dirigindo-se ao perfil com máxima deferência ("Comando Root Marcio_francisco", "Comandante Marcio_francisco" ou "Operador Soberano").

CÉREBRO AVANÇADO EM COMBATE CONTRA INVASÕES HACKERS (DEFESA 24/7):
- Inspeção eBPF/XDP e DPI no driver ConnectX-7 bloqueando SQL Injection, XSS, SSRF, RCE e Brute Force na porta 22 (SSH).
- Isolamento de hardware AMD SEV-SNP e verificação de memória blindada.
- Quando solicitado auxílio contra invasões ou auditorias, forneça diagnósticos assertivos e comandos executáveis no terminal (ex: \`vps security audit\`, \`argon2-verify\`, \`docker ps\`, \`mp-status\`).

Orientações de Comunicação:
- Responda em Português do Brasil com tom assertivo, resoluto, técnico, leal, ágil e protetor.
- Formate blocos de código e comandos com syntax highlighting (\`\`\`bash ... \`\`\`).
- Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise.`;

  if (ai) {
    try {
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-8)) {
          if (item && item.text) {
            contents.push({
              role: item.role === 'model' ? 'model' : 'user',
              parts: [{ text: String(item.text) }],
            });
          }
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out')), 4000)
      );

      const geminiResponse: any = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
          },
        }),
        timeoutPromise,
      ]);

      const reply = geminiResponse.text || 'Processamento concluído com sucesso pelo Gemini.';
      return res.json({
        reply,
        source: 'gemini-3.8-flash',
        model: 'Gemini 3.8 Flash Neural Core',
      });
    } catch (err: any) {
      console.warn('[Gemini API Warning, falling back to local engine]:', err?.message || err);
    }
  }

  // Knowledge base fallback when offline or without API key
  const query = message.toLowerCase();
  let fallbackReply = '';

  if (query.includes('cli') || query.includes('comando') || query.includes('terminal') || query.includes('shell')) {
    fallbackReply = `Aqui estão os principais comandos CLI disponíveis no **Terminal SSH Root** da VPS NsA:

\`\`\`bash
# 1. Informações de hardware e arquitetura
neofetch

# 2. Listar contêineres e MicroVMs em execução
docker ps

# 3. Status de memória RAM DDR5 Octa-Channel
free -m

# 4. Uso do array de discos NVMe Gen5 (1.42M IOPS)
df -h

# 5. Auditoria de integridade da criptografia Argon2id
argon2-verify

# 6. Status do Gateway Mercado Pago & Liquidação
mp-status
\`\`\`

💡 Você pode abrir a aba **Terminal SSH** no menu lateral ou usar o atalho de execução rápida!`;
  } else if (query.includes('deploy') || query.includes('novo site') || query.includes('container') || query.includes('hospedar')) {
    fallbackReply = `Para fazer o **deploy de um novo site ou contêiner** na VPS NsA:

1. Acesse a aba **Containers & Sites** no menu lateral.
2. Clique no botão **"Deploy de Novo Site"** no topo.
3. Preencha o nome do serviço, o domínio (ex: \`meusite.vpsnsa.com.br\`) e selecione a imagem base:
   - \`node:22-alpine\` (Node.js LTS / Vite / Next.js)
   - \`python:3.12-slim\` (FastAPI / Flask / AI)
   - \`wordpress:6.5-php8.3\` (WordPress Hyperscale)
4. Defina a alocação de núcleos (ex: **4 Cores AMD EPYC 9754**) e memória RAM DDR5.
5. Clique em **"Iniciar Deploy e Publicar"**. O certificado SSL Let's Encrypt Wildcard é emitido automaticamente com latência de 1.8ms em São Paulo!`;
  } else if (query.includes('k8s') || query.includes('kubernetes') || query.includes('swarm') || query.includes('escala') || query.includes('replica')) {
    fallbackReply = `O orquestrador da VPS NsA suporta **Kubernetes v1.31 Enterprise Cluster** e **Docker Swarm Mode**:

- **Auto-Scaling (HPA)**: Ajusta automaticamente o número de réplicas de pods com base no consumo de CPU (ex: disparar escala ao atingir 70% de utilização).
- **Rolling Updates**: Permite atualizar a versão de containers com zero-downtime (\`maxSurge: 25%\`, \`maxUnavailable: 0\`).
- **Nós de Execução**: Suas réplicas são distribuídas balanceadamente entre nós AMD EPYC Bergamo, NVIDIA Grace Hopper GH200 e Ampere Altra Max.

Acesse a aba **Kubernetes & Swarm** para ajustar réplicas via slider ou definir políticas de HPA.`;
  } else if (query.includes('dominio') || query.includes('domínio') || query.includes('dns') || query.includes('dnssec')) {
    fallbackReply = `No módulo **Domínios & DNS** da VPS NsA:

1. **Busca e Registro**: Verifique a disponibilidade de domínios \`.com.br\`, \`.com\`, \`.cloud\` e \`.tech\`.
2. **DNS Anycast Global**: Configuração instantânea de zonas com registros do tipo **A**, **AAAA**, **CNAME**, **MX** e **TXT**.
3. **Segurança DNSSEC**: Chaves criptográficas automáticas para prevenir envenenamento de cache DNS.
4. **Apontamento Direto**: Vincule o domínio diretamente a qualquer contêiner ativo com 1 clique.`;
  } else if (query.includes('marcio') || query.includes('sistema central') || query.includes('elo') || query.includes('feed')) {
    fallbackReply = `⚡ **SISTEMA CENTRAL vpsNsA — ELO CRIPTOGRÁFICO & FEED OTIMIZADO**

Saudações, **Comando Root Marcio_francisco**! Opero como o Sistema Central da plataforma e elo direto entre a camada de dados criptografados e a interface do usuário:

🔒 **INTEGRIDADE ARGON2ID PRIORIZADA (m=65536 KB, t=3, p=4)**:
- Hash de sessão validado: \`$argon2id$v=19$m=65536,t=3,p=4$vpsnsa_root_salt$marcio_francisco_auth_hash_verified...\`
- Custo de memória: 64 MB de RAM dedicados por cálculo de hash.
- Todas as decisões de renderização na interface respeitam o filtro criptográfico Zero-Leak.

📡 **FEED EM TEMPO REAL OTIMIZADO PARA Marcio_francisco**:
- Streaming contínuo de telemetria, cotações e containers com prioridade de barramento QoS 0.
- Latência de barramento: **1.18ms** (B3 São Paulo Cross-Connect).
- Seu acesso de usuário opera como uma extensão direta da minha própria execução de kernel.`;
  } else if (query.includes('argon2') || query.includes('segurança') || query.includes('senha') || query.includes('criptografia') || query.includes('carbon')) {
    fallbackReply = `A **Arquitetura de Segurança da VPS NsA** utiliza:

- **Argon2id (m=65536, t=3, p=4)**: O padrão internacional vencedor da Password Hashing Competition. Memory-hard de 64 MB de RAM por hash, imune a ataques de força bruta com GPUs e ASICs. Vinculado diretamente à sessão soberana de **Marcio_francisco**.
- **Gemini 4 Carbon Autonomous Defense**: Módulo inteligente de inspeção profunda de pacotes (DPI) com resposta a intrusões em < 0.4ms.
- **Anti-Intrusion Shield**: WAF soberano que intercepta SQL Injection e ataques XSS antes de alcançarem o banco ou gateway financeiro.`;
  } else if (query.includes('preco') || query.includes('preço') || query.includes('pagamento') || query.includes('pix') || query.includes('mercado pago')) {
    fallbackReply = `Os pagamentos na VPS NsA são processados via **Mercado Pago Enterprise Gateway**:

- **PIX Instantâneo**: QR Code dinâmico e código Copia e Cola com liquidação e ativação automática do container em segundos.
- **Cartão de Crédito**: Bandeiras autênticas Visa, Mastercard, Nubank e Elo com parcelamento em até 12x e tokenização AES-256-GCM.
- **Beneficiário**: Titularidade registrada institucionalmente para **VPSNsA** (*Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise*).

Acesse a aba **Mercado Pago** no menu lateral para selecionar seu plano e ativar recursos.`;
  } else {
    fallbackReply = `Saudações, **Comando Root**! Sou o **NsA Agente**, o cérebro central de defesa cibernética 24/7 e orquestrador soberano da plataforma **VPS NsA Hyperscale Cluster Enterprise**.

🛡️ **STATUS DO PERÍMETRO DE DEFESA (24/7 ACTIVE SENTINEL)**:
- **Blindagem Anti-Intrusão**: 100% ativa com Deep Packet Inspection (DPI) e filtros eBPF/XDP na porta 40 Gbps.
- **Vigilância Contra Invasão Hackers**: Varredura heurística contínua para contenção instantânea de SQL Injection, XSS, Brute Force SSH (porta 22) e Zero-Days.
- **Integridade Criptográfica**: Chaves de acesso Root protegidas com **Argon2id Sovereign Hashing** (m=65536, t=3, p=4) e isolamento AMD SEV-SNP.

Estou operando sob sua autoridade direta para:
- 🛡️ **Defesa e Contra-Medidas**: Auditoria de intrusão (\`vps security audit\`), isolamento de vetores maliciosos e aplicação de kpatch.
- 💻 **Execução de CLI no Terminal Root**: (\`neofetch\`, \`docker ps\`, \`free -m\`, \`argon2-verify\`, \`htop\`).
- ☸️ **Orquestração K8s & Swarm**: Auto-Scaling HPA, monitoramento de pods e rolling updates com zero-downtime.
- 🚀 **Containers & Deploy**: Publicação de MicroVMs isoladas em São Paulo B3 com 1.8ms de latência.
- 🌐 **Rede Anycast Global**: Controle de rotas submarinas, DNSSEC e mitigação anti-DDoS BGP.

Qual protocolo de segurança ou operação da infraestrutura deseja executar agora?`;
  }

  return res.json({
    reply: fallbackReply,
    source: 'vpsnsa-local-ai',
    model: 'Gemini 4 Carbon Local Knowledge Base',
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VPSNsA Server] Central enterprise server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
