'use client';

import { useEffect, useState } from 'react';
import { obtenerParticipantes, obtenerNoJugados } from '@/lib/queries';

export default function PendientesPage() {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarPendientes() {
      try {
        const jugadores = await obtenerParticipantes();
        const list = await Promise.all(
          jugadores.map(async (j) => {
            const rivales = await obtenerNoJugados(j.cedula);
            return { jugador: j.nombre, pendientes: rivales };
          })
        );
        setPendientes(list);
      } catch (err) {
        setPendientes([]);
      } finally {
        setLoading(false);
      }
    }
    cargarPendientes();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 inline-block"></span>
        <p className="mt-4 text-muted-foreground">Cargando partidas pendientes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Partidas pendientes por jugador</h1>
      {pendientes.map(({ jugador, pendientes }) => (
        <div key={jugador} className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{jugador}</h2>
          <ul className="list-disc ml-6">
            {pendientes.length === 0
              ? <li className="text-muted-foreground">Ya jugó con todos</li>
              : pendientes.map((op) => <li key={op.cedula}>{op.nombre}</li>)
            }
          </ul>
        </div>
      ))}
    </div>
  );
}