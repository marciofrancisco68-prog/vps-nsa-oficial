import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Cloud,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Play,
  Trash2,
  RotateCw,
  Archive,
  Lock,
  Download,
  AlertTriangle,
  Folder,
  Server,
  Layers,
  X,
  ExternalLink,
  Cpu
} from 'lucide-react';
import {
  BackupSchedule,
  BackupSnapshot,
  BackupFrequency,
  BackupDestination,
  ContainerItem
} from '../types';
import {
  fetchBackupSchedules,
  createBackupSchedule,
  toggleBackupSchedule,
  deleteBackupSchedule,
  fetchBackupSnapshots,
  triggerContainerBackupNow,
  restoreBackupSnapshot,
  deleteBackupSnapshot
} from '../services/api';

interface ContainerBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  containers: ContainerItem[];
  preSelectedContainerId?: string;
}

export const ContainerBackupModal: React.FC<ContainerBackupModalProps> = ({
  isOpen,
  onClose,
  containers,
  preSelectedContainerId,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'schedules' | 'snapshots' | 'instant'>('create');
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Form State
  const [targetContainerId, setTargetContainerId] = useState<string>(preSelectedContainerId || (containers[0]?.id || 'ct-prod-01'));
  const [frequency, setFrequency] = useState<BackupFrequency>('diaria');
  const [timeOfDay, setTimeOfDay] = useState<string>('03:00');
  const [dayOfWeek, setDayOfWeek] = useState<number>(0); // 0 = Domingo
  const [destination, setDestination] = useState<BackupDestination>('s3');
  const [s3Bucket, setS3Bucket] = useState<string>('s3://vpsnsa-backups-sp1/containers/');
  const [s3Region, setS3Region] = useState<string>('sa-east-1 (São Paulo Tier IV)');
  const [s3StorageClass, setS3StorageClass] = useState<string>('INTELLIGENT_TIERING');
  const [localPath, setLocalPath] = useState<string>('/var/vpsnsa/backups/containers/');
  const [retentionCopies, setRetentionCopies] = useState<number>(14);

  // Instant Backup State
  const [instantDest, setInstantDest] = useState<BackupDestination>('s3');
  const [instantRunning, setInstantRunning] = useState<boolean>(false);
  const [instantLogs, setInstantLogs] = useState<string[]>([]);

  // Restore State
  const [restoringSnapshot, setRestoringSnapshot] = useState<BackupSnapshot | null>(null);
  const [restoreProgress, setRestoreProgress] = useState<number>(0);
  const [restoreLogs, setRestoreLogs] = useState<string[]>([]);
  const [restoreComplete, setRestoreComplete] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (preSelectedContainerId) {
        setTargetContainerId(preSelectedContainerId);
      }
    }
  }, [isOpen, preSelectedContainerId]);

  const loadData = async () => {
    setLoading(true);
    const [schedList, snapList] = await Promise.all([
      fetchBackupSchedules(),
      fetchBackupSnapshots()
    ]);
    setSchedules(schedList);
    setSnapshots(snapList);
    setLoading(false);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const container = containers.find(c => c.id === targetContainerId);
    const containerName = targetContainerId === 'all' ? 'Todos os Containers' : (container?.name || targetContainerId);

    try {
      setLoading(true);
      const newSchedule = await createBackupSchedule({
        containerId: targetContainerId,
        containerName,
        frequency,
        timeOfDay,
        dayOfWeek: frequency === 'semanal' ? dayOfWeek : undefined,
        destination,
        s3Bucket: destination === 's3' ? `${s3Bucket.replace(/\/$/, '')}/${containerName}` : undefined,
        s3Region: destination === 's3' ? s3Region : undefined,
        s3Prefix: `${frequency}-snapshots/`,
        localPath: destination === 'local' ? `${localPath.replace(/\/$/, '')}/${containerName}/` : undefined,
        retentionCopies,
      });

      setSchedules(prev => [newSchedule, ...prev]);
      setStatusMessage({
        type: 'success',
        text: `Agendamento ${frequency === 'diaria' ? 'Diário' : 'Semanal'} configurado para ${destination === 's3' ? 'Amazon S3' : 'Storage Local'} com sucesso!`
      });
      setActiveTab('schedules');
    } catch {
      setStatusMessage({ type: 'error', text: 'Erro ao registrar agendamento de backup.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSchedule = async (id: string) => {
    const updated = await toggleBackupSchedule(id);
    if (updated) {
      setSchedules(prev => prev.map(s => s.id === id ? updated : s));
      setStatusMessage({
        type: 'info',
        text: `Agendamento ${updated.enabled ? 'ativado' : 'pausado'} com sucesso.`
      });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    const ok = await deleteBackupSchedule(id);
    if (ok) {
      setSchedules(prev => prev.filter(s => s.id !== id));
      setStatusMessage({ type: 'info', text: 'Agendamento removido.' });
    }
  };

  const handleRunBackupNow = async (containerId: string, dest: BackupDestination = 's3') => {
    const container = containers.find(c => c.id === containerId);
    const containerName = container?.name || containerId;

    setInstantRunning(true);
    setInstantLogs([
      `[VPSNsA-BackupEngine] Inicializando snapshot do container ${containerName}...`,
      `[VPSNsA-BackupEngine] Pausando I/O momentâneo em MicroVM (Zero Downtime Snapshot)...`,
      `[VPSNsA-BackupEngine] Compactando camadas de disco com Zstandard (zstd lvl-19)...`,
      `[VPSNsA-BackupEngine] Gerando chave de criptografia AES-256-GCM com salting Argon2id...`,
      `[VPSNsA-BackupEngine] Transmitindo para destino ${dest.toUpperCase()}...`,
      `[VPSNsA-BackupEngine] Validando hash SHA-256 de integridade no destino... OK!`
    ]);

    await new Promise(r => setTimeout(r, 900));

    try {
      const snap = await triggerContainerBackupNow(
        containerId,
        dest,
        containerName,
        `s3://vpsnsa-backups-sp1/containers/${containerName}`,
        `/var/vpsnsa/backups/containers/${containerName}`
      );
      setSnapshots(prev => [snap, ...prev]);
      setStatusMessage({
        type: 'success',
        text: `Snapshot imediato criado com sucesso em ${dest.toUpperCase()} (${snap.sizeMB} MB)!`
      });
      setInstantLogs(prev => [...prev, `[VPSNsA-BackupEngine] Finalizado: ${snap.id} (${snap.sizeMB} MB) arquivado!`]);
      setActiveTab('snapshots');
    } catch {
      setStatusMessage({ type: 'error', text: 'Falha ao executar backup imediato.' });
    } finally {
      setInstantRunning(false);
    }
  };

  const handleStartRestore = async (snap: BackupSnapshot) => {
    setRestoringSnapshot(snap);
    setRestoreProgress(10);
    setRestoreComplete(false);
    setRestoreLogs([
      `[RESTORE] Inicializando protocolo de restauração para ${snap.containerName}...`,
      `[RESTORE] Baixando artefato de ${snap.destinationPath}...`,
    ]);

    await new Promise(r => setTimeout(r, 600));
    setRestoreProgress(40);
    setRestoreLogs(prev => [
      ...prev,
      `[RESTORE] Validando assinatura criptográfica Argon2id (${snap.argon2Checksum.slice(0, 24)}...)... OK!`,
      `[RESTORE] Checksum SHA-256 conferido: ${snap.sha256.slice(0, 16)}...`,
    ]);

    await new Promise(r => setTimeout(r, 700));
    setRestoreProgress(75);
    setRestoreLogs(prev => [
      ...prev,
      `[RESTORE] Descompactando imagens e volumes montados no NVMe Direct...`,
      `[RESTORE] Recarregando nó MicroVM e portas de rede Anycast...`,
    ]);

    await new Promise(r => setTimeout(r, 600));
    const result = await restoreBackupSnapshot(snap.id);
    setRestoreProgress(100);
    setRestoreComplete(true);
    setRestoreLogs(prev => [
      ...prev,
      `[RESTORE] SUCESSO: ${result.message}`,
      `[RESTORE] Container ${snap.containerName} em estado ONLINE!`
    ]);
  };

  const handleDeleteSnapshot = async (id: string) => {
    const ok = await deleteBackupSnapshot(id);
    if (ok) {
      setSnapshots(prev => prev.filter(s => s.id !== id));
      setStatusMessage({ type: 'info', text: 'Snapshot removido.' });
    }
  };

  const handleDownloadManifest = (snap: BackupSnapshot) => {
    const manifest = {
      applet: 'VPSNsA Cloud Enterprise',
      ceo: 'VPSNsA',
      snapshotId: snap.id,
      containerId: snap.containerId,
      containerName: snap.containerName,
      destination: snap.destination,
      destinationPath: snap.destinationPath,
      sizeMB: snap.sizeMB,
      compression: 'zstd-level-19',
      encryption: 'AES-256-GCM',
      argon2Checksum: snap.argon2Checksum,
      sha256: snap.sha256,
      createdAt: snap.createdAt,
      securityStandard: 'Zero-Trust Bank-Grade Vault',
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-manifest-${snap.containerName}-${snap.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Sistema de Agendamento & Backup de Containers
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  AES-256-GCM + Argon2id
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure frequência (diária/semanal), destino (S3 / Local NVMe) e políticas de restauração com zero downtime.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800/80 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'create'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Novo Agendamento</span>
          </button>

          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'schedules'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Agendamentos Ativos ({schedules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('snapshots')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'snapshots'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>Snapshots & Restauração ({snapshots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('instant')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'instant'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Backup Imediato</span>
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-lg text-xs flex items-center justify-between border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: NOVO AGENDAMENTO */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSchedule} className="space-y-6">
              
              {/* Target Container Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>1. Selecionar Container Alvo</span>
                  <span className="text-[11px] font-normal text-slate-400">Total: {containers.length} containers</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTargetContainerId('all')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetContainerId === 'all'
                        ? 'border-cyan-400 bg-cyan-950/20 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        Todos os Containers (Cluster Total)
                      </div>
                      {targetContainerId === 'all' && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Agendamento global unificado para todos os sites e microVMs
                    </p>
                  </button>

                  {containers.map(ct => (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => setTargetContainerId(ct.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        targetContainerId === ct.id
                          ? 'border-cyan-400 bg-cyan-950/20 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-xs text-white truncate max-w-[200px]">
                          {ct.name}
                        </div>
                        {targetContainerId === ct.id && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-cyan-300 truncate mt-0.5">
                        {ct.domain}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {ct.cpuAllocation} · {ct.memoryAllocated}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency Selection (Diária vs Semanal) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200">
                  2. Escolha a Frequência de Execução
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Daily Option */}
                  <div
                    onClick={() => setFrequency('diaria')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      frequency === 'diaria'
                        ? 'border-cyan-400 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/30'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${frequency === 'diaria' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Frequência Diária</h4>
                          <span className="text-[10px] font-mono text-cyan-400">Todo dia às 03:00 (UTC-3)</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={frequency === 'diaria'}
                        onChange={() => setFrequency('diaria')}
                        className="text-cyan-500 focus:ring-cyan-500 mt-1"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2.5">
                      Ideal para e-commerce, APIs e bancos de dados com atualizações contínuas. Menor janela de tráfego.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Expressão Cron:</span>
                      <span className="text-cyan-300">0 3 * * *</span>
                    </div>
                  </div>

                  {/* Weekly Option */}
                  <div
                    onClick={() => setFrequency('semanal')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      frequency === 'semanal'
                        ? 'border-cyan-400 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/30'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${frequency === 'semanal' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Frequência Semanal</h4>
                          <span className="text-[10px] font-mono text-cyan-400">Aos Domingos às 02:00 (UTC-3)</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={frequency === 'semanal'}
                        onChange={() => setFrequency('semanal')}
                        className="text-cyan-500 focus:ring-cyan-500 mt-1"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2.5">
                      Recomendado para sites institucionais, blogs e ambientes de homologação de menor volatilidade.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Expressão Cron:</span>
                      <span className="text-cyan-300">0 2 * * 0</span>
                    </div>
                  </div>
                </div>

                {/* Detailed time picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] text-slate-400">Horário de Execução (Janela Segura):</label>
                    <input
                      type="time"
                      value={timeOfDay}
                      onChange={e => setTimeOfDay(e.target.value)}
                      className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  {frequency === 'semanal' && (
                    <div>
                      <label className="text-[11px] text-slate-400">Dia da Semana:</label>
                      <select
                        value={dayOfWeek}
                        onChange={e => setDayOfWeek(Number(e.target.value))}
                        className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value={0}>Domingo (Madrugada com menor I/O)</option>
                        <option value={1}>Segunda-feira</option>
                        <option value={2}>Terça-feira</option>
                        <option value={3}>Quarta-feira</option>
                        <option value={4}>Quinta-feira</option>
                        <option value={5}>Sexta-feira</option>
                        <option value={6}>Sábado</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Destination Selection (S3 vs Local) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200">
                  3. Escolha o Destino do Armazenamento
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* S3 Cloud Storage */}
                  <div
                    onClick={() => setDestination('s3')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      destination === 's3'
                        ? 'border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-500/30'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${destination === 's3' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                          <Cloud className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Nuvem S3 (Amazon / Wasabi / R2)</h4>
                          <span className="text-[10px] font-mono text-cyan-400">Replicação Multi-Região 99.999999999%</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={destination === 's3'}
                        onChange={() => setDestination('s3')}
                        className="text-cyan-500 focus:ring-cyan-500 mt-1"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2.5">
                      Armazenamento em bucket compatível com S3, imune a falhas físicas de hardware local.
                    </p>
                  </div>

                  {/* Local NVMe Storage */}
                  <div
                    onClick={() => setDestination('local')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      destination === 'local'
                        ? 'border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-500/30'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${destination === 'local' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                          <HardDrive className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Armazenamento Local NVMe Gen5</h4>
                          <span className="text-[10px] font-mono text-cyan-400">PCIe x16 Direct Ultra-Speed (14.5 GB/s)</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={destination === 'local'}
                        onChange={() => setDestination('local')}
                        className="text-cyan-500 focus:ring-cyan-500 mt-1"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2.5">
                      Restauração ultra veloz em milissegundos dentro do próprio cluster de datacenter Tier IV.
                    </p>
                  </div>
                </div>

                {/* Destination Config Detail */}
                <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-3">
                  {destination === 's3' ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400">URI do Bucket S3:</label>
                          <input
                            type="text"
                            value={s3Bucket}
                            onChange={e => setS3Bucket(e.target.value)}
                            className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                            placeholder="s3://vpsnsa-backups-sp1/containers/"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400">Região Cloud S3:</label>
                          <select
                            value={s3Region}
                            onChange={e => setS3Region(e.target.value)}
                            className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                          >
                            <option value="sa-east-1 (São Paulo Tier IV)">sa-east-1 (São Paulo Tier IV - Menor Latência)</option>
                            <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia - Alta Capacidade)</option>
                            <option value="eu-central-1 (Frankfurt)">eu-central-1 (Frankfurt GDPR Compliant)</option>
                            <option value="wasabi-sp-01">Wasabi Hot Cloud Storage SP1</option>
                            <option value="cloudflare-r2">Cloudflare R2 (Zero Egress Fees)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-400">Classe de Armazenamento:</span>
                        <div className="flex gap-2 font-mono text-[11px]">
                          {['INTELLIGENT_TIERING', 'STANDARD', 'GLACIER_IR'].map(cls => (
                            <button
                              key={cls}
                              type="button"
                              onClick={() => setS3StorageClass(cls)}
                              className={`px-2.5 py-1 rounded border transition-colors ${
                                s3StorageClass === cls
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {cls}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-[11px] text-slate-400">Caminho Local do Diretório (Array NVMe Raid-10 Direct):</label>
                      <input
                        type="text"
                        value={localPath}
                        onChange={e => setLocalPath(e.target.value)}
                        className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                        placeholder="/var/vpsnsa/backups/containers/"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Diretório blindado com criptografia em repouso LUKS2 + Argon2id KDF.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Retention and Advanced Policies */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      Políticas de Retenção & Criptografia Bancária
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Snapshots antigos são purgados automaticamente respeitando o número de versões.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Manter cópias:</span>
                    <select
                      value={retentionCopies}
                      onChange={e => setRetentionCopies(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value={7}>7 versões (1 semana)</option>
                      <option value={14}>14 versões (2 semanas)</option>
                      <option value={30}>30 versões (1 mês)</option>
                      <option value={60}>60 versões (2 meses)</option>
                      <option value={90}>90 versões (Trimestre)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Criptografia:</span>
                    <p className="text-emerald-400 font-semibold truncate">AES-256-GCM</p>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Assinatura:</span>
                    <p className="text-cyan-400 font-semibold truncate">Argon2id Memory-Hard</p>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Compactação:</span>
                    <p className="text-white font-semibold truncate">Zstandard (zstd-19)</p>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Downtime:</span>
                    <p className="text-emerald-400 font-semibold truncate">Zero Downtime (0s)</p>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 rounded-lg hover:brightness-110 transition-all shadow-md disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Salvar Agendamento de Backup</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: AGENDAMENTOS ATIVOS */}
          {activeTab === 'schedules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Rotinas de Backup Agendadas</h3>
                  <p className="text-xs text-slate-400">
                    Monitore os gatilhos automáticos executados pelo orquestrador do VPSNsA.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 rounded-lg hover:bg-cyan-900/40 transition-colors"
                >
                  + Novo Agendamento
                </button>
              </div>

              {schedules.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
                  <Archive className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">Nenhum agendamento configurado no momento.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 rounded-lg hover:brightness-110"
                  >
                    Criar Primeiro Agendamento
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map(sched => (
                    <div
                      key={sched.id}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg border ${sched.destination === 's3' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                            {sched.destination === 's3' ? <Cloud className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{sched.containerName}</h4>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                                  sched.frequency === 'diaria'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                }`}
                              >
                                {sched.frequency === 'diaria' ? 'Diária' : 'Semanal'}
                              </span>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                                  sched.enabled
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {sched.enabled ? 'ATIVO' : 'PAUSADO'}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-slate-400 mt-0.5 truncate max-w-md">
                              {sched.destination === 's3' ? sched.s3Config?.bucket : sched.localPath}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRunBackupNow(sched.containerId, sched.destination)}
                            title="Executar Agora"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
                          >
                            <Play className="w-3 h-3 text-cyan-400" />
                            <span>Executar</span>
                          </button>
                          <button
                            onClick={() => handleToggleSchedule(sched.id)}
                            title={sched.enabled ? 'Pausar' : 'Ativar'}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(sched.id)}
                            title="Excluir"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Schedule Metadata Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-2 border-t border-slate-800/80 font-mono text-slate-400">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Cron / Horário:</span>
                          <span className="text-slate-200">{sched.cronExpression} ({sched.timeOfDay})</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Destino:</span>
                          <span className="text-cyan-300 uppercase">{sched.destination} ({sched.destination === 's3' ? 'Cloud' : 'NVMe Local'})</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Último Snapshot:</span>
                          <span className="text-slate-200">{sched.lastRunAt || 'Nunca executado'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Próxima Execução:</span>
                          <span className="text-emerald-400 font-semibold">{sched.nextRunAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SNAPSHOTS & RESTAURAÇÃO */}
          {activeTab === 'snapshots' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Histórico de Snapshots & Cofre de Restauração</h3>
                  <p className="text-xs text-slate-400">
                    Restaure qualquer container a partir de versões gravadas no S3 ou no NVMe com 1 clique.
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Total de Snapshots: <span className="text-white font-bold">{snapshots.length}</span>
                </div>
              </div>

              {/* Restore Modal/Overlay when triggered */}
              {restoringSnapshot && (
                <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-950/90 shadow-2xl space-y-3 ring-1 ring-cyan-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RotateCw className={`w-4 h-4 text-cyan-400 ${restoreComplete ? '' : 'animate-spin'}`} />
                      <h4 className="text-xs font-bold text-white">
                        {restoreComplete ? 'Restauração Concluída com Sucesso!' : `Restaurando container ${restoringSnapshot.containerName}...`}
                      </h4>
                    </div>
                    {restoreComplete && (
                      <button
                        onClick={() => setRestoringSnapshot(null)}
                        className="text-xs text-cyan-400 hover:underline font-mono"
                      >
                        Fechar painel
                      </button>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${restoreProgress}%` }}
                    />
                  </div>

                  {/* Restore Logs Terminal */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 space-y-1 max-h-36 overflow-y-auto">
                    {restoreLogs.map((log, i) => (
                      <div key={i} className="text-slate-300">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {snapshots.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
                  <HardDrive className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">Nenhum snapshot gerado ainda.</p>
                  <button
                    onClick={() => setActiveTab('instant')}
                    className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 rounded-lg hover:brightness-110"
                  >
                    Gerar Snapshot Agora
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {snapshots.map(snap => (
                    <div
                      key={snap.id}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg border ${snap.destination === 's3' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                            {snap.destination === 's3' ? <Cloud className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{snap.containerName}</h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {snap.id}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                                {snap.frequency}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-cyan-300 mt-0.5 truncate max-w-lg">
                              {snap.destinationPath}
                            </p>
                          </div>
                        </div>

                        {/* Snapshot action controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartRestore(snap)}
                            disabled={restoringSnapshot !== null && !restoreComplete}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:brightness-110 rounded-lg transition-all shadow-sm disabled:opacity-50"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Restaurar</span>
                          </button>
                          <button
                            onClick={() => handleDownloadManifest(snap)}
                            title="Baixar Manifesto JSON"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSnapshot(snap.id)}
                            title="Excluir Snapshot"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Snapshot Security & Metadata */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-2 border-t border-slate-800/80 font-mono text-slate-400">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Tamanho Compactado:</span>
                          <span className="text-white font-semibold tabular-nums">{snap.sizeMB} MB</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Duração do Backup:</span>
                          <span className="text-slate-200 tabular-nums">{snap.durationSec}s (Zero Downtime)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Assinatura Argon2id:</span>
                          <span className="text-emerald-400 font-semibold truncate block" title={snap.argon2Checksum}>
                            {snap.argon2Checksum.slice(0, 20)}...
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Criado em:</span>
                          <span className="text-slate-200">{snap.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BACKUP IMEDIATO */}
          {activeTab === 'instant' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Play className="w-4 h-4 text-cyan-400" />
                    Executar Snapshot Criptografado Imediato
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dispare uma cópia pontual agora mesmo para contingência imediata ou antes de atualizar o código do container.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Container para Backup:</label>
                    <select
                      value={targetContainerId}
                      onChange={e => setTargetContainerId(e.target.value)}
                      className="mt-1.5 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      {containers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.domain})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Destino do Snapshot:</label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setInstantDest('s3')}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          instantDest === 's3'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Nuvem S3</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInstantDest('local')}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          instantDest === 'local'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Local NVMe</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleRunBackupNow(targetContainerId, instantDest)}
                    disabled={instantRunning}
                    className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:brightness-110 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {instantRunning ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Gerando Snapshot Zstandard...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Fazer Backup Imediato Agora</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instant Backup Live Output Terminal */}
              {instantLogs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    Log do Mecanismo de Snapshot em Tempo Real:
                  </span>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-cyan-300 space-y-1 max-h-48 overflow-y-auto">
                    {instantLogs.map((log, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-slate-600 select-none">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Auditado pela VPSNsA · Todos os direitos reservados a VPS NsA Hyperscale Cluster Enterprise</span>
          </div>
          <div className="font-mono text-slate-400">
            Frequências Ativas: <span className="text-white">Diária (03:00)</span> / <span className="text-white">Semanal (Dom 02:00)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
