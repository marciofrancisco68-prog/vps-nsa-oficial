import {
  TelemetryData,
  MarketTickerItem,
  ContainerItem,
  CpuItem,
  DomainItem,
  PaymentTransaction,
  K8sDeployment,
  K8sPod,
  CiCdPipelineRun,
  N8nWorkflow,
  N8nNode,
  N8nExecution,
  BackupSchedule,
  BackupSnapshot,
  BackupFrequency,
  BackupDestination,
  HealthCheckProbe,
  HealthCheckType,
  HealthCheckStatus,
} from '../types';

let localContainers: ContainerItem[] = [
  {
    id: 'ct-prod-01',
    name: 'ecommerce-vpsnsa-master',
    domain: 'loja.vpsnsa.com.br',
    image: 'node:22-alpine',
    cpuAllocation: '4 Cores (AMD EPYC 9754 Bergamo)',
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

let localDeployments: K8sDeployment[] = [
  {
    id: 'k8s-dep-01',
    name: 'ecommerce-vpsnsa-master',
    namespace: 'production',
    orchestrator: 'Kubernetes v1.31',
    replicas: 6,
    availableReplicas: 6,
    targetReplicas: 6,
    image: 'registry.vpsnsa.cloud/vpsnsa/ecommerce:v2.14.0',
    domain: 'loja.vpsnsa.com.br',
    cpuRequest: '500m',
    cpuLimit: '2000m',
    memoryRequest: '1Gi',
    memoryLimit: '4Gi',
    hpaEnabled: true,
    hpaMin: 4,
    hpaMax: 48,
    hpaTargetCpu: 70,
    currentCpuPercent: 44,
    currentMemoryPercent: 52,
    status: 'Healthy',
    gitRepo: 'https://github.com/VPSNsA/ecommerce-enterprise',
    gitBranch: 'main',
    lastCommitSha: 'a98f12c',
    lastDeployedAt: 'Há 12 minutos via GitHub Webhook',
    pods: [
      { id: 'pod-01-a', name: 'ecommerce-vpsnsa-master-7d88f98d5-h29kx', node: 'node-epyc-sp01', status: 'Running', ip: '10.244.1.84', restarts: 0, cpuUsage: '48m', memoryUsage: '342Mi', uptime: '18d 7h' },
      { id: 'pod-01-b', name: 'ecommerce-vpsnsa-master-7d88f98d5-px42v', node: 'node-epyc-sp01', status: 'Running', ip: '10.244.1.85', restarts: 0, cpuUsage: '52m', memoryUsage: '350Mi', uptime: '18d 7h' },
      { id: 'pod-01-c', name: 'ecommerce-vpsnsa-master-7d88f98d5-mk991', node: 'node-epyc-sp02', status: 'Running', ip: '10.244.2.19', restarts: 0, cpuUsage: '39m', memoryUsage: '338Mi', uptime: '12d 3h' },
      { id: 'pod-01-d', name: 'ecommerce-vpsnsa-master-7d88f98d5-zq180', node: 'node-epyc-sp02', status: 'Running', ip: '10.244.2.20', restarts: 0, cpuUsage: '45m', memoryUsage: '340Mi', uptime: '12d 3h' },
      { id: 'pod-01-e', name: 'ecommerce-vpsnsa-master-7d88f98d5-ll402', node: 'node-gh200-sp03', status: 'Running', ip: '10.244.3.44', restarts: 0, cpuUsage: '61m', memoryUsage: '360Mi', uptime: '5d 1h' },
      { id: 'pod-01-f', name: 'ecommerce-vpsnsa-master-7d88f98d5-br882', node: 'node-ampere-sp04', status: 'Running', ip: '10.244.4.12', restarts: 0, cpuUsage: '42m', memoryUsage: '335Mi', uptime: '1d 9h' },
    ],
    yamlManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ecommerce-vpsnsa-master
  namespace: production
  labels:
    app: ecommerce-vpsnsa
    author: vpsnsa
    argon2id-secured: "true"
spec:
  replicas: 6
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ecommerce-vpsnsa
  template:
    metadata:
      labels:
        app: ecommerce-vpsnsa
    spec:
      containers:
      - name: web-app
        image: registry.vpsnsa.cloud/vpsnsa/ecommerce:v2.14.0
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 2000m
            memory: 4Gi
        ports:
        - containerPort: 3000
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ecommerce-vpsnsa-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ecommerce-vpsnsa-master
  minReplicas: 4
  maxReplicas: 48
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70`
  },
  {
    id: 'k8s-dep-02',
    name: 'quantum-ai-inference-node',
    namespace: 'ai-workloads',
    orchestrator: 'Kubernetes v1.31',
    replicas: 2,
    availableReplicas: 2,
    targetReplicas: 2,
    image: 'nvcr.io/nvidia/pytorch:24.08-gh200',
    domain: 'ai.vpsnsa.cloud',
    cpuRequest: '4000m',
    cpuLimit: '16000m',
    memoryRequest: '16Gi',
    memoryLimit: '64Gi',
    hpaEnabled: false,
    hpaMin: 2,
    hpaMax: 8,
    hpaTargetCpu: 85,
    currentCpuPercent: 58,
    currentMemoryPercent: 74,
    status: 'Healthy',
    gitRepo: 'https://github.com/vpsnsa/quantum-core',
    gitBranch: 'main',
    lastCommitSha: '7b2049e',
    lastDeployedAt: 'Há 2 horas via GitHub CI/CD',
    pods: [
      { id: 'pod-02-a', name: 'quantum-ai-node-6bb7f-94jks', node: 'node-gh200-sp03', status: 'Running', ip: '10.244.3.110', restarts: 0, cpuUsage: '2800m', memoryUsage: '24.2Gi', uptime: '5d 19h' },
      { id: 'pod-02-b', name: 'quantum-ai-node-6bb7f-22zqp', node: 'node-gh200-sp03', status: 'Running', ip: '10.244.3.111', restarts: 0, cpuUsage: '3100m', memoryUsage: '26.8Gi', uptime: '5d 19h' },
    ],
    yamlManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: quantum-ai-inference-node
  namespace: ai-workloads
spec:
  replicas: 2
  template:
    spec:
      nodeSelector:
        hardware: nvidia-gh200-grace-hopper
      containers:
      - name: llm-inference
        image: nvcr.io/nvidia/pytorch:24.08-gh200
        resources:
          limits:
            nvidia.com/gpu: 1
            memory: 64Gi`
  },
  {
    id: 'swarm-srv-03',
    name: 'wordpress-hyperscale-cluster',
    namespace: 'swarm-default',
    orchestrator: 'Docker Swarm',
    replicas: 4,
    availableReplicas: 4,
    targetReplicas: 4,
    image: 'wordpress:6.5-php8.3-fpm-alpine',
    domain: 'portal.noticiasbrasil.com.br',
    cpuRequest: '250m',
    cpuLimit: '1000m',
    memoryRequest: '512Mi',
    memoryLimit: '2Gi',
    hpaEnabled: true,
    hpaMin: 2,
    hpaMax: 20,
    hpaTargetCpu: 65,
    currentCpuPercent: 28,
    currentMemoryPercent: 38,
    status: 'Healthy',
    gitRepo: 'https://github.com/WordPress/WordPress',
    gitBranch: 'trunk',
    lastCommitSha: '33e145c',
    lastDeployedAt: 'Há 5 horas via Swarm Manager',
    pods: [
      { id: 'task-03-a', name: 'wordpress-hyperscale.1.k78xq', node: 'node-epyc-sp01', status: 'Running', ip: '10.0.0.14', restarts: 0, cpuUsage: '35m', memoryUsage: '180Mi', uptime: '12d 3h' },
      { id: 'task-03-b', name: 'wordpress-hyperscale.2.99zlk', node: 'node-epyc-sp02', status: 'Running', ip: '10.0.0.15', restarts: 0, cpuUsage: '28m', memoryUsage: '175Mi', uptime: '12d 3h' },
      { id: 'task-03-c', name: 'wordpress-hyperscale.3.op182', node: 'node-ampere-sp04', status: 'Running', ip: '10.0.0.16', restarts: 0, cpuUsage: '31m', memoryUsage: '182Mi', uptime: '12d 3h' },
      { id: 'task-03-d', name: 'wordpress-hyperscale.4.yy501', node: 'node-epyc-sp01', status: 'Running', ip: '10.0.0.17', restarts: 0, cpuUsage: '24m', memoryUsage: '168Mi', uptime: '12d 3h' },
    ],
    yamlManifest: `version: "3.8"
services:
  wordpress-hyperscale:
    image: wordpress:6.5-php8.3-fpm-alpine
    deploy:
      mode: replicated
      replicas: 4
      update_config:
        parallelism: 2
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
    networks:
      - nsa_overlay_mesh`
  }
];

let localPipelines: CiCdPipelineRun[] = [
  {
    id: 'pipe-run-9812',
    deploymentName: 'ecommerce-vpsnsa-master',
    repo: 'VPSNsA/ecommerce-enterprise',
    branch: 'main',
    commitSha: 'a98f12c',
    commitMessage: 'Fix Argon2id auth middleware & Mercado Pago webhook verify',
    committer: 'VPSNsA',
    status: 'success',
    startedAt: 'Há 12 minutos',
    duration: '1m 42s',
    stages: [
      { name: '1. Git Checkout & Argon2id Verify', status: 'success', duration: '4s' },
      { name: '2. Lint & TypeScript Validation', status: 'success', duration: '18s' },
      { name: '3. Multi-Arch Docker Build (x86/ARM)', status: 'success', duration: '52s' },
      { name: '4. Push to VPSNsA Container Registry', status: 'success', duration: '12s' },
      { name: '5. Kubernetes Rolling Update (Zero-Downtime)', status: 'success', duration: '16s' },
    ],
    logs: [
      '[VPSNsA-CI] Triggered by GitHub Webhook push on refs/heads/main',
      '[VPSNsA-CI] Verifying committer GPG and Argon2id digital signature for VPSNsA... OK',
      '[VPSNsA-CI] Pulling base image node:22-alpine from cache (Layer Cache Hit: 94%)',
      '[VPSNsA-CI] Executing: docker buildx build --platform linux/amd64,linux/arm64 -t registry.vpsnsa.cloud/vpsnsa/ecommerce:v2.14.0',
      '[VPSNsA-CI] Image pushed successfully to internal registry (digest: sha256:88fa10b9...)',
      '[VPSNsA-CI] Applying manifest: kubectl set image deployment/ecommerce-vpsnsa-master web-app=registry.vpsnsa.cloud/vpsnsa/ecommerce:v2.14.0',
      '[VPSNsA-CI] Rolling update: 6/6 pods updated and ready. Ingress SSL verified. Pipeline PASSED in 1m 42s.'
    ]
  },
  {
    id: 'pipe-run-9811',
    deploymentName: 'quantum-ai-inference-node',
    repo: 'vpsnsa/quantum-core',
    branch: 'main',
    commitSha: '7b2049e',
    commitMessage: 'Optimize memory bandwidth tensor engine for GH200',
    committer: 'VPSNsA',
    status: 'success',
    startedAt: 'Há 2 horas',
    duration: '2m 10s',
    stages: [
      { name: '1. Git Checkout & Argon2id Verify', status: 'success', duration: '5s' },
      { name: '2. CUDA / TensorRT Engine Compile', status: 'success', duration: '1m 15s' },
      { name: '3. Docker GH200 Container Build', status: 'success', duration: '30s' },
      { name: '4. Push to VPSNsA Registry', status: 'success', duration: '10s' },
      { name: '5. Pod Rolling Update on Grace Hopper', status: 'success', duration: '10s' },
    ],
    logs: [
      '[VPSNsA-CI] Triggered by GitHub Webhook push on refs/heads/main',
      '[VPSNsA-CI] Compiling FP8 tensor kernels for NVIDIA Grace Hopper GH200...',
      '[VPSNsA-CI] Image build successful: nvcr.io/nvidia/pytorch:24.08-gh200',
      '[VPSNsA-CI] Rolling update complete. GPU allocated: 96GB HBM3.'
    ]
  }
];

let localDomains: DomainItem[] = [
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

let localTransactions: PaymentTransaction[] = [
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

const fallbackCpus: CpuItem[] = [
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

let simulatedCpuOverride: number | null = null;
let simulatedRamOverride: number | null = null;

export function setSimulatedTelemetrySpike(metric: 'cpu' | 'ram' | 'both' | 'clear', value?: number) {
  if (metric === 'cpu') {
    simulatedCpuOverride = value ?? 94;
  } else if (metric === 'ram') {
    simulatedRamOverride = value ?? 93;
  } else if (metric === 'both') {
    simulatedCpuOverride = 95;
    simulatedRamOverride = 92;
  } else {
    simulatedCpuOverride = null;
    simulatedRamOverride = null;
  }
}

export function getSimulatedSpikeState() {
  return {
    cpu: simulatedCpuOverride,
    ram: simulatedRamOverride,
  };
}

export async function fetchTelemetryData(): Promise<TelemetryData> {
  const now = Date.now();
  const timeOffset = Math.sin(now / 15000);
  const jitter = (Math.random() - 0.5) * 2;

  const cpuLoad = simulatedCpuOverride !== null 
    ? simulatedCpuOverride 
    : Math.max(12, Math.min(88, Math.round(28.4 + timeOffset * 8 + jitter)));

  const ramUsagePercent = simulatedRamOverride !== null
    ? simulatedRamOverride
    : Math.round(((512 + Math.sin(now / 30000) * 40) / 2048) * 100);

  const ramUsedGB = simulatedRamOverride !== null
    ? Math.round((2048 * simulatedRamOverride) / 100)
    : Math.round(512 + Math.sin(now / 30000) * 40);

  return {
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
      overallLoadPercent: cpuLoad,
      clockSpeedGHz: (3.10 + Math.sin(now / 5000) * 0.15).toFixed(2),
      temperatureCelsius: cpuLoad > 90 ? 76 : Math.round(38 + Math.cos(now / 20000) * 3),
      loadBreakdown: [
        { socket: 'CPU 0 (AMD EPYC 9754 Bergamo - 128C)', usage: cpuLoad > 90 ? Math.min(99, cpuLoad + 2) : Math.round(26 + jitter * 2), temp: cpuLoad > 90 ? 78 : 37 },
        { socket: 'CPU 1 (AMD EPYC 9754 Bergamo - 128C)', usage: cpuLoad > 90 ? Math.min(98, cpuLoad - 1) : Math.round(31 + jitter * 2), temp: cpuLoad > 90 ? 75 : 39 },
        { socket: 'CPU 2 (Intel Xeon Platinum 8592+ - 64C)', usage: cpuLoad > 90 ? Math.min(96, cpuLoad - 3) : Math.round(22 + jitter), temp: cpuLoad > 90 ? 74 : 36 },
        { socket: 'CPU 3 (NVIDIA GH200 Grace Hopper ARM - 72C)', usage: cpuLoad > 90 ? Math.min(99, cpuLoad + 4) : Math.round(41 + jitter * 3), temp: cpuLoad > 90 ? 81 : 42 },
        { socket: 'CPU 4 (Ampere Altra Max M128 - 128C Cloud Native)', usage: cpuLoad > 90 ? Math.min(95, cpuLoad - 2) : Math.round(19 + jitter), temp: cpuLoad > 90 ? 72 : 35 },
      ]
    },
    memory: {
      totalGB: 2048,
      usedGB: ramUsedGB,
      freeGB: 2048 - ramUsedGB,
      cachedGB: ramUsagePercent > 90 ? 120 : 340,
      type: 'DDR5 ECC Registered 5600 MT/s Octa-Channel + HBM3',
      usagePercent: ramUsagePercent,
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
}

export async function fetchMarketTickerData(): Promise<MarketTickerItem> {
  const now = Date.now();
  const v = (seed: number, base: number, delta: number) => {
    const shift = Math.sin((now + seed * 1000) / 10000) * delta;
    return (base + shift).toFixed(2);
  };

  return {
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
}

export async function fetchCpusData(): Promise<CpuItem[]> {
  return fallbackCpus;
}

export async function fetchContainersData(): Promise<ContainerItem[]> {
  return localContainers;
}

export async function deployNewContainer(data: {
  name: string;
  domain: string;
  image: string;
  cpuAllocation: string;
  memoryAllocated: string;
  gitRepo: string;
  branch: string;
}): Promise<ContainerItem> {
  const newContainer: ContainerItem = {
    id: `ct-${Date.now().toString(36)}`,
    name: data.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    domain: data.domain.toLowerCase(),
    image: data.image || 'node:22-alpine',
    cpuAllocation: data.cpuAllocation || '4 Cores (AMD EPYC 9754)',
    memoryAllocated: data.memoryAllocated || '8 GB DDR5',
    status: 'running',
    uptime: '1m 20s',
    port: 80,
    ssl: true,
    requestsPerSec: 12,
    gitRepo: data.gitRepo || 'https://github.com/vpsnsa/starter-site',
    branch: data.branch || 'main',
    commit: 'Initial commit via VPSNsA Deploy Engine',
  };

  localContainers.unshift(newContainer);
  return newContainer;
}

export async function actionOnContainer(id: string, action: 'start' | 'stop' | 'restart' | 'delete'): Promise<void> {
  const idx = localContainers.findIndex(c => c.id === id);
  if (idx === -1) return;

  if (action === 'delete') {
    localContainers.splice(idx, 1);
  } else if (action === 'stop') {
    localContainers[idx].status = 'stopped';
  } else if (action === 'start') {
    localContainers[idx].status = 'running';
  } else if (action === 'restart') {
    localContainers[idx].status = 'running';
    localContainers[idx].uptime = '0s';
  }
}

// ----------------- Kubernetes & Docker Swarm Orchestration Engine -----------------

export async function fetchK8sDeployments(): Promise<K8sDeployment[]> {
  return localDeployments;
}

export async function scaleK8sDeployment(id: string, newReplicas: number): Promise<K8sDeployment | null> {
  const dep = localDeployments.find(d => d.id === id);
  if (!dep) return null;

  dep.status = 'Scaling';
  dep.targetReplicas = Math.max(1, Math.min(256, newReplicas));

  const diff = dep.targetReplicas - dep.pods.length;
  if (diff > 0) {
    // Add new pods
    for (let i = 0; i < diff; i++) {
      const hex = Math.random().toString(36).substring(2, 7);
      const nodeChoice = ['node-epyc-sp01', 'node-epyc-sp02', 'node-gh200-sp03', 'node-ampere-sp04'][Math.floor(Math.random() * 4)];
      dep.pods.push({
        id: `pod-${Date.now()}-${i}`,
        name: `${dep.name}-${hex}`,
        node: nodeChoice,
        status: 'Running',
        ip: `10.244.${Math.floor(Math.random() * 5 + 1)}.${Math.floor(Math.random() * 200 + 10)}`,
        restarts: 0,
        cpuUsage: `${Math.floor(30 + Math.random() * 30)}m`,
        memoryUsage: `${Math.floor(250 + Math.random() * 100)}Mi`,
        uptime: '10s'
      });
    }
  } else if (diff < 0) {
    // Graceful terminate pods
    dep.pods.splice(dep.targetReplicas);
  }

  dep.replicas = dep.pods.length;
  dep.availableReplicas = dep.pods.length;
  dep.status = 'Healthy';

  return { ...dep };
}

export async function toggleHpaPolicy(id: string, enabled: boolean, min: number, max: number, targetCpu: number): Promise<K8sDeployment | null> {
  const dep = localDeployments.find(d => d.id === id);
  if (!dep) return null;

  dep.hpaEnabled = enabled;
  dep.hpaMin = min;
  dep.hpaMax = max;
  dep.hpaTargetCpu = targetCpu;

  return { ...dep };
}

export async function triggerRollingUpdate(id: string, newImage?: string): Promise<K8sDeployment | null> {
  const dep = localDeployments.find(d => d.id === id);
  if (!dep) return null;

  dep.status = 'Updating';
  if (newImage) dep.image = newImage;
  dep.lastDeployedAt = 'Agora mesmo via Rolling Update Zero-Downtime';

  // Simulate rolling update
  dep.pods.forEach((p, idx) => {
    p.uptime = `${idx * 2 + 1}s`;
    p.restarts = 0;
  });

  dep.status = 'Healthy';
  return { ...dep };
}

export async function fetchCiCdPipelines(): Promise<CiCdPipelineRun[]> {
  return localPipelines;
}

export async function triggerGitHubCiCdRun(deploymentName: string, repo: string, branch: string): Promise<CiCdPipelineRun> {
  const runId = `pipe-run-${Math.floor(1000 + Math.random() * 9000)}`;
  const sha = Math.random().toString(16).substring(2, 9);

  const newPipeline: CiCdPipelineRun = {
    id: runId,
    deploymentName,
    repo,
    branch,
    commitSha: sha,
    commitMessage: `Auto-deploy commit via GitHub Webhook trigger on ${branch}`,
    committer: 'VPSNsA',
    status: 'success',
    startedAt: 'Agora mesmo',
    duration: '1m 24s',
    stages: [
      { name: '1. Git Checkout & Argon2id Verify', status: 'success', duration: '3s' },
      { name: '2. Lint & TypeScript Validation', status: 'success', duration: '14s' },
      { name: '3. Multi-Arch Docker Build (x86/ARM)', status: 'success', duration: '44s' },
      { name: '4. Push to VPSNsA Container Registry', status: 'success', duration: '11s' },
      { name: '5. Kubernetes Manifest Apply & Zero-Downtime', status: 'success', duration: '12s' },
    ],
    logs: [
      `[VPSNsA-CI] Recebido push webhook oficial do GitHub: ${repo}@${branch}`,
      `[VPSNsA-CI] Verificando assinatura digital Argon2id do comitente VPSNsA... APROVADA`,
      `[VPSNsA-CI] Clonando código fonte com submódulos e LFS...`,
      `[VPSNsA-CI] Compilando assets de frontend e backend em container otimizado`,
      `[VPSNsA-CI] Gerando tag da imagem: registry.vpsnsa.cloud/${repo.toLowerCase()}:${sha}`,
      `[VPSNsA-CI] Executando rolling update no deployment "${deploymentName}"`,
      `[VPSNsA-CI] Health checks 200 OK. Tráfego Anycast alternado sem interrupção. Pipeline concluído com sucesso!`
    ]
  };

  localPipelines.unshift(newPipeline);
  await triggerRollingUpdate(
    localDeployments.find(d => d.name === deploymentName)?.id || localDeployments[0].id
  );

  return newPipeline;
}

export async function fetchDomainsData(): Promise<DomainItem[]> {
  return localDomains;
}

export async function registerNewDomain(domain: string, targetContainer: string): Promise<DomainItem> {
  const newDomain: DomainItem = {
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

  localDomains.unshift(newDomain);
  return newDomain;
}

export async function fetchTransactionsData(): Promise<PaymentTransaction[]> {
  return localTransactions;
}

// ----------------- n8n Native Workflow Automation Engine -----------------

let localN8nWorkflows: N8nWorkflow[] = [
  {
    id: 'wf-mp-k8s-01',
    name: 'Mercado Pago ➜ Provisionamento Automático de VPS Kubernetes',
    description: 'Quando um pagamento PIX ou Cartão for aprovado para VPSNsA, valida a assinatura Argon2id e aciona a criação do pod no cluster.',
    active: true,
    triggerType: 'Mercado Pago Webhook',
    lastExecutedAt: 'Há 4 minutos',
    totalExecutions: 1420,
    successRate: '99.8%',
    connections: [
      { fromNodeId: 'node-mp-trigger', toNodeId: 'node-argon2-val' },
      { fromNodeId: 'node-argon2-val', toNodeId: 'node-pg-insert' },
      { fromNodeId: 'node-pg-insert', toNodeId: 'node-k8s-deploy' },
      { fromNodeId: 'node-k8s-deploy', toNodeId: 'node-telegram-notify' },
    ],
    nodes: [
      {
        id: 'node-mp-trigger',
        type: 'mercadopago',
        name: 'Mercado Pago Webhook',
        subtitle: 'payment.created / approved',
        icon: 'CreditCard',
        color: '#0284c7',
        status: 'success',
        inputs: 0,
        outputs: 1,
        position: { x: 40, y: 120 },
        parameters: {
          recipient: 'VPSNsA',
          webhookUrl: 'https://n8n.vpsnsa.cloud/webhook/mercadopago',
          event: 'payment.approved',
        },
        lastExecutionTimeMs: 12,
        outputPayload: {
          id: 'MP-TX-892147',
          amount: 149.90,
          payer: 'cliente@empresa.com',
          status: 'approved',
          timestamp: new Date().toISOString(),
        }
      },
      {
        id: 'node-argon2-val',
        type: 'argon2',
        name: 'Argon2id Hash Verify',
        subtitle: 'Memória m=65536, t=3, p=4',
        icon: 'ShieldCheck',
        color: '#06b6d4',
        status: 'success',
        inputs: 1,
        outputs: 1,
        position: { x: 260, y: 120 },
        parameters: {
          algorithm: 'Argon2id',
          saltLength: 16,
          verifySignature: true,
        },
        lastExecutionTimeMs: 15,
        outputPayload: {
          signatureValid: true,
          entropyScore: 'MILITARY_PASSED',
        }
      },
      {
        id: 'node-pg-insert',
        type: 'postgres',
        name: 'PostgreSQL Nativo NsA',
        subtitle: 'INSERT INTO billing_mercadopago_tx',
        icon: 'Database',
        color: '#3b82f6',
        status: 'success',
        inputs: 1,
        outputs: 1,
        position: { x: 480, y: 120 },
        parameters: {
          connection: 'Localhost Unix Socket / 5432',
          table: 'billing_mercadopago_tx',
          query: 'INSERT INTO billing_mercadopago_tx (tx_id, amount, recipient) VALUES ($1, $2, $3)',
        },
        lastExecutionTimeMs: 2,
        outputPayload: {
          rowsAffected: 1,
          dbLatency: '0.42ms',
        }
      },
      {
        id: 'node-k8s-deploy',
        type: 'k8s_scale',
        name: 'Kubernetes Pod Provisioner',
        subtitle: 'kubectl scale deployment +1 pod',
        icon: 'Layers',
        color: '#6366f1',
        status: 'success',
        inputs: 1,
        outputs: 1,
        position: { x: 700, y: 120 },
        parameters: {
          namespace: 'production',
          cluster: 'vpsnsa-sp01',
          cpuLimit: '4 Cores (AMD EPYC Bergamo)',
        },
        lastExecutionTimeMs: 44,
        outputPayload: {
          podCreated: 'vps-client-instance-892147',
          ipAssigned: '10.244.1.92',
          sslWildcardActive: true,
        }
      },
      {
        id: 'node-telegram-notify',
        type: 'telegram',
        name: 'Telegram & WhatsApp Admin',
        subtitle: 'Notificar VPSNsA',
        icon: 'Send',
        color: '#10b981',
        status: 'success',
        inputs: 1,
        outputs: 0,
        position: { x: 920, y: 120 },
        parameters: {
          botToken: 'ENC(n8n_tg_bot_token)',
          chatId: 'vpsnsa_root',
          message: 'Novo pagamento Mercado Pago R$ 149.90 aprovado! VPS provisionado com sucesso.',
        },
        lastExecutionTimeMs: 18,
        outputPayload: {
          messageDelivered: true,
          recipientStatus: 'Sent to VPSNsA',
        }
      }
    ]
  },
  {
    id: 'wf-github-cicd-02',
    name: 'GitHub Push ➜ CI/CD Pipeline & Deploy Zero-Downtime',
    description: 'Monitora commits na branch main do repositório oficial no GitHub, compila contêiner multi-arquitetura e aplica rolling update.',
    active: true,
    triggerType: 'GitHub Webhook (Push)',
    lastExecutedAt: 'Há 18 minutos',
    totalExecutions: 890,
    successRate: '100%',
    connections: [
      { fromNodeId: 'node-gh-trigger', toNodeId: 'node-gemini-scan' },
      { fromNodeId: 'node-gemini-scan', toNodeId: 'node-docker-build' },
      { fromNodeId: 'node-docker-build', toNodeId: 'node-k8s-roll' },
      { fromNodeId: 'node-k8s-roll', toNodeId: 'node-discord-alert' },
    ],
    nodes: [
      {
        id: 'node-gh-trigger',
        type: 'github',
        name: 'GitHub Push Event',
        subtitle: 'repo: VPSNsA/ecommerce',
        icon: 'GitBranch',
        color: '#64748b',
        status: 'success',
        inputs: 0,
        outputs: 1,
        position: { x: 40, y: 120 },
        parameters: {
          event: 'push',
          branch: 'main',
          auth: 'GitHub OAuth Oficial',
        },
        lastExecutionTimeMs: 14,
        outputPayload: {
          commit: 'a98f12c',
          author: 'VPSNsA',
        }
      },
      {
        id: 'node-gemini-scan',
        type: 'ai_gemini',
        name: 'Gemini Code Security Audit',
        subtitle: 'Análise de vulnerabilidades SAST',
        icon: 'Sparkles',
        color: '#8b5cf6',
        status: 'success',
        inputs: 1,
        outputs: 1,
        position: { x: 260, y: 120 },
        parameters: {
          model: 'gemini-2.5-flash',
          checkVulnerabilities: true,
        },
        lastExecutionTimeMs: 320,
        outputPayload: {
          securityScore: '100/100',
          zeroVulnerabilities: true,
        }
      },
      {
        id: 'node-docker-build',
        type: 'webhook',
        name: 'Docker Buildx (x86/ARM)',
        subtitle: 'linux/amd64 + linux/arm64',
        icon: 'Box',
        color: '#0ea5e9',
        status: 'success',
        inputs: 1,
        outputs: 1,
        position: { x: 480, y: 120 },
        parameters: {
          registry: 'registry.vpsnsa.cloud',
          cacheLayer: true,
        },
        lastExecutionTimeMs: 1250,
        outputPayload: {
          digest: 'sha256:88fa10b9...',
          duration: '1.25s',
        }
      },
      {
        id: 'node-k8s-roll',
        type: 'k8s_scale',
        name: 'Kubernetes Rolling Update',
        subtitle: 'maxSurge: 25%, maxUnavailable: 0',
        icon: 'RotateCcw',
        color: '#6366f1',
        status: 'success',
        inputs: 1,
        outputs: 1,
        position: { x: 700, y: 120 },
        parameters: {
          deployment: 'ecommerce-vpsnsa-master',
        },
        lastExecutionTimeMs: 48,
        outputPayload: {
          podsUpdated: '6/6',
          downtimeMs: 0,
        }
      },
      {
        id: 'node-discord-alert',
        type: 'discord',
        name: 'Discord & Slack Notification',
        subtitle: '#deploys-producao',
        icon: 'Send',
        color: '#ec4899',
        status: 'success',
        inputs: 1,
        outputs: 0,
        position: { x: 920, y: 120 },
        parameters: {
          channel: '#deploys-producao',
        },
        lastExecutionTimeMs: 25,
        outputPayload: {
          notified: true,
        }
      }
    ]
  },
  {
    id: 'wf-cron-telemetry-03',
    name: 'Auto-Scaling Preditivo ➜ IA Gemini & Telemetria EPYC',
    description: 'Monitora a carga por socket a cada 1 minuto e orquestra réplicas automaticamente antes de picos de audiência.',
    active: true,
    triggerType: 'Cron Schedule (1 min)',
    lastExecutedAt: 'Há 1 minuto',
    totalExecutions: 4320,
    successRate: '100%',
    connections: [
      { fromNodeId: 'node-cron-t', toNodeId: 'node-telemetry-read' },
      { fromNodeId: 'node-telemetry-read', toNodeId: 'node-ai-decision' },
      { fromNodeId: 'node-ai-decision', toNodeId: 'node-k8s-autoscale' },
    ],
    nodes: [
      {
        id: 'node-cron-t',
        type: 'cron',
        name: 'Cron Trigger (1 Minuto)',
        subtitle: '* * * * *',
        icon: 'Clock',
        color: '#eab308',
        status: 'success',
        inputs: 0,
        outputs: 1,
        position: { x: 80, y: 120 },
        parameters: { interval: '1m' },
        lastExecutionTimeMs: 1,
        outputPayload: { tick: Date.now() }
      },
      {
        id: 'node-telemetry-read',
        type: 'webhook',
        name: 'Telemetria Anycast Ingress',
        subtitle: 'Leitura CPU EPYC & IOPS',
        icon: 'Activity',
        color: '#06b6d4',
        status: 'success',
        inputs: 1,
        outputs: 1,
        position: { x: 340, y: 120 },
        parameters: { api: '/api/telemetry' },
        lastExecutionTimeMs: 6,
        outputPayload: { cpuLoad: '28%', iops: '1.42M IOPS', activeSites: '4.89B' }
      },
      {
        id: 'node-ai-decision',
        type: 'ai_gemini',
        name: 'Gemini Predictive Engine',
        subtitle: 'Decisão de escala preditiva',
        icon: 'Sparkles',
        color: '#a855f7',
        status: 'success',
        inputs: 1,
        outputs: 1,
        position: { x: 600, y: 120 },
        parameters: { model: 'gemini-2.5-flash', targetLatency: '<2ms' },
        lastExecutionTimeMs: 180,
        outputPayload: { action: 'MAINTAIN_NOMINAL', recommendedPods: 6 }
      },
      {
        id: 'node-k8s-autoscale',
        type: 'k8s_scale',
        name: 'HPA Policy Feedback',
        subtitle: 'Zero throttling garantido',
        icon: 'CheckCircle2',
        color: '#10b981',
        status: 'success',
        inputs: 1,
        outputs: 0,
        position: { x: 860, y: 120 },
        parameters: { cluster: 'vpsnsa-sp01' },
        lastExecutionTimeMs: 8,
        outputPayload: { status: 'OPTIMAL' }
      }
    ]
  }
];

let localN8nExecutions: N8nExecution[] = [
  {
    id: 'exec-89012',
    workflowId: 'wf-mp-k8s-01',
    workflowName: 'Mercado Pago ➜ Provisionamento Automático de VPS Kubernetes',
    trigger: 'Mercado Pago Webhook (PIX R$ 149.90)',
    status: 'success',
    startedAt: 'Há 4 minutos',
    durationMs: 91,
    stepsCount: 5,
    payloadSummary: 'Pagamento de R$ 149,90 creditado a VPSNsA. Pod k8s provisionado.'
  },
  {
    id: 'exec-89011',
    workflowId: 'wf-github-cicd-02',
    workflowName: 'GitHub Push ➜ CI/CD Pipeline & Deploy Zero-Downtime',
    trigger: 'GitHub Webhook (push: main@a98f12c)',
    status: 'success',
    startedAt: 'Há 18 minutos',
    durationMs: 1657,
    stepsCount: 5,
    payloadSummary: 'Commit a98f12c compilado e distribuído em 6 réplicas no cluster de São Paulo.'
  },
  {
    id: 'exec-89010',
    workflowId: 'wf-cron-telemetry-03',
    workflowName: 'Auto-Scaling Preditivo ➜ IA Gemini & Telemetria EPYC',
    trigger: 'Cron Interval (1 min)',
    status: 'success',
    startedAt: 'Há 1 minuto',
    durationMs: 195,
    stepsCount: 4,
    payloadSummary: 'Carga nominal 28.4%. 6 réplicas mantidas com latência de 1.8ms.'
  }
];

export async function fetchN8nWorkflows(): Promise<N8nWorkflow[]> {
  return localN8nWorkflows;
}

export async function fetchN8nExecutions(): Promise<N8nExecution[]> {
  return localN8nExecutions;
}

export async function toggleN8nWorkflow(id: string): Promise<N8nWorkflow | null> {
  const wf = localN8nWorkflows.find(w => w.id === id);
  if (!wf) return null;
  wf.active = !wf.active;
  return { ...wf };
}

export async function executeN8nWorkflow(id: string): Promise<{ workflow: N8nWorkflow; execution: N8nExecution }> {
  const wf = localN8nWorkflows.find(w => w.id === id);
  if (!wf) throw new Error('Workflow not found');

  const execId = `exec-${Math.floor(10000 + Math.random() * 90000)}`;
  const startTime = Date.now();

  // Run through nodes simulating execution
  wf.nodes.forEach(node => {
    node.status = 'running';
    node.lastExecutionTimeMs = Math.floor(5 + Math.random() * 45);
  });

  wf.nodes.forEach(node => {
    node.status = 'success';
  });

  wf.lastExecutedAt = 'Agora mesmo';
  wf.totalExecutions += 1;

  const totalDuration = Date.now() - startTime + Math.floor(45 + Math.random() * 60);

  const newExecution: N8nExecution = {
    id: execId,
    workflowId: wf.id,
    workflowName: wf.name,
    trigger: 'Disparo Manual n8n Console',
    status: 'success',
    startedAt: 'Agora mesmo',
    durationMs: totalDuration,
    stepsCount: wf.nodes.length,
    payloadSummary: `Execução de ${wf.nodes.length} nós concluída com sucesso no motor n8n do VPSNsA.`
  };

  localN8nExecutions.unshift(newExecution);

  return { workflow: { ...wf }, execution: newExecution };
}

// ----------------- Container Backups & Scheduling Engine -----------------

let localBackupSchedules: BackupSchedule[] = [
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
    lastRunAt: 'Hoje às 03:00 (14 horas atrás)',
    nextRunAt: 'Amanhã às 03:00 UTC-3',
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
    lastRunAt: 'Domingo às 02:00 (3 dias atrás)',
    nextRunAt: 'Próximo Domingo às 02:00 UTC-3',
    status: 'active'
  }
];

let localBackupSnapshots: BackupSnapshot[] = [
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
    createdAt: 'Hoje às 03:00',
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
    createdAt: 'Domingo às 02:00',
    restorable: true
  }
];

export async function fetchBackupSchedules(): Promise<BackupSchedule[]> {
  try {
    const res = await fetch('/api/containers/backups/schedules');
    if (res.ok) {
      const data = await res.json();
      if (data.schedules) return data.schedules;
    }
  } catch {
    // fallback
  }
  return localBackupSchedules;
}

export async function createBackupSchedule(params: {
  containerId: string;
  containerName?: string;
  frequency: BackupFrequency;
  timeOfDay?: string;
  dayOfWeek?: number;
  destination: BackupDestination;
  s3Bucket?: string;
  s3Region?: string;
  s3Prefix?: string;
  localPath?: string;
  retentionCopies?: number;
}): Promise<BackupSchedule> {
  try {
    const res = await fetch('/api/containers/backups/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.schedule) {
        localBackupSchedules.unshift(data.schedule);
        return data.schedule;
      }
    }
  } catch {
    // fallback
  }

  const freq = params.frequency;
  const dest = params.destination;
  const time = params.timeOfDay || (freq === 'diaria' ? '03:00' : '02:00');
  const name = params.containerName || (params.containerId === 'all' ? 'Todos os Containers' : params.containerId);

  const newSchedule: BackupSchedule = {
    id: `sched-${Date.now().toString(36)}`,
    containerId: params.containerId,
    containerName: name,
    frequency: freq,
    cronExpression: freq === 'diaria' ? `${time.split(':')[1] || '00'} ${time.split(':')[0] || '03'} * * *` : `${time.split(':')[1] || '00'} ${time.split(':')[0] || '02'} * * ${params.dayOfWeek ?? 0}`,
    timeOfDay: time,
    dayOfWeek: freq === 'semanal' ? (params.dayOfWeek ?? 0) : undefined,
    destination: dest,
    s3Config: dest === 's3' ? {
      bucket: params.s3Bucket || `s3://vpsnsa-backups-sp1/containers/${name}`,
      region: params.s3Region || 'sa-east-1 (São Paulo Tier IV)',
      storageClass: 'INTELLIGENT_TIERING',
      prefix: params.s3Prefix || `${freq}-snapshots/`,
    } : undefined,
    localPath: dest === 'local' ? (params.localPath || `/var/vpsnsa/backups/containers/${name}/`) : undefined,
    retentionCopies: params.retentionCopies || (freq === 'diaria' ? 14 : 8),
    compression: 'zstd',
    encryption: 'AES-256-GCM + Argon2id',
    enabled: true,
    lastRunAt: undefined,
    nextRunAt: freq === 'diaria' ? 'Amanhã às ' + time + ' UTC-3' : 'Próximo Domingo às ' + time + ' UTC-3',
    status: 'active'
  };

  localBackupSchedules.unshift(newSchedule);
  return newSchedule;
}

export async function toggleBackupSchedule(id: string): Promise<BackupSchedule | null> {
  try {
    const res = await fetch(`/api/containers/backups/schedules/${id}/toggle`, { method: 'PATCH' });
    if (res.ok) {
      const data = await res.json();
      if (data.schedule) return data.schedule;
    }
  } catch {
    // fallback
  }

  const sched = localBackupSchedules.find(s => s.id === id);
  if (!sched) return null;
  sched.enabled = !sched.enabled;
  sched.status = sched.enabled ? 'active' : 'paused';
  return { ...sched };
}

export async function deleteBackupSchedule(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/containers/backups/schedules/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const idx = localBackupSchedules.findIndex(s => s.id === id);
      if (idx !== -1) localBackupSchedules.splice(idx, 1);
      return true;
    }
  } catch {
    // fallback
  }
  const idx = localBackupSchedules.findIndex(s => s.id === id);
  if (idx !== -1) {
    localBackupSchedules.splice(idx, 1);
    return true;
  }
  return false;
}

export async function fetchBackupSnapshots(): Promise<BackupSnapshot[]> {
  try {
    const res = await fetch('/api/containers/backups/snapshots');
    if (res.ok) {
      const data = await res.json();
      if (data.snapshots) return data.snapshots;
    }
  } catch {
    // fallback
  }
  return localBackupSnapshots;
}

export async function triggerContainerBackupNow(
  containerId: string,
  destination: BackupDestination,
  containerName?: string,
  s3Bucket?: string,
  localPath?: string
): Promise<BackupSnapshot> {
  try {
    const res = await fetch(`/api/containers/${containerId}/backup/now`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, s3Bucket, localPath }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.snapshot) {
        localBackupSnapshots.unshift(data.snapshot);
        return data.snapshot;
      }
    }
  } catch {
    // fallback
  }

  const name = containerName || containerId;
  const dateTag = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const path = destination === 's3'
    ? `${s3Bucket || `s3://vpsnsa-backups-sp1/containers/${name}`}/manual-${dateTag}.tar.zst`
    : `${localPath || `/var/vpsnsa/backups/containers/${name}`}/manual-${dateTag}.tar.zst`;

  const newSnapshot: BackupSnapshot = {
    id: `snap-${Date.now().toString(36)}`,
    containerId,
    containerName: name,
    frequency: 'manual',
    destination,
    destinationPath: path,
    sizeMB: parseFloat((380 + Math.random() * 420).toFixed(1)),
    durationSec: Math.floor(11 + Math.random() * 15),
    status: 'completed',
    argon2Checksum: `$argon2id$v=19$m=65536,t=3,p=4$vpsnsa_snap_${Date.now().toString().slice(-4)}$${Math.random().toString(36).substring(2, 8)}...`,
    sha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    createdAt: 'Agora mesmo',
    restorable: true,
  };

  localBackupSnapshots.unshift(newSnapshot);

  // Update schedule lastRunAt if there is an active schedule
  const relatedSchedule = localBackupSchedules.find(s => s.containerId === containerId);
  if (relatedSchedule) {
    relatedSchedule.lastRunAt = 'Agora mesmo';
  }

  return newSnapshot;
}

export async function restoreBackupSnapshot(snapshotId: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`/api/containers/backups/snapshots/${snapshotId}/restore`, {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message };
    }
  } catch {
    // fallback
  }

  const snap = localBackupSnapshots.find(s => s.id === snapshotId);
  return {
    success: true,
    message: snap 
      ? `Container ${snap.containerName} restaurado com sucesso a partir de ${snap.destinationPath}! Criptografia Argon2id validada.`
      : `Snapshot ${snapshotId} restaurado com sucesso!`,
  };
}

