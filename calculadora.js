function calcularTotal() {
    const cant20 = parseInt(document.getElementById("litros20").value) || 0;
    const cant12 = parseInt(document.getElementById("litros12").value) || 0;
    const cant5 = parseInt(document.getElementById("litros5").value) || 0;

    const precio20 = 1.5;
    const precio12 = 1;
    const precio5 = 0.5;

    const total20 = cant20 * precio20;
    const total12 = cant12 * precio12;
    const total5 = cant5 * precio5;

    const total = total20 + total12 + total5;

    // Precio del dólar BCV
    const dolar = parseFloat(document.getElementById("dolar").value) || 0;
    const totalBs = total * dolar;

    document.getElementById("resultado").style.display = "block";

    document.getElementById("total").textContent = 
        `$${total.toFixed(2)} — Bs ${totalBs.toFixed(2)}`;

    document.getElementById("detalle").innerHTML = `
        20L: ${cant20} × $1.5 = $${total20.toFixed(2)} <br>
        12L: ${cant12} × $1 = $${total12.toFixed(2)} <br>
        5L: ${cant5} × $0.5 = $${total5.toFixed(2)} <br><br>
        <strong>Dólar BCV:</strong> Bs ${dolar.toFixed(2)}
    `;
}


function cambiarCantidad(id, cambio) {
    const input = document.getElementById(id);
    let valor = parseInt(input.value) || 0;

    valor += cambio;
    if (valor < 0) valor = 0;

    input.value = valor;

    calcularTotal(); // actualiza automáticamente
}


document.addEventListener("input", calcularTotal);

function preguntarCliente() {
    const cant20 = parseInt(document.getElementById("litros20").value) || 0;
    const cant12 = parseInt(document.getElementById("litros12").value) || 0;
    const cant5 = parseInt(document.getElementById("litros5").value) || 0;

    const total = cant20 + cant12 + cant5;

    if (total === 0) {
        alert("No has seleccionado ninguna recarga.");
        return;
    }
}

