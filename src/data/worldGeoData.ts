// Geographic data for d3 SVG world mapping, VPS nodes, and probe regions
export interface GeoFeaturePolygon {
  id: string;
  name: string;
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface VpsDatacenterNode {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  region: string;
  coordinates: [number, number]; // [longitude, latitude]
  hardware: string;
  tier: string;
  bandwidth: string;
  capacityGbe: number;
  uptimeSla: string;
  isPrimaryCore?: boolean;
}

export interface LatencyProbeRegion {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  continent: 'South America' | 'North America' | 'Europe' | 'Asia' | 'Oceania' | 'Africa' | 'Middle East';
  coordinates: [number, number]; // [longitude, latitude]
  tier1Provider: string;
  subseaCable: string;
  // Base latency (ms) to each VPS node
  baseLatencies: Record<string, number>;
}

export interface SubseaFiberRoute {
  id: string;
  name: string;
  fromNodeId: string;
  toNodeId: string;
  coordinates: [number, number][]; // [lon, lat] sequence
  capacityTbps: number;
  rttBaselineMs: number;
  operator: string;
}

// 1. Continentes do Mundo em Polígonos GeoJSON (coordenadas [lon, lat])
export const WORLD_CONTINENTS_GEOJSON: GeoFeaturePolygon[] = [
  // América do Norte
  {
    id: 'north-america',
    name: 'North America',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-168, 65], [-160, 71], [-140, 70], [-125, 75], [-100, 75], [-80, 70],
        [-65, 60], [-55, 52], [-65, 44], [-75, 35], [-80, 25], [-97, 26],
        [-88, 21], [-82, 9], [-77, 8], [-85, 13], [-95, 16], [-105, 20],
        [-110, 23], [-117, 32], [-124, 40], [-125, 50], [-135, 57], [-150, 60],
        [-165, 60], [-168, 65]
      ]]
    }
  },
  // América Central e México
  {
    id: 'central-america',
    name: 'Central America & Caribbean',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-105, 20], [-97, 26], [-88, 21], [-82, 9], [-77, 8], [-85, 13],
        [-95, 16], [-105, 20]
      ]]
    }
  },
  // Groenlândia
  {
    id: 'greenland',
    name: 'Greenland',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-50, 83], [-20, 82], [-18, 76], [-28, 70], [-40, 60], [-50, 60],
        [-55, 68], [-58, 76], [-50, 83]
      ]]
    }
  },
  // América do Sul
  {
    id: 'south-america',
    name: 'South America',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-77, 8], [-72, 12], [-60, 9], [-50, 2], [-35, -5], [-35, -10],
        [-39, -15], [-41, -22], [-48, -28], [-53, -33], [-58, -38], [-65, -45],
        [-67, -55], [-73, -53], [-75, -44], [-72, -37], [-70, -28], [-78, -10],
        [-81, -4], [-77, 8]
      ]]
    }
  },
  // Europa
  {
    id: 'europe',
    name: 'Europe',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9, 36], [-9, 43], [-1, 46], [-5, 48], [3, 51], [8, 54], [10, 58],
        [6, 62], [14, 68], [28, 71], [40, 67], [50, 60], [40, 50], [30, 46],
        [25, 40], [20, 37], [14, 38], [5, 43], [0, 40], [-5, 36], [-9, 36]
      ]]
    }
  },
  // Reino Unido e Irlanda
  {
    id: 'uk-ireland',
    name: 'United Kingdom & Ireland',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-10, 51], [-6, 50], [-1, 51], [1, 53], [-2, 58], [-5, 59],
        [-8, 55], [-10, 51]
      ]]
    }
  },
  // África
  {
    id: 'africa',
    name: 'Africa',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-6, 36], [10, 37], [25, 32], [32, 31], [35, 27], [43, 13],
        [51, 11], [42, 0], [40, -10], [35, -24], [28, -33], [20, -34],
        [15, -28], [12, -17], [10, 2], [3, 5], [-5, 5], [-15, 11],
        [-17, 15], [-17, 21], [-13, 28], [-6, 36]
      ]]
    }
  },
  // Madagascar
  {
    id: 'madagascar',
    name: 'Madagascar',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [44, -13], [50, -13], [50, -25], [44, -25], [44, -13]
      ]]
    }
  },
  // Ásia Continental
  {
    id: 'asia',
    name: 'Asia',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [40, 67], [60, 73], [80, 73], [105, 77], [130, 72], [170, 66],
        [180, 65], [172, 60], [160, 52], [140, 50], [130, 42], [120, 35],
        [118, 25], [108, 18], [105, 10], [100, 2], [90, 22], [80, 10],
        [74, 15], [68, 24], [60, 25], [55, 26], [48, 30], [35, 32],
        [35, 42], [45, 45], [50, 60], [40, 67]
      ]]
    }
  },
  // Japão
  {
    id: 'japan',
    name: 'Japan Archipelago',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [130, 31], [132, 34], [139, 35], [141, 41], [145, 44], [141, 45],
        [139, 41], [136, 36], [131, 33], [130, 31]
      ]]
    }
  },
  // Sudeste Asiático / Indonésia / Filipinas
  {
    id: 'southeast-asia-islands',
    name: 'Southeast Asia Maritime',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [95, 5], [106, -6], [115, -8], [125, -9], [130, -3], [126, 6],
        [120, 15], [118, 5], [105, -2], [95, 5]
      ]]
    }
  },
  // Austrália
  {
    id: 'australia',
    name: 'Australia',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [114, -22], [125, -14], [135, -12], [142, -11], [148, -20], [153, -28],
        [150, -37], [140, -38], [130, -32], [115, -34], [114, -22]
      ]]
    }
  },
  // Nova Zelândia
  {
    id: 'new-zealand',
    name: 'New Zealand',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [167, -46], [174, -41], [178, -38], [175, -35], [172, -40], [168, -44],
        [167, -46]
      ]]
    }
  }
];

