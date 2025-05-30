const toggleButton = document.getElementById('toggleButton');
const tablaContainer = document.getElementById('tablaContainer');
const toggleButtonPersonal = document.getElementById('toggleButtonPersonal');
const tablaContainerPersonal = document.getElementById('tablaContainerPersonal');
const pdfInput = document.getElementById('pdfFile');
const fileNameDisplay = document.getElementById('fileName');
const errorMessage = document.getElementById('errorMessage');
const  closeRegistrarPersonal = document.querySelector('#closeRegistrarPersonal');
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
document.getElementById("btnregistrarpdf").addEventListener("click", function () {
  const form = document.getElementById("uploadForm");
  const formData = new FormData(form);
  const fileInput = document.getElementById("pdfFile");
  const errorMessage = document.getElementById("errorMessage");
  const submitButton = document.getElementById("btnregistrarpdf");

  // Validar que se haya seleccionado un archivo
  if (fileInput.files.length === 0) {
      errorMessage.classList.remove("d-none");
      Notiflix.Notify.failure("Por favor, seleccione un archivo PDF.");
      return;
  }

  errorMessage.classList.add("d-none"); // Ocultar mensaje de error si el archivo es válido

  // ✅ Mostrar mensaje de "Enviando documento..."
  Notiflix.Notify.info("Enviando el documento, por favor espere...");

  // Deshabilitar el botón mientras se envía
  submitButton.disabled = true;

  // Enviar datos al servidor con fetch
  fetch("/home/uploadpdf", {
      method: "POST",
      body: formData
  })
  .then(response => response.json()) // Convertir respuesta a JSON
  .then(data => {
      if (data.success) {
          Notiflix.Notify.success("Documento subido correctamente.");
          setTimeout(() => window.location.reload(), 2000); // Recargar tras éxito con delay
      } else {
          Notiflix.Notify.failure("Error en el servidor: " + data.message);
      }
  })
  .catch(error => {
      console.error("Error en la petición:", error);
      Notiflix.Notify.failure("Hubo un error al subir el archivo.");
  })
  .finally(() => {
      submitButton.disabled = false; // Habilitar el botón nuevamente
  });
});


function carga(){
  const idDocumentoupload = document.querySelector('#idDocumentoupload');
  idDocumentoupload.value=documentId;
  const idTrabajadorupload = document.querySelector('#idTrabajadorupload');
  const idTrabajador = document.querySelector('#idTrabajador');
idTrabajadorupload.value=idTrabajador.value;
 }
