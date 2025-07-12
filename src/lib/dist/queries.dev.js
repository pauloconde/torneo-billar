"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.obtenerPartidasJugador = obtenerPartidasJugador;
exports.obtenerPartida = obtenerPartida;
exports.obtenerParticipantesYPartidas = obtenerParticipantesYPartidas;
exports.obtenerParticipantes = obtenerParticipantes;
exports.insertarPartida = insertarPartida;
exports.insertarEntradas = insertarEntradas;
exports.obtenerTodasLasPartidas = obtenerTodasLasPartidas;
exports.formatearFechaBD = formatearFechaBD;
exports.obtenerNoJugados = obtenerNoJugados;

import _supabase from "./supabase";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

// Obtener partidas de un jugador
function obtenerPartidasJugador(cedula) {
  var _ref, data, error;

  return regeneratorRuntime.async(function obtenerPartidasJugador$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(_supabase.supabase.from('partidas').select("\n      *,\n      jugador1_data:participantes!partidas_jugador1_fkey(cedula, nombre),\n      jugador2_data:participantes!partidas_jugador2_fkey(cedula, nombre)\n    ").or("jugador1.eq.".concat(cedula, ",jugador2.eq.").concat(cedula)).order('fecha', {
            ascending: false
          }).order('hora_inicio', {
            ascending: false
          }));

        case 2:
          _ref = _context.sent;
          data = _ref.data;
          error = _ref.error;

          if (!error) {
            _context.next = 8;
            break;
          }

          console.error('Error obteniendo partidas del jugador:', error);
          return _context.abrupt("return", []);

        case 8:
          return _context.abrupt("return", data);

        case 9:
        case "end":
          return _context.stop();
      }
    }
  });
} // Obtener detalles de una partida


function obtenerPartida(id) {
  var _ref2, partida, partidaError, _ref3, entradas, entradasError, maxJ1, maxJ2;

  return regeneratorRuntime.async(function obtenerPartida$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(_supabase.supabase.from('partidas').select("\n      *,\n      jugador1_data:participantes!partidas_jugador1_fkey(cedula, nombre),\n      jugador2_data:participantes!partidas_jugador2_fkey(cedula, nombre)\n    ").eq('id', id).single());

        case 2:
          _ref2 = _context2.sent;
          partida = _ref2.data;
          partidaError = _ref2.error;

          if (!partidaError) {
            _context2.next = 8;
            break;
          }

          console.error('Error obteniendo partida:', partidaError);
          return _context2.abrupt("return", null);

        case 8:
          _context2.next = 10;
          return regeneratorRuntime.awrap(_supabase.supabase.from('entradas').select('*').eq('partida_id', id).order('numero_entrada'));

        case 10:
          _ref3 = _context2.sent;
          entradas = _ref3.data;
          entradasError = _ref3.error;

          if (!entradasError) {
            _context2.next = 16;
            break;
          }

          console.error('Error obteniendo entradas:', entradasError);
          return _context2.abrupt("return", {
            partida: partida,
            entradas: []
          });

        case 16:
          // Buscar el máximo de carambolas >= 2 para cada jugador
          maxJ1 = Math.max.apply(Math, _toConsumableArray(entradas.map(function (e) {
            return e.carambolas_jugador1 >= 2 ? e.carambolas_jugador1 : -Infinity;
          })));
          maxJ2 = Math.max.apply(Math, _toConsumableArray(entradas.map(function (e) {
            return e.carambolas_jugador2 >= 2 ? e.carambolas_jugador2 : -Infinity;
          }))); // Devolver la partida y las entradas de serie mayor

          return _context2.abrupt("return", {
            partida: partida,
            entradas: entradas.map(function (e) {
              return _objectSpread({}, e, {
                serie1: maxJ1 >= 2 && e.carambolas_jugador1 === maxJ1,
                serie2: maxJ2 >= 2 && e.carambolas_jugador2 === maxJ2
              });
            })
          });

        case 19:
        case "end":
          return _context2.stop();
      }
    }
  });
} // Obtiene todos los participantes y todas las partidas


