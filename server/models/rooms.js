const mongoose = require ('mongoose');

var RoomSchema = mongoose.Schema({
	name: {
        type: String,
        unique: true,
	   required: true,
    },
    availability: {
        // false = habitacion libre
        // true = habitacion ocupada
        type: Boolean,
        required: true,
        default: false
    }
});

var Room = mongoose.model('Room', RoomSchema);

var rooms = {};
rooms["noroom"] = false;


/*
	Funcion para poner enfermedades por defecto en el sistema
*/
function populateDatabase () {
    for (prop in rooms) {
        var room = Room({
            name: prop,
            availability: rooms[prop]
        });

        room.save().then((disease) => {
			// no hacer nada
		}, (err) => {
			// no hacer nada
		});
    }
}

populateDatabase();

module.exports = {rooms, Room};
