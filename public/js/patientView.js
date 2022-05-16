
function myFunction() {
    // Declaracion de variables
    var input, filter, ul, li, a;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL"); // la lista desordenada
    li = ul.getElementsByTagName('li'); // todos los elementos de la lista

    // Recorre todos los elementos de la lista y oculte aquellos que no coincidan con la consulta de búsqueda
    for (var i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}
