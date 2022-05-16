var URL = location.protocol + '//' + location.host;

var patientsWaitingTableConstructor = [];
var patientsInHospitalTableConstructor = [];
var freeRoomsTableConstructor = [];
var dynamicTableClickable = true;

$(document).ready(function() {
  var patientsAPI = URL + "/app/getpatients";
  $.getJSON(patientsAPI).done(function(patients) {
	  var roomsAPI = URL + "/app/getrooms";
	  $.getJSON(roomsAPI).done(function(rooms1) {

          // se itera a través de todas las habitaciones
	  	  for(var room in rooms1) {
		  	  var freeRoomsRowConstructor = [];

              if (room !== 'noroom' && rooms1[room] === false) {
		  	  	  freeRoomsRowConstructor.push(room);
		  	  	  freeRoomsTableConstructor.push(freeRoomsRowConstructor);
		  	  }
		  }

		  for(var i = 0; i < patients.length; i++) {
			  var patient = patients[i];

			  var patientsRowConstructor = [];
			  patientsRowConstructor.push(patient["hospitalNumber"]);

                 var actualTime = new Date().getTime();
                 var timeDifference = actualTime - patient.lastUpdate;

                 var timeDifferenceInMinutes = Math.abs(timeDifference) / 60 / 1000;

                 if (timeDifferenceInMinutes > 1440) {
                    patientsRowConstructor.push("<span class=\"glyphicon glyphicon-warning-sign\" style=\"color: red;\"></span>   " + patient["firstName"] + " " + patient["lastName"]);
                 } else {
                    patientsRowConstructor.push(patient["firstName"] + " " + patient["lastName"]);
                 }


			  if(patient["room"] === "noroom") {
			  	  patientsRowConstructor.push(patient["score"]);

			  	  patientsWaitingTableConstructor.push(patientsRowConstructor);
			  } else {
			  	  patientsRowConstructor.push(patient["room"]);
			  	  patientsRowConstructor.push(patient["score"]);

			  	  patientsInHospitalTableConstructor.push(patientsRowConstructor);
			  }
		  }

		  $('#patients-waiting').dataTable({
		       data: patientsWaitingTableConstructor,
		       columns: [{
		       	 title: "<span class=\"fa fa-hospital-o fa-fw\" style=\"color: black;\"></span>   " + "  nro.",
                     width: "30%"
		       }, {
		           title: "Pacientes esperando",
                     width: "60%"
		       }, {
		           title: "Puntaje",
                     width: "10%"
		       }],
		       scrollY: '60vh',
		       scrollCollapse: true,
		       paging: false,
		       resposnive: true,
		       info: false,
                 language: {
                   searchPlaceholder: "Buscar paciente en espera",
                   sSearch: ""
                 },
               aaSorting: [[2, 'desc']],
               fnCreatedRow: function(nRow, aData, iDisplayIndex) {
                    // nRow - es el elemento HTML de la fila
                    // aData - array de los datos en las columnas. Obtener datos de la columna 4: aData[3]
                    // iDataIndex - indice de fila en la tabla

                   //colorea el campo de puntuación dependiendo del valor
                   if (aData[2] > 35) { // rojo
                       $('td:eq(2)', nRow).css("background-color", "#ffad99");
                   } else if (aData[2] >=25) { // naranja
                       $('td:eq(2)', nRow).css("background-color", "#ffdd99");
                   } else if (aData[2] >= 5) { // amarillo
                       $('td:eq(2)', nRow).css("background-color", "#ffffcc");
                   }
               }
		   });

		  $('#patients-in-hospital').DataTable({
   			   data: patientsInHospitalTableConstructor,
		        columns:[{
	                title: "<span class=\"fa fa-hospital-o fa-fw\" style=\"color: black;\"></span>   " + "  nro.",
                     width: "25%"
	            },{
	                title: "Pacientes con habitación",
                     width: "45%"
	            },{
	           	 title: "Habitación",
                     width: "15%"
	            },{
	           	 title: "Puntaje",
                     width: "15%"
	            }],
		        scrollY: '60vh',
		        scrollCollapse: true,
		        paging: false,
		        resposnive: true,
		        info: false,
                  language: {
                       searchPlaceholder: "Buscar paciente con habitación",
                       sSearch: ""
                },
                aaSorting: [[3, 'desc']],
                fnCreatedRow: function(nRow, aData, iDisplayIndex) {
                    // nRow - es el elemento HTML de la fila
                    // aData - array de los datos en las columnas. Obtener datos de la columna 4: aData[3]
                    // iDataIndex - indice de fila en la tabla

                    // colorea el campo de puntuación dependiendo del valor
                    if (aData[3] >= 35) { // rojo
                        $('td:eq(3)', nRow).css("background-color", "#ffad99");
                    } else if (aData[3] >=20) { // naranja
                        $('td:eq(3)', nRow).css("background-color", "#ffdd99");
                    } else if (aData[3] >= 10) { // amarillo
                        $('td:eq(3)', nRow).css("background-color", "#ffffcc");
                    }
                }
            });

			//  tabla con habitaciones libres en el lado derecho
		  $('#free-rooms').dataTable({
			  data: freeRoomsTableConstructor,
			  columns:[{
				  title: "Habitaciones libres"
			  }],
			  scrollY: '60vh',
			  scrollCollapse: true,
			  paging: false,
			  resposnive: true,
			  info: false,
                language: {
                     searchPlaceholder: "Buscar habitación",
                     sSearch: ""
              }
		  });

            // pone los datos de la tabla en los tres cuadros en la parte superior
            var patientsWithRoomsDashboard = patientsInHospitalTableConstructor.length || 0;
            $("#patients-with-rooms-live").html(patientsWithRoomsDashboard);

            var patientsWaitingDashboard = patientsWaitingTableConstructor.length || 0;
            $("#patients-waiting-live").html(patientsWaitingDashboard);

            var freeRoomsDashboard = freeRoomsTableConstructor.length || 0;
            $("#free-rooms-live").html(freeRoomsDashboard);

	  });
  });
});

