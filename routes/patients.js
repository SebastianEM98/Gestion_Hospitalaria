/*
     GET /app/addpatient -> pagina de addPatient
     POST /app/addpatient                -> agregar un paciente en la base de datos
     GET  /app/getpatients               -> obtiene un JSON con todos los pacientes
     GET  /app/patient/:hospitalNumber   -> obtiene un solo paciente
     GET  /app/getpatient/:hospitalNumber-> obtiene un JSON de los datos de un paciente
     POST /app/updatepatient/:hospitalNumber ->  actualiza una enfermedad y el puntaje del paciente
     POST /app/delete/:hospitalNumber -> eliminar un paciente del sistema
*/

const express = require('express');
const _ = require('lodash');
const router = express.Router();

var {scoreOfDisease, Disease} = require('./../server/models/diseases.js');
var {Patient} = require('./../server/models/patient.js');
var {rooms, Room} = require('./../server/models/rooms.js');
var isValidDate = require('is-valid-date');
const {ObjectID} = require('mongodb');


/*
    GET /app/addpatient -> pagina de addPatient
*/
router.get('/app/addpatient', (req, res) => {
    res.render('addpatient', {pageTitle: "Agregar paciente"});
});

/*
    POST /addPatient -> agregar un nuevo paciente
*/
router.post('/app/addpatient', (req, res) => {
    // recibir las enfermedades del formulario en el arreglo PD, siendo cada elemento un String con el nombre de la enfermedad
    var PD = req.body.PD;
    var dateOfBirth = req.body.dateOfBirth;

    if (_.isEmpty(PD)) {    // verifica si no se ha seleccionado ninguna enfermedad
        PD = [];
    }

    // verifica los campos vacios
    if (_.isEmpty(req.body.firstName) || _.isEmpty(req.body.lastName) || _.isEmpty(req.body.hospitalNumber) || !isValidDate(dateOfBirth)) {
        if (_.isEmpty(req.body.firstName)) req.flash('error_msg', 'Porfavor ingrese el nombre.');
        if (_.isEmpty(req.body.lastName)) req.flash('error_msg', 'Porfavor ingrese el apellido.');
        if (_.isEmpty(req.body.hospitalNumber)) req.flash('error_msg', 'Porfavor ingrese el numero de hospital');
        if (!isValidDate(dateOfBirth)) req.flash('error_msg', 'La fecha no es valida.');

        res.status(400).redirect('/app/addpatient');
    } else {
        // asigna el sexo al paciente nuevo
        var sex = req.body.sex;
        if (sex === "male") {
            sex = true;
        } else {
            sex = false;
        }

        // crea un nuevo paciente y lo agrega a la base de datos
        var patient = Patient({
            firstName: _.capitalize(req.body.firstName),
            lastName: _.capitalize(req.body.lastName),
            sex: sex,
            dateOfBirth: dateOfBirth,
            hospitalNumber: _.toUpper(req.body.hospitalNumber),
            diseases: PD,
            lastUpdate: (new Date().getTime())
        });

        patient.save().then((patient) => {
            patient.updateScore();
            res.status(200).redirect('/app');
        }).catch((err) => {
            console.log(err);
            res.status(400).redirect('/app');
        });
   }
});

/*
    GET /app/getpatients  -> obtiene un JSON con todos los pacientes
*/
router.get('/app/getpatients', (req, res) => {
    Patient.find({}).then((patients) => {
        res.status(200).send(patients);
    }).catch((err) => {
        console.log(err);
        res.status(400).send();
    });
});

/*
    GET datos de un paciente -> pagina personal del paciente
*/
router.get('/app/patient/:hospitalNumber', (req, res) => {
    hospitalNumber = req.params.hospitalNumber;
    Patient.findOne({
        hospitalNumber
    }).then((patient) => {
        if (_.isEmpty(patient)) {
            throw Error('El paciente no existe');
        }
        res.status(200).render('patientPage');
    }).catch((err) => {
        console.log(err);
        res.status(404).redirect('/app');
    });
});

/*
    GET  datos de un solo paciente y lo returna como un JSON
*/
router.get('/app/getpatient/:hospitalNumber', (req, res) => {
    hospitalNumber = req.params.hospitalNumber;
    Patient.findOne({
        hospitalNumber
    }).then((patient) => {
        res.status(200).send(patient);
    }).catch((err) => {
        req.flash('error_msg', 'Porfavor ingrese el nombre.');
        res.status(404).redirect('/app');
    });
});

/*
    POST /app/updatepatient/:hospitalNumber -> actualiza la enfermedad y la puntuación del paciente
*/
router.post('/app/updatepatient/:hospitalNumber', (req, res) => {
    hospitalNumber = req.params.hospitalNumber;

    var PD = req.body.PD;
    if (_.isEmpty(PD)) {
        PD = [];
    }

    Patient.findOneAndUpdate({
        hospitalNumber
    }, {
        "$set": {
            "diseases": PD,
            "lastUpdate": (new Date().getTime())
         }
    },{
        new: true
    }).then((patient) => {
        patient.updateScore();
        res.redirect('/app/patient/' + hospitalNumber);
    }).catch((err) => {
        console.log(err);
        res.redirect('/app/patient/' + hospitalNumber);
    });
});

/*
    POST /app/delete/:hospitalNumber -> elimina un paciente del sistema
*/
router.get('/app/deletepatient/:hospitalNumber', (req, res) => {
    var hospitalNumber = req.params.hospitalNumber;

    Promise.all([Room.find({}), Patient.findOne({hospitalNumber: hospitalNumber})])
        .then((data) => {
            var rooms = data[0];
            var patient = data[1];

            // Si el paciente está en una habitación, hace que la habitación esté vacía.
            if (patient.room !== 'noroom') {
                 for (var i = 0; i < rooms.length; ++i) {
                    if (rooms[i].name === patient.room) {
                         rooms[i].availability = false;
                         rooms[i].save();
                         break;
                    }
                 }
            }

            patient.remove().then((patients) => {
               res.status(200).redirect('/app');
            });
         }).catch((err) => {
            res.status(400).redirect('/app');
         });
});

module.exports = router;
