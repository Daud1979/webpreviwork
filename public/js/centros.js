
let indexColumna=0;
btncentromodal = document.querySelector('#btnregistrarcentro');

function validarObjeto(obj) {
    return Object.values(obj).every(value => value !== null && value !== undefined && value !== '');
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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
document.getElementById("buscadorCentro").addEventListener("input", function() {
    const searchValue = this.value.toLowerCase();
   
    const rows = document.querySelectorAll("#tabla-centros tr");
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

// deshabilita las columnas en el if
$(document).on("click", "#tabla-centros td[data-id]", function() {
    // Verifica si la celda es de la columna `idCentro` o `ntrabajadorCentro`
    indexColumna = $(this).index();
    
    if (indexColumna === 0 || indexColumna === 3 ||indexColumna===5 || indexColumna === 4 || indexColumna === 9) {
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

// modificar el centro r
$(document).on("focusout", ".edit-input", function() {
    let nuevoValor = $(this).val().trim();
    let id = $(this).data("id");
    let parentTd = $(this).parent(); // Obtener la celda padre (td)
    let originalValue = parentTd.data("original-value"); // Valor original almacenado

    // Validación: Si el campo está vacío, mostrar error y no permitir salir
    if (nuevoValor === "") {
        if (!$(this).siblings(".error-message").length) {
            $(this).after("<span id='spanerror' class='error-message'>DATO REQUERIDO</span>");
        }
        $(this).focus();
        return;
    }

    // Eliminar mensaje de error si el campo tiene un valor
    $(this).siblings(".error-message").remove();

    // Enviar datos al servidor
    const data = { indexColumna, id, nuevoValor, originalValue };

    fetch('/home/modificarCentros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.estado == 1) { // Si hay un error en el servidor
            Notiflix.Notify.warning(data.message);

            // Restaurar el valor anterior
            parentTd.text(data.valorAnterior); // Cambia el texto visible en la celda
            parentTd.data("original-value", data.valorAnterior); // Restablece el valor almacenado
        } else {
            // Si la actualización es exitosa, actualizar el valor en la celda
            parentTd.text(nuevoValor);
            parentTd.data("original-value", nuevoValor);
        }
    })
    .catch(error => {
        Notiflix.Notify.warning( "Error de conexión. Restaurando el valor original.");
       
        parentTd.text(originalValue); // Restaurar el valor original si hay error de red
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

btncentromodal.addEventListener('click',()=>{
   
    const centro=document.querySelector('#txtcentro');
    const encargado=document.querySelector('#txtencargado');
    const ciudad=document.querySelector('#txtciudad');
    const direccion=document.querySelector('#txtdireccion');
    const telefono=document.querySelector('#txttelefono');
    const codigopostal=document.querySelector('#txtcodigopostal');
    const email=document.querySelector('#txtemail');
    const personal=document.querySelector('#txtpersonal');
    const message = document.querySelector('#messageregister');
    const data ={
        centro:centro.value,
        encargado:encargado.value,
        ciudad:ciudad.value,
        direccion:direccion.value,
        telefono:telefono.value,
        email:email.value,
        personal:personal.value,
        codigopostal:codigopostal.value
    }
  
    if (isValidEmail(email.value) && validarObjeto(data))
    {
        message.innerHTML="";
        message.classList.remove('messageregisteralert');
       
        fetch('/home/registrarcentro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
               if(data.error==1)
               {
                    if(data.registrar[0].Resultado)
                    {
                        message.classList.add('messageregisteradd');
                        message.innerHTML="SE REGISTRO CORRECTAMENTE";
                        centro.value='';
                        encargado.value='';
                        ciudad.value='';
                        direccion.value='';
                        telefono.value='';
                        email.value='';
                        personal.value='';
                        location.reload();
                    }
                    else
                    {
                        message.innerHTML="EL CENTRO YA SE ENCUENTRA REGISTRADO";
                        message.classList.add('messageregisteralert');
                    }
               }
               else
               {
                    message.classList.add('messageregisteradd');
                    message.innerHTML=data.message;
               }
            //    if(data[0].Resultado==1)
          
            })
            .catch((error) => {
                Notiflix.Notify.warning( error);
            }); 
    }
    else{
        message.innerHTML="SE REQUIERE DATOS";
        message.classList.add('messageregisteralert');
    }
});


