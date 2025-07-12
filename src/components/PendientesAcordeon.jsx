'use client';

import { useEffect, useState } from 'react';
import { obtenerNoJugados } from '@/lib/queries';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function PendientesAcordeon({ cedula }) {
  const [abierto, setAbierto] = useState(false);
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar la lista apenas se monta (opción 2)
  useEffect(() => {
    async function fetchPendientes() {
      setLoading(true);
      try {
        const rivales = await obtenerNoJugados(cedula);
        setPendientes(rivales);
      } catch (e) {
        setPendientes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPendientes();
  }, [cedula]);

  return (
    <>
      <div className="mb-3 flex items-center">
        <button
          type="button"
          className="text-xs md:text-sm text-muted-foreground flex items-center gap-1"
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? (
            <>
              <ChevronUp className="inline w-4 h-4" /> Ocultar
            </>
          ) : (
            <>
              <ChevronDown className="inline w-4 h-4" />
              {loading
                ? 'Cargando...'
                : pendientes.length === 0
                  ? 'Ya jugó con todos'
                  : `${pendientes.length} Partidas faltan por jugar`}
            </>
          )}
        </button>
      </div>
      {abierto && (
        <div className="mb-4 bg-accent/30 rounded-md p-2 border mt-2">
          {loading ? (
            <div className="text-muted-foreground text-sm">Cargando...</div>
          ) : pendientes.length === 0 ? (
            <div className="text-muted-foreground text-sm">Ya jugó con todos.</div>
          ) : (
            <ul className="list-disc ml-6 text-sm">
              {pendientes.map((p) => (
                <li key={p.cedula}>{p.nombre_corto}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}