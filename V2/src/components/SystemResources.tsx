import { Cpu, Activity, Thermometer, Server, TrendingUp, Zap } from 'lucide-react';
import { SystemData } from '../types/system';
import { ResourceChart } from './charts/ResourceChart';
import { DiskChart } from './charts/DiskChart';
import { CPUInfoCard } from './charts/CPUInfoCard';

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

function StatMetric({ icon: Icon, label, value, unit, color }: { icon: typeof Cpu; label: string; value: string | number; unit?: string; color: string }) {
  const colorClass = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    cyan: 'text-cyan-400',
  }[color] || 'text-blue-400';

  return (
    <div className="flex items-start gap-3">
      <div className={`p-2.5 bg-slate-700/50 rounded-lg ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">
          {value}
          {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

export function SystemResources({ data }: SystemResourcesProps) {
  if (!data) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl h-64"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 hover:border-slate-600/50 transition-all">
        <div className="flex items-center gap-3 mb-6">
          <Server className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">System Overview</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <StatMetric icon={Server} label="Hostname" value={data.info.hostname} color="cyan" />
          <StatMetric icon={Cpu} label="Cores" value={data.info.cpus} color="blue" />
          <StatMetric icon={Activity} label="Uptime" value={formatUptime(data.info.uptime)} color="green" />
          <StatMetric icon={TrendingUp} label="Load 1m" value={data.load.load1} color="blue" />
          <StatMetric icon={Zap} label="Load 5m" value={data.load.load5} color="blue" />
          <StatMetric icon={Thermometer} label="Temperature" value={data.temperature.available ? data.temperature.current : 'N/A'} unit={data.temperature.available ? '°C' : ''} color={data.temperature.available ? 'amber' : 'blue'} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResourceChart
            data={data.cpuHistory}
            title="CPU Usage Over Time"
            color="#3b82f6"
          />
        </div>
        <div>
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/30 transition-all h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-300">Current CPU</h3>
            </div>
            <div className="text-4xl font-bold text-blue-400 mb-2">{data.cpu.toFixed(1)}%</div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, data.cpu)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResourceChart
            data={data.memoryHistory}
            title="Memory Usage Over Time"
            color="#10b981"
          />
        </div>
        <div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 hover:border-green-500/30 transition-all h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-semibold text-slate-300">Current RAM</h3>
            </div>
            <div className="text-4xl font-bold text-green-400 mb-2">{data.memory.usagePercent.toFixed(1)}%</div>
            <p className="text-xs text-slate-400 mb-3">{formatBytes(data.memory.used)} / {formatBytes(data.memory.total)}</p>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, data.memory.usagePercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DiskChart
          used={data.disk.used}
          available={data.disk.available}
          usagePercent={data.disk.usagePercent}
        />
        <div className="lg:col-span-2">
          <ResourceChart
            data={data.diskHistory}
            title="Disk Usage Over Time"
            color="#f59e0b"
          />
        </div>
      </div>

      {data.swap.total > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-300">Swap Memory</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-2">Usage</p>
              <p className="text-2xl font-bold text-amber-400">{data.swap.usagePercent.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Used</p>
              <p className="text-sm font-semibold text-white">{formatBytes(data.swap.used)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Total</p>
              <p className="text-sm font-semibold text-white">{formatBytes(data.swap.total)}</p>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mt-4">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, data.swap.usagePercent)}%` }}
            />
          </div>
        </div>
      )}

      <CPUInfoCard data={data} />
    </div>
  );
}
