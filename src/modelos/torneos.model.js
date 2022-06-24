const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TorneoSchema = Schema({
    nombreTorneo: String,
    idAd: String
});
module.exports = mongoose.model('torneos', TorneoSchema);