function obtenerParticipantesYPartidas() {
  var _ref4, participantes, errorParticipantes, _ref5, partidas, errorPartidas;

  return regeneratorRuntime.async(function obtenerParticipantesYPartidas$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(_supabase.supabase.from('participantes').select('cedula, nombre').order('nombre'));

        case 2:
          _ref4 = _context3.sent;
          participantes = _ref4.data;
          errorParticipantes = _ref4.error;

          if (!errorParticipantes) {
            _context3.next = 8;
            break;
          }

          console.error('Error obteniendo participantes:', errorParticipantes);
          return _context3.abrupt("return", {
            participantes: [],
            partidas: []
          });

        case 8:
          _context3.next = 10;
          return regeneratorRuntime.awrap(_supabase.supabase.from('partidas').select("\n      id,\n      jugador1,\n      jugador2,\n      entradas1,\n      entradas2,\n      carambolas1,\n      carambolas2,\n      seriemayor1,\n      seriemayor2,\n      jugador1_data:participantes!partidas_jugador1_fkey(cedula, nombre),\n      jugador2_data:participantes!partidas_jugador2_fkey(cedula, nombre)\n    "));

        case 10:
          _ref5 = _context3.sent;
          partidas = _ref5.data;
          errorPartidas = _ref5.error;

          if (!errorPartidas) {
            _context3.next = 16;
            break;
          }

          console.error('Error obteniendo partidas:', errorPartidas);
          return _context3.abrupt("return", {
            participantes: participantes,
            partidas: []
          });

        case 16:
          return _context3.abrupt("return", {
            participantes: participantes,
            partidas: partidas
          });

        case 17:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function obtenerParticipantes() {
  var _ref6, data, error;

  return regeneratorRuntime.async(function obtenerParticipantes$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(_supabase.supabase.from('participantes').select('*').order('nombre', {
            ascending: true
          }));

        case 2:
          _ref6 = _context4.sent;
          data = _ref6.data;
          error = _ref6.error;

          if (!error) {
            _context4.next = 7;
            break;
          }

          throw error;

        case 7:
          return _context4.abrupt("return", data);

        case 8:
        case "end":
          return _context4.stop();
      }
    }
  });
}

function insertarPartida(partida) {
  var _ref7, data, error;

  return regeneratorRuntime.async(function insertarPartida$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(_supabase.supabase.from('partidas').insert([partida]).select().single());

        case 2:
          _ref7 = _context5.sent;
          data = _ref7.data;
          error = _ref7.error;

          if (!error) {
            _context5.next = 7;
            break;
          }

          throw error;

        case 7:
          return _context5.abrupt("return", data);

        case 8:
        case "end":
          return _context5.stop();
      }
    }
  });
}

function insertarEntradas(partida_id, entradas) {
  var filas, _ref8, data, error;

  return regeneratorRuntime.async(function insertarEntradas$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          // entradas es un array de objetos: [{numero_entrada, carambolas_jugador1, carambolas_jugador2}, ...]
          filas = entradas.map(function (entrada, idx) {
            return {
              partida_id: partida_id,
              numero_entrada: idx + 1,
              carambolas_jugador1: entrada.carambolas_jugador1,
              carambolas_jugador2: entrada.carambolas_jugador2
            };
          });
          _context6.next = 3;
          return regeneratorRuntime.awrap(_supabase.supabase.from('entradas').insert(filas));

        case 3:
          _ref8 = _context6.sent;
          data = _ref8.data;
          error = _ref8.error;

          if (!error) {
            _context6.next = 8;
            break;
          }

          throw error;

        case 8:
          return _context6.abrupt("return", data);

        case 9:
        case "end":
          return _context6.stop();
      }
    }
  });
} // Obtener todas las partidas (con datos de ambos jugadores)


function obtenerTodasLasPartidas() {
  var _ref9, data, error;

  return regeneratorRuntime.async(function obtenerTodasLasPartidas$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(_supabase.supabase.from('partidas').select("\n      *,\n      jugador1_data:participantes!partidas_jugador1_fkey(cedula, nombre),\n      jugador2_data:participantes!partidas_jugador2_fkey(cedula, nombre)\n    ").order('id', {
            ascending: false
          }));

        case 2:
          _ref9 = _context7.sent;
          data = _ref9.data;
          error = _ref9.error;

          if (!error) {
            _context7.next = 8;
            break;
          }

          console.error('Error obteniendo todas las partidas:', error);
          return _context7.abrupt("return", []);

        case 8:
          return _context7.abrupt("return", data);

        case 9:
        case "end":
          return _context7.stop();
      }
    }
  });
} // Función para formatear fechas de YYYY-MM-DD a DD/MM/YYYY


function formatearFechaBD(fechaStr) {
  if (!fechaStr) return null; // Verificar si ya está formateada

  if (fechaStr.includes('/')) return fechaStr; // Verificar si es formato ISO (YYYY-MM-DD)

  if (fechaStr.includes('-')) {
    var _fechaStr$split = fechaStr.split('-'),
        _fechaStr$split2 = _slicedToArray(_fechaStr$split, 3),
        year = _fechaStr$split2[0],
        month = _fechaStr$split2[1],
        day = _fechaStr$split2[2];

    return "".concat(day, "/").concat(month, "/").concat(year);
  }

  return fechaStr; // Devolver original si no coincide
}
/**
 * Usa la función RPC para obtener los rivales pendientes de un jugador.
 * @param {string} cedula_jugador
 * @returns {Promise<Array<{cedula:string, nombre:string}>>}
 */


function obtenerNoJugados(cedula_jugador) {
  var _ref10, data, error;

  return regeneratorRuntime.async(function obtenerNoJugados$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return regeneratorRuntime.awrap(_supabase.supabase.rpc('jugadores_no_jugados', {
            cedula_jugador: cedula_jugador
          }));

        case 2:
          _ref10 = _context8.sent;
          data = _ref10.data;
          error = _ref10.error;

          if (!error) {
            _context8.next = 7;
            break;
          }

          throw error;

        case 7:
          return _context8.abrupt("return", data);

        case 8:
        case "end":
          return _context8.stop();
      }
    }
  });
}