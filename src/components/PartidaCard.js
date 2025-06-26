import Link from 'next/link';
import {
  Calendar,
  Clock,
  ChevronRight
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatearHora(hora) {
  if (!hora) return '';
  const [horas, minutos] = hora.split(':');
  const horaNum = parseInt(horas);
  const ampm = horaNum >= 12 ? 'PM' : 'AM';
  const hora12 = horaNum % 12 || 12;
  return `${hora12}:${minutos} ${ampm}`;
}

function calcularDuracionPartida(horaInicio, horaFin) {
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
}

// function formatearNombre(nombre) {
//   const indiceComa = nombre.indexOf(',');
//   if (indiceComa !== -1) {
//     const apellidos = nombre.substring(0, indiceComa);
//     const nombres = nombre.substring(indiceComa + 1).trim();
//     return { apellidos, nombres };
//   }
//   return { apellidos: nombre, nombres: '' };
// }

// function obtenerResultado(partida, cedula) {
//   const esJugador1 = partida.jugador1 === cedula;
//   const misCarambolas = esJugador1 ? partida.carambolas1 : partida.carambolas2;
//   const rivalCarambolas = esJugador1 ? partida.carambolas2 : partida.carambolas1;
//   const misEntradas = esJugador1 ? partida.entradas1 : partida.entradas2;
//   const rivalEntradas = esJugador1 ? partida.entradas2 : partida.entradas1;
//   const miSerie = esJugador1 ? partida.seriemayor1 : partida.seriemayor2;
//   const rivalSerie = esJugador1 ? partida.seriemayor2 : partida.seriemayor1;
//   let resultado = 'empate';
//   if (misCarambolas > rivalCarambolas) resultado = 'victoria';
//   else if (misCarambolas < rivalCarambolas) resultado = 'derrota';
//   return {
//     misCarambolas,
//     rivalCarambolas,
//     misEntradas,
//     rivalEntradas,
//     miSerie,
//     rivalSerie,
//     resultado,
//     gane: resultado === 'victoria',
//     empate: resultado === 'empate',
//     miBola: esJugador1 ? 'blanca' : 'amarilla',
//     rivalBola: esJugador1 ? 'amarilla' : 'blanca',
//   };
// }

export default function PartidaCard({ partida,  }) {
//export default function PartidaCard({ partida, jugadorActualCedula }) {
// Si se provee jugadorActualCedula, se calcula resultado, si no, se omite
  // let rival = null, resultado = null;
  // if (jugadorActualCedula) {
  //   rival = partida.jugador1 === jugadorActualCedula ? partida.jugador2_data : partida.jugador1_data;
  //   resultado = obtenerResultado(partida, jugadorActualCedula);
  // }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={`/partida/${partida.id}`} className="block">
          <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer group hover:border-primary/50 flex flex-col md:flex-row md:justify-between">
            {/* Info principal */}
            <div className="flex-1 flex flex-col md:flex-row md:items-center md:space-x-6">
              <div className="mb-2 md:mb-0">
                <span className="text-xs text-muted-foreground">
                  Partida #{partida.id}
                </span>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatearFecha(partida.fecha)}</span>
                  <Clock className="w-4 h-4" />
                  <span>{formatearHora(partida.hora_inicio)}</span>
                  {partida.hora_fin && (
                    <span>
                      ({calcularDuracionPartida(partida.hora_inicio, partida.hora_fin)})
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium text-foreground">
                  {partida.jugador1_data?.nombre || partida.jugador1} vs {partida.jugador2_data?.nombre || partida.jugador2}
                </span>
              </div>
            </div>
            <div className="flex items-center mt-2 md:mt-0">
              <span className="text-xl font-bold text-foreground">
                {partida.carambolas1} - {partida.carambolas2}
              </span>
              <ChevronRight className="w-5 h-5 ml-2" />
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
}