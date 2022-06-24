const Usuario = require('../modelos/usuarios.model');
const Torneo = require('../modelos/torneos.model');
const Liga = require('../modelos/ligas.model');
const Asigna = require('../modelos/asignacion_torneos.model');

const bcrypt = require('bcrypt-nodejs');
const jwt = require('../servicios/jwt.tokens');

////////////////////////////////////////////////////////////////
// UNIVERSAL
////////////////////////////////////////////////////////////////
function Login(req, res) {
    var parametros = req.body;

    Usuario.findOne({ usuario: parametros.usuario }, (error, usuarioEncontrado) => {
        if (error) return res.status(500).send({ mensaje: "Error en la petición" });
        if (usuarioEncontrado) {

            bcrypt.compare(parametros.password, usuarioEncontrado.password, (error, verificacionPassword) => {// V/F

                if (verificacionPassword) {

                    if (parametros.Token === "true") {
                        return res.status(200).send({ token: jwt.crearToken(usuarioEncontrado) })
                    } else {
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({ usuario: usuarioEncontrado })
                    }

                } else {
                    return res.status(500).send({ mensaje: "La contraseña no coincide" });
                }
            })

        } else {
            return res.status(500).send({ mensaje: "Error, este usuario no se encuentra registrado" })
        }
    })
}

function Admin(res) {
    var adminModelo = new Usuario();
    adminModelo.usuario = "ADMIN";
    adminModelo.rol = "Admin";

    Usuario.find({ tipo: adminModelo.tipo }, (error, adminEncontrado) => {
        if (adminEncontrado.length == 0)

            bcrypt.hash('deportes123', null, null, (error, passwordEncriptada) => {
                adminModelo.password = passwordEncriptada;

                adminModelo.save((error, adminGuardado) => {
                    if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                    if (!adminGuardado) return res.status(500).send({ mensaje: "Error, no se creo ningun Admin" });

                });
            });
    });
}

////////////////////////////////////////////////////////////////
// CRUD TORNEOS
////////////////////////////////////////////////////////////////
function verTorneos(req, res) {
    var _id = req.params._id;
    Torneo.find({ idAd: /*req.user.sub*/ _id }, (error, torneosObtenidos) => {
        if (error) return res.send({ mensaje: "error:" + error })

        return res.send({ Torneos: torneosObtenidos })
    })
}

function torneoId(req, res) {
    var idTorneo = req.params.idTorneo;
    Torneo.findById(idTorneo, (error, torneoObtenido) => {
        if (error) return res.send({ mensaje: "error:" + error })

        return res.send({ torneo: torneoObtenido })
    })
}

function crearTorneo(req, res) {
    var parametros = req.body;
    var _id = req.params._id
    var torneoModelo = new Torneo();

    if (parametros.nombreTorneo) {

        Torneo.findOne({ nombreTorneo: parametros.nombreTorneo }, (error, torneoEncontrado) => {
            if (error) return res.status(500).send({ mensaje: "Error de la petición" });
            if (!torneoEncontrado) {

                torneoModelo.nombreTorneo = parametros.nombreTorneo;
                torneoModelo.idAd = _id;

                torneoModelo.save((error, torneoGuardado) => {
                    if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                    if (!torneoGuardado) return res.status(500).send({ mensaje: "Error, no se agrego ningun torneo" });

                    return res.status(200).send({
                        Torneo: torneoGuardado, nota: "Torneo agregada exitosamente"
                    });
                });

            } else {
                return res.status(500).send({ mensaje: "Este torneo ya esta registrado" })
            }
        })
    } else {
        return res.status(500).send({ mensaje: "Envie los parametros obligatorios" });
    }
}

function editarTorneo(req, res) {
    var idTorneo = req.params.idTorneo;
    var parametros = req.body;

    Torneo.findOne({ _id: idTorneo }, (error, torneoEncontrado) => {
        if (!torneoEncontrado) {
            return res.status(500).send({ mensaje: "No existe este torneo" });

        } else {
            if (req.user.sub !== torneoEncontrado.idAd) {
                return res.status(500).send({ mensaje: "No puede editar torneos de otro Admin" });

            } else {
                Torneo.findByIdAndUpdate(idTorneo, parametros, { new: true }, (error, torneoActualizado) => {
                    if (error) return res.status(500).send({ mesaje: "Error de la petición" });
                    if (!torneoActualizado) return res.status(500).send({ mensaje: "Error al editar el torneo" });

                    return res.status(200).send({
                        torneo: torneoActualizado, nota: "Torneo actualizado exitosamente"
                    });
                });
            }
        }
    });
}

