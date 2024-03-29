var URL = location.protocol + '//' + location.host;

$(document).ready(function() {
    var diseasesAPI = URL + "/app/getdiseases/";

    $.getJSON(diseasesAPI).done(function(allDiseases) {
           var diseasesScoresCheckboxes = [];

           for(var disease in allDiseases) {
             var diseaseScoreCheckbox = [];
        	   diseaseScoreCheckbox[0] = disease;
        	   diseaseScoreCheckbox[1] = allDiseases[disease]; // Puntaje
             diseaseScoreCheckbox[2] = "<input type=\"checkbox\" name=\"DD[]\" value=\"" + disease + "\">";

        	   diseasesScoresCheckboxes.push(diseaseScoreCheckbox)
           }

           $('#diseases-table').dataTable({
		      data: diseasesScoresCheckboxes,
		      columns:[{
	              title: "Enfermedad",
                  width: "60%"
	          },{
	              title: "Puntaje",
                  width: "20%"
	          },{
	              title: "Seleccionar",
                  width: "20%"
	          }],
		      scrollY: '40vh',
		      scrollCollapse: true,
		      paging: false,
                info: false,
                language: {
                  searchPlaceholder: "Buscar enfermedad",
                  sSearch: ""
                },
		 });
    });
});


// tabla de las habitaciones
$(document).ready(function() {
    var roomsAPI = URL + "/app/getrooms/";

    $.getJSON(roomsAPI).done(function(allRooms) {
           var roomsScoresCheckboxes = [];

           for(var room in allRooms) {
               if (room !== 'noroom') {
                    var roomScoreCheckbox = [];
                    roomScoreCheckbox[0] = room;
                    roomScoreCheckbox[1] = "<input type=\"checkbox\" name=\"RD[]\" value=\"" + room + "\">";

                    roomsScoresCheckboxes.push(roomScoreCheckbox);
               }
           }

           $('#rooms-table').dataTable({
		      data: roomsScoresCheckboxes,
		      columns:[{
	              title: "Habitación",
                  width: "60%"
                },{
	              title: "Seleccionar",
                  width: "40%"
	           }],
		      scrollY: '40vh',
		      scrollCollapse: true,
		      paging: false,
                info: false,
                language: {
                  searchPlaceholder: "Buscar habitación",
                  sSearch: ""
                },
		 });
    });
});


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-97568701-1', 'auto');
ga('send', 'pageview');
