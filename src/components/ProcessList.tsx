import { List, Wifi } from 'lucide-react';
import { SystemData } from '../types/system';

interface ProcessListProps {
  data: SystemData | null;
}

export function ProcessList({ data }: ProcessListProps) {
  if (!data) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 animate-pulse">
        <div className="h-64 bg-slate-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">Top Processes</h2>
            <span className="ml-auto text-sm text-slate-500">{data.processes.length} processes</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">PID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">CPU%</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">MEM%</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {data.processes.slice(0, 15).map((process, index) => (
                <tr key={`${process.pid}-${index}`} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 text-slate-300 font-mono">{process.pid}</td>
                  <td className="px-4 py-3 text-slate-300">{process.user}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${parseFloat(process.cpu) > 50 ? 'text-red-400' : 'text-slate-300'}`}>
                      {process.cpu}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${parseFloat(process.mem) > 10 ? 'text-yellow-400' : 'text-slate-300'}`}>
                      {process.mem}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs truncate max-w-md">
                    {process.command}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <Wifi className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">Open Ports</h2>
            <span className="ml-auto text-sm text-slate-500">{data.ports.length} ports</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Protocol</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Port</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {data.ports.length > 0 ? (
                data.ports.map((port, index) => (
                  <tr key={`${port.port}-${index}`} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3 text-slate-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {port.protocol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono font-semibold">{port.port}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{port.address}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    No open ports detected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
