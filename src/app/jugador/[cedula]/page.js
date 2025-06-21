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
  ChevronRight,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import VolverButton from '../../../components/VolverButton';

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
      <div className='min-h-screen bg-background p-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
            <p className='mt-4 text-muted-foreground'>
              Cargando datos del jugador...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!jugador) {
    return (
      <div className='min-h-screen bg-background p-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center py-8'>
            <p className='text-destructive'>Jugador no encontrado</p>
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
    if (!hora) return '';

    // Convertir hora en formato HH:MM a formato 12 horas
    const [horas, minutos] = hora.split(':');
    const horaNum = parseInt(horas);
    const ampm = horaNum >= 12 ? 'PM' : 'AM';
    const hora12 = horaNum % 12 || 12; // 0 se convierte en 12

    return `${hora12}:${minutos} ${ampm}`;
  };

  const calcularDuracionPartida = (horaInicio, horaFin) => {
    if (!horaInicio || !horaFin) return null;

    // Convertir horas a minutos desde medianoche
    const convertirAMinutos = (hora) => {
      const [horas, minutos] = hora.split(':').map(Number);
      return horas * 60 + minutos;
    };

    const minutosInicio = convertirAMinutos(horaInicio);
    let minutosFin = convertirAMinutos(horaFin);

    // Si la hora de fin es menor que la de inicio, asumimos que cruzó medianoche
    if (minutosFin < minutosInicio) {
      minutosFin += 24 * 60; // Agregar 24 horas en minutos
    }

    const duracionMinutos = minutosFin - minutosInicio;

    // Formatear duración
    if (duracionMinutos < 60) {
      return `${duracionMinutos} min`;
    } else {
      const horas = Math.floor(duracionMinutos / 60);
      const minutos = duracionMinutos % 60;
      return minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`;
    }
  };

  const formatearNombre = (nombre) => {
    // Buscar la primera coma y dividir ahí
    const indiceComa = nombre.indexOf(',');
    if (indiceComa !== -1) {
      const apellidos = nombre.substring(0, indiceComa);
      const nombres = nombre.substring(indiceComa + 1).trim();
      return { apellidos, nombres };
    }
    // Si no hay coma, devolver como apellidos
    return { apellidos: nombre, nombres: '' };
  };

  const obtenerRival = (partida) => {
    return partida.jugador1 === cedula
      ? partida.jugador2_data
      : partida.jugador1_data;
  };

  const obtenerResultado = (partida) => {
    const esJugador1 = partida.jugador1 === cedula;
    const misCarambolas = esJugador1
      ? partida.carambolas1
      : partida.carambolas2;
    const rivalCarambolas = esJugador1
      ? partida.carambolas2
      : partida.carambolas1;
    const misEntradas = esJugador1 ? partida.entradas1 : partida.entradas2;
    const rivalEntradas = esJugador1 ? partida.entradas2 : partida.entradas1;
    const miSerie = esJugador1 ? partida.seriemayor1 : partida.seriemayor2;
    const rivalSerie = esJugador1 ? partida.seriemayor2 : partida.seriemayor1;

    // Determinar resultado
    let resultado = 'empate';
    if (misCarambolas > rivalCarambolas) {
      resultado = 'victoria';
    } else if (misCarambolas < rivalCarambolas) {
      resultado = 'derrota';
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
      rivalBola: esJugador1 ? 'amarilla' : 'blanca',
    };
  };

  return (
    <div className='min-h-screen bg-background p-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header con botón de regreso */}
        <div className='mb-6'>
            <VolverButton fallback="/" />
        </div>

        {/* Estadísticas del jugador */}
        <Card className='mb-6 border-border'>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2 text-foreground'>
              <Users className='w-6 h-6' />
              <span>{jugador.nombre}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
              <div className='col-span-2 md:col-span-1 text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <Target className='w-5 h-5 text-blue-500' />
                  <span className='text-2xl font-bold text-blue-400'>
                    {jugador.promedio.toFixed(3)}
                  </span>
                </div>
                <p className='text-sm text-muted-foreground'>Promedio</p>
              </div>

              <div className='text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg'>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <BarChart3 className='w-5 h-5 text-green-500' />
                  <span className='text-2xl font-bold text-green-400'>
                    {jugador.mejor_serie}
                  </span>
                </div>
                <p className='text-sm text-muted-foreground'>Mejor Serie</p>
              </div>

              <div className='text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg'>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <Trophy className='w-5 h-5 text-purple-500' />
                  <span className='text-2xl font-bold text-purple-400'>
                    {jugador.total_carambolas}
                  </span>
                </div>
                <p className='text-sm text-muted-foreground'>
                  Total Carambolas
                </p>
              </div>

              <div className='text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg'>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <Users className='w-5 h-5 text-orange-500' />
                  <span className='text-2xl font-bold text-orange-400'>
                    {jugador.partidas_jugadas}
                  </span>
                </div>
                <p className='text-sm text-muted-foreground'>Partidas</p>
              </div>

              <div className='text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg'>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <Users className='w-5 h-5 text-yellow-500' />
                  <span className='text-2xl font-bold text-yellow-400'>
                    {jugador.total_entradas}
                  </span>
                </div>
                <p className='text-sm text-muted-foreground'>Total Entradas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de partidas */}
        <Card className='border-border'>
          <CardHeader>
            <CardTitle className='text-foreground'>
              Historial de Partidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className='space-y-4'>
                {partidas.map((partida) => {
                  const rival = obtenerRival(partida);
                  const resultado = obtenerResultado(partida);

                  return (
                    <Tooltip key={partida.id}>
                      <TooltipTrigger asChild>
                        <Link href={`/partida/${partida.id}`} className='block'>
                          {/* Layout para móvil */}
                          <div className='block md:hidden border border-border rounded-lg p-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer group hover:border-primary/50'>
                            {/* Header con bola y badge */}
                            <div className='flex items-center justify-between mb-3'>
                              <div className='flex items-center space-x-2'>
                                <div
                                  className={`w-4 h-4 rounded-full border-2 ${
                                    resultado.miBola === 'blanca'
                                      ? 'bg-white border-gray-400'
                                      : 'bg-yellow-400 border-yellow-600'
                                  }`}
                                ></div>
                                <span className='text-xs text-muted-foreground uppercase font-medium'>
                                  con Bola {resultado.miBola}
                                </span>
                              </div>

                              {(() => {
                                const getBadgeProps = () => {
                                  if (resultado.empate) {
                                    return {
                                      variant: 'outline',
                                      className:
                                        'border-muted-foreground text-muted-foreground',
                                      text: 'Empate',
                                    };
                                  }
                                  if (resultado.gane) {
                                    return {
                                      variant: 'default',
                                      className:
                                        'bg-green-500 hover:bg-green-600',
                                      text: 'Victoria',
                                    };
                                  }
                                  return {
                                    variant: 'secondary',
                                    className:
                                      'bg-red-500 hover:bg-red-600 text-white',
                                    text: 'Derrota',
                                  };
                                };

                                const badgeProps = getBadgeProps();
                                return (
                                  <Badge
                                    variant={badgeProps.variant}
                                    className={badgeProps.className}
                                  >
                                    {badgeProps.text}
                                  </Badge>
                                );
                              })()}
                            </div>

                            {/* Rival y resultado - MÓVIL */}
                            <div className='flex items-center justify-between mb-3'>
                              <div className='flex items-center space-x-2'>
                                <div className='flex flex-col'>
                                  <p className='text-sm'>vs.</p>
                                  <div className='flex items-center space-x-1'>
                                    <span className='font-semibold text-foreground text-md'>
                                      {formatearNombre(rival.nombre).apellidos}
                                    </span>
                                    <div
                                      className={`w-3 h-3 rounded-full border ${
                                        resultado.rivalBola === 'blanca'
                                          ? 'bg-white border-gray-400'
                                          : 'bg-yellow-400 border-yellow-600'
                                      }`}
                                    ></div>
                                  </div>
                                  {formatearNombre(rival.nombre).nombres && (
                                    <span className='text-md text-foreground -mt-2'>
                                      {formatearNombre(rival.nombre).nombres}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className='text-right'>
                                <div className='text-2xl font-bold text-foreground'>
                                  {resultado.misCarambolas} -{' '}
                                  {resultado.rivalCarambolas}
                                </div>
                              </div>
                            </div>

                            {/* Series */}
                            <div className='flex justify-end items-center mb-3'>
                              <div className='text-sm text-muted-foreground'>
                                Serie:&nbsp;
                              </div>
                              <Badge
                                variant='outline'
                                className='border-border text-md'
                              >
                                <div className='font-medium text-foreground'>
                                  {resultado.miSerie} vs {resultado.rivalSerie}
                                </div>
                              </Badge>
                            </div>

                            {/* Footer con fecha, hora y partida */}
                            <div className='flex justify-between items-center text-xs text-muted-foreground'>
                              <div className='flex-col items-center space-x-3'>
                                <div className='flex items-center'>
                                  <Calendar className='w-3 h-3 mr-1' />
                                  {formatearFecha(partida.fecha)}
                                </div>
                                <div className='flex items-center'>
                                  <Clock className='w-3 h-3 mr-1' />
                                  {formatearHora(partida.hora_inicio)}
                                  <span className='flex items-center space-x-2'>
                                    {partida.hora_fin && (
                                      <span>
                                        &nbsp;(
                                        {calcularDuracionPartida(
                                          partida.hora_inicio,
                                          partida.hora_fin
                                        )}
                                        )
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <div className='flex items-center justify-between '>
                                  <div className='text-xs text-white pt-1 border-t-2 mt-1'>
                                    Partida #{partida.id}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className='w-5 h-5' />
                            </div>
                          </div>

                          {/* Layout para desktop */}
                          <div className='hidden md:block border border-border rounded-lg p-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer group hover:border-primary/50'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center space-x-4'>
                                <div className='flex-col'>
                                  <div className='flex items-center space-x-1 mb-1 pl-2 text-sm text-muted-foreground'>
                                    {(
                                      partida.carambolas2 / partida.entradas2
                                    ).toFixed(3)}
                                  </div>
                                  <div className='flex items-center space-x-2'>
                                    {(() => {
                                      const getBadgeProps = () => {
                                        if (resultado.empate) {
                                          return {
                                            variant: 'outline',
                                            className:
                                              'border-muted-foreground text-muted-foreground',
                                            text: 'Empate',
                                          };
                                        }
                                        if (resultado.gane) {
                                          return {
                                            variant: 'default',
                                            className:
                                              'bg-green-500 hover:bg-green-600',
                                            text: 'Victoria',
                                          };
                                        }
                                        return {
                                          variant: 'secondary',
                                          className:
                                            'bg-red-500 hover:bg-red-600 text-white',
                                          text: 'Derrota',
                                        };
                                      };

                                      const badgeProps = getBadgeProps();
                                      return (
                                        <Badge
                                          variant={badgeProps.variant}
                                          className={badgeProps.className}
                                        >
                                          {badgeProps.text}
                                        </Badge>
                                      );
                                    })()}
                                  </div>
                                </div>
                                <div>
                                  <div className='flex items-center space-x-1 mb-1'>
                                    <div
                                      className={`w-4 h-4 rounded-full border-2 ${
                                        resultado.miBola === 'blanca'
                                          ? 'bg-white border-gray-400'
                                          : 'bg-yellow-400 border-yellow-600'
                                      }`}
                                    ></div>
                                    <span className='text-xs text-muted-foreground uppercase'>
                                      con Bola {resultado.miBola}
                                    </span>
                                  </div>
                                  <div className='font-semibold text-foreground'>
                                    vs {rival.nombre}
                                    <div
                                      className={`inline-block w-3 h-3 rounded-full border ml-1 ${
                                        resultado.rivalBola === 'blanca'
                                          ? 'bg-white border-gray-400'
                                          : 'bg-yellow-400 border-yellow-600'
                                      }`}
                                    ></div>
                                  </div>
                                  <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                                    <span className='flex items-center'>
                                      <Calendar className='w-4 h-4 mr-1' />
                                      {formatearFecha(partida.fecha)}
                                    </span>
                                    <span className='flex items-center'>
                                      <Clock className='w-4 h-4 mr-1' />
                                      {formatearHora(partida.hora_inicio)}
                                      {partida.hora_fin &&
                                        ` (${calcularDuracionPartida(
                                          partida.hora_inicio,
                                          partida.hora_fin
                                        )})`}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className='text-right flex items-center space-x-3'>
                                <div>
                                  <div className='text-lg font-bold text-foreground'>
                                    {resultado.misCarambolas} -{' '}
                                    {resultado.rivalCarambolas}
                                  </div>
                                  <div className='text-sm text-muted-foreground'>
                                    Mayor Serie: {resultado.miSerie} vs{' '}
                                    {resultado.rivalSerie}
                                  </div>
                                  <div className='text-xs text-muted-foreground'>
                                    Partida #{partida.id}
                                  </div>
                                </div>
                                <ChevronRight className='w-5 h-5' />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Click para ver detalles de la partida #{partida.id}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>

            {partidas.length === 0 && (
              <div className='text-center py-8'>
                <p className='text-muted-foreground'>
                  No hay partidas registradas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
