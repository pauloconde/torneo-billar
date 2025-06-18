'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { obtenerRanking } from '@/lib/queries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, BarChart3, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from 'next/link';

export default function HomePage() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarRanking() {
      try {
        const data = await obtenerRanking();
        setRanking(data);
      } catch (error) {
        console.error('Error cargando ranking:', error);
      } finally {
        setLoading(false);
      }
    }

    cargarRanking();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen bg-background p-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
            <p className='mt-4 text-muted-foreground'>Cargando ranking...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background p-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          {/* Layout móvil - Logo arriba, título abajo */}
          <div className='block md:hidden text-center'>
            <div className='mb-4'>
              <Image
                src='/logo_clear.png'
                alt='Logo del torneo'
                width={100} // ancho en píxeles
                height={100} // alto en píxeles
                className='mx-auto md:mx-0'
                priority
              />
            </div>
            <h1 className='text-2xl font-bold text-foreground mb-2'>
              Ranking Inicial de Billar 3 Bandas
            </h1>
            <p className='text-muted-foreground'>Barinas - Junio 2025</p>
          </div>

          {/* Layout desktop - Logo a la izquierda, título a la derecha */}
          <div className='hidden md:flex md:items-center md:justify-center md:space-x-6'>
            <Image
              src='/logo_clear.png'
              alt='Logo del torneo'
              width={150} // ancho en píxeles
              height={150} // alto en píxeles
              className='mx-auto md:mx-0'
              priority
            />
            <div className='text-center'>
              <h1 className='text-3xl font-bold text-foreground mb-2'>
                Ranking Inicial de Billar 3 Bandas
              </h1>
              <p className='text-muted-foreground'>Barinas - Junio 2025</p>
            </div>
          </div>
        </div>
        
        {/* Ranking */}
        <TooltipProvider>
          <div className='space-y-4'>
            {ranking.map((jugador, index) => (
              <Tooltip key={jugador.cedula}>
                <TooltipTrigger asChild>
                  <Link
                    href={`/jugador/${jugador.cedula}`}
                    className='block'
                  >
                    <Card className='hover:shadow-lg transition-all duration-200 cursor-pointer border-border group hover:border-primary/50'>
                      <CardContent className='p-4 md:p-6'>
                        <div className='flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0'>
                          {/* Posición y nombre */}
                          <div className='flex items-center space-x-4'>
                            <div className='flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted'>
                              {index === 0 && (
                                <Trophy className='w-5 h-5 md:w-6 md:h-6 text-yellow-500' />
                              )}
                              {index === 1 && (
                                <Trophy className='w-5 h-5 md:w-6 md:h-6 text-gray-400' />
                              )}
                              {index === 2 && (
                                <Trophy className='w-5 h-5 md:w-6 md:h-6 text-amber-600' />
                              )}
                              {index > 2 && (
                                <span className='font-bold text-muted-foreground text-sm md:text-base'>
                                  #{index + 1}
                                </span>
                              )}
                            </div>
                            <div>
                              <h3 className='text-base md:text-lg font-semibold text-foreground'>
                                {jugador.nombre}
                              </h3>
                              <p className='text-xs md:text-sm text-muted-foreground'>
                                {jugador.partidas_jugadas}{' '}
                                {jugador.partidas_jugadas === 1
                                  ? 'partida jugada'
                                  : 'partidas jugadas'}
                              </p>
                            </div>
                          </div>

                          {/* Estadísticas */}
                          <div className='flex items-center justify-between md:justify-end space-x-4 md:space-x-6'>
                            {/* Promedio y Serie en columna para móvil */}
                            <div className='flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-6'>
                              <div className='text-center'>
                                <div className='flex items-center justify-center space-x-1'>
                                  <Target className='w-4 h-4 text-blue-500' />
                                  <span className='text-xl md:text-2xl font-bold text-blue-400'>
                                    {jugador.promedio.toFixed(3)}
                                  </span>
                                </div>
                                <p className='text-xs text-muted-foreground'>
                                  Promedio
                                </p>
                              </div>

                              <div className='text-center'>
                                <div className='flex items-center justify-center space-x-1'>
                                  <BarChart3 className='w-4 h-4 text-green-500' />
                                  <span className='text-lg md:text-xl font-semibold text-green-400'>
                                    {jugador.mejor_serie}
                                  </span>
                                </div>
                                <p className='text-xs text-muted-foreground'>
                                  Mejor Serie
                                </p>
                              </div>
                            </div>

                            {/* Car/Ent separado */}
                            <div className='text-center'>
                              <Badge
                                variant='outline'
                                className='border-border text-md'
                              >
                                {jugador.total_carambolas}/{jugador.total_entradas}
                              </Badge>
                              <p className='text-xs text-muted-foreground mt-1'>
                                C/E
                              </p>
                            </div>

                            {/* Indicador de click */}
                            <div className="flex items-center text-muted-foreground group-hover:text-primary transition-colors">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click para ver historial de partidas de {jugador.nombre}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        {ranking.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>No hay datos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}