// Elementos del DOM
const elements = {
  toggleButton: document.getElementById('toggleButton'),
  tablaContainer: document.getElementById('tablaContainer'),
  toggleButtonPersonal: document.getElementById('toggleButtonPersonal'),
  tablaContainerPersonal: document.getElementById('tablaContainerPersonal'),
  pdfInput: document.getElementById('pdfFile'),
  fileNameDisplay: document.getElementById('fileName'),
  errorMessage: document.getElementById('errorMessage'),
  closeRegistrarPersonal: document.getElementById('closeRegistrarPersonal'),
  uploadForm: document.getElementById('uploadForm'),
  buscadorGlobal: document.getElementById("buscadorinformacionglobal"),
  buscadorTrabajador: document.getElementById("buscadorinformaciontrabajador"),
};

// Función para alternar visibilidad de una tabla
function toggleTable(button, table) {
  const isHidden = table.classList.contains('d-none');
  table.classList.toggle('d-none');
  button.textContent = isHidden ? '-' : '+';
}

// Evento para alternar tablas
elements.toggleButton.addEventListener('click', () => toggleTable(elements.toggleButton, elements.tablaContainer));
elements.toggleButtonPersonal.addEventListener('click', () => toggleTable(elements.toggleButtonPersonal, elements.tablaContainerPersonal));

// Función para cargar documento
function carga(documentId) {
  document.querySelector('#idDocumentoupload').value = documentId;
  document.querySelector('#idTrabajadorupload').value = document.querySelector('#idTrabajador').value;
}

// Función para descargar PDF
async function descargarPDF(endpoint, documentId, button, columnIndex) {
  const icon = button.querySelector('.material-icons');
  icon.style.color = 'Grey';

  const row = button.closest('tr');
  const documentCell = row.cells[columnIndex];
  const documentName = documentCell.textContent.trim();

  try {
      const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: documentId })
      });

      if (!response.ok) throw new Error('Error al descargar el archivo');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      icon.style.color = 'Green'; // Éxito
  } catch (error) {
      Notiflix.Notify.warning( error);  
      icon.style.color = 'Red'; // Error
  }
}

// Funciones específicas para descargar
function descargarpdf(documentId, button) {
  descargarPDF('/home/downloadpdf_', documentId, button, 3);
}

function descargarpdfTrabajador(documentId, button) {
  descargarPDF('/home/downloadpdfTrabajador', documentId, button, 4);
}

// Función de filtrado en tablas
function filtrarTabla(input, tableSelector) {
  const searchValue = input.value.toLowerCase();
  document.querySelectorAll(`${tableSelector} tr`).forEach(row => {
      const rowText = Array.from(row.querySelectorAll("td"))
          .map(cell => cell.textContent.toLowerCase())
          .join(" ");
      row.style.display = rowText.includes(searchValue) ? "" : "none";
  });
}

// Eventos de filtrado
elements.buscadorGlobal.addEventListener("input", () => filtrarTabla(elements.buscadorGlobal, "#tabla-documentos"));
elements.buscadorTrabajador.addEventListener("input", () => filtrarTabla(elements.buscadorTrabajador, "#tablainformaciontrabajador"));

// Cerrar formulario y limpiar campos
elements.closeRegistrarPersonal.addEventListener('click', () => {
  ['#pdfFile', '#fileName', '#Observacion', '#FAlta'].forEach(selector => {
      document.querySelector(selector).value = '';
  });
});

// Mostrar nombre del archivo seleccionado
elements.pdfInput.addEventListener('change', function () {
  if (this.files.length > 0) {
      elements.fileNameDisplay.value = this.files[0].name;
      elements.errorMessage.classList.add('d-none');
  }
});

// Validación de formulario antes de enviar
elements.uploadForm.addEventListener('submit', function (e) {
  if (!elements.pdfInput.files.length || elements.pdfInput.files[0].type !== 'application/pdf') {
      e.preventDefault(); // Detener envío
      elements.errorMessage.classList.remove('d-none');
      elements.pdfInput.classList.add('is-invalid');
  } else {
      elements.errorMessage.classList.add('d-none');
      elements.pdfInput.classList.remove('is-invalid');
  }
});

// Sincronizar nombre de archivo en input oculto
elements.pdfInput.addEventListener("change", function () {
  if (this.files.length > 0) {
      const fileName = this.files[0].name;
      document.getElementById("fileName").value = fileName;
      document.getElementById("pdfFileName").value = fileName;
  }
});
