btnModificarEmpresa=document.querySelector('#btnModificarEmpresa');
btncloseModificarEmpresa=document.querySelector('#closeModificarEmpresa');
btnCenterAll = document.querySelector('#btnCenterAll');

btnModificarEmpresa.addEventListener('click',()=>{
    email =document.querySelector('#emailempresa').value;
    encargado=document.querySelector('#encargadoempresa').value;
    telefono=document.querySelector('#telefonoempresa').value;
    direccion=document.querySelector('#direccionempresa').value;
    
    const data={email,encargado,telefono,direccion}
    if (!isValidEmail(email)) {
        messagemodificar.classList.add("error"); 
        messagemodificar.innerHTML = "EL FORMATO DEL CORREO ELECTRÓNICO NO ES VÁLIDO";
    } else{
        messagemodificar.classList.remove("error"); 
        messagemodificar.innerHTML = "";
        if (Object.values(data).some(value => value.trim() === ''))
        {
            messagemodificar.classList.remove("error"); 
            messagemodificar.innerHTML = "NO SE ADMITE CAMPOS VACIOS";
        }
        else{
            /*enviar el json*/
            fetch('/home/modificardatosEmpresa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(data => {                  
                    if(data.message){                    
                         window.location.href = '/home';
                     }
                    else{
                        messagemodificar.classList.add("error"); 
                        messagemodificar.innerHTML=data.message;
                     }
                })
                .catch((error) => {
                console.error('Error:', error);
                }); 
        }
    }
})
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/*foldes*/
btnfolder14 = document.querySelector('#gestion_1');//plan de prevencion
btnfolder14.addEventListener('click',()=>{
    mostrarpdf(btnfolder14);
});

btnfolder13 = document.querySelector('#gestion_2');//evaluacin de riesgo
btnfolder13.addEventListener('click',()=>{
    mostrarpdf(btnfolder13);
});

btnfolder12 = document.querySelector('#gestion_3');//planificacion actividad preventiva
btnfolder12.addEventListener('click',()=>{
    mostrarpdf(btnfolder12);
});

btnfolder11 = document.querySelector('#gestion_4');//programacion anual
btnfolder11.addEventListener('click',()=>{
    mostrarpdf(btnfolder11);
});

btnfolder10 = document.querySelector('#gestion_5');//memoria anual
btnfolder10.addEventListener('click',()=>{
    mostrarpdf(btnfolder10);
});

btnfolder9 = document.querySelector('#gestion_6');//notificacion
btnfolder9.addEventListener('click',()=>{
    mostrarpdf(btnfolder9);
});
btnfolder8 = document.querySelector('#gestion_7');//contrato
btnfolder8.addEventListener('click',()=>{
    mostrarpdf(btnfolder8);
})


btnfolder7 = document.querySelector('#btnPresupuestoAll');//presupuesto
btnfolder7.addEventListener('click',()=>{
    mostrarpdf(btnfolder7);
})
btnfolder6 = document.querySelector('#btninforme_8');//construccion
btnfolder6.addEventListener('click',()=>{
    mostrarpdf(btnfolder6);
})
btnfolder5 = document.querySelector('#btninforme_9');//informe de seguridad
btnfolder5.addEventListener('click',()=>{
    mostrarpdf(btnfolder5);
})
btnfolder4 = document.querySelector('#btninforme_10');//informe de psicosociologia
btnfolder4.addEventListener('click',()=>{
    mostrarpdf(btnfolder4);
})
btnfolder3 = document.querySelector('#btninforme_11');//informe de ergonomia
btnfolder3.addEventListener('click',()=>{
    mostrarpdf(btnfolder3);
})
btnfolder2 = document.querySelector('#btninforme_12');//informe de higiene
btnfolder2.addEventListener('click',()=>{
    mostrarpdf(btnfolder2);
})
btnfolder1 = document.querySelector('#btnformacion');//formacion
btnfolder1.addEventListener('click',()=>{
  
    mostrarpdf(btnfolder1);
})
btnfolder = document.querySelector('#btnmedicina');//medicina de trabajo
btnfolder.addEventListener('click',()=>{
    mostrarpdf(btnfolder);
})

function mostrarpdf(btnclick){
    const dataenviar={tipo:btnclick.id};
    fetch('/home/mostrarpdfempresa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataenviar)
        })
        .then(response => response.json())
        .then(data => {                  
          if(data.confirm)
          {
            redirigirConPost('/home/listadocumentos', dataenviar)
          }
          else
          {
            alert(data.message);
          }
        })
        .catch((error) => {
        console.error('Error:', error);
        });
}

function redirigirConPost(url, data) {
    // Crear un formulario temporal
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;

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
}