async function descargarpdf(documentId, button) {
    const icon = button.querySelector('.material-icons');

    icon.style.color = 'Grey';
    const row = button.closest('tr');
    // Obtener el contenido de la celda de la cuarta columna (índice 3)
    const documentCell = row.cells[3]; // Índice 3 para la cuarta columna (cero indexado)
    const documentName = documentCell.textContent.trim();
    const nif= document.querySelector('#NIF');
    const nombre = document.querySelector('#nombre');
    const apellidos= document.querySelector('#apellidos');
    const idTrabajador = document.querySelector('#idTrabajador');
    try {
        const response = await fetch('/home/downloadpdf_', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: documentId,
              nif:nif.value,
              nombre:nombre.value,
              apellidos:apellidos.value,
             idTrabajador:idTrabajador.value
             })
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
        setTimeout(() => {
          location.reload();
        }, 1000); // 1000 ms = 1 segundo
    } catch (error) {
      Notiflix.Notify.warning( error);
        icon.style.color = 'Red'; // Cambiar color a rojo en caso de error
    }
}
async function descargarpdfTrabajador(documentId, button) {
  const icon = button.querySelector('.material-icons');

  icon.style.color = 'Grey';
  const row = button.closest('tr');
  // Obtener el contenido de la celda de la cuarta columna (índice 3)
  const documentCell = row.cells[4]; // Índice 3 para la cuarta columna (cero indexado)
  const documentName = documentCell.textContent.trim();
  const nif= document.querySelector('#NIF');
  const nombre = document.querySelector('#nombre');
  const apellidos= document.querySelector('#apellidos');
  
  try {
      const response = await fetch('/home/downloadpdfTrabajador', {
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
    Notiflix.Notify.warning( error);
      icon.style.color = 'Red'; // Cambiar color a rojo en caso de error
  }
}
// Agregar evento click al botón
toggleButton.addEventListener('click', () => {
  if (tablaContainer.classList.contains('d-none')) {
    // Mostrar la tabla
    tablaContainer.classList.remove('d-none');
    toggleButton.textContent = '-';
  } else {
    // Ocultar la tabla
    tablaContainer.classList.add('d-none');
    toggleButton.textContent = '+';
  }
});

toggleButtonPersonal.addEventListener('click', () => {
    if (tablaContainerPersonal.classList.contains('d-none')) {
      // Mostrar la tabla
      tablaContainerPersonal.classList.remove('d-none');
      toggleButtonPersonal.textContent = '-';
    } else {
      // Ocultar la tabla
      tablaContainerPersonal.classList.add('d-none');
      toggleButtonPersonal.textContent = '+';
    }
});

document.getElementById("buscadorinformacionglobal").addEventListener("input", function() {
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

document.getElementById("buscadorinformaciontrabajador").addEventListener("input", function() {
  const searchValue = this.value.toLowerCase();
 
  const rows = document.querySelectorAll("#tablainformaciontrabajador tr");

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
  
closeRegistrarPersonal.addEventListener('click',()=>{
    pdfFile = document.querySelector('#pdfFile');
    fileName = document.querySelector('#fileName');
    observacion = document.querySelector('#Observacion');
    fecha = document.querySelector('#FAlta');
    pdfFile.value='';
    observacion.value='';
    fecha.value='';
    fileName.value='';
});


pdfInput.addEventListener('change', function () {
    if (pdfInput.files.length > 0) {
      fileNameDisplay.value = pdfInput.files[0].name;     
      errorMessage.classList.add('d-none');
     
    }
  });

  //Validación del formulario
  document.getElementById('uploadForm').addEventListener('submit', function (e) {  
    if (!pdfInput.files.length || pdfInput.files[0].type !== 'application/pdf') {
      e.preventDefault(); // Detener el envío del formulario
      errorMessage.classList.remove('d-none');
      pdfInput.classList.add('is-invalid');
    } else {
      errorMessage.classList.add('d-none');
      pdfInput.classList.remove('is-invalid');
    }
  });

  document.getElementById("pdfFile").addEventListener("change", function () {
    const fileInput = this;
    const fileNameField = document.getElementById("fileName");
    const hiddenFileNameField = document.getElementById("pdfFileName");

    if (fileInput.files && fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name; // Obtiene el nombre del archivo
        fileNameField.value = fileName; // Muestra el nombre en el campo de texto
        hiddenFileNameField.value = fileName; // Asigna el nombre al campo oculto
    }
});
function verpdfTrabajador(url, data) {
  // Crear un formulario temporal
  const datos={id:data};
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.target = "_blank"; 
  // Agregar los datos como campos ocultos
  for (const key in datos) {
      if (datos.hasOwnProperty(key)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = datos[key];
          form.appendChild(input);
      }
  }

  // Añadir el formulario al documento, enviarlo y luego eliminarlo
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

async function enviaremailpdf(documentId, button) {
  const icon = button.querySelector('.material-icons');
  icon.style.color = 'Grey';
  const row = button.closest('tr');
  // Obtener el contenido de la celda de la cuarta columna (índice 3)
  const documentCell = row.cells[3]; // Índice 3 para la cuarta columna (cero indexado)
  const documentName = documentCell.textContent.trim();
  const nif= document.querySelector('#NIF');
  const nombre = document.querySelector('#nombre');
  const apellidos= document.querySelector('#apellidos');
  const email =document.querySelector('#email');
  const idTrabajador = document.querySelector('#idTrabajador');
 if (isValidEmail(email.value))
 {
  const data={
    tipo:'Documento de Autorización o Renuncia',
    id: documentId,
    nif:nif.value,
    nombre:nombre.value,
    apellidos:apellidos.value,
    email:email.value,
    idTrabajador:idTrabajador.value
  };
  try {
    fetch('/home/enviarmailpdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {    
      if (data.valor>0)
      {  
        Notiflix.Notify.success(data.message);
       setTimeout(() => {
          location.reload();
        }, 1000); // 1000 ms = 1 segundo
      }
      else
      {
          Notiflix.Notify.warning(data.message);
          
      }
    })
    .catch((error) => {
      Notiflix.Notify.warning(error);
     
    }); 
    // Cambiar color a verde si la descarga fue exitosa
  } catch (error) {
    Notiflix.Notify.warning( error);
   
  }
 }
 else{
  Notiflix.Notify.warning("EMAIL NO VALIDO");
 }
  
}