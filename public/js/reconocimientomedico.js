const toggleButton = document.getElementById('toggleButton');
const tablaContainer = document.getElementById('tablaContainer');

// const toggleButtonPersonal = document.getElementById('toggleButtonPersonal');
// const tablaContainerPersonal = document.getElementById('tablaContainerPersonal');
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
toggleButtonPersonalOnline.addEventListener('click', () => {
    if (tablaContainerPersonalOnline.classList.contains('d-none')) {
      // Mostrar la tabla
      tablaContainerPersonalOnline.classList.remove('d-none');
      toggleButtonPersonalOnline.textContent = '-';
    } else {
      // Ocultar la tabla
      tablaContainerPersonalOnline.classList.add('d-none');
      toggleButtonPersonalOnline.textContent = '+';
    }
});

document.getElementById("buscadorinformaciontrabajadorOnline").addEventListener("input", function() {
  const searchValue = this.value.toLowerCase();
 
  const rows = document.querySelectorAll("#tablaRMPreviwork tr");

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

async function descargarRMOnline(urlpdf, nombre, button) {
  if (esURLValida(urlpdf)) {
    try {
      const response = await fetch(urlpdf, { method: 'GET' });
      if (!response.ok) throw new Error("No se pudo descargar el PDF");
      console.log(urlpdf);
      const blob = await response.blob();
      const enlace = document.createElement("a");
      enlace.href = URL.createObjectURL(blob);
      enlace.download = nombre+".pdf";
      enlace.style.display = 'none'; // Oculta el enlace
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(enlace.href); // Libera la URL temporal

    } catch (error) {
      console.error(error);
      Notiflix.Notify.warning("Se produjo un error al descargar el PDF");
    }
  } else {
    Notiflix.Notify.warning("El certificado aún no se encuentra finalizado");
  }
}

async function verRMOnline(url,urlpdf,nombre, button) {
    if (esURLValida(urlpdf))
    {
        
    const datos={id:urlpdf, nombre:nombre};
    console.log(datos);
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
    else
    {
        Notiflix.Notify.warning("El certificado aun no se encuentra finalizado");
    }
}
function esURLValida(url) {
  try {
    new URL(url); // Intenta construir la URL
    return true;
  } catch (err) {
    return false; // Si lanza error, no es válida
  }
}
