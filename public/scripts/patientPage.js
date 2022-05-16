var URL = location.protocol + '//' + location.host;

$(document).ready(function() {
    var hospitalNumber= window.location.pathname.split('/');

    var patientAPI = URL + "/app/getpatient/" + hospitalNumber[3];

    $("#form-patient").attr("action", "/app/updatepatient/" + hospitalNumber[3]);
    $("#delete-button").attr("href", "/app/deletepatient/" + hospitalNumber[3]);

    $.getJSON(patientAPI).done(function(patient) {
       $("#first-name-disabled").attr("placeholder", patient["firstName"]);
       $("#last-name-disabled").attr("placeholder", patient["lastName"]);
       $("#hospitalNumber-disabled").attr("placeholder", patient["hospitalNumber"]);
       $("#date-of-birth-disabled").attr("placeholder", patient["dateOfBirth"]);
       $("#patient-score").html(patient["score"]);


/*
       Sexo del paciente
*/
       if (patient["sex"] === true) {
           $("#patient-sex-disabled").attr("placeholder", "Masculino");
       } else if (patient["sex"] === false) {
           $("#patient-sex-disabled").attr("placeholder", "Femenino");
       }

/*
       Habitacion del paciente
*/
       if (patient["room"] === "noroom") {
           $("#patient-room-disabled").attr("placeholder", 'Sin habitación asignada');
       } else {
           $("#patient-room-disabled").attr("placeholder", 'Habitación: ' + patient["room"]);

           var patientDeleteRoomLink = "/app/updateroom/" + hospitalNumber[3] + "/noroom";
           $("#patient-room-disabled").after("<a id=\"delete-room-button\" class=\"btn btn-primary btn-lg btn-block\" href=\"" + patientDeleteRoomLink +"\">Mover a lista de espera</a>");
       }

/*
       Panel de puntuación
*/
       if (patient["score"] <=5) {
           $("#panel-score").attr("class", "panel panel-primary");
       } else if (patient["score"] < 25) {
           $("#panel-score").attr("class", "panel panel-yellow");
       } else if (patient["score"] <= 35) {
           $("#panel-score").attr("class", "panel panel-orange");
       } else {
           $("#panel-score").attr("class", "panel panel-red");
       }

       var diseasesAPI = URL +"/app/getdiseases";
       $.getJSON(diseasesAPI).done(function(allDiseases) {
           var diseasesScoresCheckboxes = [];

           for(var disease in allDiseases) {
             var diseaseScoreCheckbox = [];
        	   diseaseScoreCheckbox[0] = disease;
        	   diseaseScoreCheckbox[1] = allDiseases[disease]; // Puntaje

        	   var input;
               if (patient["diseases"].length !== 0) {
                   for(var i = 0; i < patient["diseases"].length; i++) {
            	   	   if(disease === patient["diseases"][i]) {
            	   	   	   input = "<input type=\"checkbox\" name=\"PD[]\" value=\"" + disease + "\" checked>";
            	   	   	   break;
            	   	   } else {
            	   	        input = "<input type=\"checkbox\" name=\"PD[]\" value=\"" + disease + "\">";
            	   	   }
            	   }
               } else {
                   input = "<input type=\"checkbox\" name=\"PD[]\" value=\"" + disease + "\">";
               }

          	diseaseScoreCheckbox[2] = input;
        	     diseasesScoresCheckboxes.push(diseaseScoreCheckbox)
           }

           // Agregue nombre, sexo, número, edad antes de la tabla.
           $('#diagnosis').dataTable({
		      data: diseasesScoresCheckboxes,
		      columns:[{
	              title: "Enfermedad"
	           },{
	              title: "Puntaje"
	           },{
	              title: "Diagnostico"
	           }],
		      scrollY: '40vh',
		      scrollCollapse: true,
		      paging: false,
                info: false,
                language: {
                sSearch: "Buscar enfermedad"
              }
		   });
       });
    });
});
