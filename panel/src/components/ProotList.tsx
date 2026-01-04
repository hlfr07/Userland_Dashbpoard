import { useEffect, useState } from 'react';
import { SkeletonCard } from './LoadingSpinner';

interface ProotEntry {
  nombreCompleto: string;
  nombre: string;
  puerto: string;
}

interface ProotListProps {
  serverUrl: string;
  token: string;
}

export default function ProotList({ serverUrl, token }: ProotListProps) {
  const [items, setItems] = useState<ProotEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const fetchList = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${serverUrl}/api/proot/list`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Error ${res.status}`);
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al obtener la lista');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-4 bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Instancias proot existentes</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchList}
            disabled={loading}
            className={`px-3 py-1 ${loading ? 'bg-slate-600/60 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600'} text-slate-200 rounded-md text-sm flex items-center gap-2`}
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Refrescar
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items && items.length > 0 ? (
            items.map((item) => (
              <div key={item.nombreCompleto} className="p-3 bg-slate-900/40 border border-slate-700 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300 font-semibold">{item.nombreCompleto}</p>
                    <p className="text-xs text-slate-400">{item.nombre}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-slate-200 bg-slate-700/40 px-2 py-1 rounded-md">:{item.puerto}</div>
                    <button
                      onClick={() => setExpanded(expanded === item.nombreCompleto ? null : item.nombreCompleto)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-md"
                    >
                      {expanded === item.nombreCompleto ? 'Ocultar' : 'Instrucciones'}
                    </button>
                  </div>
                </div>

                {expanded === item.nombreCompleto && (
                  <div className="mt-3 bg-slate-800/60 border border-slate-700/60 rounded-md p-3 text-sm text-slate-300 space-y-2">
                    <p className="text-slate-400">Sigue estos pasos para usar correctamente la instancia <span className="font-semibold text-white">{item.nombreCompleto}</span> (respeta el puerto <span className="font-semibold">{item.puerto}</span>):</p>

                    <CommandRow
                      label={`Crear sesión screen`}
                      cmd={`screen -S ${item.nombreCompleto}`}
                      onCopy={(key, txt) => copyText(key, txt)}
                      copied={copied[`${item.nombreCompleto}-screen`]}
                      id={`${item.nombreCompleto}-screen`}
                    />

                    <CommandRow
                      label={`Entrar a la instancia`}
                      cmd={`proot-distro login ${item.nombreCompleto}`}
                      onCopy={(key, txt) => copyText(key, txt)}
                      copied={copied[`${item.nombreCompleto}-login`]}
                      id={`${item.nombreCompleto}-login`}
                    />

                    <div className="bg-slate-900/30 p-2 rounded-md">
                      <p className="text-xs text-slate-400">Dentro de la instancia deberías ver:</p>
                      <pre className="text-xs text-slate-200 mt-1 bg-transparent">root@localhost:~#</pre>
                    </div>

                    <CommandRow
                      label={`Clonar tu proyecto (ejemplo)`}
                      cmd={`git clone <tu_repo> && cd <tu_repo> # usa puerto ${item.puerto} si aplica`}
                      onCopy={(key, txt) => copyText(key, txt)}
                      copied={copied[`${item.nombreCompleto}-clone`]}
                      id={`${item.nombreCompleto}-clone`}
                    />

                    <div className="space-y-1">
                      <p className="text-slate-400">Para dejar procesos corriendo dentro de screen:</p>
                      <CommandRow
                        label={`Desconectar pantalla (detache)`}
                        cmd={`ctrl + a, d`}
                        onCopy={(key, txt) => copyText(key, txt)}
                        copied={copied[`${item.nombreCompleto}-detach`]}
                        id={`${item.nombreCompleto}-detach`}
                      />

                      <CommandRow
                        label={`Volver a la pantalla`}
                        cmd={`screen -r ${item.nombreCompleto}`}
                        onCopy={(key, txt) => copyText(key, txt)}
                        copied={copied[`${item.nombreCompleto}-resume`]}
                        id={`${item.nombreCompleto}-resume`}
                      />

                      <CommandRow
                        label={`Matar la sesión`}
                        cmd={`screen -r ${item.nombreCompleto} -X quit`}
                        onCopy={(key, txt) => copyText(key, txt)}
                        copied={copied[`${item.nombreCompleto}-kill`]}
                        id={`${item.nombreCompleto}-kill`}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 col-span-full">No se encontraron instancias.</p>
          )}
        </div>
      )}
    </div>
  );

  function copyText(key: string, txt: string) {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(txt).then(() => {
      setCopied((s) => ({ ...s, [key]: true }));
      setTimeout(() => setCopied((s) => ({ ...s, [key]: false })), 1800);
    }).catch(() => {
      // ignore
    });
  }
}

function CommandRow({ label, cmd, onCopy, copied, id }: { label: string; cmd: string; onCopy: (k: string, t: string) => void; copied?: boolean; id: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <p className="text-xs text-slate-300 font-medium">{label}</p>
        <pre className="mt-1 bg-slate-900/20 text-slate-200 text-xs p-2 rounded-md overflow-x-auto">{cmd}</pre>
      </div>
      <div className="flex items-center">
        <button
          onClick={() => onCopy(id, cmd)}
          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-xs"
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}