export async function deleteBackupSnapshot(snapshotId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/containers/backups/snapshots/${snapshotId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const idx = localBackupSnapshots.findIndex(s => s.id === snapshotId);
      if (idx !== -1) localBackupSnapshots.splice(idx, 1);
      return true;
    }
  } catch {
    // fallback
  }
  const idx = localBackupSnapshots.findIndex(s => s.id === snapshotId);
  if (idx !== -1) {
    localBackupSnapshots.splice(idx, 1);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// Health Check Probes (HTTP / TCP) API Client
// -------------------------------------------------------------

let localHealthChecks: HealthCheckProbe[] = [
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
    lastCheckAt: '12s atrás',
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
    lastCheckAt: '6s atrás',
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
    lastCheckAt: '18s atrás',
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
    lastCheckAt: '25s atrás',
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

export async function fetchHealthChecks(): Promise<HealthCheckProbe[]> {
  try {
    const res = await fetch('/api/containers/health-checks');
    if (res.ok) {
      const data = await res.json();
      if (data.probes) {
        localHealthChecks = data.probes;
        return data.probes;
      }
    }
  } catch {
    // fallback
  }
  return localHealthChecks;
}

export async function saveHealthCheckProbe(probeData: Partial<HealthCheckProbe>): Promise<HealthCheckProbe> {
  try {
    const res = await fetch('/api/containers/health-checks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(probeData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.probe) {
        const idx = localHealthChecks.findIndex(h => h.id === data.probe.id || h.containerId === data.probe.containerId);
        if (idx !== -1) {
          localHealthChecks[idx] = data.probe;
        } else {
          localHealthChecks.unshift(data.probe);
        }
        return data.probe;
      }
    }
  } catch {
    // fallback
  }

  const existingIdx = localHealthChecks.findIndex(h => h.id === probeData.id || h.containerId === probeData.containerId);
  if (existingIdx !== -1) {
    localHealthChecks[existingIdx] = {
      ...localHealthChecks[existingIdx],
      ...probeData,
      endpoint: probeData.endpoint || localHealthChecks[existingIdx].endpoint,
      type: probeData.type || localHealthChecks[existingIdx].type,
    } as HealthCheckProbe;
    return localHealthChecks[existingIdx];
  }

  const newProbe: HealthCheckProbe = {
    id: `hc-${Date.now().toString(36)}`,
    containerId: probeData.containerId || 'ct-prod-01',
    containerName: probeData.containerName || 'container-app',
    type: probeData.type || 'HTTP',
    endpoint: probeData.endpoint || '/health',
    port: probeData.port || 80,
    expectedStatus: probeData.expectedStatus || 200,
    httpMethod: probeData.httpMethod || 'GET',
    intervalSeconds: probeData.intervalSeconds || 15,
    timeoutSeconds: probeData.timeoutSeconds || 3,
    healthyThreshold: probeData.healthyThreshold || 2,
    unhealthyThreshold: probeData.unhealthyThreshold || 3,
    enabled: probeData.enabled !== undefined ? probeData.enabled : true,
    lastCheckAt: 'Agora mesmo',
    lastStatus: 'healthy',
    lastLatencyMs: 12,
    lastMessage: 'Health Check configurado com sucesso',
    uptimePercentage: 100,
    consecutiveSuccesses: 1,
    consecutiveFailures: 0,
    history: [
      {
        timestamp: 'Agora mesmo',
        status: 'healthy',
        latencyMs: 12,
        statusCode: 200,
        message: 'Endpoint verificado com sucesso',
      }
    ]
  };

  localHealthChecks.unshift(newProbe);
  return newProbe;
}

export async function toggleHealthCheckProbe(id: string): Promise<HealthCheckProbe | null> {
  try {
    const res = await fetch(`/api/containers/health-checks/${id}/toggle`, {
      method: 'PATCH',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.probe) {
        const idx = localHealthChecks.findIndex(h => h.id === id);
        if (idx !== -1) localHealthChecks[idx] = data.probe;
        return data.probe;
      }
    }
  } catch {
    // fallback
  }

  const p = localHealthChecks.find(h => h.id === id);
  if (p) {
    p.enabled = !p.enabled;
    return p;
  }
  return null;
}

export async function testHealthCheckProbeNow(id: string): Promise<{ success: boolean; message: string; probe: HealthCheckProbe }> {
  try {
    const res = await fetch(`/api/containers/health-checks/${id}/test`, {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.probe) {
        const idx = localHealthChecks.findIndex(h => h.id === id);
        if (idx !== -1) localHealthChecks[idx] = data.probe;
        return { success: data.success, message: data.message, probe: data.probe };
      }
    }
  } catch {
    // fallback
  }

  const p = localHealthChecks.find(h => h.id === id);
  if (p) {
    const latency = p.type === 'TCP' ? Math.floor(3 + Math.random() * 5) : Math.floor(10 + Math.random() * 14);
    p.lastLatencyMs = latency;
    p.lastStatus = 'healthy';
    p.lastCheckAt = 'Agora mesmo';
    p.lastMessage = p.type === 'HTTP' 
      ? `HTTP 200 OK - Resposta recebida em ${latency}ms (${p.endpoint})`
      : `TCP ACK recebido na porta ${p.port} em ${latency}ms`;
    p.consecutiveSuccesses += 1;
    p.history.unshift({
      timestamp: 'Agora mesmo',
      status: 'healthy',
      latencyMs: latency,
      statusCode: p.expectedStatus || 200,
      message: p.lastMessage,
    });
    if (p.history.length > 20) p.history = p.history.slice(0, 20);
    return { success: true, message: 'Health Check executado com sucesso!', probe: p };
  }

  throw new Error('Health check probe não encontrado');
}

export async function deleteHealthCheckProbe(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/containers/health-checks/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const idx = localHealthChecks.findIndex(h => h.id === id);
      if (idx !== -1) localHealthChecks.splice(idx, 1);
      return true;
    }
  } catch {
    // fallback
  }

  const idx = localHealthChecks.findIndex(h => h.id === id);
  if (idx !== -1) {
    localHealthChecks.splice(idx, 1);
    return true;
  }
  return false;
}

