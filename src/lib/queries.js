import { supabase } from './supabase';

// Obtener ranking de jugadores
export async function obtenerRanking() {
  const { data: partidas, error } = await supabase.from('partidas').select(`
      *,
      jugador1_data:participantes!partidas_jugador1_fkey(cedula, nombre),
      jugador2_data:participantes!partidas_jugador2_fkey(cedula, nombre)
    `);

  if (error) {
    console.error('Error obteniendo partidas:', error);
    return [];
  }

  // Calcular estadísticas por jugador
  const estadisticas = new Map();

  partidas?.forEach((partida) => {
    // Estadísticas jugador 1
    const jugador1 = partida.jugador1_data;
    if (!estadisticas.has(jugador1.cedula)) {
      estadisticas.set(jugador1.cedula, {
        cedula: jugador1.cedula,
        nombre: jugador1.nombre,
        partidas_jugadas: 0,
        total_carambolas: 0,
        total_entradas: 0,
        promedio: 0,
        mejor_serie: 0,
      });
    }

    const stats1 = estadisticas.get(jugador1.cedula);
    stats1.partidas_jugadas++;
    stats1.total_carambolas += partida.carambolas1;
    stats1.total_entradas += partida.entradas1;
    stats1.mejor_serie = Math.max(stats1.mejor_serie, partida.seriemayor1);

    // Estadísticas jugador 2
    const jugador2 = partida.jugador2_data;
    if (!estadisticas.has(jugador2.cedula)) {
      estadisticas.set(jugador2.cedula, {
        cedula: jugador2.cedula,
        nombre: jugador2.nombre,
        partidas_jugadas: 0,
        total_carambolas: 0,
        total_entradas: 0,
        promedio: 0,
        mejor_serie: 0,
      });
    }

    const stats2 = estadisticas.get(jugador2.cedula);
    stats2.partidas_jugadas++;
    stats2.total_carambolas += partida.carambolas2;
    stats2.total_entradas += partida.entradas2;
    stats2.mejor_serie = Math.max(stats2.mejor_serie, partida.seriemayor2);
  });

  // Calcular promedios y ordenar
  const ranking = Array.from(estadisticas.values()).map((stats) => ({
    ...stats,
    promedio:
      stats.total_entradas > 0
        ? stats.total_carambolas / stats.total_entradas
        : 0,
  }));

  // Ordenar por criterios de desempate
  return ranking.sort((a, b) => {
    if (a.promedio !== b.promedio) return b.promedio - a.promedio;
    if (a.mejor_serie !== b.mejor_serie) return b.mejor_serie - a.mejor_serie;
    // TODO: Implementar head-to-head cuando sea necesario
    return 0;
  });
}

// Obtener partidas de un jugador
export async function obtenerPartidasJugador(cedula) {
  const { data, error } = await supabase
    .from('partidas')
    .select(
      `
      *,
      jugador1_data:participantes!partidas_jugador1_fkey(cedula, nombre),
      jugador2_data:participantes!partidas_jugador2_fkey(cedula, nombre)
    `
    )
    .or(`jugador1.eq.${cedula},jugador2.eq.${cedula}`)
    .order('id', { ascending: false });

  if (error) {
    console.error('Error obteniendo partidas del jugador:', error);
    return [];
  }

  return data;
}

// Obtener detalles de una partida
export async function obtenerPartida(id) {
  const { data: partida, error: partidaError } = await supabase
    .from('partidas')
    .select(
      `
      *,
      jugador1_data:participantes!partidas_jugador1_fkey(cedula, nombre),
      jugador2_data:participantes!partidas_jugador2_fkey(cedula, nombre)
    `
    )
    .eq('id', id)
    .single();

  if (partidaError) {
    console.error('Error obteniendo partida:', partidaError);
    return null;
  }

  const { data: entradas, error: entradasError } = await supabase
    .from('entradas')
    .select('*')
    .eq('partida_id', id)
    .order('numero_entrada');

  if (entradasError) {
    console.error('Error obteniendo entradas:', entradasError);
    return { partida, entradas: [] };
  }

  // Buscar el máximo de carambolas >= 2 para cada jugador
  const maxJ1 = Math.max(
    ...entradas.map((e) =>
      e.carambolas_jugador1 >= 2 ? e.carambolas_jugador1 : -Infinity
    )
  );
  const maxJ2 = Math.max(
    ...entradas.map((e) =>
      e.carambolas_jugador2 >= 2 ? e.carambolas_jugador2 : -Infinity
    )
  );

  // Devolver la partida y las entradas de serie mayor
  return {
    partida,
    entradas: entradas.map((e) => ({
      ...e,
      serie1: maxJ1 >= 2 && e.carambolas_jugador1 === maxJ1,
      serie2: maxJ2 >= 2 && e.carambolas_jugador2 === maxJ2,
    })),
  };
}

// Obtiene todos los participantes y todas las partidas
export async function obtenerParticipantesYPartidas() {
  // Obtener participantes
  const { data: participantes, error: errorParticipantes } = await supabase
    .from('participantes')
    .select('cedula, nombre')
    .order('nombre');

  if (errorParticipantes) {
    console.error('Error obteniendo participantes:', errorParticipantes);
    return { participantes: [], partidas: [] };
  }

  // Obtener partidas (con datos de los jugadores para fácil acceso)
  const { data: partidas, error: errorPartidas } = await supabase
    .from('partidas')
    .select(`
      id,
      jugador1,
      jugador2,
      entradas1,
      entradas2,
      carambolas1,
      carambolas2,
      seriemayor1,
      seriemayor2,
      jugador1_data:participantes!partidas_jugador1_fkey(cedula, nombre),
      jugador2_data:participantes!partidas_jugador2_fkey(cedula, nombre)
    `);

  if (errorPartidas) {
    console.error('Error obteniendo partidas:', errorPartidas);
    return { participantes, partidas: [] };
  }

  return { participantes, partidas };
}

export async function obtenerParticipantes() {
  const { data, error } = await supabase
    .from('participantes')
    .select('*')
    .order('nombre', { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertarPartida(partida) {
  // partida debe ser un objeto con los campos: fecha, hora_inicio, hora_fin, jugador1, jugador2, entradas1, entradas2,
  // carambolas1, carambolas2, seriemayor1, seriemayor2, arbitro (puedes omitir los que no uses)
  const { data, error } = await supabase
    .from('partidas')
    .insert([partida])
    .select()
    .single();
  if (error) throw error;
  // Devuelve el objeto de la partida insertada (incluye el id autogenerado)
  return data;
}

export async function insertarEntradas(partida_id, entradas) {
  // entradas es un array de objetos: [{numero_entrada, carambolas_jugador1, carambolas_jugador2}, ...]
  const filas = entradas.map((entrada, idx) => ({
    partida_id,
    numero_entrada: idx + 1,
    carambolas_jugador1: entrada.carambolas_jugador1,
    carambolas_jugador2: entrada.carambolas_jugador2,
  }));
  const { data, error } = await supabase
    .from('entradas')
    .insert(filas);
  if (error) throw error;
  return data;
}