function eliminarTorneo(req, res) {
    var idTorneo = req.params.idTorneo;

    Torneo.findOne({ _id: idTorneo }, (error, torneoEncontrado) => {
        if (torneoEncontrado) {

            if (req.user.sub != torneoEncontrado.idAd) {
                return res.status(500).send({ mensaje: "No se puede borrar torneos de otro Admin" });

            } else {
                Torneo.findByIdAndDelete(idTorneo, (error, torneoEliminado) => {
                    if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                    if (!torneoEliminado) return res.status(404).send({ mensaje: "Error al eliminar el torneo" });

                    return res.status(200).send({
                        Torneo: torneoEliminado, nota: "Eliminado con exito"
                    });
                });
            }
        } else {
            return res.status(500).send({ mensaje: "No existe este torneo" });
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CRUD ASIGNACIÓN TORNEOS-LIGAS
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function asignarLigas(req, res) {
    var parametros = req.body;
    var asigModelo = new Asigna();

    if (parametros.nombreLiga && parametros.nombreTorneo) {

        Torneo.findOne({ nombreTorneo: { $regex: parametros.nombreTorneo, $options: 'i' } }, (error, TorneoEncontrado) => {
            if (error) return res.status(500).send({ mensaje: "Error de la petición" });
            if (!TorneoEncontrado) return res.status(500).send({ mensaje: "Esta liga no existe" });

            Liga.findOne({ nombreLiga: { $regex: parametros.nombreLiga, $options: 'i' } }, (error, LigaEncontrada) => {
                if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                if (!LigaEncontrada) return res.status(500).send({ mensaje: "Este equipo no existe2" });

                Asigna.find({ idTorneo: TorneoEncontrado._id }, (error, asignacionesEncontradas) => {
                    if (asignacionesEncontradas.length < 10) {

                        Asigna.findOne({ nombreLiga: LigaEncontrada.nombreLiga }, (error, LigasAsigEncontradas) => {
                            if (LigasAsigEncontradas) return res.status(400).send({ mensaje: "No puede asignar esta liga más de 1 vez" });

                            for (let i = 0; i < asignacionesEncontradas.length; i++) {
                                if (asignacionesEncontradas[i].nombreLiga == LigaEncontrada.nombreLiga)
                                    return res.status(400).send({ mensaje: "No puede asignar esta liga de nuevo" });
                            }

                            asigModelo.idTorneo = TorneoEncontrado._id;
                            asigModelo.nombreTorneo = TorneoEncontrado.nombreTorneo;
                            asigModelo.idLiga = LigaEncontrada._id;
                            asigModelo.nombreLiga = LigaEncontrada.nombreLiga;

                            asigModelo.save((error, asigGuardado) => {
                                if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                                if (!asigGuardado) return res.status(500).send({ mensaje: "Error, no se asigno a ninguna liga" });

                                Liga.findOneAndUpdate({ nombreLiga: LigaEncontrada.nombreLiga }, { torneo: TorneoEncontrado.nombreTorneo },
                                    { new: true }, (error, equipoActualizado) => {
                                        if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                                        if (!equipoActualizado) return res.status(500).send({ mensaje: "Error, no se añadio el torneo a la liga" });

                                        return res.status(200).send({ asignacion: asigGuardado, nota: "Asignacion realizada exitosamente" });
                                    })
                            })
                        });
                    } else {
                        return res.send({ mensaje: "Solo se pueden asignar maximo 10 ligas por torneo" })
                    }
                })
            })
        })

    } else {
        return res.status(500).send({ mensaje: "Envie los parametros obligatorios" });
    }
}

function ligaAsig(req, res) {
    var idAsig = req.params.idAsig;
    Asigna.find({ _id: idAsig }, (error, asigEncontrada) => {
        if (error) return res.send({ mensaje: "error:" + error })

        return res.send({ asignaciones: asigEncontrada })
    })
}
////////////////////////////////////////////////////////////////
// CRUD Usuarios
////////////////////////////////////////////////////////////////
function Registrar(req, res) { //GENERAL
    var parametros = req.body;
    var usuarioModelo = new Usuario();

    if (parametros.nombre && parametros.usuario && parametros.password) {

        usuarioModelo.nombre = parametros.nombre;
        usuarioModelo.apellido = parametros.apellido;
        usuarioModelo.usuario = parametros.usuario;
        usuarioModelo.rol = "Organizador";

        Usuario.find({ usuario: parametros.usuario }, (error, usuarioEncontrado) => {
            if (usuarioEncontrado.length == 0) {

                bcrypt.hash(parametros.password, null, null, (error, passwordEncriptada) => {
                    usuarioModelo.password = passwordEncriptada;

                    usuarioModelo.save((error, usuarioGuardado) => {
                        if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                        if (!usuarioGuardado) return res.status(500).send({ mensaje: "Error, no se registro ninguna Empresa" });

                        return res.status(200).send({ Usuario: usuarioGuardado, nota: "Empresa registrada exitosamente" });
                    });
                });

            } else {
                return res.status(500).send({ mensaje: "Este Usuario ya se encuentra utilizado" });
            }
        });
    }
}

function verUsuarios(req, res) {
    Usuario.find((error, usuariosObtenidos) => {
        if (error) return res.send({ mensaje: "error:" + error })

        return res.status(200).send({ usuarios: usuariosObtenidos })
    })
}

function editarUsuario(req, res) {
    var idUsuario = req.params.idUsuario;
    var parametros = req.body;

    Usuario.findOne({ _id: idUsuario }, (error, usuarioEncontrado) => {
        if (error) return res.status(500).send({ mesaje: "Usuario no encontrado" });

        if (req.user.rol == "Admin" && usuarioEncontrado.rol == "Organizador") {

            Usuario.findByIdAndUpdate(idUsuario, parametros, { new: true }, (error, usuarioActualizada) => {
                if (error) return res.status(500).send({ mesaje: "Error de la petición" });
                if (!usuarioActualizada) return res.status(500).send({ mensaje: "Error al editar el Usuario" });

                usuarioActualizada.password = undefined;
                return res.status(200).send({
                    Usuario: usuarioActualizada, nota: "Usuario organizador editado exitosamente"
                });
            });

        } else if (req.user.rol == "Organizador" && req.user.sub == idUsuario) {

            parametros.rol = "Organizador"

            Usuario.findByIdAndUpdate(idUsuario, parametros, { new: true }, (error, usuarioActualizada) => {
                if (error) return res.status(500).send({ mesaje: "Error de la petición" });
                if (!usuarioActualizada) return res.status(500).send({ mensaje: "Error al editar el Usuario" });

                usuarioActualizada.password = undefined;
                return res.status(200).send({
                    Usuario: usuarioActualizada, nota: "Perfil editado exitosamente"
                });
            });

        } else if (req.user.rol == "Admin" && req.user.sub == idUsuario) {

            Usuario.findByIdAndUpdate(idUsuario, parametros, { new: true }, (error, usuarioActualizada) => {
                if (error) return res.status(500).send({ mesaje: "Error de la petición" });
                if (!usuarioActualizada) return res.status(500).send({ mensaje: "Error al editar el Usuario" });

                usuarioActualizada.password = undefined;
                return res.status(200).send({
                    Usuario: usuarioActualizada, nota: "Perfil admin editado exitosamente"
                });
            });

        } else {
            return res.status(500).send({ error2: "No puede editar a este usuario" });
        }
    })
}

function eliminarUsuario(req, res) {
    var idUsuario = req.params.idUsuario;

    Usuario.findOne({ _id: idUsuario }, (error, usuarioEncontrado) => {
        if (error) return res.status(500).send({ mesaje: "Usuario no encontrado" });

        /*if (req.user.sub == idUsuario) {*/

            Usuario.findByIdAndDelete(idUsuario, (error, usuarioEliminado) => {
                if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                if (!usuarioEliminado) return res.status(404).send({ mensaje: "Error al eliminar el usuario1" });

                return res.status(200).send({ eliminado: usuarioEliminado });
            })

       /* } else if (req.user.rol == "Admin" && usuarioEncontrado.rol == "Organizador") {

            Usuario.findByIdAndDelete(idUsuario, (error, usuarioEliminado) => {
                if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                if (!usuarioEliminado) return res.status(404).send({ mensaje: "Error al eliminar el usuario2" });

                return res.status(200).send({ "Usuario eliminado con exito2": usuarioEliminado });
            })

        } else {
            return res.status(500).send({ error: "No puede eliminar a este usuario" });
        }*/
    });
}







module.exports = {
    Login,
    Admin,
    Registrar,
    verUsuarios,
    editarUsuario,
    eliminarUsuario,
    verTorneos,
    torneoId,
    crearTorneo,
    editarTorneo,
    eliminarTorneo,
    asignarLigas,
    ligaAsig
}