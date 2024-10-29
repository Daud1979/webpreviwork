
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

document.getElementById("buscadorCentro").addEventListener("input", function() {
    const searchValue = this.value.toLowerCase();
   
    const rows = document.querySelectorAll("#tabla-centros tr");

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
