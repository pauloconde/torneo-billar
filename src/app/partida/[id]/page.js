'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { obtenerPartida } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ArrowLeft, Calendar, Clock, Trophy, Target, Star } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

export default function PartidaPage() {
  const params = useParams();
  const router = useRouter();
  const partidaId = params.id;

  const [partida, setPartida] = useState(null);
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);

  const colorBlanco = '#ffffff';
  const colorAmarillo = '#FBBF24';

  useEffect(() => {
    async function cargarDatos() {
      try {
        const data = await obtenerPartida(partidaId);
        setPartida(data.partida);
        setEntradas(data.entradas);
      } catch (error) {
        console.error('Error cargando detalle de partida:', error);
      } finally {
        setLoading(false);
      }
    }

    if (partidaId) {
      cargarDatos();
    }
  }, [partidaId]);

  if (loading) {
    return (
      <div className='min-h-screen bg-background p-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
            <p className='mt-4 text-muted-foreground'>
              Cargando detalle de partida...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!partida) {
    return (
      <div className='min-h-screen bg-background p-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center py-8'>
            <p className='text-destructive'>Partida no encontrada</p>
            <Button onClick={() => router.back()} className='mt-4'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Volver
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
    const [horas, minutos] = hora.split(':');
    const horaNum = Number.parseInt(horas);
    const ampm = horaNum >= 12 ? 'PM' : 'AM';
    const hora12 = horaNum % 12 || 12;
    return `${hora12}:${minutos} ${ampm}`;
  };

  const calcularDuracionPartida = (horaInicio, horaFin) => {
    if (!horaInicio || !horaFin) return null;

    const convertirAMinutos = (hora) => {
      const [horas, minutos] = hora.split(':').map(Number);
      return horas * 60 + minutos;
    };

    const minutosInicio = convertirAMinutos(horaInicio);
    let minutosFin = convertirAMinutos(horaFin);

    if (minutosFin < minutosInicio) {
      minutosFin += 24 * 60;
    }

    const duracionMinutos = minutosFin - minutosInicio;

    if (duracionMinutos < 60) {
      return `${duracionMinutos} min`;
    } else {
      const horas = Math.floor(duracionMinutos / 60);
      const minutos = duracionMinutos % 60;
      return minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`;
    }
  };

  const formatearNombre = (nombre) => {
    const indiceComa = nombre.indexOf(',');
    if (indiceComa !== -1) {
      const apellidos = nombre.substring(0, indiceComa);
      const nombres = nombre.substring(indiceComa + 1).trim();
      return { apellidos, nombres };
    }
    return { apellidos: nombre, nombres: '' };
  };

  // Datos para evolución por entrada (acumulativo)
  const prepararDatosEvolucion = () => {
    let acumulado1 = 0;
    let acumulado2 = 0;

    return entradas
      .sort((a, b) => a.numero_entrada - b.numero_entrada)
      .map((entrada) => {
        acumulado1 += entrada.carambolas_jugador1 || 0;
        acumulado2 += entrada.carambolas_jugador2 || 0;

        return {
          entrada: entrada.numero_entrada,
          [partida.jugador1_data.nombre]: acumulado1,
          [partida.jugador2_data.nombre]: acumulado2,
          carambolas1: entrada.carambolas_jugador1 || 0,
          carambolas2: entrada.carambolas_jugador2 || 0,
          serie1: entrada.serie1 || false,
          serie2: entrada.serie2 || false,
        };
      });
  };

  // Preparar datos para el pie chart
  const prepararDatosPie = () => {
    const nombre1 = formatearNombre(partida.jugador1_data.nombre).apellidos;
    const nombre2 = formatearNombre(partida.jugador2_data.nombre).apellidos;

    return [
      {
        name: nombre1,
        value: partida.carambolas1,
        color: colorBlanco,
      },
      {
        name: nombre2,
        value: partida.carambolas2,
        color: colorAmarillo,
      },
    ];
  };

  const dataEvolucion = prepararDatosEvolucion();
  const datosPie = prepararDatosPie();

  const nombre1 = formatearNombre(partida.jugador1_data.nombre);
  const nombre2 = formatearNombre(partida.jugador2_data.nombre);

  // Determinar resultado de la partida
  let resultadoPartida = 'empate';
  if (partida.carambolas1 > partida.carambolas2) {
    resultadoPartida = 'jugador1';
  } else if (partida.carambolas2 > partida.carambolas1) {
    resultadoPartida = 'jugador2';
  }

  // Función para obtener el badge del resultado
  const obtenerBadgeResultado = (jugador) => {
    if (resultadoPartida === 'empate') {
      return (
        <Badge className='mt-2 bg-gray-500 hover:bg-gray-600'>Empate</Badge>
      );
    }

    if (resultadoPartida === jugador) {
      return (
        <Badge className='mt-2 bg-green-500 hover:bg-green-600'>Ganador</Badge>
      );
    } else {
      return (
        <Badge className='mt-2 bg-red-500 hover:bg-red-600'>Perdedor</Badge>
      );
    }
  };

  return (
    <div className='min-h-screen bg-background p-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='mb-4'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Volver
          </Button>
        </div>

        {/* Información de la partida */}
        <Card className='mb-6 border-border'>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center space-x-2'>
                <Trophy className='w-6 h-6' />
                <span>Partida #{partida.id}</span>
              </span>
              <div className='flex-col items-center space-x-4 text-sm text-muted-foreground'>
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Marcador principal */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
              {/* Jugador 1 */}
              <div className='text-center'>
                <div className='flex items-center justify-center space-x-2 mb-2'>
                  <div className='w-6 h-6 rounded-full bg-white border-2 border-gray-400'></div>
                  <span className='text-xs text-muted-foreground uppercase'>
                    Bola Blanca
                  </span>
                </div>
                <div className='space-y-1'>
                  <h3 className='font-bold text-lg'>{nombre1.nombres}</h3>
                  <h3 className='font-bold text-lg -mt-2'>
                    {nombre1.apellidos}
                  </h3>
                </div>
                <div className='text-4xl font-bold text-white mt-2'>
                  {partida.carambolas1}
                </div>
                {obtenerBadgeResultado('jugador1')}
              </div>

              {/* VS */}
              <div className='flex items-center justify-center'>
                <div className='text-2xl font-bold text-muted-foreground'>
                  VS
                </div>
              </div>

              {/* Jugador 2 */}
              <div className='text-center'>
                <div className='flex items-center justify-center space-x-2 mb-2'>
                  <div className='w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-600'></div>
                  <span className='text-xs text-muted-foreground uppercase'>
                    Bola Amarilla
                  </span>
                </div>
                <div className='space-y-1'>
                  <h3 className='font-bold text-lg'>{nombre2.nombres}</h3>
                  <h3 className='font-bold text-lg -mt-2'>
                    {nombre2.apellidos}
                  </h3>
                </div>
                <div className='text-4xl font-bold text-yellow-400 mt-2'>
                  {partida.carambolas2}
                </div>
                {obtenerBadgeResultado('jugador2')}
              </div>
            </div>

            {/* Estadísticas adicionales */}
            <div className='grid grid-cols-3 md:grid-cols-3 gap-4 pt-4 border-t border-border'>
              <Badge variant='outline' className='border-border text-md'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-foreground'>
                    {partida.entradas1}
                  </div>
                  <p className='text-sm text-muted-foreground'>Entradas</p>
                  <p className='text-xs text-muted-foreground'>sin límite</p>
                </div>
              </Badge>
              <div className='text-center'>
                <div className='text-2xl font-bold text-foreground'>
                  {partida.seriemayor1}
                </div>
                <p className='text-sm text-muted-foreground'>
                  Mejor Serie Blanca
                </p>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-400'>
                  {partida.seriemayor2}
                </div>
                <p className='text-sm text-muted-foreground'>
                  Mejor Serie Amarilla
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          {/* Evolución por entrada */}
          <Card className='border-border'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Target className='w-5 h-5' />
                <span>Evolución de la partida</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-96'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={dataEvolucion}>
                    <CartesianGrid strokeDasharray='1 2' />
                    <XAxis dataKey='entrada' />
                    <YAxis width={18} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = dataEvolucion.find(
                            (d) => d.entrada === label
                          );
                          return (
                            <div className='bg-background border border-border rounded-lg p-3 shadow-lg'>
                              <p className='font-semibold'>{`Entrada ${label}`}</p>
                              {payload.map((entry, index) => (
                                <div key={index}>
                                  <p
                                    style={{ color: entry.color }}
                                  >{`${entry.dataKey}: ${entry.value} (acumulado)`}</p>
                                  <p
                                    style={{ color: entry.color }}
                                    className='text-sm opacity-75'
                                  >
                                    {`Esta entrada: ${
                                      index === 0
                                        ? data.carambolas1
                                        : data.carambolas2
                                    }`}
                                  </p>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type='monotone'
                      dataKey={partida.jugador1_data.nombre}
                      stroke={colorBlanco}
                      strokeWidth={3}
                      dot={{
                        fill: '#aaa',
                        strokeWidth: 1,
                        r: 3,
                        stroke: colorBlanco,
                      }}
                      activeDot={{ r: 6, stroke: colorBlanco, strokeWidth: 2 }}
                    />
                    <Line
                      type='monotone'
                      dataKey={partida.jugador2_data.nombre}
                      stroke={colorAmarillo}
                      strokeWidth={3}
                      dot={{
                        fill: '#C99011',
                        strokeWidth: 1,
                        r: 3,
                        stroke: colorAmarillo,
                      }}
                      activeDot={{
                        r: 6,
                        stroke: colorAmarillo,
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className='border-border'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Target className='w-5 h-5' />
                <span>Distribución de Carambolas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  [nombre1.apellidos]: {
                    label: '',
                    color: colorBlanco,
                  },
                  [nombre2.apellidos]: {
                    label: '',
                    color: colorAmarillo,
                  },
                }}
                className='h-64 md:h-80 w-[100%]'
              >
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={datosPie}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ value, percent }) =>
                        `${value} (${(percent * 100).toFixed(1)}%)`
                      }
                      outerRadius={100}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {datosPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabla detallada de entradas */}
        <Card className='border-border'>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Target className='w-5 h-5' />
              <span>Detalle por entradas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <tbody>
                  {dataEvolucion.map((entrada, index) => (
                    <tr key={index} className='border-b border-border/50'>
                      <td className='p-2 font-medium'>{entrada.entrada}</td>
                      <td className='text-center p-2'>
                        <span className='inline-flex items-center space-x-1'>
                          <div className='w-3 h-3 rounded-full bg-white'></div>
                          <span>{entrada.carambolas1}</span>
                        </span>
                        <Star
                          className='w-2 h-2 inline-block ml-1 -mt-1'
                          color={entrada.serie1 ? '#eab308' : 'transparent'} // amarillo-500 de Tailwind
                          fill={entrada.serie1 ? '#eab308' : 'transparent'}
                        />
                      </td>
                      <td className='text-center p-2'>
                        <span className='inline-flex items-center space-x-1'>
                          <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
                          <span>{entrada.carambolas2}</span>
                        </span>

                        <Star
                          className='w-2 h-2 inline-block ml-1 -mt-1'
                          color={entrada.serie2 ? '#eab308' : 'transparent'} // amarillo-500 de Tailwind
                          fill={entrada.serie2 ? '#eab308' : 'transparent'}
                        />
                      </td>
                      <td className='text-center p-2 text-sm text-muted-foreground'>
                        {entrada[partida.jugador1_data.nombre]} -{' '}
                        {entrada[partida.jugador2_data.nombre]}
                      </td>
                    </tr>
                  ))}
                  {console.log('Entrada:', dataEvolucion)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
