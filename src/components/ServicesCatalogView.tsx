import React, { useState, useMemo } from 'react';
import {
  Server,
  Globe,
  Globe2,
  Mail,
  Bot,
  Layers,
  Shield,
  Zap,
  CheckCircle2,
  Sparkles,
  Search,
  ArrowRight,
  Filter,
  CreditCard,
  Cpu,
  Database,
  Lock,
  Radio,
  FileCheck,
  HardDrive,
  Share2,
  Sliders,
  DollarSign,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Send,
  X
} from 'lucide-react';
import { CardCornerMarks } from './CardCornerMarks';

export interface ServiceItem {
  id: string;
  name: string;
  category: 'vps' | 'sites' | 'domains' | 'email' | 'ai' | 'others';
  categoryLabel: string;
  tagline: string;
  monthlyPrice: number;
  annualPriceMonthly: number;
  featured?: boolean;
  badge?: string;
  badgeColor?: 'cyan' | 'emerald' | 'indigo' | 'amber' | 'rose';
  specs: {
    cpu?: string;
    ram?: string;
    storage?: string;
    bandwidth?: string;
    latency?: string;
    sla?: string;
    activationTime?: string;
  };
  highlights: string[];
  description: string;
  primaryActionLabel: string;
}

interface ServicesCatalogViewProps {
  onNavigateTab: (tab: string) => void;
  onSelectPlanForPayment?: (planName: string) => void;
  visualFxMode?: 'cyber-aura' | 'neo-glass' | 'hud-contrast';
}