// 2. Nós de Datacenter VPS Soberanos (Destinos Principais)
export const VPS_DATACENTER_NODES: VpsDatacenterNode[] = [
  {
    id: 'sp1',
    name: 'Nó Central B3 SP1',
    city: 'São Paulo',
    country: 'Brasil',
    flag: '🇧🇷',
    region: 'América do Sul (BR-EAST-1)',
    coordinates: [-46.6333, -23.5505],
    hardware: 'AMD EPYC 9754 Bergamo 128C / 256T + NVMe Gen5',
    tier: 'Tier IV Gold Certified',
    bandwidth: '40 Gbps Uplink Redundante (IX.br)',
    capacityGbe: 40,
    uptimeSla: '99.999%',
    isPrimaryCore: true,
  },
  {
    id: 'nyc1',
    name: 'Nó Borda NYC1',
    city: 'Nova York',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    region: 'América do Norte (US-EAST-1)',
    coordinates: [-74.0060, 40.7128],
    hardware: 'AMD EPYC Bergamo 128C + 512GB ECC',
    tier: 'Tier III+ Enterprise',
    bandwidth: '40 Gbps NYIIX Direct Interconnect',
    capacityGbe: 40,
    uptimeSla: '99.998%',
  },
  {
    id: 'sfo1',
    name: 'Nó Vale do Silício SFO1',
    city: 'San Francisco',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    region: 'Costa Oeste EUA (US-WEST-1)',
    coordinates: [-122.4194, 37.7749],
    hardware: 'NVIDIA Grace Hopper GH200 + ARM 72C',
    tier: 'Tier IV AI Ready',
    bandwidth: '100 Gbps Dark Fiber Anycast',
    capacityGbe: 100,
    uptimeSla: '99.999%',
  },
  {
    id: 'fra1',
    name: 'Nó Europa Central FRA1',
    city: 'Frankfurt',
    country: 'Alemanha',
    flag: '🇩🇪',
    region: 'Europa Central (EU-CENTRAL-1)',
    coordinates: [8.6821, 50.1109],
    hardware: 'AMD EPYC Bergamo 128C',
    tier: 'Tier IV Sovereign',
    bandwidth: '40 Gbps DE-CIX Frankfurt Peering',
    capacityGbe: 40,
    uptimeSla: '99.999%',
  },
  {
    id: 'lon1',
    name: 'Nó City LON1',
    city: 'Londres',
    country: 'Reino Unido',
    flag: '🇬🇧',
    region: 'Europa Ocidental (EU-WEST-1)',
    coordinates: [-0.1276, 51.5074],
    hardware: 'AMD EPYC Bergamo 128C',
    tier: 'Tier III+ Enterprise',
    bandwidth: '40 Gbps LINX Direct Peering',
    capacityGbe: 40,
    uptimeSla: '99.997%',
  },
  {
    id: 'tyo1',
    name: 'Nó Ásia Pacífico TYO1',
    city: 'Tóquio',
    country: 'Japão',
    flag: '🇯🇵',
    region: 'Ásia Pacífico (AP-NORTHEAST-1)',
    coordinates: [139.6917, 35.6895],
    hardware: 'AMD EPYC + NVIDIA H100 Ultra',
    tier: 'Tier IV Sovereign',
    bandwidth: '40 Gbps JPIX / BBIX Direct',
    capacityGbe: 40,
    uptimeSla: '99.999%',
  },
  {
    id: 'sin1',
    name: 'Nó Equatorial SIN1',
    city: 'Cingapura',
    country: 'Cingapura',
    flag: '🇸🇬',
    region: 'Sudeste Asiático (AP-SOUTHEAST-1)',
    coordinates: [103.8198, 1.3521],
    hardware: 'AMD EPYC Bergamo 128C',
    tier: 'Tier IV Regional Hub',
    bandwidth: '40 Gbps SGIX Subsea Link',
    capacityGbe: 40,
    uptimeSla: '99.999%',
  },
  {
    id: 'syd1',
    name: 'Nó Oceania SYD1',
    city: 'Sydney',
    country: 'Austrália',
    flag: '🇦🇺',
    region: 'Oceania (AU-EAST-1)',
    coordinates: [151.2093, -33.8688],
    hardware: 'Intel Xeon Scalable Enterprise',
    tier: 'Tier III+ Sovereign',
    bandwidth: '20 Gbps Equinix Sydney IX',
    capacityGbe: 20,
    uptimeSla: '99.995%',
  },
  {
    id: 'jnb1',
    name: 'Nó África JNB1',
    city: 'Joanesburgo',
    country: 'África do Sul',
    flag: '🇿🇦',
    region: 'África Subsaariana (AF-SOUTH-1)',
    coordinates: [28.0473, -26.2041],
    hardware: 'AMD EPYC 64C Enterprise',
    tier: 'Tier III+ Regional Gateway',
    bandwidth: '20 Gbps NAPAfrica Direct',
    capacityGbe: 20,
    uptimeSla: '99.992%',
  },
  {
    id: 'stg1',
    name: 'Nó Borda Pacífico STG1',
    city: 'Santiago',
    country: 'Chile',
    flag: '🇨🇱',
    region: 'América do Sul (CL-WEST-1)',
    coordinates: [-70.6693, -33.4489],
    hardware: 'AMD EPYC 64C + NVMe Enterprise',
    tier: 'Tier III+ Edge',
    bandwidth: '20 Gbps PIT Chile Direct',
    capacityGbe: 20,
    uptimeSla: '99.995%',
  }
];

