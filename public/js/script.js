const btnsendform = document.querySelector("#sendform");

btnsendform.addEventListener("click", () => {
    const email = document.getElementById('useremail');
    const username = document.getElementById('userid');
    const password = document.getElementById('userpassword');
    const message = document.getElementById('message');
    if (!isValidEmail(email.value)) {
        message.classList.add("error"); 
        message.innerHTML = "DATOS NO VALIDOS";
    } else
    {
        message.classList.remove("error"); // Remueve la clase sin '#'
        message.innerHTML = "";
        /*envio del json*/
        const data = {
            email:email.value,
            username:username.value,
            password:password.value
            };                   
            fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if(data.success){
                    message.classList.remove("error"); // Remueve la clase sin '#'
                    message.innerHTML = "";
                    window.location.href = '/home';
                }
                else{
                    message.classList.add("error"); 
                    message.innerHTML=data.message;
                }
            })
            .catch((error) => {
            console.error('Error:', error);
            }); 
    }
});

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