export const ServicesCatalogView: React.FC<ServicesCatalogViewProps> = ({
  onNavigateTab,
  onSelectPlanForPayment,
  visualFxMode = 'cyber-aura',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ServiceItem | null>(null);
  const [customDomainInput, setCustomDomainInput] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('sp1');
  const [provisioningSuccess, setProvisioningSuccess] = useState<boolean>(false);
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);

  // Catálogo Completo de Serviços de Primeiro Mundo (VPS, Sites, Domínios, E-mail & Marketing, IA Autônomo e Outros)
  const services: ServiceItem[] = [
    // 1. HOSPEDAGENS DE SERVIDOR VPS
    {
      id: 'vps-hyperscale-128c',
      name: 'VPS Hyperscale AMD EPYC Bergamo',
      category: 'vps',
      categoryLabel: 'Hospedagem VPS',
      tagline: '128 Cores Físicos com 1.8ms de Latência no Nó B3 São Paulo',
      monthlyPrice: 89.90,
      annualPriceMonthly: 69.90,
      featured: true,
      badge: 'TOP DESEMPENHO',
      badgeColor: 'cyan',
      specs: {
        cpu: 'AMD EPYC™ 9754 (8 vCPUs Dedicados 3.10 GHz)',
        ram: '32 GB DDR5 4800MHz ECC',
        storage: '500 GB NVMe Gen5 (>420k IOPS)',
        bandwidth: '40 Gbps Anycast Tráfego Ilimitado',
        latency: '1.8ms B3 SP1 GRU',
        sla: '99.999% Garantido',
        activationTime: '35 segundos'
      },
      highlights: [
        'Acesso Root Completo via SSH e Web Console',
        'Mitigação Anti-DDoS Anycast L3/L4/L7 no driver eBPF/XDP',
        'Kernel Linux 6.12-rt22 com patches RT-Preempt de baixa latência',
        'Snapshots diários e reversão instantânea em 1 clique'
      ],
      description: 'Infraestrutura de ponta desenvolvida para suportar aplicações de missão crítica, e-commerces de alto tráfego e microsserviços com estabilidade militar.',
      primaryActionLabel: 'Contratar Servidor VPS'
    },
    {
      id: 'vps-ultra-kvm',
      name: 'VPS Ultra KVM Bare-Metal Cloud',
      category: 'vps',
      categoryLabel: 'Hospedagem VPS',
      tagline: 'Isolamento de Hardware AMD SEV-SNP e Zero-Throttling',
      monthlyPrice: 169.00,
      annualPriceMonthly: 139.00,
      badge: 'ZERO-THROTTLING',
      badgeColor: 'emerald',
      specs: {
        cpu: 'AMD EPYC™ 9654 Dedicated Core (16 vCPUs)',
        ram: '64 GB DDR5 ECC Registrada',
        storage: '1.2 TB NVMe Enterprise Direct Attached',
        bandwidth: '40 Gbps Link Direto PTT/IX.br',
        latency: '1.8ms SP1 / 118ms VA1',
        sla: '99.999%',
        activationTime: '45 segundos'
      },
      highlights: [
        'Isolamento Criptográfico de Memória AMD SEV-SNP',
        '1 IP IPv4 Dedicado Limpo + Bloco IPv6 /64',
        'Virtualização KVM 100% nativa sem sobrealocação',
        'Compatível com Docker Swarm, Kubernetes e Proxmox'
      ],
      description: 'Poder de computação puro sem vizinhos ruidosos. Recursos 100% dedicados para banco de dados relacional e alta concorrência.',
      primaryActionLabel: 'Contratar KVM Dedicado'
    },
    {
      id: 'vps-gpu-neural',
      name: 'VPS GPU Neural NVIDIA GH200',
      category: 'vps',
      categoryLabel: 'Hospedagem VPS',
      tagline: 'Superchip de IA com Barramento NVLink a 900 GB/s',
      monthlyPrice: 489.00,
      annualPriceMonthly: 419.00,
      badge: 'GPU CLUSTER IA',
      badgeColor: 'indigo',
      specs: {
        cpu: '72-Core Neoverse V2 ARM + GPU Hopper 96GB HBM3',
        ram: '480 GB LPDDR5X Unificada',
        storage: '2 TB NVMe PCIe 5.0 Raided',
        bandwidth: '100 Gbps Infiniband / RoCE',
        latency: 'Ultra-Baixa Latência C2C',
        sla: '99.999%',
        activationTime: '2 minutos'
      },
      highlights: [
        'CUDA 12.8, TensorRT-LLM e PyTorch 2.5 pré-instalados',
        'Inference Engine para modelos DeepSeek, Llama 3 e Mistral',
        'Barramento ultrarrápido NVLink-C2C a 900 GB/s',
        'Ambiente pronto para fine-tuning e agentes neurais autônomos'
      ],
      description: 'A máquina definitiva para processamento de IA em tempo real, geração de conteúdo multimodal e treinamento de embeddings.',
      primaryActionLabel: 'Provisionar Cluster GPU'
    },
    {
      id: 'vps-storage-cloud',
      name: 'VPS Storage NVMe Raided Petabyte',
      category: 'vps',
      categoryLabel: 'Hospedagem VPS',
      tagline: 'Armazenamento Massivo com Throughput de 14.000 MB/s',
      monthlyPrice: 129.00,
      annualPriceMonthly: 99.00,
      badge: 'ALTA CAPACIDADE',
      badgeColor: 'amber',
      specs: {
        cpu: 'AMD Dedicated Compute 8 vCPUs',
        ram: '32 GB DDR5 ECC',
        storage: '4 TB NVMe Gen5 (Expansível até 20 TB)',
        bandwidth: 'Tráfego Ilimitado em 40 Gbps',
        latency: '1.8ms São Paulo',
        sla: '99.999%',
        activationTime: '60 segundos'
      },
      highlights: [
        'ZFS com compressão nativa LZ4 e verificação de integridade',
        'Compatibilidade 100% com API Amazon S3 / MinIO',
        'Replicação geográfica assíncrona para nós internacionais',
        'Perfeito para arquivos pesados, streaming e backups corporativos'
      ],
      description: 'Volume de dados massivo com a velocidade da tecnologia NVMe PCIe 5.0, sem gargalos de I/O em discos magnéticos antigos.',
      primaryActionLabel: 'Contratar VPS Storage'
    },

    // 2. SITES & WEB APPS
    {
      id: 'site-wordpress-turbo',
      name: 'Hospedagem WordPress & WooCommerce Turbo',
      category: 'sites',
      categoryLabel: 'Sites & Web Apps',
      tagline: 'Otimização com LiteSpeed Enterprise e Redis Object Cache',
      monthlyPrice: 24.90,
      annualPriceMonthly: 19.90,
      featured: true,
      badge: 'MAIS POPULAR',
      badgeColor: 'emerald',
      specs: {
        cpu: '4 vCPUs AMD Turbo 3.7 GHz',
        ram: '8 GB RAM Alocada',
        storage: '80 GB NVMe Gen5 SSD',
        bandwidth: 'Tráfego Ilimitado',
        latency: 'TTFB < 25ms',
        sla: '99.99%',
        activationTime: 'Instantâneo'
      },
      highlights: [
        'LiteSpeed Cache nativo com pontuação 99+ no Google PageSpeed',
        'Staging em 1 clique para testar alterações sem afetar a loja',
        'Certificado SSL Wildcard gratuito e renovação automática',
        'Migração gratuita sem interrupção de vendas'
      ],
      description: 'Turbine suas vendas e tempo de carregamento de páginas. Carregamento instantâneo que reduz o abandono de carrinho.',
      primaryActionLabel: 'Criar Hospedagem WordPress'
    },
    {
      id: 'site-jamstack-edge',
      name: 'Static & Jamstack Edge Hosting',
      category: 'sites',
      categoryLabel: 'Sites & Web Apps',
      tagline: 'Deploy Git Instantâneo para Next.js, Vite, React e Astro',
      monthlyPrice: 19.90,
      annualPriceMonthly: 14.90,
      badge: 'DEPLOY GIT',
      badgeColor: 'cyan',
      specs: {
        cpu: 'Serverless Edge Workers',
        ram: 'Memória Elástica por Requisição',
        storage: 'Deploy Ilimitado no Edge',
        bandwidth: '300+ PoPs Anycast Mundiais',
        latency: '< 10ms Global',
        sla: '99.999%',
        activationTime: '15 segundos'
      },
      highlights: [
        'Conexão direta com repositórios GitHub e GitLab',
        'Ambientes de Preview automáticos em cada Pull Request',
        'Compressão automática Brotli e otimização de imagens WebP/AVIF',
        'Headers de segurança HSTS e CSP configurados por padrão'
      ],
      description: 'Hospede aplicações modernas com performance de nível mundial. Cada commit em seu branch gera um deploy em segundos.',
      primaryActionLabel: 'Conectar Repositório Git'
    },
    {
      id: 'site-oni-creator-ai',
      name: 'Criador de Sites Soberano ONI com IA',
      category: 'sites',
      categoryLabel: 'Sites & Web Apps',
      tagline: 'Construtor Drag-and-Drop Inteligente com Criação por IA',
      monthlyPrice: 34.90,
      annualPriceMonthly: 27.90,
      badge: 'IA INTEGRADA',
      badgeColor: 'indigo',
      specs: {
        cpu: 'Motor Visual Inteligente',
        ram: 'Recursos Dedicados no Cluster',
        storage: '100 GB NVMe Storage',
        bandwidth: 'Tráfego Ilimitado',
        latency: '1.8ms Edge Brasil',
        sla: '99.99%',
        activationTime: 'Imediato'
      },
      highlights: [
        'Crie sites profissionais em 60 segundos com comandos em linguagem natural',
        'Checkout transparente integrado com Mercado Pago e PIX instantâneo',
        'Otimização SEO automatizada com Schema.org e tags OpenGraph',
        'Mais de 250 modelos modernos de primeiro mundo pré-configurados'
      ],
      description: 'Não precisa programar. Diga à IA o que sua empresa faz e o Construtor ONI gera textos, imagens e formulários prontos para faturar.',
      primaryActionLabel: 'Criar Site com IA'
    },
    {
      id: 'site-microfrontends',
      name: 'Enterprise Micro-Frontends & Containers',
      category: 'sites',
      categoryLabel: 'Sites & Web Apps',
      tagline: 'Hospedagem em Containers Docker com Balanceamento Anycast',
      monthlyPrice: 59.90,
      annualPriceMonthly: 47.90,
      badge: 'DOCKER CLOUD',
      badgeColor: 'cyan',
      specs: {
        cpu: '8 vCPUs Isoladas',
        ram: '16 GB RAM DDR5',
        storage: '150 GB NVMe Storage',
        bandwidth: 'Anycast Load Balancer',
        latency: 'Multi-Region Routing',
        sla: '99.999%',
        activationTime: '30 segundos'
      },
      highlights: [
        'Suporte nativo a Node.js, Python FastAPI, Go, Java e PHP',
        'Balanceamento de carga com roteamento de tráfego por caminho (Path-Based)',
        'Zero-downtime rolling updates integrados com Kubernetes',
        'Certificados SSL automáticos para múltiplos subdomínios'
      ],
      description: 'Para arquiteturas modernas de microsserviços. Suba múltiplos containers integrados em uma única malha de rede com alta disponibilidade.',
      primaryActionLabel: 'Lançar Containers Web'
    },

    // 3. DOMÍNIOS & DNS ANYCAST
    {
      id: 'domain-br-registration',
      name: 'Registro de Domínio Nacional .com.br',
      category: 'domains',
      categoryLabel: 'Domínios & DNS',
      tagline: 'Presença Oficial no Brasil com Registro Direto Registro.br',
      monthlyPrice: 3.58, // R$ 42,90 anualizado
      annualPriceMonthly: 3.58,
      featured: true,
      badge: 'BRASIL OFICIAL',
      badgeColor: 'emerald',
      specs: {
        cpu: 'DNS Anycast Integrado',
        ram: 'Propagação Instantânea',
        storage: 'Zonas DNS Ilimitadas',
        bandwidth: 'Proteção Anti-DDoS DNS',
        latency: '0.8s Resolução',
        sla: '100% DNS Uptime',
        activationTime: 'Ativação em 15 min'
      },
      highlights: [
        'Ativação oficial com conformidade NIC.br / Registro.br',
        'Gestão de DNS Anycast com suporte a registros A, CNAME, MX, TXT e CAA',
        'Privacidade Whois e proteção de dados cadastrais',
        'Certificado SSL Let\'s Encrypt Wildcard gratuito para sempre'
      ],
      description: 'O endereço oficial e mais confiável para empresas brasileiras. Conecte sua marca a milhões de clientes com a extensão .com.br.',
      primaryActionLabel: 'Registrar Domínio .com.br'
    },
    {
      id: 'domain-global-registration',
      name: 'Domínios Globais (.com, .cloud, .tech, .ai, .io)',
      category: 'domains',
      categoryLabel: 'Domínios & DNS',
      tagline: 'Alcance Global em Mais de 400 TLDs Internacionais',
      monthlyPrice: 4.99, // R$ 59,90 anualizado
      annualPriceMonthly: 4.99,
      badge: 'INTERNACIONAL',
      badgeColor: 'cyan',
      specs: {
        cpu: 'DNSSEC Ativo',
        ram: 'Anycast Global 9 Nós',
        storage: 'Subdomínios Ilimitados',
        bandwidth: '100 Gbps Rede DNS',
        latency: '< 5ms Mundial',
        sla: '100% Uptime',
        activationTime: 'Imediato (60s)'
      },
      highlights: [
        'Ativação instantânea em nível internacional',
        'Assinatura criptográfica DNSSEC contra envenenamento de cache',
        'Bloqueio de transferência contra sequestro de domínios (Domain Lock)',
        'Redirecionamento de URL e e-mail com 1 clique'
      ],
      description: 'Expanda suas fronteiras comerciais para o mercado mundial com extensões de autoridade (.com, .cloud, .tech, .ai, .io, .dev).',
      primaryActionLabel: 'Registrar Domínio Global'
    },
    {
      id: 'dns-anycast-enterprise',
      name: 'DNS Anycast Soberano de Alta Performance',
      category: 'domains',
      categoryLabel: 'Domínios & DNS',
      tagline: 'Resolução em Menos de 0.8s em 9 Hubs Mundiais',
      monthlyPrice: 9.90,
      annualPriceMonthly: 7.90,
      badge: 'PROPAGAÇÃO 0.8s',
      badgeColor: 'cyan',
      specs: {
        cpu: 'BGP Anycast Routing',
        ram: 'Cache em Memória RAM',
        storage: 'Registros Ilimitados',
        bandwidth: 'Mitigação DDoS 940 Tbps',
        latency: '0.8s Brasil / 3ms Global',
        sla: '100% Disponibilidade',
        activationTime: 'Tempo Real'
      },
      highlights: [
        'Roteamento inteligente que responde pelo datacenter mais próximo do usuário',
        'Failover de DNS automático (Health Check de servidores com troca de IP em 5s)',
        'Exportação e importação de zonas em formato BIND padrão',
        'Histórico de alterações e auditoria de registros com logs em tempo real'
      ],
      description: 'A espinha dorsal da velocidade do seu site. Garanta que visitantes encontrem seus servidores na fração de um milissegundo.',
      primaryActionLabel: 'Ativar DNS Anycast'
    },

    // 4. E-MAIL & MARKETING
    {
      id: 'email-soberano-pro',
      name: 'E-mail Corporativo Soberano (ONI Mail)',
      category: 'email',
      categoryLabel: 'E-mail & Marketing',
      tagline: 'Caixas Postais com Domínio Próprio e Reputação Estelar',
      monthlyPrice: 14.90,
      annualPriceMonthly: 11.90,
      featured: true,
      badge: '100% ENTREGABILIDADE',
      badgeColor: 'emerald',
      specs: {
        cpu: 'Filtro Heurístico Zero-Trust',
        ram: 'Aceleração de Busca IMAP',
        storage: '25 GB por Caixa Postal',
        bandwidth: 'Tráfego Criptografado TLS 1.3',
        latency: 'Entrega em < 2s',
        sla: '99.99%',
        activationTime: '60 segundos'
      },
      highlights: [
        'Configuração 100% blindada com chaves SPF, DKIM e DMARC automáticas',
        'Antispam e Antivírus alimentado por IA para bloquear phishing e malware',
        'Webmail responsivo de última geração estilo Gmail / Outlook',
        'Sincronização instantânea com iOS Mail, Android, Outlook e Thunderbird'
      ],
      description: 'Passe credibilidade profissional aos seus clientes usando contato@suaempresa.com.br em vez de serviços genéricos gratuitos.',
      primaryActionLabel: 'Criar Caixas de E-mail'
    },
    {
      id: 'email-marketing-massa',
      name: 'Disparador de E-mail Marketing em Massa',
      category: 'email',
      categoryLabel: 'E-mail & Marketing',
      tagline: '500.000 Envios por Hora com Pool de IPs Aquecidos',
      monthlyPrice: 79.90,
      annualPriceMonthly: 62.90,
      badge: 'ALTA ESCALA',
      badgeColor: 'indigo',
      specs: {
        cpu: 'Cluster de Envio SMTP Dedicado',
        ram: 'Fila Redis em Memória',
        storage: 'Listas e Leads Ilimitados',
        bandwidth: 'Pool de IPs Dedicados',
        latency: '500k disparos/h',
        sla: '99.95%',
        activationTime: 'Imediato'
      },
      highlights: [
        'IPs limpos e aquecidos com máxima taxa de entrega na Caixa de Entrada',
        'Editor de templates responsivos com suporte a tags dinâmicas e variáveis',
        'Métricas em tempo real: aberturas, cliques, bounces e descadastros',
        'API REST e Webhooks para integração com plataformas de e-commerce e CRM'
      ],
      description: 'Envie newsletters, promoções e comunicados importantes em massa com a certeza de que cairão na caixa de entrada dos seus clientes.',
      primaryActionLabel: 'Contratar Disparador'
    },
    {
      id: 'email-automacao-funil',
      name: 'Automação de Funis de Nutrição & WhatsApp',
      category: 'email',
      categoryLabel: 'E-mail & Marketing',
      tagline: 'Régua de Relacionamento Multicanal Integrada com n8n',
      monthlyPrice: 49.90,
      annualPriceMonthly: 39.90,
      badge: 'AUTOMAÇÃO TOTAL',
      badgeColor: 'amber',
      specs: {
        cpu: 'Motor de Gatilhos em Tempo Real',
        ram: 'Execução Assíncrona',
        storage: 'Histórico de Interações 1 Ano',
        bandwidth: 'Conexão API WhatsApp / SMTP',
        latency: 'Reação em < 500ms',
        sla: '99.99%',
        activationTime: '30 segundos'
      },
      highlights: [
        'Recuperação automática de carrinho abandonado por e-mail e WhatsApp',
        'Segmentação avançada por comportamento de compra e pontuação de lead (Lead Scoring)',
        'Testes A/B inteligentes com auto-seleção da mensagem vencedora',
        'Integração direta com o módulo de n8n Workflows do Cluster NsA'
      ],
      description: 'Transforme leads em compradores no piloto automático com mensagens personalizadas enviadas no momento exato.',
      primaryActionLabel: 'Configurar Automação'
    },

    // 5. IA AUTÔNOMO & AGENTES
    {
      id: 'ai-nsa-sentinel',
      name: 'NsA Agente — Sentinela Cibernética 24/7',
      category: 'ai',
      categoryLabel: 'IA Autônomo',
      tagline: 'Cérebro Central de Combate Cibernético e Anti-Invasão',
      monthlyPrice: 0.00, // Incluso nativamente
      annualPriceMonthly: 0.00,
      featured: true,
      badge: 'INCLUSO NO CLUSTER',
      badgeColor: 'cyan',
      specs: {
        cpu: 'Rede Neural Autônoma 24/7',
        ram: 'Memória Episódica Criptografada',
        storage: 'Logs de Auditoria em Tempo Real',
        bandwidth: 'Deep Packet Inspection (DPI)',
        latency: '< 12ms Tempo de Reação',
        sla: '100% Vigilância Contínua',
        activationTime: 'Ativo 24/7'
      },
      highlights: [
        'Bloqueio ativo contra força bruta na porta SSH (22) e portas de gerência',
        'Mitigação preventiva contra SQL Injection, XSS, SSRF e RCE em tempo real',
        'Auditoria contínua do sistema operacional com live kernel patching (kpatch)',
        'Comandos de mitigação instantâneos e relatórios executivos sob sigilo absoluto'
      ],
      description: 'O guardião soberano da sua infraestrutura. Atua em segundo plano 24 horas por dia identificando e neutralizando ataques antes que afetem suas operações.',
      primaryActionLabel: 'Abrir Painel do Agente'
    },
    {
      id: 'ai-omnichannel-agent',
      name: 'Agente de Vendas & Atendimento Omnichannel',
      category: 'ai',
      categoryLabel: 'IA Autônomo',
      tagline: 'Atendente Inteligente para WhatsApp, Site e Telegram',
      monthlyPrice: 99.90,
      annualPriceMonthly: 79.90,
      badge: 'FECHAMENTO VENDAS',
      badgeColor: 'emerald',
      specs: {
        cpu: 'Modelo LLM Multimodal',
        ram: 'Contexto de 128k Tokens',
        storage: 'Base de Conhecimento Vetorial',
        bandwidth: 'Multi-Canal Simultâneo',
        latency: '< 1.2s Tempo de Resposta',
        sla: '99.95%',
        activationTime: 'Imediato'
      },
      highlights: [
        'Responde dúvidas sobre produtos, estoque e preços em linguagem natural fluida',
        'Gera chave PIX e link de pagamento Mercado Pago diretamente na conversa',
        'Transfere para atendentes humanos quando necessário com resumo prévio',
        'Atende centenas de clientes simultaneamente sem fila de espera'
      ],
      description: 'Seu melhor vendedor nunca dorme. Aumente sua conversão atendendo clientes instantaneamente no WhatsApp a qualquer hora do dia ou da noite.',
      primaryActionLabel: 'Conectar Agente Omnichannel'
    },
    {
      id: 'ai-rag-pgvector',
      name: 'Pipeline Neural RAG com PostgreSQL pgvector',
      category: 'ai',
      categoryLabel: 'IA Autônomo',
      tagline: 'Busca Semântica e Memória de Longo Prazo em Dados Corporativos',
      monthlyPrice: 89.90,
      annualPriceMonthly: 69.90,
      badge: 'RAG CORPORATIVO',
      badgeColor: 'indigo',
      specs: {
        cpu: 'PostgreSQL 17 com Aceleração AVX-512',
        ram: 'Índices HNSW em RAM',
        storage: 'Milhões de Vetores de Embedding',
        bandwidth: 'Conexão Privada na Malha VPS',
        latency: '< 15ms Busca Vetorial',
        sla: '99.999%',
        activationTime: '40 segundos'
      },
      highlights: [
        'Indexação inteligente de PDFs, contratos, planilhas e bancos de conhecimento',
        'Busca semântica aproximada de alta precisão com algoritmos HNSW e IVFFlat',
        'Total privacidade: seus dados corporativos nunca são utilizados para treinar modelos públicos',
        'SDK e endpoints prontos para integração com Node.js, Python e n8n'
      ],
      description: 'Permita que sua IA consulte instantaneamente manuais, políticas internas e históricos de clientes para fornecer respostas 100% corretas e fundamentadas.',
      primaryActionLabel: 'Criar Banco Vetorial'
    },

    // 6. OUTROS SERVIÇOS & SEGURANÇA
    {
      id: 'other-cdn-anycast',
      name: 'CDN Global Anycast Edge Network',
      category: 'others',
      categoryLabel: 'Outros Serviços',
      tagline: 'Mais de 300 Pontos de Presença Globais com HTTP/3 e Brotli',
      monthlyPrice: 29.90,
      annualPriceMonthly: 22.90,
      badge: 'ACELERAÇÃO 400%',
      badgeColor: 'cyan',
      specs: {
        cpu: '300+ PoPs Anycast',
        ram: 'SSD Caching de Borda',
        storage: 'Cache Estático Ilimitado',
        bandwidth: 'Redução de 80% na Origem',
        latency: '< 10ms no Usuário Final',
        sla: '99.999%',
        activationTime: 'Ativação em 10s'
      },
      highlights: [
        'Acelera o carregamento de imagens, vídeos e scripts estáticos em até 400%',
        'Protege o servidor de origem contra picos de tráfego e ataques volumétricos',
        'Otimização dinâmica de imagens e conversão automática para WebP e AVIF',
        'Web Application Firewall (WAF) com regras OWASP Top 10 ativadas'
      ],
      description: 'Coloque o conteúdo do seu site fisicamente perto de cada visitante no mundo todo, garantindo carregamento instantâneo em qualquer conexão.',
      primaryActionLabel: 'Ativar CDN Global'
    },
    {
      id: 'other-managed-database',
      name: 'Banco Gerenciado PostgreSQL 17 + Redis Cloud',
      category: 'others',
      categoryLabel: 'Outros Serviços',
      tagline: 'Alta Concorrência com Failover Automático em 200ms',
      monthlyPrice: 49.90,
      annualPriceMonthly: 39.90,
      badge: 'POSTGRES 17',
      badgeColor: 'emerald',
      specs: {
        cpu: '4 vCPUs Dedicadas ao Motor SQL',
        ram: '16 GB RAM com PgBouncer',
        storage: '250 GB NVMe Gen5 (>420k IOPS)',
        bandwidth: 'Conexão Privada Criptografada',
        latency: '0.4ms Local Cluster',
        sla: '99.999%',
        activationTime: '30 segundos'
      },
      highlights: [
        'PostgreSQL 17 de alta performance com extensões PostGIS, pgvector e pg_stat_statements',
        'Réplicas de leitura integradas com balanceamento automático de consultas',
        'Backups contínuos com Point-in-Time Recovery (PITR) a cada segundo',
        'Instância Redis Enterprise em cache de memória incluída no mesmo cluster'
      ],
      description: 'Esqueça a dor de cabeça de configurar bancos de dados manualmente. Deixe atualizações, réplicas e segurança sob nossa supervisão 24/7.',
      primaryActionLabel: 'Criar Cluster de Banco'
    },
    {
      id: 'other-quantum-backup',
      name: 'Backup Quântico Imutável NVMe Geo-Redundante',
      category: 'others',
      categoryLabel: 'Outros Serviços',
      tagline: 'Snapshots a Cada 15 Minutos com Retenção Tripla WORM',
      monthlyPrice: 19.90,
      annualPriceMonthly: 14.90,
      badge: 'ANTI-RANSOMWARE',
      badgeColor: 'amber',
      specs: {
        cpu: 'Desduplicação de Dados ZFS',
        ram: 'Compressão em Tempo Real',
        storage: 'Espaço Conforme o Plano',
        bandwidth: 'Link Dedicado de Backup',
        latency: 'Snapshots em 2s',
        sla: '100% Integridade de Dados',
        activationTime: 'Imediato'
      },
      highlights: [
        'Tecnologia WORM (Write Once, Read Many): arquivos imunes a exclusão por ransomware',
        'Cópia geo-redundante sincronizada em 3 continentes (Brasil, EUA e Europa)',
        'Restauração de servidores e bancos de dados inteiros em menos de 60 segundos',
        'Relatórios diários de integridade SHA-256 enviados para seu e-mail'
      ],
      description: 'O seguro definitivo para a continuidade do seu negócio. Seus dados protegidos contra qualquer falha humana, pane de software ou invasão.',
      primaryActionLabel: 'Contratar Backup Quântico'
    },
    {
      id: 'other-zerotrust-audit',
      name: 'Blindagem & Auditoria Zero-Trust Enterprise',
      category: 'others',
      categoryLabel: 'Outros Serviços',
      tagline: 'Varredura de Vulnerabilidades e Relatórios de Conformidade',
      monthlyPrice: 119.00,
      annualPriceMonthly: 95.00,
      badge: 'PCI-DSS & FIPS',
      badgeColor: 'rose',
      specs: {
        cpu: 'Scanner Heurístico Contínuo',
        ram: 'Inspeção de Memória em Hardware',
        storage: 'Relatórios Criptografados',
        bandwidth: 'Monitoramento de Portas 24/7',
        latency: 'Auditoria Diária',
        sla: '100% Proteção Zero-Trust',
        activationTime: '24 horas'
      },
      highlights: [
        'Varreduras diárias de portas, certificados SSL e dependências de software',
        'Assinatura criptográfica de auditoria com algoritmo de nível bancário Argon2id',
        'Selo oficial de segurança para exibir em seu site e aumentar a confiança dos clientes',
        'Relatórios técnicos detalhados com orientações práticas para a equipe de TI'
      ],
      description: 'Atenda aos mais rígidos padrões de conformidade da indústria e garanta que sua empresa opere sob uma fortaleza cibernética impenetrável.',
      primaryActionLabel: 'Iniciar Auditoria de Segurança'
    }
  ];

  // Filtro por categoria e busca em tempo real
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      const matchesSearch = 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  // Contagem por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: services.length,
      vps: 0,
      sites: 0,
      domains: 0,
      email: 0,
      ai: 0,
      others: 0
    };
    services.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [services]);

  const handleOpenProvisionModal = (service: ServiceItem) => {
    setSelectedServiceForModal(service);
    setProvisioningSuccess(false);
    setIsProvisioning(false);
    setCustomDomainInput('');
  };

  const handleExecuteProvision = () => {
    setIsProvisioning(true);
    setTimeout(() => {
      setIsProvisioning(false);
      setProvisioningSuccess(true);
    }, 1400);
  };

  const handleProceedToPayment = () => {
    if (selectedServiceForModal) {
      if (onSelectPlanForPayment) {
        onSelectPlanForPayment(selectedServiceForModal.name);
      }
      setSelectedServiceForModal(null);
      onNavigateTab('payments');
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none pb-12">
      
      {/* 1. HERO BANNER DO CATÁLOGO DE SERVIÇOS & HOSPEDAGENS */}
      <section className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-hidden shadow-2xl backdrop-blur-md">
        <CardCornerMarks showLaserBeam={true} showGlare={true} glowColor="cyan" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Catálogo Global de Soluções Soberanas
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold hidden sm:inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 23 Serviços Ativos no Cluster
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Hospedagens VPS, Sites, Domínios, E-mail & IA Autônomo
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 leading-relaxed">
              Infraestrutura de alta performance com hardware AMD EPYC™ 128C, rede Anycast com 1.8ms no Brasil (B3 SP1), criptografia de nível bancário Argon2id e blindagem contra invasões ativada 24/7.
            </p>
          </div>

          {/* Toggle de Ciclo de Faturamento (Mensal vs Anual com Desconto) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shrink-0">
            <span className="text-[11px] font-mono text-slate-400 px-2">Faturamento:</span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold font-mono transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Anual</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-400 text-slate-950 font-black">
                  -22% OFF
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Filtros por Categoria e Busca Rápida */}
        <div className="relative z-10 mt-5 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {[
              { id: 'all', label: 'Todos os Serviços', icon: Layers },
              { id: 'vps', label: 'Hospedagem VPS', icon: Server },
              { id: 'sites', label: 'Sites & Web', icon: Globe },
              { id: 'domains', label: 'Domínios & DNS', icon: Globe2 },
              { id: 'email', label: 'E-mail & Marketing', icon: Mail },
              { id: 'ai', label: 'IA Autônomo', icon: Bot },
              { id: 'others', label: 'Outros & Segurança', icon: Shield },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = selectedCategory === tab.id;
              const count = categoryCounts[tab.id] || 0;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono whitespace-nowrap transition-all border shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/80 ring-1 ring-cyan-500/30 shadow-md'
                      : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-cyan-400/30 text-cyan-200' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar serviço, recurso ou tecnologia..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </section>

      {/* 2. GRID DE SERVIÇOS COM EFEITOS VISUAIS DE PRIMEIRO MUNDO */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 items-stretch">
        {filteredServices.map(service => {
          const priceToShow = billingCycle === 'annual' ? service.annualPriceMonthly : service.monthlyPrice;
          const isFree = service.monthlyPrice === 0;

          return (
            <div
              key={service.id}
              className={`group bg-slate-900/90 border border-slate-800 hover:border-cyan-400/60 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xl backdrop-blur-md transition-all duration-200 relative overflow-hidden ${
                service.featured ? 'ring-1 ring-cyan-500/30' : ''
              }`}
            >
              <CardCornerMarks showLaserBeam={service.featured} showGlare={true} glowColor={service.badgeColor || 'cyan'} />

              {/* Topo do Card: Categoria, Nome e Badge */}
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    {service.categoryLabel}
                  </span>

                  {service.badge && (
                    <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      service.badgeColor === 'emerald'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                        : service.badgeColor === 'indigo'
                        ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700'
                        : service.badgeColor === 'amber'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                        : service.badgeColor === 'rose'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                        : 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
                    }`}>
                      {service.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-cyan-200 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-0.5 line-clamp-2">
                  {service.tagline}
                </p>

                {/* Preço de Primeiro Mundo com Alta Visibilidade */}
                <div className="mt-3.5 p-2.5 rounded-lg bg-slate-950/90 border border-slate-800/90 flex items-baseline justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {isFree ? 'INVESTIMENTO' : billingCycle === 'annual' ? 'PLANO ANUAL (-22%)' : 'VALOR MENSAL'}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      {isFree ? (
                        <span className="text-lg font-black text-emerald-400">INCLUSO NATIVO</span>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-slate-400">R$</span>
                          <span className="text-xl sm:text-2xl font-black text-white tracking-tight text-glow-cyan">
                            {priceToShow.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">/mês</span>
                        </>
                      )}
                    </div>
                  </div>

                  {service.specs.activationTime && (
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 uppercase block">Ativação</span>
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center justify-end gap-1">
                        <Zap className="w-3 h-3" /> {service.specs.activationTime}
                      </span>
                    </div>
                  )}
                </div>

                {/* Especificações Técnicas em Alta Definição */}
                <div className="grid grid-cols-2 gap-1.5 mt-3 text-[11px] font-mono">
                  {service.specs.cpu && (
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80 flex items-center gap-1.5 truncate">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-slate-200 truncate">{service.specs.cpu.split('(')[0]}</span>
                    </div>
                  )}
                  {service.specs.ram && (
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80 flex items-center gap-1.5 truncate">
                      <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="text-slate-200 truncate">{service.specs.ram}</span>
                    </div>
                  )}
                  {service.specs.storage && (
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80 flex items-center gap-1.5 truncate">
                      <HardDrive className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-slate-200 truncate">{service.specs.storage}</span>
                    </div>
                  )}
                  {service.specs.latency && (
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80 flex items-center gap-1.5 truncate">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-200 truncate">{service.specs.latency}</span>
                    </div>
                  )}
                </div>

                {/* Destaques Técnicos Exclusivos */}
                <div className="mt-3.5 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Recursos Inclusos:
                  </span>
                  {service.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões de Ação na Base do Card */}
              <div className="relative z-10 pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenProvisionModal(service)}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-cyan-500/20 active:scale-[0.99] cursor-pointer"
                >
                  <span>{service.primaryActionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (service.category === 'vps' || service.category === 'others') {
                      onNavigateTab('payments');
                    } else if (service.category === 'domains') {
                      onNavigateTab('domains');
                    } else if (service.category === 'sites') {
                      onNavigateTab('containers');
                    } else if (service.category === 'ai') {
                      onNavigateTab('terminal');
                    } else {
                      onNavigateTab('dashboard');
                    }
                  }}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Ver Detalhes Técnicos"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </section>

      {/* CASO A BUSCA NÃO RETORNE RESULTADOS */}
      {filteredServices.length === 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <Search className="w-8 h-8 text-slate-500" />
          <h3 className="text-base font-bold text-white">Nenhum serviço encontrado</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Não encontramos resultados para "{searchQuery}". Tente buscar por outros termos como "VPS", "WordPress", "Domínio", "E-mail" ou "IA".
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold font-mono transition-colors"
          >
            Limpar Filtros e Ver Todos
          </button>
        </div>
      )}

      {/* 3. MODAL INTERATIVO DE PROVISIONAMENTO E CONTRATAÇÃO IMEDIATA */}
      {selectedServiceForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden font-sans">
            <CardCornerMarks showLaserBeam={true} showGlare={true} glowColor="cyan" />

            <div className="relative z-10 flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {selectedServiceForModal.name}
                  </h3>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {selectedServiceForModal.categoryLabel} · Ativação em {selectedServiceForModal.specs.activationTime}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedServiceForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal de Provisionamento */}
            <div className="relative z-10 py-4 space-y-4">
              {!provisioningSuccess ? (
                <>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedServiceForModal.description}
                  </p>

                  {/* Seleção do Nó Central de Borda */}
                  <div>
                    <label className="text-[11px] font-mono font-bold text-slate-300 uppercase block mb-1.5">
                      Nó Geográfico de Datacenter:
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      {[
                        { id: 'sp1', label: 'B3 SP1 (São Paulo)', latency: '1.8ms', flag: '🇧🇷' },
                        { id: 'va1', label: 'VA1 (Virgínia EUA)', latency: '118ms', flag: '🇺🇸' },
                        { id: 'fra1', label: 'FRA1 (Frankfurt)', latency: '142ms', flag: '🇩🇪' },
                      ].map(region => (
                        <button
                          key={region.id}
                          type="button"
                          onClick={() => setSelectedRegion(region.id)}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            selectedRegion === region.id
                              ? 'bg-cyan-500/20 border-cyan-400 text-white ring-1 ring-cyan-500/30'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="font-bold">{region.flag} {region.label.split(' ')[0]}</div>
                          <div className="text-[10px] text-cyan-400 mt-0.5">{region.latency}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nome do Hostname / Domínio Personalizado */}
                  <div>
                    <label className="text-[11px] font-mono font-bold text-slate-300 uppercase block mb-1.5">
                      Hostname ou Domínio Desejado:
                    </label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden focus-within:border-cyan-400">
                      <input
                        type="text"
                        value={customDomainInput}
                        onChange={(e) => setCustomDomainInput(e.target.value)}
                        placeholder="minha-empresa-vps"
                        className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
                      />
                      <span className="px-3 text-xs font-mono text-slate-500 bg-slate-900 border-l border-slate-800 py-2">
                        .vpsnsa.com.br
                      </span>
                    </div>
                  </div>

                  {/* Resumo do Valor */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/90 flex items-center justify-between font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total a Faturar:</span>
                      <span className="text-lg font-black text-white">
                        {selectedServiceForModal.monthlyPrice === 0
                          ? 'Incluso no Cluster'
                          : `R$ ${(billingCycle === 'annual' ? selectedServiceForModal.annualPriceMonthly : selectedServiceForModal.monthlyPrice).toFixed(2).replace('.', ',')} /mês`}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800">
                      SSL Wildcard + Anti-DDoS Incluso
                    </span>
                  </div>

                  {/* Botões do Modal */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExecuteProvision}
                      disabled={isProvisioning}
                      className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isProvisioning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Provisionando no Cluster...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-emerald-200" />
                          <span>Ativar Imediatamente no Cluster</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      <span>Ir para Pagamento PIX</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Sucesso no Provisionamento */
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-white">
                    Serviço Provisionado com Sucesso!
                  </h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto font-mono">
                    O nó <strong className="text-cyan-400">B3 SP1 (São Paulo)</strong> alocou os recursos dedicados para <strong className="text-white">{customDomainInput || 'instancia-cloud'}.vpsnsa.com.br</strong> com blindagem Argon2id.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedServiceForModal(null);
                        onNavigateTab('containers');
                      }}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold font-mono transition-colors"
                    >
                      Ver no Painel de Containers
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedServiceForModal(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold font-mono transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
