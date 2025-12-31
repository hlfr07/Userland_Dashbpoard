import pty from 'node-pty';
import os from 'os';

const terminals = new Map();

export function createTerminal(id, cols = 80, rows = 24) {
  if (terminals.has(id)) {
    terminals.get(id).kill();
  }

  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

  const term = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: cols,
    rows: rows,
    cwd: process.env.HOME || process.cwd(),
    env: process.env
  });

  terminals.set(id, term);

  return term;
}

export function getTerminal(id) {
  return terminals.get(id);
}

export function resizeTerminal(id, cols, rows) {
  const term = terminals.get(id);
  if (term) {
    term.resize(cols, rows);
    return true;
  }
  return false;
}

export function writeToTerminal(id, data) {
  const term = terminals.get(id);
  if (term) {
    term.write(data);
    return true;
  }
  return false;
}

export function killTerminal(id) {
  const term = terminals.get(id);
  if (term) {
    term.kill();
    terminals.delete(id);
    return true;
  }
  return false;
}

export function cleanupTerminals() {
  terminals.forEach((term, id) => {
    term.kill();
  });
  terminals.clear();
}
