'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { obtenerPartida } from '@/lib/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, Trophy, Target, Users } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function PartidaPage() {
  const params = useParams()
  const router = useRouter()
  const id = parseInt(params.id)

  const [partida, setPartida] = useState(null)
  const [entradas, setEntradas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarPartida() {
      try {
        const data = await obtenerPartida(id)
        if (data) {
          setPartida(data.partida)
          setEntradas(data.entradas)
        }
      } catch (error) {
        console.error('Error cargando partida:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      cargarPartida()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando partida...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!partida) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-destructive">Partida no encontrada</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatearHora = (hora) => {
    if (!hora) return ''
    const [horas, minutos] = hora.split(':')
    const horaNum = parseInt(horas)
    const ampm = horaNum >= 12 ? 'PM' : 'AM'
    const hora12 = horaNum % 12 || 12
    return `${hora12}:${minutos} ${ampm}`
  }

  const calcularDuracion = (horaInicio, horaFin) => {
    if (!horaInicio || !horaFin) return null
    const convertirAMinutos = (hora) => {
      const [horas, minutos] = hora.split(':').map(Number)
      return horas * 60 + minutos
    }
    const minutosInicio = convertirAMinutos(horaInicio)
    let minutosFin = convertirAMinutos(horaFin)
    if (minutosFin < minutosInicio) {
      minutosFin += 24 * 60
    }
    const duracionMinutos = minutosFin - minutosInicio
    if (duracionMinutos < 60) {
      return `${duracionMinutos} min`
    } else {
      const horas = Math.floor(duracionMinutos / 60)
      const minutos = duracionMinutos % 60
      return minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`
    }
  }

  // Datos para el gráfico de torta
  const dataTorta = [
    {
      name: partida.jugador1_data.nombre,
      value: partida.carambolas1,
      color: '#ffffff', // Blanco para jugador1 (bola blanca)
      bola: 'Bola Blanca'
    },
    {
      name: partida.jugador2_data.nombre,
      value: partida.carambolas2,
      color: '#fbbf24', // Amarillo para jugador2 (bola amarilla)
      bola: 'Bola Amarilla'
    }
  ]

  // Datos para el gráfico de series
  const dataSeries = [
    {
      name: 'Series Mayores',
      [partida.jugador1_data.nombre]: partida.seriemayor1,
      [partida.jugador2_data.nombre]: partida.seriemayor2
    }
  ]

  // Datos para evolución por entrada
  const dataEvolucion = entradas.map(entrada => ({
    entrada: entrada.numero_entrada,
    [partida.jugador1_data.nombre]: entrada.carambolas_jugador1,
    [partida.jugador2_data.nombre]: entrada.carambolas_jugador2
  }))

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header con botón de regreso */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Header de la partida */}
        <Card className="mb-6 border-border">
          <CardHeader>
            <CardTitle className="text-center">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-2 mb-2 md:mb-0">
                  <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-400"></div>
                  <span className="text-lg">{partida.jugador1_data.nombre}</span>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {partida.carambolas1} - {partida.carambolas2}
                  </div>
                  <p className="text-sm text-muted-foreground">Partida #{partida.id}</p>
                </div>
                
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <span className="text-lg">{partida.jugador2_data.nombre}</span>
                  <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-600"></div>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center space-x-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatearFecha(partida.fecha)}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center space-x-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatearHora(partida.hora_inicio)}</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Duración: {calcularDuracion(partida.hora_inicio, partida.hora_fin)}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Árbitro: {partida.arbitro}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de torta */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-center">Distribución de Carambolas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataTorta}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dataTorta.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de series */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-center">Series Mayores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey={partida.jugador1_data.nombre} fill="#ffffff" />
                  <Bar dataKey={partida.jugador2_data.nombre} fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Evolución por entrada */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-center">Evolución por Entrada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 md:h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataEvolucion}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="entrada" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={partida.jugador1_data.nombre} fill="#ffffff" />
                  <Bar dataKey={partida.jugador2_data.nombre} fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas detalladas */}
        <Card className="mt-6 border-border">
          <CardHeader>
            <CardTitle>Estadísticas Detalladas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center">
                  <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-400 mr-2"></div>
                  {partida.jugador1_data.nombre}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Carambolas:</span>
                    <span className="font-medium">{partida.carambolas1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entradas:</span>
                    <span className="font-medium">{partida.entradas1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Promedio:</span>
                    <span className="font-medium">
                      {partida.entradas1 > 0 ? (partida.carambolas1 / partida.entradas1).toFixed(3) : '0.000'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Serie Mayor:</span>
                    <span className="font-medium">{partida.seriemayor1}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-600 mr-2"></div>
                  {partida.jugador2_data.nombre}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Carambolas:</span>
                    <span className="font-medium">{partida.carambolas2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entradas:</span>
                    <span className="font-medium">{partida.entradas2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Promedio:</span>
                    <span className="font-medium">
                      {partida.entradas2 > 0 ? (partida.carambolas2 / partida.entradas2).toFixed(3) : '0.000'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Serie Mayor:</span>
                    <span className="font-medium">{partida.seriemayor2}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}