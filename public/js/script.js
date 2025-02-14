const btnsendform = document.querySelector("#sendform");

function showLoading() {
    textp=document.querySelector('.loader-text');
    textp.innerHTML="VERIFICANDO SUS DATOS...";
    document.body.classList.add("loading");
}

function hideLoading() {
    document.body.classList.remove("loading");
}

btnsendform.addEventListener("click", () => {     
    const email = document.getElementById('useremail');
    const username = document.getElementById('userid');
    const password = document.getElementById('userpassword');
    const message = document.getElementById('message');

    if (!isValidEmail(email.value)) {
        message.classList.add("error"); 
        message.innerHTML = "DATOS NO VALIDOS";
    } else {
        message.classList.remove("error");
        message.innerHTML = "";

        // Mostrar la pantalla de carga
        showLoading();

        // Genera un tiempo de espera aleatorio entre 2 y 3 segundos
        const waitTime = Math.random() * (3000 - 2000) + 2000;

        setTimeout(() => {
            /* Envío del JSON */
            const data = {
                email: email.value,
                username: username.value,
                password: password.value
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
                if (data.success) {
                    message.classList.remove("error");
                    message.innerHTML = "";
                    window.location.href = '/home';
                } else {
                    message.classList.add("error");
                    message.innerHTML = data.message;

                    // Ocultar la pantalla de carga si hay error
                    hideLoading();
                }
            })
            .catch((error) => {
                Notiflix.Notify.warning(error);

                // Ocultar la pantalla de carga si hay error en la conexión
                hideLoading();
            });
        }, waitTime); // Espera de 2 a 3 segundos antes de enviar la solicitud
    }
});


function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