// 3. 24 Regiões Geográficas de Sondagem / Probes Globais
export const LATENCY_PROBE_REGIONS: LatencyProbeRegion[] = [
  // América do Sul
  {
    id: 'probe-sp',
    name: 'São Paulo Região Metropolitana',
    city: 'São Paulo',
    country: 'Brasil',
    flag: '🇧🇷',
    continent: 'South America',
    coordinates: [-46.6333, -23.5505],
    tier1Provider: 'Claro / Vivo / IX.br',
    subseaCable: 'Metro Dark Fiber DWDM',
    baseLatencies: { sp1: 1.8, nyc1: 104.2, sfo1: 142.5, fra1: 141.5, lon1: 138.9, tyo1: 209.6, sin1: 244.8, syd1: 275.4, jnb1: 195.2, stg1: 26.5 },
  },
  {
    id: 'probe-rio',
    name: 'Rio de Janeiro Peering Hub',
    city: 'Rio de Janeiro',
    country: 'Brasil',
    flag: '🇧🇷',
    continent: 'South America',
    coordinates: [-43.1729, -22.9068],
    tier1Provider: 'Lumen / Eletronet',
    subseaCable: 'GlobeNet Subsea Ring',
    baseLatencies: { sp1: 6.2, nyc1: 108.5, sfo1: 146.0, fra1: 145.2, lon1: 141.0, tyo1: 214.2, sin1: 248.6, syd1: 279.1, jnb1: 192.4, stg1: 31.8 },
  },
  {
    id: 'probe-bue',
    name: 'Buenos Aires CABASE IX',
    city: 'Buenos Aires',
    country: 'Argentina',
    flag: '🇦🇷',
    continent: 'South America',
    coordinates: [-58.3816, -34.6037],
    tier1Provider: 'Telecom Argentina / CABASE',
    subseaCable: 'Bicentenario Subsea Link',
    baseLatencies: { sp1: 24.8, nyc1: 122.4, sfo1: 154.2, fra1: 161.8, lon1: 158.4, tyo1: 228.1, sin1: 262.3, syd1: 260.5, jnb1: 215.1, stg1: 16.4 },
  },
  {
    id: 'probe-stg',
    name: 'Santiago Andes Hub',
    city: 'Santiago',
    country: 'Chile',
    flag: '🇨🇱',
    continent: 'South America',
    coordinates: [-70.6693, -33.4489],
    tier1Provider: 'Entel / CenturyLink',
    subseaCable: 'Prat / Curie Subsea Cable',
    baseLatencies: { sp1: 28.4, nyc1: 118.2, sfo1: 129.5, fra1: 168.0, lon1: 164.2, tyo1: 215.8, sin1: 258.4, syd1: 235.2, jnb1: 222.4, stg1: 2.1 },
  },
  {
    id: 'probe-bog',
    name: 'Bogotá Andes Peering',
    city: 'Bogotá',
    country: 'Colômbia',
    flag: '🇨🇴',
    continent: 'South America',
    coordinates: [-74.0721, 4.7110],
    tier1Provider: 'Telxius / Claro Colombia',
    subseaCable: 'SAM-1 / Pacific Caribbean',
    baseLatencies: { sp1: 72.1, nyc1: 58.4, sfo1: 82.1, fra1: 132.5, lon1: 126.8, tyo1: 182.4, sin1: 225.1, syd1: 242.0, jnb1: 210.8, stg1: 58.6 },
  },
  {
    id: 'probe-mex',
    name: 'Cidade do México NAP',
    city: 'Cidade do México',
    country: 'México',
    flag: '🇲🇽',
    continent: 'North America',
    coordinates: [-99.1332, 19.4326],
    tier1Provider: 'Telmex / Alestra',
    subseaCable: 'Pan-American Crossing (PAC)',
    baseLatencies: { sp1: 112.4, nyc1: 42.1, sfo1: 48.6, fra1: 126.2, lon1: 118.5, tyo1: 148.2, sin1: 212.0, syd1: 210.4, jnb1: 242.1, stg1: 98.4 },
  },
  // América do Norte
  {
    id: 'probe-mia',
    name: 'Miami NAP of the Americas',
    city: 'Miami',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    continent: 'North America',
    coordinates: [-80.1918, 25.7617],
    tier1Provider: 'Equinix / Level 3',
    subseaCable: 'Monet / Seabras-1 Landing',
    baseLatencies: { sp1: 96.5, nyc1: 22.4, sfo1: 58.2, fra1: 104.2, lon1: 96.8, tyo1: 154.2, sin1: 218.4, syd1: 215.1, jnb1: 212.6, stg1: 92.4 },
  },
  {
    id: 'probe-nyc',
    name: 'Nova York Silicon Alley',
    city: 'Nova York',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    continent: 'North America',
    coordinates: [-74.0060, 40.7128],
    tier1Provider: 'Verizon / Zayo / Telia',
    subseaCable: 'Apollo / Seabras-1 Direct',
    baseLatencies: { sp1: 104.2, nyc1: 1.5, sfo1: 68.4, fra1: 78.4, lon1: 70.2, tyo1: 142.1, sin1: 205.4, syd1: 220.1, jnb1: 202.4, stg1: 116.2 },
  },
  {
    id: 'probe-chi',
    name: 'Chicago 350 Cermak Core',
    city: 'Chicago',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    continent: 'North America',
    coordinates: [-87.6298, 41.8781],
    tier1Provider: 'Lumen / Cogent',
    subseaCable: 'Transcontinental Terrestrial',
    baseLatencies: { sp1: 118.4, nyc1: 16.8, sfo1: 48.2, fra1: 88.5, lon1: 82.1, tyo1: 132.4, sin1: 198.6, syd1: 212.0, jnb1: 218.2, stg1: 122.1 },
  },
  {
    id: 'probe-sfo',
    name: 'San Francisco Bay Area',
    city: 'San Francisco',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    continent: 'North America',
    coordinates: [-122.4194, 37.7749],
    tier1Provider: 'Hurricane Electric / NTT',
    subseaCable: 'FASTER / JUPITER Trans-Pacific',
    baseLatencies: { sp1: 142.5, nyc1: 68.4, sfo1: 1.8, fra1: 132.4, lon1: 124.6, tyo1: 88.2, sin1: 162.4, syd1: 154.2, jnb1: 260.4, stg1: 128.5 },
  },
  {
    id: 'probe-tor',
    name: 'Toronto 151 Front Hub',
    city: 'Toronto',
    country: 'Canadá',
    flag: '🇨🇦',
    continent: 'North America',
    coordinates: [-79.3832, 43.6532],
    tier1Provider: 'Rogers / Bell Canada',
    subseaCable: 'Trans-Canada Fiber Network',
    baseLatencies: { sp1: 110.2, nyc1: 12.4, sfo1: 62.1, fra1: 82.4, lon1: 76.5, tyo1: 138.5, sin1: 202.1, syd1: 224.2, jnb1: 208.6, stg1: 120.4 },
  },
  // Europa
  {
    id: 'probe-lon',
    name: 'Londres Telehouse North',
    city: 'Londres',
    country: 'Reino Unido',
    flag: '🇬🇧',
    continent: 'Europe',
    coordinates: [-0.1276, 51.5074],
    tier1Provider: 'BT / Colt / LINX',
    subseaCable: 'Yellow / AC-1 Subsea',
    baseLatencies: { sp1: 138.9, nyc1: 70.2, sfo1: 124.6, fra1: 14.2, lon1: 1.6, tyo1: 162.4, sin1: 168.2, syd1: 265.4, jnb1: 148.2, stg1: 162.5 },
  },
  {
    id: 'probe-fra',
    name: 'Frankfurt DE-CIX Core',
    city: 'Frankfurt',
    country: 'Alemanha',
    flag: '🇩🇪',
    continent: 'Europe',
    coordinates: [8.6821, 50.1109],
    tier1Provider: 'Deutsche Telekom / Arelion',
    subseaCable: 'Central European Fiber Mesh',
    baseLatencies: { sp1: 141.5, nyc1: 78.4, sfo1: 132.4, fra1: 1.5, lon1: 14.2, tyo1: 168.5, sin1: 162.4, syd1: 272.1, jnb1: 142.1, stg1: 168.0 },
  },
  {
    id: 'probe-ams',
    name: 'Amsterdã AMS-IX Hub',
    city: 'Amsterdã',
    country: 'Holanda',
    flag: '🇳🇱',
    continent: 'Europe',
    coordinates: [4.9041, 52.3676],
    tier1Provider: 'KPN / AMS-IX Direct',
    subseaCable: 'North Sea Subsea Crossing',
    baseLatencies: { sp1: 139.8, nyc1: 74.2, sfo1: 128.5, fra1: 8.6, lon1: 9.8, tyo1: 164.2, sin1: 164.5, syd1: 268.4, jnb1: 145.6, stg1: 164.2 },
  },
  {
    id: 'probe-par',
    name: 'Paris Equinix PA4',
    city: 'Paris',
    country: 'França',
    flag: '🇫🇷',
    continent: 'Europe',
    coordinates: [2.3522, 48.8566],
    tier1Provider: 'Orange / France-IX',
    subseaCable: 'Western European Terrestrial Ring',
    baseLatencies: { sp1: 136.2, nyc1: 72.8, sfo1: 126.1, fra1: 12.4, lon1: 8.4, tyo1: 165.8, sin1: 165.2, syd1: 267.0, jnb1: 143.5, stg1: 161.2 },
  },
  {
    id: 'probe-mad',
    name: 'Madri ESpanix Landing',
    city: 'Madri',
    country: 'Espanha',
    flag: '🇪🇸',
    continent: 'Europe',
    coordinates: [-3.7038, 40.4168],
    tier1Provider: 'Telefónica / Telxius',
    subseaCable: 'EllaLink Sines Interconnect',
    baseLatencies: { sp1: 128.4, nyc1: 76.5, sfo1: 134.2, fra1: 24.8, lon1: 22.1, tyo1: 174.2, sin1: 172.5, syd1: 278.4, jnb1: 136.2, stg1: 154.6 },
  },
  // Ásia Pacífico
  {
    id: 'probe-tyo',
    name: 'Tóquio Otemachi Telehouse',
    city: 'Tóquio',
    country: 'Japão',
    flag: '🇯🇵',
    continent: 'Asia',
    coordinates: [139.6917, 35.6895],
    tier1Provider: 'NTT Comms / KDDI / SoftBank',
    subseaCable: 'JUPITER / SJC2 Subsea Cable',
    baseLatencies: { sp1: 209.6, nyc1: 142.1, sfo1: 88.2, fra1: 168.5, lon1: 162.4, tyo1: 1.8, sin1: 64.2, syd1: 104.5, jnb1: 248.2, stg1: 215.8 },
  },
  {
    id: 'probe-sel',
    name: 'Seul KINX Gasan Hub',
    city: 'Seul',
    country: 'Coreia do Sul',
    flag: '🇰🇷',
    continent: 'Asia',
    coordinates: [126.9780, 37.5665],
    tier1Provider: 'KT / SK Broadband',
    subseaCable: 'APG / Trans-Pacific Express',
    baseLatencies: { sp1: 218.4, nyc1: 148.5, sfo1: 94.2, fra1: 172.4, lon1: 166.5, tyo1: 24.2, sin1: 68.5, syd1: 112.4, jnb1: 252.1, stg1: 220.4 },
  },
  {
    id: 'probe-sin',
    name: 'Cingapura Equinix SG1',
    city: 'Cingapura',
    country: 'Cingapura',
    flag: '🇸🇬',
    continent: 'Asia',
    coordinates: [103.8198, 1.3521],
    tier1Provider: 'Singtel / StarHub / SGIX',
    subseaCable: 'SEA-ME-WE 5 / APG Hub',
    baseLatencies: { sp1: 244.8, nyc1: 205.4, sfo1: 162.4, fra1: 162.4, lon1: 168.2, tyo1: 64.2, sin1: 1.9, syd1: 86.4, jnb1: 172.5, stg1: 258.4 },
  },
  {
    id: 'probe-hkg',
    name: 'Hong Kong MEGA-i MegaHub',
    city: 'Hong Kong',
    country: 'Hong Kong',
    flag: '🇭🇰',
    continent: 'Asia',
    coordinates: [114.1694, 22.3193],
    tier1Provider: 'PCCW Global / HKIX',
    subseaCable: 'AAG / C2C Cable Network',
    baseLatencies: { sp1: 232.5, nyc1: 182.4, sfo1: 136.5, fra1: 166.2, lon1: 170.4, tyo1: 44.5, sin1: 32.4, syd1: 118.2, jnb1: 198.4, stg1: 242.0 },
  },
  {
    id: 'probe-mum',
    name: 'Mumbai NIXI Gateway',
    city: 'Mumbai',
    country: 'Índia',
    flag: '🇮🇳',
    continent: 'Asia',
    coordinates: [72.8777, 19.0760],
    tier1Provider: 'Tata Communications / Jio',
    subseaCable: 'AAE-1 / MENA Cable',
    baseLatencies: { sp1: 262.4, nyc1: 174.5, sfo1: 194.2, fra1: 104.5, lon1: 112.1, tyo1: 112.4, sin1: 52.4, syd1: 142.1, jnb1: 132.4, stg1: 278.5 },
  },
  // Oriente Médio
  {
    id: 'probe-dxb',
    name: 'Dubai UAE-IX Datamena',
    city: 'Dubai',
    country: 'Emirados Árabes',
    flag: '🇦🇪',
    continent: 'Middle East',
    coordinates: [55.2708, 25.2048],
    tier1Provider: 'du / Etisalat / UAE-IX',
    subseaCable: 'FALCON / SEA-ME-WE 4',
    baseLatencies: { sp1: 228.4, nyc1: 162.1, sfo1: 188.4, fra1: 86.4, lon1: 94.2, tyo1: 128.4, sin1: 76.5, syd1: 168.4, jnb1: 118.4, stg1: 248.1 },
  },
  // Oceania
  {
    id: 'probe-syd',
    name: 'Sydney Equinix SY3 Hub',
    city: 'Sydney',
    country: 'Austrália',
    flag: '🇦🇺',
    continent: 'Oceania',
    coordinates: [151.2093, -33.8688],
    tier1Provider: 'Telstra / Optus / Vocus',
    subseaCable: 'Southern Cross Cable / Hawaiki',
    baseLatencies: { sp1: 275.4, nyc1: 220.1, sfo1: 154.2, fra1: 272.1, lon1: 265.4, tyo1: 104.5, sin1: 86.4, syd1: 1.8, jnb1: 238.4, stg1: 235.2 },
  },
  // África
  {
    id: 'probe-jnb',
    name: 'Joanesburgo NAPAfrica Core',
    city: 'Joanesburgo',
    country: 'África do Sul',
    flag: '🇿🇦',
    continent: 'Africa',
    coordinates: [28.0473, -26.2041],
    tier1Provider: 'Liquid Telecom / Telkom SA',
    subseaCable: '2Africa / WACS Subsea',
    baseLatencies: { sp1: 195.2, nyc1: 202.4, sfo1: 260.4, fra1: 142.1, lon1: 148.2, tyo1: 248.2, sin1: 172.5, syd1: 238.4, jnb1: 1.9, stg1: 222.4 },
  }
];

