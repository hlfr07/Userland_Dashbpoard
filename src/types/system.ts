export interface SystemData {
  cpu: number;
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  disk: {
    total: string;
    used: string;
    available: string;
    usagePercent: number;
  };
  swap: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  load: {
    load1: string;
    load5: string;
    load15: string;
  };
  processes: Process[];
  ports: Port[];
  temperature: {
    current: string;
    available: boolean;
  };
  info: {
    hostname: string;
    platform: string;
    arch: string;
    uptime: number;
    cpus: number;
  };
  timestamp: number;
}

export interface Process {
  user: string;
  pid: string;
  cpu: string;
  mem: string;
  vsz: string;
  rss: string;
  tty: string;
  stat: string;
  start: string;
  time: string;
  command: string;
}

export interface Port {
  protocol: string;
  port: string;
  address: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  message: string;
}
