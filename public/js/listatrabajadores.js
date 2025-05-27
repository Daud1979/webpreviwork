
let indexColumna=0;
let isOn = true;
function validarObjeto(obj) {
    return Object.values(obj).every(value => value !== null && value !== undefined && value !== '');
}

document.getElementById('logout').addEventListener('click', (event) => {
    //event.preventDefault(); // Evita el comportamiento por defecto del enlace
    textp=document.querySelector('.loader-text');
    textp.innerHTML="CERRANDO SESION...";

    // Mostrar la pantalla de carga
    showLoading();

    // Genera un tiempo de espera aleatorio entre 2 y 3 segundos
    const waitTime = Math.random() * (2000 - 1000) + 1000;

    setTimeout(() => {
        // Redirige a la ruta de cerrar sesión
        window.location.href = '/logout';
    }, waitTime); // Espera de 2 a 3 segundos antes de redirigir
});

function showLoading() {
    document.body.classList.add("loading");
}

function hideLoading() {
    document.body.classList.remove("loading");
}


document.getElementById("buscadorpersonal").addEventListener("input", function() {
    const searchValue = this.value.toLowerCase();
   
    const rows = document.querySelectorAll("#tabla-trabajadorT tr");

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const rowText = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(" ");
        
        if (rowText.includes(searchValue)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});


$('#cmbcentrospersonal').on('change', function(){
    cargardatos();
});

function cargardatos() {
    // Obtener el valor seleccionado
    const valorSeleccionado = document.querySelector('#cmbcentrospersonal').value;
    const data = { valor: valorSeleccionado, isOn: isOn };

    // Limpiar el tbody de la tabla
    $('#tabla-trabajadorT').empty();

    // Hacer la solicitud fetch para cargar nuevos datos
    fetch('/home/cargarDocumentoSeleccionPersonalCentro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta de la red');
        }
        return response.json();
    })
    .then(({ Data, estadoli }) => {
        // Mostrar el tipo de listado (F. Alta o F. Baja)
        document.querySelector('#fAltaBaja').textContent = estadoli;

        if (Array.isArray(Data)) {
            // Agregar filas a la tabla
            Data.forEach(item => {
                $('#tabla-trabajadorT').append(`
                    <tr>
                        <td class="col-ancho">${item.centro}</td>
                        <td>${item.nif}</td>
                        <td class="col-ancho">${item.nombre}</td>
                        <td class="col-ancho">${item.apellidos}</td>
                        <td class="col-ancho">${item.puesto}</td>
                        <td>${item.alta}</td>
                        <td>${item.estado}</td>
                        <td>${item.fechaAceptacion}</td>
                        <td class="col-ancho">${item.ARObservacion}</td>
                        <td class="izqui">${item.RM_inicio}</td>
                        <td class="derec">${item.RM_fin}</td>
                        <td class="izqui">${item.nCurso}</td>
                        <td class="derec">${item.fechaCurso}</td>
                        <td class="izqui">${item.nFormacion}</td>
                        <td class="derec">${item.fechaFormacion}</td>
                        <td class="izqui">${item.nInformacion}</td>
                        <td class="derec">${item.fechaInformacion}</td>
                        <td class="izqui">${item.nEpis}</td>
                        <td class="derec">${item.fechaEpis}</td>
                        <td class="izqui">${item.nAutorizacion}</td>
                        <td class="derec">${item.fechaAutorizacion}</td>
                    </tr>
                `);
            });
        } else {
            Notiflix.Notify.failure('La respuesta no es un array válido');
        }
    })
    .catch(error => {
        console.error(error);
        Notiflix.Notify.warning("Hubo un problema al cargar los datos");
    });
}





function cargarInformacion(idTrabajador){
    const data = { idTrabajador:idTrabajador };  
    fetch('/home/trabajador/formacion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).catch((error) => {
        Notiflix.Notify.warning( error);
    });
}


//delboton deslizable

function toggleSwitch() {
    const slider = document.getElementById('slider');
    isOn = !isOn;
    if (isOn) {
        slider.textContent = 'Alta';
    } else {
        slider.textContent = 'Baja';
    }
    cargardatos();
    slider.parentElement.classList.toggle('on');
}