$("#patients-waiting").ready(function() {
    $("#patients-waiting > tbody > tr").select(function() {
        $(this).children('td')[3].css({"backgroung-colour": "yellow"});
    });
});

var clicks = 0;

$(function() {
    $("body").on("click", '#patients-in-hospital > tbody > tr', function(e){
         var hospitalNumberToBeWaiting = $(this).children('td')[0];
         hospitalNumberToBeWaiting = hospitalNumberToBeWaiting.textContent;
         clicks++;
         var clicks_when_called = clicks;

           $("body").on('click', '#patients-waiting > tbody > tr', function() {
             var hospitalNumberToBeAdmitted = $(this).children('td')[0];
             hospitalNumberToBeAdmitted = hospitalNumberToBeAdmitted.textContent;
             if (clicks_when_called + 1 === clicks) {
                  if (confirm('¿quieres hacer el cambio?')) {
                    window.location.href = URL + "/app/swappatients/" + hospitalNumberToBeWaiting + "/" + hospitalNumberToBeAdmitted;
                  } else {
                    window.location.href = URL +"/app/";
                  }
              }
          });
     });
});

$(function(){
    $("body").on("click", '#patients-waiting > tbody > tr', function(e){
         var hospitalNumberToBeAdmitted = $(this).children('td')[0];
         hospitalNumberToBeAdmitted = hospitalNumberToBeAdmitted.textContent;
         clicks++;

           var clicks_when_called = clicks;
           $("body").on('click', '#free-rooms > tbody > tr', function() {
             var roomToBeOccupied = $(this).children('td')[0];
             roomToBeOccupied = roomToBeOccupied.textContent;
             if (clicks_when_called + 1 === clicks) {
                  if (confirm('¿quieres hacer el cambio?')) {
                    window.location.href = URL +"/app/updateroom/" + hospitalNumberToBeAdmitted + "/" + roomToBeOccupied;
                  }
                  else
                  {
                    window.location.href = URL + "/app/";
                  }
              }
              $("body").on('click', '#patients-in-hospital > tbody > tr', function() {
                  var hospitalNumberToBeWaiting = $(this).children('td')[0];
                  hospitalNumberToBeWaiting = hospitalNumberToBeWaiting.textContent;

                  if (clicks_when_called + 1 === clicks) {
                       if (confirm('¿quieres hacer el cambio?')) {
                         window.location.href = URL +"/app/swappatients/" + hospitalNumberToBeWaiting + "/" + hospitalNumberToBeAdmitted;
                       } else {
                         window.location.href = URL +"/app/";
                       }
                  }
               });
           });
     });
});

$(function(){
    $("body").on("click", '#free-rooms > tbody > tr', function(e){
           var roomToBeOccupied = $(this).children('td')[0];
           roomToBeOccupied = roomToBeOccupied.textContent;
           clicks++;
           var clicks_when_called = clicks;

           $("body").on('click', '#patients-waiting > tbody > tr', function() {
             var hospitalNumberToBeAdmitted = $(this).children('td')[0];
             hospitalNumberToBeAdmitted = hospitalNumberToBeAdmitted.textContent;
             if (clicks_when_called + 1 === clicks) {
                  if (confirm('¿quieres hacer el cambio?')) {
                    window.location.href = URL + "/app/updateroom/" + hospitalNumberToBeAdmitted + "/" + roomToBeOccupied;
                  } else {
                    window.location.href = URL + "/app/";
                  }
              }
           });
     });
});

$("body").on('dblclick', '#patients-in-hospital > tbody > tr', function() {
      var NHSnumber = $(this).children('td')[0];
      NHSnumber = NHSnumber.textContent;
      window.location.href = URL + "/app/patient/" + NHSnumber;
});

$("body").on('dblclick', '#patients-waiting > tbody > tr', function() {
     var NHSnumber = $(this).children('td')[0];
     NHSnumber = NHSnumber.textContent;
     window.location.href = URL + "/app/patient/" + NHSnumber;
});


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-97568701-1', 'auto');
ga('send', 'pageview');
