const express = require('express');
const _ = require('lodash');
const router = express.Router();

var {Patient} = require('./../server/models/patient.js');
var {rooms, Room} = require('./../server/models/rooms.js');
const {ObjectID} = require('mongodb');


/*
    GET /app/getrooms ->  returna un JSON con el status de todas las habitaciones del sistema
*/
router.get('/app/getrooms', (req, res) => {
    Room.find({}, null, {sort: {name: 1}}).then((rooms) => {
        var roomsJSON = {};
        // rooms es un array con todas las habitaciones
        for (var i = 0; i < rooms.length; ++i) {
            roomsJSON[rooms[i].name] = rooms[i].availability;
        }

        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(roomsJSON));
    }).catch((err) => {
        console.log(err);
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({noroom: false}));
    });
});

/*
    GET /app/updateroom -> actualiza la habitacion de un paciente
*/
router.get('/app/updateroom/:hospitalNumber/:futureRoom', (req, res) => {
    var hospitalNumber = req.params.hospitalNumber;
    var futureRoom = req.params.futureRoom;

    Promise.all([Room.find({}), Room.findOne({name: futureRoom}), Patient.findOne({hospitalNumber: hospitalNumber})])
        .then((data) => {
            var rooms = data[0];
            var futureRoomObject = data[1];
            var patient = data[2];


                // 1. verifica si la habitacion actual esta vacia
            if (rooms && patient && futureRoomObject && futureRoomObject["availability"] === false) {  // verifica que todos los parametros esten correctos
                // 2.  desasigna una habitacion de un paciente
                if (patient.room !== 'noroom') {
                    for (var i = 0; i < rooms.length; ++i) {
                        if (rooms[i].name === patient.room) {
                            rooms[i].availability = false;
                            rooms[i].save();
                            break;
                        }
                    }
                }

                // 3. se asigna a la habitacion actual
                patient.room = futureRoomObject.name;
                patient.save();

                // 4. asigna a la proxima habitacion como ocupada
                if (futureRoomObject.name !== 'noroom') {

                    for (var i = 0; i < rooms.length; ++i) {
                        if (rooms[i].name === futureRoomObject.name) {
                            rooms[i].availability = true;
                            rooms[i].save();
                            break;
                        }
                    }
                }
                res.redirect('/app');
            } else {
                throw Error("Mala petición de cambio de habitación. Verifique los parametros.");
            }
        }).catch((err) => {
            console.log(err);
            res.redirect('/app');
        });
});

/*
    GET /app/swappatients/:patientWithRoom/:patientWithoutRoom -> intercambia las habitaciones entre pacientes
*/
router.get('/app/swappatients/:patientWithRoom/:patientWithoutRoom', (req, res) => {
    var patientWithRoom = req.params.patientWithRoom;
    var patientWithoutRoom = req.params.patientWithoutRoom;

    Promise.all([Patient.findOne({hospitalNumber: patientWithRoom}), Patient.findOne({hospitalNumber: patientWithoutRoom})])
        .then((data) => {
            var patientWithRoom = data[0];
            var patientWithoutRoom = data[1];

                // verifica si los pacientes tienen o no tienen una habitacion 
            if (patientWithRoom && patientWithoutRoom && patientWithRoom["room"] !== 'noroom' && patientWithoutRoom["room"] === 'noroom') {  // Verifica que los parametros esten correctos
            
                var roomOfPatient = patientWithRoom["room"];

                patientWithRoom.room = "noroom";
                patientWithRoom.save();

                patientWithoutRoom.room = roomOfPatient;
                patientWithoutRoom.save();

                res.redirect('/app');
            } else {
                throw Error("Mala petición de cambio de habitación. Verifique los parametros.");
            }
        }).catch((err) => {
            console.log(err);
            res.redirect('/app');
        });
});

/*
    POST /app/addroom -> agrega una nueva habitacion al sistema
*/
router.post('/app/addroom', (req, res) => {
    var roomName = req.body.roomName;

    // verifica que el nomre sea un String
    if (_.isString(roomName) && !_.isNaN(roomName)) {
        var room = Room({
            name: roomName,
            availability: false
        });

        room.save().then((room) => {
            console.log('Room added');
            res.status(200).redirect('/app/systemsettings');
        }).catch((err) => {
            console.log(err);
            res.status(400).redirect('/app/systemsettings');
        });
    } else {
        res.status(400).redirect('/app/systemsettings', {messages: req.flash('success_msg', 'Habitacion agregada con exito') });
    }
});

/*
    POST /app/deleteroom -> elimina una habitacion del sistema
*/
router.post('/app/deleterooms', (req, res) => {
    var roomsToDelete = req.body.RD;

    if (_.isArray(roomsToDelete)) {
        for (var i = 0; i < roomsToDelete.length; ++i) {
            Room.find({
                name: roomsToDelete[i]
            }).remove().catch((err) => {
                console.log(err);
            });

            Patient.findOneAndUpdate({
                 room: roomsToDelete[i]
            }, {
                 "$set": {
                   "room": "noroom",
               }
          }).catch((err) => {
                 console.log(err);
            });
        }
        res.status(200).redirect('/app/systemsettings');
    } else {
        res.status(400).redirect('/app/systemsettings');
    }
});


module.exports = router;
