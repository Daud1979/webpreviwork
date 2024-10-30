
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
document.getElementById("buscadorpersonal").addEventListener("input", function() {
    const searchValue = this.value.toLowerCase();
   
    const rows = document.querySelectorAll("#tabla-trabajador tr");

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

let indexColumna=0;
// Detecta el clic en una celda para habilitar la edición
$(document).on("click", "#tabla-trabajador td[data-id]", function() {
    // Verifica si la celda es de la columna `idCentro` o `ntrabajadorCentro`
    indexColumna = $(this).index();
    
    if (indexColumna === 0 || indexColumna === 6) {
        // No permitir edición en la columna de `idCentro` (index 0) ni en `ntrabajadorCentro` (index 8)
        return;
    }

    if ($(this).find("input").length === 0) {
        let valorActual = $(this).text().trim();
        let id = $(this).data("id");

        // Guarda el valor original en un atributo de datos para restaurarlo si se presiona Escape
        $(this).data("original-value", valorActual);

        $(this).html(`<input type="text" value="${valorActual}" class="edit-input" data-id="${id}" />`);
        $(this).find("input").focus();
    }
});

// Detecta cuando se sale del campo de texto (focusout) para guardar el valor
$(document).on("focusout", ".edit-input", function() {
    let nuevoValor = $(this).val().trim();
    let id = $(this).data("id");
    
    // Validación para evitar que el campo quede vacío
    if (nuevoValor === "") {
        if (!$(this).siblings(".error-message").length) {
            $(this).after("<span id='spanerror' class='error-message'>DATO REQUERIDO</span>");
        }
        $(this).focus();
        return;
    }
    // Si el valor no está vacío, elimina el mensaje de error y vuelve a mostrar el valor como texto
    $(this).siblings(".error-message").remove();
    $(this).parent().text(nuevoValor);
    const data ={indexColumna,id,nuevoValor}
    fetch('/home/modificarPersonal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
           console.log(data);
        })
        .catch((error) => {
        console.error('Error:', error);
        }); 
});

// Elimina el mensaje de error cuando el usuario vuelve a editar
$(document).on("input", ".edit-input", function() {
    $(this).siblings(".error-message").remove();
});

// Detecta la tecla Escape para restaurar el valor original
$(document).on("keydown", ".edit-input", function(event) {
    if (event.key === "Escape") {
        let originalValue = $(this).parent().data("original-value"); // Obtiene el valor original
        $(this).parent().text(originalValue); // Restaura el valor original en la celda       
    }
});

$(document).on("click", ".select-id-btn", function() {
    // Obtener el valor de data-id desde el atributo del botón
    let idTrabajador = $(this).data("id");
    const data={idTrabajador}
    fetch('/home/modificarEstadoPersonal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            let fila = $(this).closest("tr");   
            fila.find("td.estado").text(data.message);
        })
        .catch((error) => {
        console.error('Error:', error);
        });
    


    

});


$(document).ready(function() {
    $('#cmbcentrospersonal').on('change', function() {
        // Obtener el valor seleccionado
        let valorSeleccionado = $(this).val();
        const data = { valor: valorSeleccionado };

        // Limpiar el tbody de la tabla
        $('#tabla-trabajador').empty();

        // Hacer la solicitud fetch para cargar nuevos datos
        fetch('/home/cargarPersonalCentro', {
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
            console.log(data);  // Imprimir los datos para depuración
            
            // Comprobar que los datos sean un array
            if (Array.isArray(data)) {
                // Iterar sobre el nuevo conjunto de datos y agregar filas a la tabla
                data.forEach(item => {
                    $('#tabla-trabajador').append(`
                        <tr>
                            <td class="align-left" data-id="${item.idTrabajador}">${item.Centro}</td>
                            <td class="align-right" data-id="${item.idTrabajador}">${item.NIF}</td>
                            <td class="align-left" data-id="${item.idTrabajador}">${item.nombres}</td>
                            <td class="align-left" data-id="${item.idTrabajador}">${item.apellidos}</td>
                            <td class="align-left" data-id="${item.idTrabajador}">${item.email}</td>
                            <td class="align-right" data-id="${item.idTrabajador}">${item.telefono}</td>
                            <td class="align-center" data-id="${item.idTrabajador}">${item.Estado}</td>
                            <td class="align-center">
                                <button class="btn btn-sm m-0 p-0 select-id-btn btnidpersonalfila" data-id="${item.idTrabajador}">Cambiar</button>
                            </td>
                        </tr>
                    `);
                });
            } else {
                console.error('La respuesta no es un array');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});
