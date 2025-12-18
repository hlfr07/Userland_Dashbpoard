import { Cpu, HardDrive, Activity, Thermometer, Server } from 'lucide-react';
import { SystemData } from '../types/system';

interface SystemResourcesProps {
  data: SystemData | null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '0m';
}

function ProgressBar({ value, color = 'blue' }: { value: number; color?: string }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const bgColor = value > 90 ? colorClasses.red : value > 70 ? colorClasses.yellow : colorClasses[color];

  return (
    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
      <div
        className={`${bgColor} h-full transition-all duration-300`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  progress
}: {
  icon: typeof Cpu;
  title: string;
  value: string;
  subtitle?: string;
  progress?: number;
}) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Icon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-400">{title}</h3>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
        </div>
      </div>
      {subtitle && <p className="text-xs text-slate-500 mb-2">{subtitle}</p>}
      {progress !== undefined && <ProgressBar value={progress} />}
    </div>
  );
}

export function SystemResources({ data }: SystemResourcesProps) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 animate-pulse">
            <div className="h-20 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Server className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-white">System Information</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Hostname</span>
            <p className="text-white font-medium">{data.info.hostname}</p>
          </div>
          <div>
            <span className="text-slate-500">Platform</span>
            <p className="text-white font-medium">{data.info.platform}</p>
          </div>
          <div>
            <span className="text-slate-500">Architecture</span>
            <p className="text-white font-medium">{data.info.arch}</p>
          </div>
          <div>
            <span className="text-slate-500">Uptime</span>
            <p className="text-white font-medium">{formatUptime(data.info.uptime)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Cpu}
          title="CPU Usage"
          value={`${data.cpu.toFixed(1)}%`}
          subtitle={`${data.info.cpus} cores`}
          progress={data.cpu}
        />

        <StatCard
          icon={Activity}
          title="Memory"
          value={`${data.memory.usagePercent.toFixed(1)}%`}
          subtitle={`${formatBytes(data.memory.used)} / ${formatBytes(data.memory.total)}`}
          progress={data.memory.usagePercent}
        />

        <StatCard
          icon={HardDrive}
          title="Disk Usage"
          value={`${data.disk.usagePercent}%`}
          subtitle={`${data.disk.used} / ${data.disk.total}`}
          progress={data.disk.usagePercent}
        />

        {data.swap.total > 0 && (
          <StatCard
            icon={Activity}
            title="Swap"
            value={`${data.swap.usagePercent.toFixed(1)}%`}
            subtitle={`${formatBytes(data.swap.used)} / ${formatBytes(data.swap.total)}`}
            progress={data.swap.usagePercent}
          />
        )}

        <StatCard
          icon={Activity}
          title="System Load"
          value={data.load.load1}
          subtitle={`5m: ${data.load.load5} | 15m: ${data.load.load15}`}
        />

        {data.temperature.available && (
          <StatCard
            icon={Thermometer}
            title="Temperature"
            value={`${data.temperature.current}°C`}
          />
        )}
      </div>
    </div>
  );
}
