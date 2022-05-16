var mongoose = require ('mongoose');


mongoose.Promise = global.Promise;

mongoose.connect("mongodb+srv://gestion_hospitalaria:gestion_hospitalaria@clusterpsp0-1.ojasc.mongodb.net/Gestion_Hospitalaria_DB?retryWrites=true&w=majority");

module.exports = {mongoose};
