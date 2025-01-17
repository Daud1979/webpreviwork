
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
btnregistrarpersonal = document.querySelector('#btnregistrarpersonal');
function validarObjeto(obj) {
    return Object.values(obj).every(value => value !== null && value !== undefined && value !== '');
}
closemodificarPersonal.addEventListener('click',()=>{
    location.reload();
});
btnmodificarpersonal.addEventListener('click',()=>{
    const idcentro=document.querySelector('#Ucmbcentrospersonalmodificar');
    const nif=document.querySelector('#Unifpersonal');
    const nombre=document.querySelector('#Unombrepersonal');
    const apellidos=document.querySelector('#Uapellidospersonal');
    const email=document.querySelector('#Uemailpersonal');
    const telefono=document.querySelector('#Utelefonopersonal');
    const idpuesto = document.querySelector('#Ucmbpuestotrabajo');
    const Fregistro = document.querySelector('#UFAlta');
    const Fbaja = document.querySelector('#UFBaja');
    const estado = document.querySelector('#Ucmbestado');
    const message = document.querySelector('#messagemodify');
    const idTrabajador = document.querySelector('#UidTrabajador');  
   let est='H';
   let baja=null;
    if (validarFecha(Fregistro.value))
    {      
        message.innerHTML="";
        message.classList.remove('messageregisteralert');
       if(estado.value=="H")
       {
            est='H';
            baja=null;
       }
       else//deshabilitado
       {
            if(validarFecha(Fbaja.value))
            {
                est='D';
                baja=Fbaja.value;
            }
            else
            {
                message.innerHTML="FECHA DE BAJA NO VALIDO";
                message.classList.add('messageregisteralert');
                return;
            }
       }
       const data ={
            idCentro:idcentro.value,
            NIF:nif.value,
            nombres:nombre.value,
            apellidos:apellidos.value,
            email:email.value,
            idpuesto:idpuesto.value,
            telefono:telefono.value,
            Fregistro:Fregistro.value,
            Fbaja:baja,
            estado:est,
            idTrabajador:idTrabajador.value
        }     
        fetch('/home/modificarPersonal', {
        method: 'POST',
        headers: {
               'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
          
        if(data.message)
        {
            message.classList.add('messageregisteradd');
            message.innerHTML="SE MODIFICO CORRECTAMENTE CORRECTAMENTE";

        }
        else
        {
            message.innerHTML="SE PRODUJO UN ERROR";
            message.classList.add('messageregisteralert');
        }
        })
        .catch((error) => {
            console.error('Error:', error);
        }); 
    }
    else
    {
        message.innerHTML="FECHA DE REGISTRO NO VALIDO";
        message.classList.add('messageregisteralert');
    }
    // if (isValidEmail(email.value) && (Fregistro!=""))
    //     {
           
    //         message.innerHTML="";
    //         message.classList.remove('messageregisteralert');
           
    //         fetch('/home/modificarPersonal', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(data)
    //             })
    //             .then(response => response.json())
    //             .then(data => {
    //                if(data[0].Resultado==1)
    //                {
                    
    //                     message.classList.add('messageregisteradd');
    //                     message.innerHTML="SE MODIFICO CORRECTAMENTE CORRECTAMENTE";
                       
    //                }
    //                else
    //                {
    //                     message.innerHTML="SE PRODUJO UN ERROR";
    //                     message.classList.add('messageregisteralert');
    //                }
    //             })
    //             .catch((error) => {
    //             console.error('Error:', error);
    //             }); 
    // }
    // else{
    //     message.innerHTML="SE REQUIERE DATOS O CORREO NO VALIDO";
    //     message.classList.add('messageregisteralert');
    // }
});


function validarFecha(fecha) {
    // Verifica que el formato sea YYYY-MM-DD usando una expresión regular
    const regexFecha = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    
    if (!regexFecha.test(fecha)) {
      return false; // Si no cumple el formato, no es válida
    }
  
    // Verifica si es una fecha real
    const fechaObj = new Date(fecha);
    return fechaObj instanceof Date && !isNaN(fechaObj);
  }

btnregistrarpersonal.addEventListener('click',()=>{
    const idcentro=document.querySelector('#cmbcentrospersonalregistro');
    const nif=document.querySelector('#nifpersonal');
    const nombre=document.querySelector('#nombrepersonal');
    const apellidos=document.querySelector('#apellidospersonal');
    const email=document.querySelector('#emailpersonal');
    const telefono=document.querySelector('#telefonopersonal');
    const idpuesto = document.querySelector('#cmbpuestotrabajo');
    const Fregistro = document.querySelector('#FAlta');
    const message = document.querySelector('#messageregister');
    const data ={
        idCentro:idcentro.value,
        NIF:nif.value,
        nombres:nombre.value,
        apellidos:apellidos.value,
        email:email.value,
        idpuesto:idpuesto.value,
        telefono:telefono.value,
        Fregistro:Fregistro.value
    }
    if (isValidEmail(email.value) && validarObjeto(data) && (Fregistro!=""))
    {
        message.innerHTML="";
        message.classList.remove('messageregisteralert');
       
        fetch('/home/registrarpersonal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
               if(data[0].Resultado==1)
               {
                
                message.classList.add('messageregisteradd');
                    message.innerHTML="SE REGISTRO CORRECTAMENTE";
                   
                    nif.value="";
                    nombre.value="";
                    apellidos.value="";
                    email.value="";
                    telefono.value="";
               }
               else
               {
                    message.innerHTML="LA PERSONA YA SE ENCUENTRA REGISTRADO";
                    message.classList.add('messageregisteralert');
               }
            })
            .catch((error) => {
            console.error('Error:', error);
            }); 
    }
    else{
        message.innerHTML="SE REQUIERE DATOS O CORREO NO VALIDO";
        message.classList.add('messageregisteralert');
    }
});

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
    
    if (indexColumna >= 0) {
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


// Agrega un evento de clic a cada botón
// Selecciona todos los botones con la clase "select-id-btn"
const botones = document.querySelectorAll('.select-id-btn');
const modificarpersonal = document.querySelector('#modalmodificarpersonal');
// Agrega un evento de clic a cada botón
botones.forEach((boton) => {
    boton.addEventListener('click', function() {       
        const idBoton = this.id;   
        const idTrabajador = this.getAttribute('data-id');
        Ucmbcentrospersonalmodificar = document.querySelector('#Ucmbcentrospersonalmodificar');
        Unifpersonal = document.querySelector('#Unifpersonal');
        Unombrepersonal = document.querySelector('#Unombrepersonal');
        Uapellidospersonal = document.querySelector('#Uapellidospersonal');
        Uemailpersonal = document.querySelector('#Uemailpersonal');
        Utelefonopersonal = document.querySelector('#Utelefonopersonal');
        Ucmbpuestotrabajo = document.querySelector('#Ucmbpuestotrabajo');
        UFAlta = document.querySelector('#UFAlta');
        UFBaja = document.querySelector('#UFBaja');
        Ucmbestado = document.querySelector('#Ucmbestado');
        UidTrabajador =document.querySelector('#UidTrabajador');
        if (idBoton=='btnEstadoPersona')
        {            
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
                    // let fila = $(this).closest("tr");   
                    // fila.find("td.estado").text(data.message);
                    Ucmbcentrospersonalmodificar.value=data.updateData[0].idCentro;
                    Unifpersonal.value=data.updateData[0].NIF;
                    Unombrepersonal.value = data.updateData[0].nombres;
                    Uapellidospersonal.value = data.updateData[0].apellidos;
                    Uemailpersonal.value = data.updateData[0].email;
                    Utelefonopersonal.value = data.updateData[0].telefono;
                    Ucmbpuestotrabajo.value = data.updateData[0].idPuesto;
                    Ucmbestado.value = data.updateData[0].estado;
                    UidTrabajador.value =idTrabajador;
                    UFAlta.value = data.updateData[0].fechaAlta.split('T')[0];;
                    UFBaja.value = data.updateData[0].fechaBaja.split('T')[0];;
                
                    
                })
                .catch((error) => {
                console.error('Error:', error);
                });
        }
      
    });
});

