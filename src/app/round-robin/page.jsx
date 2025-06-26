"use client";
import React, { useEffect, useState } from "react";
import { obtenerParticipantesYPartidas } from "@/lib/queries";
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function RoundRobinPage() {
  const [participantes, setParticipantes] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { participantes, partidas } = await obtenerParticipantesYPartidas();
      setParticipantes(participantes);
      setPartidas(partidas);
      setLoading(false);
    }
    fetchData();
  }, []);

  const calcularPartidasPorJugador = () => {
    const resumen = {};
    participantes.forEach((p) => {
      let jugadas = 0;
      let pendientes = 0;
      participantes.forEach((oponente) => {
        if (p.cedula === oponente.cedula) return;
        const partida = partidas.find(
          (pt) =>
            (pt.jugador1 === p.cedula && pt.jugador2 === oponente.cedula) ||
            (pt.jugador2 === p.cedula && pt.jugador1 === oponente.cedula)
        );
        if (partida) {
          const jugado = partida.carambolas1 > 0 || partida.carambolas2 > 0;
          if (jugado) jugadas++;
          else pendientes++;
        } else {
          pendientes++;
        }
      });
      resumen[p.cedula] = { jugadas, pendientes };
    });
    return resumen;
  };

  const resumenJugadores = calcularPartidasPorJugador();

  // Nuevo resumen general basado en la base de datos real:
  const totalJugadas = partidas.filter(
    (p) => p.carambolas1 > 0 || p.carambolas2 > 0
  ).length;
  const totalTeorico =
    (participantes.length * (participantes.length - 1)) / 2;
  const totalPendientes = totalTeorico - totalJugadas;

  const resumenGeneral = {
    jugadas: totalJugadas,
    pendientes: totalPendientes >= 0 ? totalPendientes : 0,
  };

  if (loading)
    return (
      <div className="p-4 text-center text-muted-foreground">Cargando...</div>
    );

  const getPartida = (cedula1, cedula2) =>
    partidas.find(
      (p) =>
        (p.jugador1 === cedula1 && p.jugador2 === cedula2) ||
        (p.jugador1 === cedula2 && p.jugador2 === cedula1)
    );

  return (
    <TooltipProvider>
      <div className="overflow-x-auto p-2 max-w-full">
        <table className="min-w-max border-collapse text-sm rounded-lg overflow-hidden font-mono">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-background text-primary p-2 border border-border text-left font-semibold align-top w-32">
                <div className="flex flex-col gap-1">
                  <Image
                    src="/logo_clear.png"
                    alt="Logo del torneo"
                    width={150}
                    height={150}
                    className="mx-auto md:mx-0"
                    priority
                  />
                  <span>
                    <span className="font-bold">{resumenGeneral.jugadas}</span>{" "}
                    jugadas
                  </span>
                  <span>
                    <span className="font-bold">
                      {resumenGeneral.pendientes}
                    </span>{" "}
                    pendientes
                  </span>
                </div>
              </th>
              {participantes.map((p) => (
                <th
                  key={p.cedula}
                  className="p-1 border border-border bg-background text-primary font-semibold align-bottom"
                  style={{
                    minWidth: 32,
                    height: 96,
                    verticalAlign: "bottom",
                    padding: 0,
                  }}
                >
                  <div className="flex flex-col items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="block text-xs pt-2 cursor-help"
                          style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            whiteSpace: "nowrap",
                            lineHeight: 1,
                          }}
                        >
                          {p.nombre}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        <div>
                          <span className="font-bold">
                            {resumenJugadores[p.cedula]?.jugadas}
                          </span>{" "}
                          jugadas
                        </div>
                        <div>
                          <span className="font-bold">
                            {resumenJugadores[p.cedula]?.pendientes}
                          </span>{" "}
                          pendientes
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {participantes.map((rowP) => (
              <tr key={rowP.cedula}>
                {/* Nombre del jugador a la izquierda como link */}
                <th className="sticky left-0 z-10 bg-background text-primary p-1 border border-border font-normal text-left align-top w-32">
                  <Link
                    href={`/jugador/${rowP.cedula}`}
                    className="text-xs underline hover:text-blue-400 transition-colors"
                  >
                    {rowP.nombre}
                  </Link>
                </th>
                {participantes.map((colP) => {
                  if (rowP.cedula === colP.cedula) {
                    // Diagonal principal, vacío
                    return (
                      <td
                        key={colP.cedula}
                        className="bg-muted border border-border w-8 h-8 text-center"
                      ></td>
                    );
                  }
                  const partida = getPartida(rowP.cedula, colP.cedula);
                  if (partida) {
                    const jugada =
                      partida.carambolas1 > 0 || partida.carambolas2 > 0;
                    // Si fue jugada, el punto es un link
                    return (
                      <td
                        key={colP.cedula}
                        className="border border-border w-8 h-8 text-center select-none"
                        title={
                          jugada
                            ? `Partida jugada (ver detalles)`
                            : "Partida pendiente"
                        }
                      >
                        {jugada ? (
                          <Link
                            href={`/partida/${partida.id}`}
                            className="inline-block w-full h-full flex items-center justify-center"
                            scroll={false}
                          >
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                          </Link>
                        ) : (
                          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300" />
                        )}
                      </td>
                    );
                  }
                  // No existe la partida: celda en blanco
                  return (
                    <td
                      key={colP.cedula}
                      className="border border-border w-8 h-8 text-center bg-transparent"
                    ></td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}