'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { obtenerPartidasJugador, obtenerRanking } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trophy,
  Target,
  BarChart3,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function JugadorPage() {
  const params = useParams();
  const router = useRouter();
  const cedula = params.cedula;

  const [jugador, setJugador] = useState(null);
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      try {
        // Obtener estadísticas del jugador desde el ranking
        const ranking = await obtenerRanking();
        const jugadorStats = ranking.find((j) => j.cedula === cedula);

        if (!jugadorStats) {
          console.error('Jugador no encontrado');
          return;
        }

        setJugador(jugadorStats);

        // Obtener partidas del jugador
        const partidasData = await obtenerPartidasJugador(cedula);
        setPartidas(partidasData);
      } catch (error) {
        console.error('Error cargando datos del jugador:', error);
      } finally {
        setLoading(false);
      }
    }

    if (cedula) {
      cargarDatos();
    }
  }, [cedula]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Cargando datos del jugador...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!jugador) {
    return (
      <div className='min-h-screen bg-gray-50 p-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center py-8'>
            <p className='text-red-600'>Jugador no encontrado</p>
            <Button onClick={() => router.push('/')} className='mt-4'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Volver al ranking
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return ''
    
    // Convertir hora en formato HH:MM a formato 12 horas
    const [horas, minutos] = hora.split(':')
    const horaNum = parseInt(horas)
    const ampm = horaNum >= 12 ? 'PM' : 'AM'
    const hora12 = horaNum % 12 || 12 // 0 se convierte en 12
    
    return `${hora12}:${minutos} ${ampm}`
  }

  const calcularDuracionPartida = (horaInicio, horaFin) => {
    if (!horaInicio || !horaFin) return null
    
    // Convertir horas a minutos desde medianoche
    const convertirAMinutos = (hora) => {
      const [horas, minutos] = hora.split(':').map(Number)
      return horas * 60 + minutos
    }
    
    const minutosInicio = convertirAMinutos(horaInicio)
    let minutosFin = convertirAMinutos(horaFin)
    
    // Si la hora de fin es menor que la de inicio, asumimos que cruzó medianoche
    if (minutosFin < minutosInicio) {
      minutosFin += 24 * 60 // Agregar 24 horas en minutos
    }
    
    const duracionMinutos = minutosFin - minutosInicio
    
    // Formatear duración
    if (duracionMinutos < 60) {
      return `${duracionMinutos} min`
    } else {
      const horas = Math.floor(duracionMinutos / 60)
      const minutos = duracionMinutos % 60
      return minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`
    }
  }
  
  const obtenerRival = (partida) => {
    return partida.jugador1 === cedula
      ? partida.jugador2_data
      : partida.jugador1_data;
  };

  const obtenerResultado = (partida) => {
    const esJugador1 = partida.jugador1 === cedula
    const misCarambolas = esJugador1 ? partida.carambolas1 : partida.carambolas2
    const rivalCarambolas = esJugador1 ? partida.carambolas2 : partida.carambolas1
    const misEntradas = esJugador1 ? partida.entradas1 : partida.entradas2
    const rivalEntradas = esJugador1 ? partida.entradas2 : partida.entradas1
    const miSerie = esJugador1 ? partida.seriemayor1 : partida.seriemayor2
    const rivalSerie = esJugador1 ? partida.seriemayor2 : partida.seriemayor1

    // Determinar resultado
    let resultado = 'empate'
    if (misCarambolas > rivalCarambolas) {
      resultado = 'victoria'
    } else if (misCarambolas < rivalCarambolas) {
      resultado = 'derrota'
    }

    return {
      misCarambolas,
      rivalCarambolas,
      misEntradas,
      rivalEntradas,
      miSerie,
      rivalSerie,
      resultado,
      gane: resultado === 'victoria',
      empate: resultado === 'empate',
      miBola: esJugador1 ? 'blanca' : 'amarilla',
      rivalBola: esJugador1 ? 'amarilla' : 'blanca'
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header con botón de regreso */}
        <div className='mb-6'>
          <Button
            variant='ghost'
            onClick={() => router.push('/')}
            className='mb-4'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Volver al ranking
          </Button>
        </div>

        {/* Estadísticas del jugador */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Users className='w-6 h-6' />
              <span>{jugador.nombre}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
              <div className='text-center p-4 bg-blue-50 rounded-lg'>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <Target className='w-5 h-5 text-blue-500' />
                  <span className='text-2xl font-bold text-blue-600'>
                    {jugador.promedio.toFixed(3)}
                  </span>
                </div>
                <p className='text-sm text-gray-600'>Promedio</p>
              </div>

              <div className='text-center p-4 bg-green-50 rounded-lg'>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <BarChart3 className='w-5 h-5 text-green-500' />
                  <span className='text-2xl font-bold text-green-600'>
                    {jugador.mejor_serie}
                  </span>
                </div>
                <p className='text-sm text-gray-600'>Mejor Serie</p>
              </div>

              <div className='text-center p-4 bg-purple-50 rounded-lg'>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <Trophy className='w-5 h-5 text-purple-500' />
                  <span className='text-2xl font-bold text-purple-600'>
                    {jugador.total_carambolas}
                  </span>
                </div>
                <p className='text-sm text-gray-600'>Total Carambolas</p>
              </div>

              <div className='text-center p-4 bg-orange-50 rounded-lg'>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <Users className='w-5 h-5 text-orange-500' />
                  <span className='text-2xl font-bold text-orange-600'>
                    {jugador.partidas_jugadas}
                  </span>
                </div>
                <p className='text-sm text-gray-600'>Partidas</p>
              </div>

              <div className='text-center p-4 bg-yellow-50 rounded-lg'>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <Users className='w-5 h-5 text-yellow-500' />
                  <span className='text-2xl font-bold text-yellow-600'>
                    {jugador.total_entradas}
                  </span>
                </div>
                <p className='text-sm text-gray-600'>Entradas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de partidas */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Partidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {partidas.map((partida) => {
                const rival = obtenerRival(partida);
                const resultado = obtenerResultado(partida);

                return (
                  <Link
                    key={partida.id}
                    href={`/partida/${partida.id}`}
                    className='block'
                  >
                    <div className='border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer'>
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center space-x-2'>
                        {/* Badge con función helper */}
                        {(() => {
                            const getBadgeProps = () => {
                              if (resultado.empate) {
                                return {
                                  variant: "outline",
                                  className: "border-gray-400 text-gray-600",
                                  text: "Empate"
                                }
                              }
                              if (resultado.gane) {
                                return {
                                  variant: "default",
                                  className: "bg-green-500",
                                  text: "Victoria"
                                }
                              }
                              return {
                                variant: "secondary",
                                className: "bg-red-500",
                                text: "Derrota"
                              }
                            }
                            
                            const badgeProps = getBadgeProps()
                            return (
                              <Badge variant={badgeProps.variant} className={badgeProps.className}>
                                {badgeProps.text}
                              </Badge>
                            )
                          })()}

                          
                        </div>

                        <div>
                          {/* Indicador de bola */}
                          <div className='flex items-center space-x-1'>
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                resultado.miBola === 'blanca'
                                  ? 'bg-white border-gray-400'
                                  : 'bg-yellow-400 border-yellow-600'
                              }`}
                              title={`Jugó con bola ${resultado.miBola}`}
                            ></div>
                            <span className='text-xs text-gray-600 uppercase'>
                              Jugó con bola {resultado.miBola}
                            </span>
                          </div>
                          <div className='font-semibold'>vs {rival.nombre}
                          <div
                              className={`inline-block w-3 h-3 rounded-full border ml-1 ${
                                resultado.rivalBola === 'blanca'
                                  ? 'bg-white border-gray-400'
                                  : 'bg-yellow-400 border-yellow-600'
                              }`}
                              title={`${rival.nombre} jugó con bola ${resultado.rivalBola}`}
                            ></div>
                          </div>
                          <div className='flex items-center space-x-4 text-sm text-gray-600'>
                            <span className='flex items-center'>
                              <Calendar className='w-4 h-4 mr-1' />
                              {formatearFecha(partida.fecha)}
                            </span>
                            <span className='flex items-center'>
                              <Clock className='w-4 h-4 mr-1' />
                              {formatearHora(partida.hora_inicio)} ({calcularDuracionPartida(partida.hora_inicio, partida.hora_fin)})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='text-right'>
                        <div className='text-lg font-bold'>
                          {resultado.misCarambolas} -{' '}
                          {resultado.rivalCarambolas}
                        </div>
                        <div className='text-sm text-gray-600'>
                          Mayor Serie: {resultado.miSerie} vs {resultado.rivalSerie}
                        </div>
                        <div className='text-xs text-gray-500 flex items-center justify-end space-x-2'>
                          <span>Partida #{partida.id}</span>
                          <div className='flex items-center space-x-1'>
                            <span>Rival:</span>
                            <div
                              className={`w-3 h-3 rounded-full border ${
                                resultado.rivalBola === 'blanca'
                                  ? 'bg-white border-gray-400'
                                  : 'bg-yellow-400 border-yellow-600'
                              }`}
                              title={`${rival.nombre} jugó con bola ${resultado.rivalBola}`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {partidas.length === 0 && (
              <div className='text-center py-8'>
                <p className='text-gray-500'>No hay partidas registradas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
