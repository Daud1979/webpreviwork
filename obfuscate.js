const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Ruta a la carpeta de tus archivos JS
const jsDirectory = path.join(__dirname, 'public', 'js');

// Lee todos los archivos en la carpeta `public/js`
fs.readdir(jsDirectory, (err, files) => {
  if (err) {
    console.error('Error al leer la carpeta:', err);
    return;
  }

  // Filtra solo los archivos .js
  files.filter(file => file.endsWith('.js')).forEach(file => {
    const filePath = path.join(jsDirectory, file);
    
    // Lee el contenido del archivo JS
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error al leer el archivo ${file}:`, err);
        return;
      }

      // Realiza la ofuscación del código JS
      const obfuscatedCode = JavaScriptObfuscator.obfuscate(data, {
        compact: true,
        controlFlowFlattening: true,
      }).getObfuscatedCode();

      // Escribe el código ofuscado en un nuevo archivo (con .min.js)
      const minifiedFilePath = path.join(jsDirectory, file.replace('.js', '.min.js'));
      fs.writeFile(minifiedFilePath, obfuscatedCode, (err) => {
        if (err) {
          console.error(`Error al escribir el archivo ofuscado ${file}:`, err);
        } else {
          console.log(`Archivo ofuscado y guardado: ${minifiedFilePath}`);
        }
      });
    });
  });
});
