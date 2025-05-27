
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
    let valorSeleccionado = document.querySelector('#cmbcentrospersonal').value;
    const data = { valor: valorSeleccionado,isOn:isOn };
    
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
        // Verificar que la respuesta sea exitosa
        if (!response.ok) {
            throw new Error('Error en la respuesta de la red');
        }
        return response.json();  // Convertir la respuesta a JSON
    })
    .then(data => {
        // Comprobar que los datos sean un array
         document.querySelector('#fAltaBaja').textContent = data.estadoli;
        if (Array.isArray(data.Data)) {
            // Iterar sobre el nuevo conjunto de datos y agregar filas a la tabla
            
            data.Data.forEach(item => {
              
                $('#tabla-trabajadorT').append(`
                    <tr>
                        <td class="align-left" id="tdCentroT"       data-id="${item.centro }">${ item.centro }</td>
                        <td class="align-rigth"  id="tdNIFT"        data-id="${item.nif }">${ item.nif }</td>
                        <td class="align-left" id="tdnombresT"      data-id="${item.nombre }">${ item.nombre }</td>
                        <td class="align-left" id="tdapellidosT"    data-id="${item.apellidos }">${ item.apellidos }</td>
                        <td class="align-left" id="tdpuestoT"       data-id="${item.puesto }">${ item.puesto }</td>                                                        
                        <td class="align-right fechas"              data-id="${item.alta}">${ item.alta }</td>
                        <td class="fechas"                          data-id="${item.estado }">${ item.estado }</td>

                        <td class="fechas"                          data-id="${item.fechaAceptacion}">${ item.fechaAceptacion }</td>
                         <td class="align-left ARObs" data-id="${ item.ARObservacion}">${ item.ARObservacion }</td>
                                   
                        <td class="align-right fechas fechasuno"    data-id="${item.RM_inicio }">${ item.RM_inicio } </td>      
                        <td class="align-right fechas fechasdos"    data-id="${item.RM_inicio }">${ item.RM_fin }</td>      

                        <td class="align-right numero fechastres"   data-id="${item.nCurso }">${ item.nCurso }</td>      
                        <td class="align-right fechas fechascuatro" data-id="${item.fechaCurso }">${ item.fechaCurso } </td> 

                        <td class="align-right numero fechascinco"  data-id="${item.nFormacion }">${ item.nFormacion }</td>      
                        <td class="align-right fechas fechasseis"   data-id="${item.fechaFormacion }">${ item.fechaFormacion } </td>      
                                    
                        <td class="align-right numero fechassiete"  data-id="${item.nEpis }">${ item.nEpis }</td>      
                        <td class="align-right fechas fechasocho"   data-id="${item.fechaEpis }">${ item.fechaEpis } </td>   

                        <td class="align-right numero fechasnueve"  data-id="${item.nAutorizacion }">${ item.nAutorizacion }</td>      
                        <td class="align-right fechas fechasdiez"   data-id="${item.fechaAutorizacion }">${ item.fechaAutorizacion } </td> 
                    </tr>
                `);
            });

            // Agregar evento a los botones generados
            //agregarEventosABotones();  // Llama a la función que añade eventos
        } else {
            Notiflix.Notify.failure('La respuesta no es un array');
        }
    })
    .catch((error) => {
        Notiflix.Notify.warning( "quepaso");
    });
};





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