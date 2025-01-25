document.addEventListener("DOMContentLoaded", () => {
    const btnVolver = document.getElementById("btnvolver");    
    const id = btnVolver.getAttribute("data-id");     
    btnVolver.addEventListener("click", () => {
        const idTrabajador=id.split('-')[1];        
        const data={idTrabajador}
        const form = document.createElement("form");
        form.method = "POST";
        form.action = 'informacionpersonal';

        // Agregar los datos como campos ocultos
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = data[key];
                form.appendChild(input);
            }
        }
    // Añadir el formulario al documento, enviarlo y luego eliminarlo
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
       
    });
});

