
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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
let indexColumna=0;
// Detecta el clic en una celda para habilitar la edición
$(document).on("click", "#tabla-centros td[data-id]", function() {
    // Verifica si la celda es de la columna `idCentro` o `ntrabajadorCentro`
    indexColumna = $(this).index();
    
    if (indexColumna === 0 || indexColumna === 8) {
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
    fetch('/home/modificarCentros', {
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

        console.log("Valor restaurado:", originalValue);
    }
});

btncentromodal = document.querySelector('#btnregistrarcentro');
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
    console.log(data);
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
               if(data[0].Resultado==1)
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

function validarObjeto(obj) {
    return Object.values(obj).every(value => value !== null && value !== undefined && value !== '');
}
