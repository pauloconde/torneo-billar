'use client'

import { useState, useEffect } from 'react'
import { obtenerRanking } from '@/lib/queries'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Target, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarRanking() {
      try {
        const data = await obtenerRanking()
        setRanking(data)
      } catch (error) {
        console.error('Error cargando ranking:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarRanking()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando ranking...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ranking Inicial Billar 3 Bandas - Barinas 2025
          </h1>
          <p className="text-gray-600">Ranking en tiempo real</p>
        </div>

        {/* Ranking */}
        <div className="space-y-4">
          {ranking.map((jugador, index) => (
            <Link 
              key={jugador.cedula} 
              href={`/jugador/${jugador.cedula}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Posición y nombre */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                        {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                        {index === 1 && <Trophy className="w-6 h-6 text-gray-400" />}
                        {index === 2 && <Trophy className="w-6 h-6 text-amber-600" />}
                        {index > 2 && <span className="font-bold text-gray-600">#{index + 1}</span>}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {jugador.nombre}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {jugador.partidas_jugadas} {jugador.partidas_jugadas === 1 ? ' partida jugada' : ' partidas jugadas'}
                        </p>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4 text-blue-500" />
                          <span className="text-2xl font-bold text-blue-600">
                            {jugador.promedio.toFixed(3)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Promedio</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-4 h-4 text-green-500" />
                          <span className="text-lg font-semibold text-green-600">
                            {jugador.mejor_serie}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Mejor Serie</p>
                      </div>

                      <div className="text-center">
                        <Badge variant="outline">
                          {jugador.total_carambolas}/{jugador.total_entradas}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">Car/Ent</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {ranking.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay datos disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
}