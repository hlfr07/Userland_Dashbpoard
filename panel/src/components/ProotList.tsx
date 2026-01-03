import { useEffect, useState } from 'react';

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
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-sm"
          >
            Refrescar
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-400">Cargando...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items && items.length > 0 ? (
            items.map((item) => (
              <div key={item.nombreCompleto} className="p-3 bg-slate-900/40 border border-slate-700 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300 font-semibold">{item.nombreCompleto}</p>
                    <p className="text-xs text-slate-400">{item.nombre}</p>
                  </div>
                  <div className="text-sm text-slate-200 bg-slate-700/40 px-2 py-1 rounded-md">:{item.puerto}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 col-span-full">No se encontraron instancias.</p>
          )}
        </div>
      )}
    </div>
  );
}