$(document).ready(function() {
    $('#cmbcentrospersonal').on('change', function() {
        // Obtener el valor seleccionado
        let valorSeleccionado = $(this).val();
        const data = { valor: valorSeleccionado };
const Unifpersonal =document.querySelector('#Unifpersonal');
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
                            <td class="align-left" data-id="${item.idTrabajador}">${item.Puesto}</td>
                            <td class="align-left" data-id="${item.idTrabajador}">${item.email}</td>
                            <td class="align-right" data-id="${item.idTrabajador}">${item.telefono}</td>
                            <td class="align-right" data-id="${item.idTrabajador}">${item.Registro}</td>
                            <td class="align-right" data-id="${item.idTrabajador}">${item.Baja}</td>
                            <td class="align-center estado" data-id="${item.idTrabajador}">${item.Estado}</td>
                           <td class="align-center m-0 p-0 " id="tdbotones">
                                <button id="btnEstadoPersona" class="btn btn-sm m-0 p-0 select-id-btn btnidpersonalfila"  data-bs-toggle="modal" data-bs-target="#modalmodificarpersonal" data-id="${item.idTrabajador}">
                                    <i id="iapto" class="material-icons">restart_alt</i>
                                    <span class="tooltip-text">Actualizar Datos</span>
                                </button>

                                <button id="btnFormacion" class="btn btn-sm m-0 p-0 select-id-btn btnidpersonalfila" data-id="${item.idTrabajador}">
                                    <i id="iformacion" class="material-icons">school</i>
                                    <span class="tooltip-text">Formación</span>
                                </button>

                                <button id="btnInformacion" class="btn btn-sm m-0 p-0 select-id-btn btnidpersonalfila" data-id="${item.idTrabajador}">
                                    <i id="iinformacion" class="material-icons">analytics</i>
                                    <span class="tooltip-text">Información</span>
                                </button>

                                <button id="btnAptoRM" class="btn btn-sm m-0 p-0 select-id-btn btnidpersonalfila" data-id="${item.idTrabajador}">
                                    <i id="iaptorm" class="material-icons">medical_information</i>
                                    <span class="tooltip-text">Apto R.M.</span>
                                </button>

                                <button id="btnRenuncia" class="btn btn-sm m-0 p-0 select-id-btn btnidpersonalfila" data-id="${item.idTrabajador}">
                                    <i id="icrrm" class="material-icons">monitor_heart</i>
                                    <span class="tooltip-text">Consentimiento Renuncia R.M.</span>
                                </button>

                                <button id="btnAutorizacion" class="btn btn-sm m-0 p-0 select-id-btn btnidpersonalfila" data-id="${item.idTrabajador}">
                                    <i id="iautorizaciones" class="material-icons">verified_user</i>
                                    <span class="tooltip-text">Autorizaciones</span>
                                </button>
                            </td>
                        </tr>
                    `);
                });

                // Agregar evento a los botones generados
                agregarEventosABotones();  // Llama a la función que añade eventos
            } else {
                console.error('La respuesta no es un array');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });

    // Función para agregar eventos a los botones
    function agregarEventosABotones() {
        // Selecciona todos los botones con la clase "select-id-btn"
        const botones = document.querySelectorAll('.select-id-btn');

        // Agrega un evento de clic a cada botón
        botones.forEach((boton) => {
            boton.addEventListener('click', function() {
                const idBoton = this.id;  // Guarda el id del botón clicado
                const idTrabajador = this.getAttribute('data-id');  // Obtiene el data-id
                Ucmbcentrospersonalmodificar = document.querySelector('#Ucmbcentrospersonalmodificar');
                Unifpersonal = document.querySelector('#Unifpersonal');
                Unombrepersonal = document.querySelector('#Unombrepersonal');
                Uapellidospersonal = document.querySelector('#Uapellidospersonal');
                Uemailpersonal = document.querySelector('#Uemailpersonal');
                Utelefonopersonal = document.querySelector('#Utelefonopersonal');
                Ucmbpuestotrabajo = document.querySelector('#Ucmbpuestotrabajo');
                UFAlta = document.querySelector('#UFAlta');
                UFBaja = document.querySelector('#UFBaja');
                UidTrabajador =document.querySelector('#UidTrabajador');
                Ucmbestado = document.querySelector('#Ucmbestado');
                if (idBoton === 'btnEstadoPersona') {
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
                            // let fila = $(this).closest("tr");   
                            // fila.find("td.estado").text(data.message);
                            Ucmbcentrospersonalmodificar.value=data.updateData[0].idCentro;
                            Unifpersonal.value=data.updateData[0].NIF;
                            Unombrepersonal.value = data.updateData[0].nombres;
                            Uapellidospersonal.value = data.updateData[0].apellidos;
                            Uemailpersonal.value = data.updateData[0].email;
                            Utelefonopersonal.value = data.updateData[0].telefono;
                            Ucmbpuestotrabajo.value = data.updateData[0].idPuesto;
                            Ucmbestado.value = data.updateData[0].estado;
                            UidTrabajador.value =idTrabajador;
                            UFAlta.value = data.updateData[0].fechaAlta.split('T')[0];;
                            UFBaja.value = data.updateData[0].fechaBaja.split('T')[0];;
                                           
                        })
                        .catch((error) => {
                        console.error('Error:', error);
                        });
                }
            });
        });
    }
});


