async function descargarpdf(documentId, button) {
    const icon = button.querySelector('.material-icons');
    icon.style.color = 'Grey';
    const row = button.closest('tr');
    // Obtener el contenido de la celda de la cuarta columna (índice 3)
    const documentCell = row.cells[3]; // Índice 3 para la cuarta columna (cero indexado)
    const documentName = documentCell.textContent.trim();
  console.log(documentName);
    try {
        const response = await fetch('/home/downloadpdf_', {
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
        console.error('Error en la descarga:', error);
        icon.style.color = 'Red'; // Cambiar color a rojo en caso de error
    }
}

const toggleButton = document.getElementById('toggleButton');
const tablaContainer = document.getElementById('tablaContainer');
const toggleButtonPersonal = document.getElementById('toggleButtonPersonal');
const tablaContainerPersonal = document.getElementById('tablaContainerPersonal');

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