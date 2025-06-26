'use client';

import { useState, useEffect } from 'react';
import { obtenerTodasLasPartidas } from '@/lib/queries'; // Debes implementar esta función si no existe
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PartidaCard from '@/components/PartidaCard';
import { Target } from 'lucide-react';

export default function ListaPartidasPage() {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarPartidas() {
      setLoading(true);
      try {
        const lista = await obtenerTodasLasPartidas();
        // Ordenar por fecha descendente
        setPartidas(lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
      } catch (e) {
        console.error('Error cargando partidas:', e);
        setPartidas([]);
      }
      setLoading(false);
    }
    cargarPartidas();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              <Target className="inline mr-2" />
              Partidas jugadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8">
                <span>Cargando partidas...</span>
              </div>
            )}
            {!loading && partidas.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No hay partidas registradas
                </p>
              </div>
            )}
            <div className="space-y-4">
              {partidas.map((partida) => (
                <PartidaCard key={partida.id} partida={partida} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}