// 4. Rotas Submarinas de Fibra Óptica (Anycast Subsea Mesh)
export const SUBSEA_FIBER_ROUTES: SubseaFiberRoute[] = [
  {
    id: 'route-ellalink',
    name: 'EllaLink Subsea Transatlantic (Fortaleza -> Sines -> Frankfurt)',
    fromNodeId: 'sp1',
    toNodeId: 'fra1',
    coordinates: [
      [-46.6333, -23.5505], // SP
      [-38.5434, -3.7172],   // Fortaleza
      [-8.8644, 37.9560],    // Sines
      [8.6821, 50.1109],     // Frankfurt
    ],
    capacityTbps: 100,
    rttBaselineMs: 141.5,
    operator: 'EllaLink & NsA Core Dark Fiber',
  },
  {
    id: 'route-seabras1',
    name: 'Seabras-1 Direct Transatlantic (São Paulo -> New York)',
    fromNodeId: 'sp1',
    toNodeId: 'nyc1',
    coordinates: [
      [-46.6333, -23.5505], // SP
      [-35.2094, -5.7945],   // Natal
      [-74.0060, 40.7128],   // NYC
    ],
    capacityTbps: 72,
    rttBaselineMs: 104.2,
    operator: 'Seaborn Networks / NsA Anycast Tier-1',
  },
  {
    id: 'route-apollo-linx',
    name: 'Apollo South Transatlantic (NYC -> London)',
    fromNodeId: 'nyc1',
    toNodeId: 'lon1',
    coordinates: [
      [-74.0060, 40.7128], // NYC
      [-50.0, 46.0],        // Atlantic North
      [-0.1276, 51.5074],   // London
    ],
    capacityTbps: 120,
    rttBaselineMs: 70.2,
    operator: 'Apollo / Zayo Dark Fiber',
  },
  {
    id: 'route-curie',
    name: 'Curie Subsea Cable (Silicon Valley -> Santiago)',
    fromNodeId: 'sfo1',
    toNodeId: 'stg1',
    coordinates: [
      [-122.4194, 37.7749], // SFO
      [-100.0, 10.0],
      [-80.0, -10.0],
      [-70.6693, -33.4489], // Santiago
    ],
    capacityTbps: 72,
    rttBaselineMs: 128.5,
    operator: 'Google Cloud / NsA Curie Direct Link',
  },
  {
    id: 'route-faster-transpac',
    name: 'FASTER Trans-Pacific Subsea (Oregon/SFO -> Tokyo)',
    fromNodeId: 'sfo1',
    toNodeId: 'tyo1',
    coordinates: [
      [-122.4194, 37.7749], // SFO
      [-160.0, 45.0],       // North Pacific
      [139.6917, 35.6895],  // Tokyo
    ],
    capacityTbps: 60,
    rttBaselineMs: 88.2,
    operator: 'KDDI / Google / Singtel / NsA TransPac',
  },
  {
    id: 'route-apg',
    name: 'Asia Pacific Gateway (Tokyo -> Singapore)',
    fromNodeId: 'tyo1',
    toNodeId: 'sin1',
    coordinates: [
      [139.6917, 35.6895], // Tokyo
      [125.0, 25.0],
      [115.0, 12.0],
      [103.8198, 1.3521],  // Singapore
    ],
    capacityTbps: 54,
    rttBaselineMs: 64.2,
    operator: 'APG Consortium / SGIX Anycast',
  },
  {
    id: 'route-sacs-wacs',
    name: 'SACS South Atlantic Cable (São Paulo -> Luanda -> Johannesburg)',
    fromNodeId: 'sp1',
    toNodeId: 'jnb1',
    coordinates: [
      [-46.6333, -23.5505], // SP
      [-38.5, -3.7],        // Fortaleza
      [13.2344, -8.8390],   // Luanda
      [28.0473, -26.2041],  // JNB
    ],
    capacityTbps: 40,
    rttBaselineMs: 195.2,
    operator: 'Angola Cables / NsA SACS Direct Peering',
  },
  {
    id: 'route-southern-cross',
    name: 'Southern Cross Subsea (Sydney -> California)',
    fromNodeId: 'syd1',
    toNodeId: 'sfo1',
    coordinates: [
      [151.2093, -33.8688], // Sydney
      [-170.0, -18.0],      // Fiji
      [-157.8, 21.3],       // Hawaii
      [-122.4194, 37.7749], // SFO
    ],
    capacityTbps: 45,
    rttBaselineMs: 154.2,
    operator: 'Southern Cross Cable Network',
  }
];
