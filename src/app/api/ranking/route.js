import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase con clave de servicio para acceso del lado servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  // Obtener todas las partidas con datos de participantes
  const { data: partidas, error } = await supabase
    .from('partidas')
    .select(`
      jugador1,
      jugador2,
      carambolas1,
      carambolas2,
      entradas1,
      entradas2,
      jugador1_data:participantes!partidas_jugador1_fkey(cedula, nombre),
      jugador2_data:participantes!partidas_jugador2_fkey(cedula, nombre)
    `);

  if (error) {
    return NextResponse.json(
      { error: 'Error obteniendo partidas', detalle: error.message },
      { status: 500 }
    );
  }

  // Agregar estadísticas por jugador (acumular carambolas/entradas y contar partidas)
  const estadisticas = new Map();

  for (const p of partidas || []) {
    const j1 = p.jugador1_data;
    const j2 = p.jugador2_data;

    if (j1 && j1.cedula) {
      if (!estadisticas.has(j1.cedula)) {
        estadisticas.set(j1.cedula, {
          nombre: j1.nombre,
          total_carambolas: 0,
          total_entradas: 0,
          partidas_jugadas: 0,
        });
      }
      const s1 = estadisticas.get(j1.cedula);
      s1.total_carambolas += p.carambolas1 || 0;
      s1.total_entradas += p.entradas1 || 0;
      s1.partidas_jugadas += 1;
    }

    if (j2 && j2.cedula) {
      if (!estadisticas.has(j2.cedula)) {
        estadisticas.set(j2.cedula, {
          nombre: j2.nombre,
          total_carambolas: 0,
          total_entradas: 0,
          partidas_jugadas: 0,
        });
      }
      const s2 = estadisticas.get(j2.cedula);
      s2.total_carambolas += p.carambolas2 || 0;
      s2.total_entradas += p.entradas2 || 0;
      s2.partidas_jugadas += 1;
    }
  }

  // Construir salida con el formato solicitado y ordenar por Promedio DESC (NULLS LAST -> 0)
  const resultado = Array.from(estadisticas.values())
    .map((s) => {
      const promedio = s.total_entradas > 0
        ? Number((s.total_carambolas / s.total_entradas).toFixed(3))
        : 0;
      return {
        Nombre: s.nombre,
        Promedio: promedio,
        Performance: `${s.total_carambolas}/${s.total_entradas}`,
        'Partidas jugadas': s.partidas_jugadas,
      };
    })
    .sort((a, b) => {
      // Ordenar por promedio descendente; si iguales, mantener orden estable
      return b.Promedio - a.Promedio;
    });

  return NextResponse.json(resultado);
}