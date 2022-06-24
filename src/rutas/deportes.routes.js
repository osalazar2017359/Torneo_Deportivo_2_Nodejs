const express = require('express');
const usuariosController = require('../controladores/Deportivo_Admin.controller');
const torneoController = require('../controladores/Deportivo_Usuario.controller')

const md_autentificacion = require('../middlewares/autentificacion');
const md_autentificacion_rol = require('../middlewares/autentificacion_rol');
const tablaPdf = require('../PDFs/tablaResultados.pdf')


var api = express.Router();

api.post('/login', usuariosController.Login);

api.get('/verUsuarios', /*[*/md_autentificacion.Auth/*, md_autentificacion_rol.Admi]*/, usuariosController.verUsuarios);
api.post('/registrar', usuariosController.Registrar);
api.put('/editarUsuario/:idUsuario', md_autentificacion.Auth, usuariosController.editarUsuario);
api.delete('/eliminarUsuario/:idUsuario', md_autentificacion.Auth, usuariosController.eliminarUsuario);

api.get('/verTorneos/:_id'/*ID DEL ADMIN*/, /*[*/md_autentificacion.Auth,/* md_autentificacion_rol.Admi],*/ usuariosController.verTorneos);
api.get('/torneo/:idTorneo', md_autentificacion.Auth, usuariosController.torneoId);
api.post('/crearTorneo/:_id', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Admi],*/ usuariosController.crearTorneo);
api.put('/editarTorneo/:idTorneo', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Admi],*/ usuariosController.editarTorneo);
api.delete('/eliminarTorneo/:idTorneo', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Admi],*/ usuariosController.eliminarTorneo);
api.post('/asignarLiga', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Admi],*/ usuariosController.asignarLigas);
api.get('/ligaAsig/:idAsig', md_autentificacion.Auth, usuariosController.torneoId);


api.get('/verLigas/:idUsuario', /*[*/md_autentificacion.Auth/*, md_autentificacion_rol.Org]*/, torneoController.verLigas);
api.get('/ligaId/:idLiga', md_autentificacion.Auth, torneoController.ligaId);
api.post('/crearLiga/:idUsuario', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Org],*/ torneoController.crearLiga);
api.put('/editarLiga/:idLiga', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Org],*/ torneoController.editarLiga);
api.delete('/eliminarLiga/:idLiga', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Org],*/ torneoController.eliminarLiga);

api.get('/verEquipos/:idUsuario', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Org],*/ torneoController.verEquipos);
api.get('/equipoId/:idEquipo', md_autentificacion.Auth, torneoController.EquipoId);
api.post('/crearEquipo/:idUsuario', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Org],*/ torneoController.crearEquipo);
api.put('/editarEquipo/:idEquipo', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Org],*/ torneoController.editarEquipo);
api.delete('/eliminarEquipo/:idEquipo', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Org],*/ torneoController.eliminarEquipo);


api.post('/asignarEquipo', [md_autentificacion.Auth, md_autentificacion_rol.Org], torneoController.asignarEquipos);
api.get('/verJornadas/:idLiga', md_autentificacion.Auth, torneoController.verJornadas);
api.get('/jornada/:idJornada', md_autentificacion.Auth, torneoController.jornadaId);
api.post('/generarJornadas/:idLiga', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Org],*/ torneoController.generarJornadas);
api.put('/partidosXJornada/:idJornada', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Org],*/ torneoController.agregarYPuntuarPartidos);
api.get('/tabla/:idLiga', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Org],*/ torneoController.tablaCalificacion);

api.get('/tablaPdf/:idLiga', /*[*/md_autentificacion.Auth, /*md_autentificacion_rol.Org],*/ tablaPdf.creandoPdf);

module.exports = api;
