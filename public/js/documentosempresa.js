
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
    const waitTime = Math.random() * (3000 - 2000) + 1000;

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
document.getElementById("buscadordocumento").addEventListener("input", function() {
    const searchValue = this.value.toLowerCase();
   
    const rows = document.querySelectorAll("#tabla-documentos tr");

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
// $(document).on("click", "#tabla-documentos td[data-id]", function() {
//     // Verifica si la celda es de la columna `idCentro` o `ntrabajadorCentro`
//     indexColumna = $(this).index();
    
//     if (indexColumna === 0 || indexColumna === 8) {
//         // No permitir edición en la columna de `idCentro` (index 0) ni en `ntrabajadorCentro` (index 8)
//         return;
//     }

//     if ($(this).find("input").length === 0) {
//         let valorActual = $(this).text().trim();
//         let id = $(this).data("id");

//         // Guarda el valor original en un atributo de datos para restaurarlo si se presiona Escape
//         $(this).data("original-value", valorActual);

//         $(this).html(`<input type="text" value="${valorActual}" class="edit-input" data-id="${id}" />`);
//         $(this).find("input").focus();
//     }
// });

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
           
        })
        .catch((error) => {
            Notiflix.Notify.warning( error);
        }); 
});

// Elimina el mensaje de error cuando el usuario vuelve a editar
// $(document).on("input", ".edit-input", function() {
//     $(this).siblings(".error-message").remove();
// });

// Detecta la tecla Escape para restaurar el valor original
// $(document).on("keydown", ".edit-input", function(event) {
//     if (event.key === "Escape") {
//         let originalValue = $(this).parent().data("original-value"); // Obtiene el valor original
//         $(this).parent().text(originalValue); // Restaura el valor original en la celda

//         console.log("Valor restaurado:", originalValue);
//     }
// });



function validarObjeto(obj) {
    return Object.values(obj).every(value => value !== null && value !== undefined && value !== '');
}


async function descargarpdf(documentId, button) {
    const icon = button.querySelector('.material-icons');
    icon.style.color = 'Grey';
    const row = button.closest('tr');

    // Obtener el contenido de la celda de la cuarta columna (índice 3)
    const documentCell = row.cells[3]; // Índice 3 para la cuarta columna (cero indexado)
    const documentName = documentCell.textContent.trim();
  
    try {
        const response = await fetch('/home/downloadpdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: documentId })
        });

        if (!response.ok) {
            throw new Error('Error al descargar el archivo');
        }

        // Crear un enlace de descarga
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        icon.style.color = 'Green'; // Cambiar color a verde si la descarga fue exitosa
    } catch (error) {
        Notiflix.Notify.warning(error);
        icon.style.color = 'Red'; // Cambiar color a rojo en caso de error
    }
}










