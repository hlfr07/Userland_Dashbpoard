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
    const [modalOpen, setModalOpen] = useState(false);
    const [modalItem, setModalItem] = useState<ProotEntry | null>(null);
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
                                            onClick={() => { setModalItem(item); setModalOpen(true); }}
                                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-md"
                                        >
                                            Instrucciones
                                        </button>
                                    </div>
                                </div>
                                {/* modal is handled globally below */}
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
        <div className="flex items-start gap-2 w-full">
            <div className="flex-1">
                <p className="text-xs text-slate-300 font-medium">{label}</p>
                <div className="mt-1 bg-black text-green-300 text-xs p-3 rounded-md font-mono overflow-x-auto border border-green-800/30">{cmd}</div>
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

// Modal component (rendered inside the file to keep changes local)
function InstructionsModal({ item, onClose, onCopy, copied }: { item: ProotEntry | null; onClose: () => void; onCopy: (k: string, t: string) => void; copied: Record<string, boolean> }) {
    if (!item) return null;

    const combined = `screen -x ${item.nombreCompleto} || screen -S ${item.nombreCompleto} proot-distro login ${item.nombreCompleto}`;
    const cloneCmd = `git clone <tu_repo> && cd <tu_repo> # usa puerto ${item.puerto} si aplica`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative max-w-3xl w-full mx-4 bg-slate-900/90 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white">Instrucciones — {item.nombreCompleto}</h4>
                    <button onClick={onClose} className="text-slate-300 hover:text-white">Cerrar</button>
                </div>

                <div className="bg-black text-green-200 p-4 rounded-md font-mono text-sm space-y-3 border border-green-800/40">
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Crear/entrar y loguearse en la instancia (attach-or-create):</p>
                        <div className="flex items-start gap-2">
                            <div className="flex-1">{combined}</div>
                            <button onClick={() => onCopy(`${item.nombreCompleto}-combined`, combined)} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-xs">{copied[`${item.nombreCompleto}-combined`] ? 'Copiado' : 'Copiar'}</button>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400 mb-1">Dentro deberías ver:</p>
                        <div className="text-xs text-green-100">root@localhost:~#</div>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400 mb-1">Clonar tu proyecto (ejemplo):</p>
                        <div className="flex items-start gap-2">
                            <div className="flex-1">{cloneCmd}</div>
                            <button onClick={() => onCopy(`${item.nombreCompleto}-clone`, cloneCmd)} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-xs">{copied[`${item.nombreCompleto}-clone`] ? 'Copiado' : 'Copiar'}</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Desconectar (detach)</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">ctrl + a, d</div>
                                <button onClick={() => onCopy(`${item.nombreCompleto}-detach`, 'ctrl + a, d')} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-xs">{copied[`${item.nombreCompleto}-detach`] ? 'Copiado' : 'Copiar'}</button>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-slate-400 mb-1">Volver a la pantalla</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">{`screen -r ${item.nombreCompleto}`}</div>
                                <button onClick={() => onCopy(`${item.nombreCompleto}-resume`, `screen -r ${item.nombreCompleto}`)} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-xs">{copied[`${item.nombreCompleto}-resume`] ? 'Copiado' : 'Copiar'}</button>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-slate-400 mb-1">Matar la sesión</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">{`screen -r ${item.nombreCompleto} -X quit`}</div>
                                <button onClick={() => onCopy(`${item.nombreCompleto}-kill`, `screen -r ${item.nombreCompleto} -X quit`)} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-xs">{copied[`${item.nombreCompleto}-kill`] ? 'Copiado' : 'Copiar'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
