'use client';

import { useState, useEffect } from 'react';
import {
  obtenerParticipantes,
  insertarPartida,
  insertarEntradas,
} from '@/lib/queries';

export default function InsertMatch() {
  const [participantes, setParticipantes] = useState([]);
  const [form, setForm] = useState({
    id: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    jugador1: '',
    jugador2: '',
    arbitro: '',
    entradas: Array(30).fill({ carambolas_jugador1: 0, carambolas_jugador2: 0 }),
  });
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    obtenerParticipantes()
      .then((data) => {
        setParticipantes(data || []);
      })
      .catch(() => setParticipantes([]));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEntradaChange(i, field, value) {
    const nuevasEntradas = form.entradas.map((entrada, idx) =>
      idx === i ? { ...entrada, [field]: value } : entrada
    );
    setForm({ ...form, entradas: nuevasEntradas });
  }

  function sumaCarambolasJugador(jugador) {
    return form.entradas.reduce(
      (acc, entrada) => acc + (parseInt(entrada[`carambolas_jugador${jugador}`], 10) || 0),
      0
    );
  }
  function serieMayorJugador(jugador) {
    return Math.max(
      ...form.entradas.map((entrada) => parseInt(entrada[`carambolas_jugador${jugador}`], 10) || 0)
    );
  }


  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje('');
    setLoading(true);
    try {
      if (form.jugador1 === form.jugador2) {
        setMensaje('Los jugadores deben ser diferentes');
        setLoading(false);
        return;
      }
      const partidaObj = {
        id: parseInt(form.id, 10),
        fecha: form.fecha,
        hora_inicio: form.hora_inicio,
        hora_fin: form.hora_fin,
        jugador1: form.jugador1,
        jugador2: form.jugador2,
        arbitro: form.arbitro,
        entradas1: 30,
        entradas2: 30,
        carambolas1: sumaCarambolasJugador(1),
        carambolas2: sumaCarambolasJugador(2),
        seriemayor1: serieMayorJugador(1),
        seriemayor2: serieMayorJugador(2),
      };
      await insertarPartida(partidaObj);
      await insertarEntradas(parseInt(form.id, 10), form.entradas);
      setMensaje('Partida guardada correctamente');
      setForm({
        id: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        jugador1: '',
        jugador2: '',
        arbitro: '',
        entradas: Array(30).fill({ carambolas_jugador1: 0, carambolas_jugador2: 0 }),
      });
    } catch (err) {
      setMensaje('Error al guardar la partida, verifica los datos o si el ID ya existe.');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Nueva Partida</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block font-medium mb-1">ID de Partida</label>
            <input
              type="number"
              name="id"
              value={form.id}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded focus:outline-none bg-white text-black dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Fecha</label>
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded focus:outline-none bg-white text-black dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Hora Inicio</label>
            <input
              type="time"
              name="hora_inicio"
              value={form.hora_inicio}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded focus:outline-none bg-white text-black dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Hora Fin</label>
            <input
              type="time"
              name="hora_fin"
              value={form.hora_fin}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded focus:outline-none bg-white text-black dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Jugador 1</label>
            <select
              name="jugador1"
              value={form.jugador1}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded focus:outline-none bg-white text-black dark:bg-gray-800 dark:text-white"
            >
              <option value="">Elige jugador</option>
              {participantes.map((p) => (
                <option key={p.cedula} value={p.cedula}>
                  {p.nombre} ({p.cedula})
                </option>
              ))}
            </select>
            {participantes.length === 0 && (
              <div className="text-red-600 text-sm mt-1">
                No hay participantes cargados
              </div>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1">Jugador 2</label>
            <select
              name="jugador2"
              value={form.jugador2}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded focus:outline-none bg-white text-black dark:bg-gray-800 dark:text-white"
            >
              <option value="">Elige jugador</option>
              {participantes.map((p) => (
                <option key={p.cedula} value={p.cedula}>
                  {p.nombre} ({p.cedula})
                </option>
              ))}
            </select>
            {participantes.length === 0 && (
              <div className="text-red-600 text-sm mt-1">
                No hay participantes cargados
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Árbitro</label>
          <input
            type="text"
            name="arbitro"
            value={form.arbitro}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded focus:outline-none bg-white text-black dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Entradas (Carambolas por entrada)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {form.entradas.map((entrada, i) => (
              <div key={i} className="flex flex-col items-center border p-2 rounded bg-white dark:bg-gray-900">
                <span className="font-bold mb-1">#{i + 1}</span>
                <input
                  type="number"
                  min={0}
                  value={entrada.carambolas_jugador1}
                  onChange={(e) =>
                    handleEntradaChange(i, 'carambolas_jugador1', parseInt(e.target.value, 10) || 0)
                  }
                  className="w-16 mb-1 border rounded px-1 py-0.5 text-center bg-white text-black dark:bg-gray-800 dark:text-white"
                  placeholder="J1"
                />
                <input
                  type="number"
                  min={0}
                  value={entrada.carambolas_jugador2}
                  onChange={(e) =>
                    handleEntradaChange(i, 'carambolas_jugador2', parseInt(e.target.value, 10) || 0)
                  }
                  className="w-16 border rounded px-1 py-0.5 text-center bg-white text-black dark:bg-gray-800 dark:text-white"
                  placeholder="J2"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center my-2">
          <div>
            <span className="font-semibold">Total J1:</span> {sumaCarambolasJugador(1)} | Serie mayor: {serieMayorJugador(1)} | Entradas: 30
          </div>
          <div>
            <span className="font-semibold">Total J2:</span> {sumaCarambolasJugador(2)} | Serie mayor: {serieMayorJugador(2)} | Entradas: 30
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Partida'}
        </button>
        {mensaje && (
          <p className={`mt-2 ${mensaje.startsWith('Error') ? 'text-red-600' : 'text-green-700'} font-semibold`}>
            {mensaje}
          </p>
        )}
      </form>
    </div>
  );
}