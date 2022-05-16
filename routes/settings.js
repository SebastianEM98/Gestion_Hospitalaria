// GET /app/settings         -> ir a los ajustes

const express = require('express');
const router = express.Router();

var {scoreOfDisease, Disease} = require('./../server/models/diseases.js');

router.get('/app/systemsettings', (req, res) => {
    res.status(200).render('systemsettings', {pageTitle: "Ajustes del sistema"});
});

module.exports = router;