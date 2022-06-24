const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Asignacion_torneosSchema = Schema({
    idTorneo: String,
    nombreTorneo: String,
    idLiga: String,
    nombreLiga: String
});
module.exports = mongoose.model('asignacion_torneos', Asignacion_torneosSchema);

