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

// document.getElementById("buscadorCentro").addEventListener("input", function() {
//     const searchValue = this.value.toLowerCase();
//     console.log(searchValue);
//     // const rows = document.querySelectorAll("#tabla-centros tr");

//     // rows.forEach(row => {
//     //     const cells = row.querySelectorAll("td");
//     //     const rowText = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(" ");
        
//     //     if (rowText.includes(searchValue)) {
//     //         row.style.display = "";
//     //     } else {
//     //         row.style.display = "none";
//     //     }
//     // });
// });
