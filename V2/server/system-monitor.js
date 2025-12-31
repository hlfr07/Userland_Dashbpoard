import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export async function getCPUUsage() {
  try {
    const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}'");
    const usage = parseFloat(stdout.trim());
    return isNaN(usage) ? 0 : usage;
  } catch (error) {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return ((totalTick - totalIdle) / totalTick) * 100;
  }
}

export async function getMemoryUsage() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    total: totalMem,
    used: usedMem,
    free: freeMem,
    usagePercent: (usedMem / totalMem) * 100
  };
}

export async function getDiskUsage() {
  try {
    const { stdout } = await execAsync("df -h / | tail -1 | awk '{print $2,$3,$4,$5}'");
    const [total, used, available, percent] = stdout.trim().split(' ');

    return {
      total,
      used,
      available,
      usagePercent: parseInt(percent)
    };
  } catch (error) {
    return {
      total: 'N/A',
      used: 'N/A',
      available: 'N/A',
      usagePercent: 0
    };
  }
}

export async function getSwapUsage() {
  try {
    const { stdout } = await execAsync("free | grep Swap | awk '{print $2,$3,$4}'");
    const [total, used, free] = stdout.trim().split(' ').map(Number);

    if (total === 0) {
      return { total: 0, used: 0, free: 0, usagePercent: 0 };
    }

    return {
      total,
      used,
      free,
      usagePercent: (used / total) * 100
    };
  } catch (error) {
    return { total: 0, used: 0, free: 0, usagePercent: 0 };
  }
}

export async function getSystemLoad() {
  const loadavg = os.loadavg();
  return {
    load1: loadavg[0].toFixed(2),
    load5: loadavg[1].toFixed(2),
    load15: loadavg[2].toFixed(2)
  };
}

export async function getProcessList() {
  try {
    const { stdout } = await execAsync("ps aux --sort=-%mem | head -20");
    const lines = stdout.trim().split('\n');
    const processes = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts.length >= 11) {
        processes.push({
          user: parts[0],
          pid: parts[1],
          cpu: parts[2],
          mem: parts[3],
          vsz: parts[4],
          rss: parts[5],
          tty: parts[6],
          stat: parts[7],
          start: parts[8],
          time: parts[9],
          command: parts.slice(10).join(' ')
        });
      }
    }

    return processes;
  } catch (error) {
    return [];
  }
}

export async function getOpenPorts() {
  try {
    const { stdout } = await execAsync("netstat -tuln 2>/dev/null || ss -tuln");
    const lines = stdout.trim().split('\n');
    const ports = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('LISTEN') || line.includes('UNCONN')) {
        const parts = line.split(/\s+/);
        const localAddress = parts.find(p => p.includes(':'));
        if (localAddress) {
          const port = localAddress.split(':').pop();
          if (port && !isNaN(port)) {
            ports.push({
              protocol: parts[0],
              port: port,
              address: localAddress
            });
          }
        }
      }
    }

    return ports;
  } catch (error) {
    return [];
  }
}

export async function getTemperature() {
  try {
    const tempFiles = [
      '/sys/class/thermal/thermal_zone0/temp',
      '/sys/class/thermal/thermal_zone1/temp',
      '/sys/class/hwmon/hwmon0/temp1_input',
      '/sys/class/hwmon/hwmon1/temp1_input'
    ];

    const temps = [];

    for (const file of tempFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const temp = parseInt(content.trim()) / 1000;
        if (!isNaN(temp) && temp > 0 && temp < 150) {
          temps.push(temp);
        }
      } catch (e) {
        continue;
      }
    }

    if (temps.length > 0) {
      return {
        current: Math.max(...temps).toFixed(1),
        available: true
      };
    }

    return { current: 'N/A', available: false };
  } catch (error) {
    return { current: 'N/A', available: false };
  }
}

export async function getSystemInfo() {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    uptime: os.uptime(),
    cpus: os.cpus().length
  };
}

export async function getAllSystemData() {
  const [cpu, memory, disk, swap, load, processes, ports, temp, info] = await Promise.all([
    getCPUUsage(),
    getMemoryUsage(),
    getDiskUsage(),
    getSwapUsage(),
    getSystemLoad(),
    getProcessList(),
    getOpenPorts(),
    getTemperature(),
    getSystemInfo()
  ]);

  return {
    cpu,
    memory,
    disk,
    swap,
    load,
    processes,
    ports,
    temperature: temp,
    info,
    timestamp: Date.now()
  };
}
