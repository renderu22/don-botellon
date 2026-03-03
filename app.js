// 🔧 MIGRACIÓN AUTOMÁTICA A ID (solo se ejecuta una vez)
(function migrarIDs() {
    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    let huboCambios = false;

    clientes = clientes.map(c => {
        if (!c.id) {
            c.id = Date.now() + Math.floor(Math.random() * 100000);
            huboCambios = true;
        }
        return c;
    });

    if (huboCambios) {
        localStorage.setItem("clientes", JSON.stringify(clientes));
        console.log("Migración completada: IDs agregados a todos los clientes.");
    }
})();

/* ============================================================
   SECCIÓN 1 — BASE DE DATOS + UTILIDADES GLOBALES
   Sistema profesional para manejar clientes en localStorage
   ============================================================ */

/* ------------------------------------------------------------
   1.1 — Crear base de datos si no existe
   ------------------------------------------------------------ */
if (!localStorage.getItem("clientes")) {
    localStorage.setItem("clientes", JSON.stringify([]));
}

/* ------------------------------------------------------------
   1.2 — Función para obtener todos los clientes
   Siempre devuelve un array válido
   ------------------------------------------------------------ */
function obtenerClientes() {
    const data = localStorage.getItem("clientes");

    if (!data) {
        return []; // si no existe, devuelve lista vacía
    }

    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Error al parsear clientes:", e);
        return []; // si está corrupto, devuelve lista vacía
    }
}

/* ------------------------------------------------------------
   1.3 — Guardar clientes en localStorage
   ------------------------------------------------------------ */
function guardarClientes(clientes) {
    localStorage.setItem("clientes", JSON.stringify(clientes));
}

/* ------------------------------------------------------------
   Registrar evento global para historial
   ------------------------------------------------------------ */
function registrarEvento(tipo, idCliente, descripcion) {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    eventos.push({
        tipo,
        idCliente,
        descripcion,
        fecha: new Date().toISOString()
    });
    localStorage.setItem("eventos", JSON.stringify(eventos));
}


/* ------------------------------------------------------------
   Eliminar cliente
   ------------------------------------------------------------ */
function eliminarClientePorID(id) {
    const clientes = obtenerClientes();
    const cliente = clientes.find(c => c.id == id);

    if (!cliente) return;

    const nuevos = clientes.filter(c => c.id != id);
    guardarClientes(nuevos);

    mostrarNotificacion("Cliente eliminado.");
    location.href = "clientes.html";
}


/* ------------------------------------------------------------
   1.6 — Mostrar notificación tipo iPhone (mensajeNotificacion)
   Esta aparece en infocliente.html
   ------------------------------------------------------------ */
function mostrarNotificacion(mensaje) {
    const noti = document.getElementById("mensajeNotificacion");
    if (!noti) return;

    noti.textContent = mensaje;
    noti.style.display = "block";
    noti.style.opacity = "1";

    setTimeout(() => {
        noti.style.opacity = "0";
        setTimeout(() => noti.style.display = "none", 300);
    }, 2500);
}

/* ------------------------------------------------------------
   1.5 — Toast global (usado en exportar/importar)
   ------------------------------------------------------------ */
function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = mensaje;
    toast.style.display = "block";

    setTimeout(() => toast.style.opacity = "1", 10);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.style.display = "none", 300);
    }, 3000);
}

/* ------------------------------------------------------------
   1.6 — Obtener fecha actual en formato YYYY-MM-DD
   ------------------------------------------------------------ */
function fechaActual() {
    return new Date().toISOString();
}

/* ============================================================
   SECCIÓN 2 — GESTIÓN DE CLIENTES
   Buscar, registrar, cargar, listar y eliminar clientes
   ============================================================ */

/* ------------------------------------------------------------
   2.1 — Buscar cliente por número desde index.html
   Si existe → redirige a infocliente.html
   ------------------------------------------------------------ */
function buscarCliente() {
    const numero = document.getElementById("buscarNumero").value.trim();

    // Evitar búsqueda si el usuario aún está escribiendo
    if (numero === "" || isNaN(numero)) return;

    const clientes = obtenerClientes();
    const cliente = clientes.find(c => c.numero == numero);

    if (!cliente) {
        mostrarToast("Cliente no encontrado");
        return;
    }

    // Asegurar ID
    if (!cliente.id) {
        cliente.id = Date.now() + Math.floor(Math.random() * 100000);
        guardarClientes(clientes);
    }

    localStorage.setItem("clienteSeleccionadoID", cliente.id);
    window.location.href = "infocliente.html";
}


/* ------------------------------------------------------------
   2.2 — Registrar un nuevo cliente
   Validaciones:
   - Número obligatorio
   - Nombre obligatorio
   - Número no repetido
   ------------------------------------------------------------ */
function registrarCliente() {
    const numero = document.getElementById("numero").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    const mensaje = document.getElementById("mensaje");

    // Validación básica
    if (!numero || !nombre) {
        mensaje.textContent = "Número y nombre son obligatorios.";
        mensaje.style.color = "red";
        return;
    }

    const clientes = obtenerClientes();

    // Validar número repetido
    const existe = clientes.some(c => c.numero == numero);
    if (existe) {
        mensaje.textContent = "Ya existe un cliente con ese número.";
        mensaje.style.color = "red";
        return;
    }

    // Crear cliente nuevo
    const nuevoCliente = {
        numero,
        nombre,
        direccion,
        telefono,
        recargas: [],
        regalados: 0,
        fechaRegistro: fechaActual()
    };

    clientes.push(nuevoCliente);
    guardarClientes(clientes);

    registrarEvento("registro", numero, `Cliente ${nombre} registrado`);
    mostrarNotificacion("Cliente registrado correctamente.");

    // Limpiar campos
    document.getElementById("numero").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("direccion").value = "";
    document.getElementById("telefono").value = "";

    // Actualizar sugerencias
    mostrarNumerosDisponiblesRegistrar();
    sugerirNumeroDisponible();
}

/* ------------------------------------------------------------
   2.3 — Mostrar lista completa de clientes (clientes.html)
   Ordenados por número
   ------------------------------------------------------------ */
function mostrarListaClientes() {
    const clientes = obtenerClientes();
    const contenedor = document.getElementById("listaClientes");

    if (!contenedor) return;

    if (clientes.length === 0) {
        contenedor.innerHTML = "<p style='padding: 20px;'>No hay clientes registrados.</p>";
        return;
    }

    clientes.sort((a, b) => a.numero - b.numero);

    contenedor.innerHTML = "";

    clientes.forEach(cliente => {
        const fila = document.createElement("div");
        fila.className = "cliente-item";
        fila.innerHTML = `
            ${cliente.numero} — ${cliente.nombre}
            <span class="flecha">›</span>
        `;
            fila.onclick = () => {
        localStorage.setItem("clienteSeleccionadoID", cliente.id);
        window.location.href = "infocliente.html";
        };

        contenedor.appendChild(fila);
    });
}


/* ------------------------------------------------------------
   2.4 — Cargar datos del cliente en infocliente.html
   Muestra:
   - Datos personales
   - Recargas
   - Regalados
   - Última recarga
   - Botones de acción
   ------------------------------------------------------------ */
function cargarCliente() {
    // 1. Obtener el ID guardado en el PASO 1
    const id = localStorage.getItem("clienteSeleccionadoID");
    if (!id) {
        alert("No se encontró el ID del cliente.");
        return;
    }

    // 2. Buscar el cliente por ID (NO por número)
    const clientes = obtenerClientes();
    const cliente = clientes.find(c => c.id == id);

    if (!cliente) {
        alert("Cliente no encontrado");
        return;
    }

    // Guardar número actual para eliminar o editar
    numeroClienteActual = cliente.numero;

    // 3. Llenar datos personales
    document.getElementById("info-nombre").textContent = cliente.nombre;
    document.getElementById("info-numero").textContent = cliente.numero;
    document.getElementById("info-telefono").textContent = cliente.telefono || "No registrado";
    document.getElementById("info-direccion").textContent = cliente.direccion || "No registrada";

    // 4. Historial
    document.getElementById("info-botellones").textContent = cliente.recargas.length;
    document.getElementById("info-regalados").textContent = cliente.regalados;

    let ultima = "Nunca ha comprado";

        if (cliente.recargas.length > 0) {
            ultima = cliente.recargas[cliente.recargas.length - 1].fecha;
        } else if (cliente.ultimaRecarga) {
            ultima = cliente.ultimaRecarga;
        }

        document.getElementById("info-ultima").textContent = ultima;

}


/* ============================================================
   SECCIÓN 3 — RECARGAS Y BOTELLONES REGALADOS
   Manejo profesional de recargas, conteo y reinicio por regalo
   ============================================================ */

/* ------------------------------------------------------------
   3.1 — Agregar recargas desde infocliente.html
   Lógica:
   - Suma la cantidad indicada
   - Cada recarga se guarda con fecha actual
   - Si llega a 9 recargas → 1 regalado y reinicia a 0
   ------------------------------------------------------------ */
function agregarRecargasDesdeInfo(cantidad) {
    const id = localStorage.getItem("clienteSeleccionadoID");

    const clientes = obtenerClientes();
    const cliente = clientes.find(c => c.id == id);

    if (!cliente) {
        mostrarNotificacion("Error: cliente no encontrado.");
        return;
    }

    // Si NO viene de la calculadora, usar el input manual
    if (!cantidad || cantidad <= 0) {
        cantidad = parseInt(document.getElementById("cantidadRecargas").value);
    }

    if (!cantidad || cantidad <= 0) {
        mostrarNotificacion("Ingresa una cantidad válida.");
        return;
    }

    // Registrar recargas
    for (let i = 0; i < cantidad; i++) {
        cliente.recargas.push({ fecha: fechaActual() });

        registrarEvento("recarga", cliente.id, `Recarga añadida a ${cliente.nombre}`);

        // Si llega a 9 → regalar y reiniciar
        if (cliente.recargas.length === 9) {

            // Guardar última recarga ANTES de reiniciar
            cliente.ultimaRecarga = cliente.recargas[cliente.recargas.length - 1].fecha;

            cliente.regalados++;
            registrarEvento("regalado", cliente.id, `Botellón regalado a ${cliente.nombre}`);

            // Reiniciar ciclo
            cliente.recargas = [];
        }
    }

    guardarClientes(clientes);
    mostrarNotificacion("Recargas agregadas correctamente.");
    setTimeout(() => cargarCliente(), 300);
}


/* ------------------------------------------------------------
   3.2 — Sumar un botellón regalado
   Solo si tiene al menos 1
   ------------------------------------------------------------ */
   function sumarRegalado() {
    const id = localStorage.getItem("clienteSeleccionadoID");
    const clientes = obtenerClientes();
    const cliente = clientes.find(c => c.id == id);

    if (!cliente) return;

    cliente.regalados++;
    guardarClientes(clientes);
    cargarCliente();
}

/* ------------------------------------------------------------
   3.3 — Quitar un botellón regalado
   Solo si tiene al menos 1
   ------------------------------------------------------------ */
function quitarRegalado() {
    const id = localStorage.getItem("clienteSeleccionadoID");
    const clientes = obtenerClientes();
    const cliente = clientes.find(c => c.id == id);

    if (!cliente) return;

    if (cliente.regalados > 0) {
        cliente.regalados--;
    }

    guardarClientes(clientes);
    cargarCliente();
}

/* ============================================================
   SECCIÓN 4 — CLIENTES INACTIVOS
   Cálculo de días sin recargar, filtrado y visualización
   ============================================================ */

/* ------------------------------------------------------------
   4.1 — Obtener clientes inactivos según días sin recargar
   Regla:
   - Si nunca ha recargado → es inactivo
   - Si su última recarga fue hace X días → inactivo
   ------------------------------------------------------------ */
function obtenerClientesInactivos(dias = 30) {
    const clientes = obtenerClientes();
    const hoy = new Date();

    return clientes.filter(cliente => {
        // Nunca ha recargado → inactivo
        if (cliente.recargas.length === 0) return true;

        // Última recarga
        const ultimaFecha = new Date(cliente.recargas[cliente.recargas.length - 1].fecha);

        // Diferencia en días
        const diferencia = (hoy - ultimaFecha) / (1000 * 60 * 60 * 24);

        return diferencia >= dias;
    });
}

/* ------------------------------------------------------------
   4.2 — Calcular días sin recargar para un cliente
   Si nunca ha recargado → Infinity
   ------------------------------------------------------------ */
function diasSinRecargar(cliente) {
    if (cliente.recargas.length === 0) return Infinity;

    const hoy = new Date();
    const ultimaFecha = new Date(cliente.recargas[cliente.recargas.length - 1].fecha);

    const diferencia = (hoy - ultimaFecha) / (1000 * 60 * 60 * 24);
    return Math.floor(diferencia);
}

/* ------------------------------------------------------------
   4.3 — Mostrar lista de clientes inactivos (inactivos.html)
   Incluye:
   - Nombre
   - Número
   - Última recarga
   - Días sin recargar
   - Botón rojo para eliminar
   - abir modal de confirmación antes de eliminar
   ------------------------------------------------------------ */
function mostrarInactivos() {
    const dias = parseInt(document.getElementById("filtroDias").value) || 30;
    const lista = document.getElementById("listaInactivos");

    const inactivos = obtenerClientesInactivos(dias);

    if (inactivos.length === 0) {
        lista.innerHTML = "<p>No hay clientes inactivos.</p>";
        return;
    }

    lista.innerHTML = inactivos.map(cliente => {
        const diasInactivo = diasSinRecargar(cliente);

        const ultima = cliente.recargas.length > 0
            ? cliente.recargas[cliente.recargas.length - 1].fecha
            : "Nunca";

        return `
        <div class="tarjeta">
            <h3>${cliente.nombre} (Nº ${cliente.numero})</h3>

            <p><strong>Última recarga:</strong> ${ultima}</p>

            <p><strong>Días sin recargar:</strong> 
                ${diasInactivo === Infinity ? "Nunca ha comprado" : diasInactivo}
            </p>

            <a class="btn btn-peligro" onclick="eliminarCliente(${cliente.numero})">
                Eliminar cliente
            </a>
        </div>
        `;
    }).join("");
}
function abrirModalEliminar() {
    document.getElementById("modalEliminar").style.display = "flex";
    document.getElementById("confirmarEliminar").onclick = function () {
        eliminarClientePorID(localStorage.getItem("clienteSeleccionadoID"));
    };
}

function cerrarModalEliminar() {
    document.getElementById("modalEliminar").style.display = "none";
}

/* ------------------------------------------------------------
   4.4 — Actualizar contador de inactivos en index.html
   Muestra cuántos clientes llevan 30 días sin recargar
   ------------------------------------------------------------ */
function actualizarContadorInactivos() {
    const span = document.getElementById("contadorInactivos");
    if (!span) return;

    const inactivos = obtenerClientesInactivos(30);
    span.textContent = inactivos.length;
}

/* ============================================================
   SECCIÓN 5 — NÚMEROS DISPONIBLES
   Sugerencias, rango máximo y primeros números libres
   ============================================================ */

/* ------------------------------------------------------------
   5.1 — Límite global de números permitidos
   Puedes cambiarlo cuando quieras (ej: 500, 1000, etc.)
   ------------------------------------------------------------ */
const RANGO_MAXIMO = 800;

/* ------------------------------------------------------------
   5.2 — Obtener números disponibles
   Devuelve un array con todos los números libres
   ------------------------------------------------------------ */
function obtenerNumerosDisponibles(rangoMaximo = RANGO_MAXIMO) {
    const clientes = obtenerClientes();
    const usados = clientes.map(c => parseInt(c.numero));

    const disponibles = [];

    for (let i = 1; i <= rangoMaximo; i++) {
        if (!usados.includes(i)) {
            disponibles.push(i);
        }
    }

    return disponibles;
}

/* ------------------------------------------------------------
   5.3 — Sugerir automáticamente el primer número libre
   Se usa en registrar.html
   ------------------------------------------------------------ */
function sugerirNumeroDisponible() {
    const disponibles = obtenerNumerosDisponibles();
    const inputNumero = document.getElementById("numero");

    if (!inputNumero) return;

    if (disponibles.length > 0) {
        inputNumero.value = disponibles[0]; // Primer número libre
    }
}

/* ------------------------------------------------------------
   5.4 — Mostrar los primeros números disponibles en registrar.html
   Ejemplo: "1, 2, 3..."
   ------------------------------------------------------------ */
function mostrarNumerosDisponiblesRegistrar() {
    const disponibles = obtenerNumerosDisponibles();
    const contenedor = document.getElementById("numerosDisponiblesRegistrar");

    if (!contenedor) return;

    if (disponibles.length === 0) {
        contenedor.textContent = "No hay números disponibles.";
        return;
    }

    const primerosTres = disponibles.slice(0, 3);

    contenedor.textContent = primerosTres.join(", ") + "...";
}

/* ============================================================
   SECCIÓN 6 — IMPORTAR Y EXPORTAR DATOS
   Respaldo en JSON y restauración segura
   ============================================================ */

/* ------------------------------------------------------------
   6.1 — Exportar datos a un archivo JSON
   - Crea un archivo con todos los clientes
   - Nombre del archivo incluye la fecha
   - Descarga automática
   6.2 — Importar datos desde un archivo JSON
   - Lee el archivo
   - Valida que sea un array
   - Reemplaza la base de datos
   - Actualiza números disponibles
   - Recarga la página
   ------------------------------------------------------------ */
/* ============================================================
   RESPALDO — Exportar e Importar JSON
   ============================================================ */

// Exportar respaldo
function exportarRespaldo() {
    const clientes = obtenerClientes();
    const data = JSON.stringify(clientes, null, 2);

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    // Nombre del archivo con fecha
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    a.download = `backup-clientes-${año}${mes}${dia}.json`;
    a.click();

    URL.revokeObjectURL(url);

    mostrarToast("Respaldo exportado");
}

// Importar respaldo
function importarRespaldo(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();

    lector.onload = function(e) {
        try {
            const datosImportados = JSON.parse(e.target.result);

            if (!Array.isArray(datosImportados)) {
                mostrarToast("Archivo inválido");
                return;
            }

            // Obtener los clientes actuales
            const clientesActuales = obtenerClientes();

            // Crear un mapa por número para evitar duplicados
            const mapa = new Map();

            // 1. Agregar clientes actuales al mapa
            clientesActuales.forEach(c => mapa.set(c.numero, c));

            // 2. Mezclar clientes importados (sobrescriben si ya existen)
            datosImportados.forEach(c => mapa.set(c.numero, c));

            // 3. Convertir el mapa nuevamente a array
            const resultadoFinal = Array.from(mapa.values());

            // Guardar mezcla final
            guardarClientes(resultadoFinal);

            mostrarToast("Respaldo importado sin borrar datos nuevos");

            setTimeout(() => location.reload(), 800);

        } catch (error) {
            mostrarToast("Error al leer el archivo");
        }
    };

    lector.readAsText(archivo);
}


/* ============================================================
   SECCIÓN 7 — ESTADÍSTICAS
   Resumen general, actividad, últimos movimientos
   ============================================================ */

/* ------------------------------------------------------------
   7.1 — Mostrar estadísticas generales en estadisticas.html
   Incluye:
   - Total de clientes
   - Activos e inactivos
   - Total de recargas
   - Botellones regalados
   - Promedios
   - Última recarga global
   - Cliente con más recargas
   ------------------------------------------------------------ */
function mostrarEstadisticas() {
    const clientes = obtenerClientes();

    const contenedor = document.getElementById("contenedorEstadisticas");
    if (!contenedor) return;

    if (clientes.length === 0) {
        contenedor.innerHTML = "<p>No hay datos para mostrar.</p>";
        return;
    }

    /* ------------------------------
       1. Totales generales
       ------------------------------ */
    const totalClientes = clientes.length;
    const totalRecargas = clientes.reduce((sum, c) => sum + c.recargas.length, 0);
    const totalRegalados = clientes.reduce((sum, c) => sum + c.regalados, 0);

    /* ------------------------------
       2. Activos e inactivos
       ------------------------------ */
    const inactivos = obtenerClientesInactivos(30).length;
    const activos = totalClientes - inactivos;

    /* ------------------------------
       3. Última recarga global
       ------------------------------ */
    let ultimaRecarga = "Ninguna";

    clientes.forEach(c => {
        if (c.recargas.length > 0) {
            const fecha = c.recargas[c.recargas.length - 1].fecha;

            if (ultimaRecarga === "Ninguna" || fecha > ultimaRecarga) {
                ultimaRecarga = fecha;
            }
        }
    });

    /* ------------------------------
       4. Cliente con más recargas
       ------------------------------ */
    let mejorCliente = null;
    let maxRecargas = 0;

    clientes.forEach(c => {
        if (c.recargas.length > maxRecargas) {
            maxRecargas = c.recargas.length;
            mejorCliente = c;
        }
    });

    /* ------------------------------
       5. Estadísticas avanzadas
       ------------------------------ */

    // Promedio de recargas por cliente
    const promedioRecargas = (totalRecargas / totalClientes).toFixed(2);

    // Porcentaje de clientes activos
    const porcentajeActivos = ((activos / totalClientes) * 100).toFixed(1);

    // Clientes que nunca han recargado
    const nuncaRecargaron = clientes.filter(c => c.recargas.length === 0).length;

    // Clientes que recargaron en los últimos 7 días
    const hoy = new Date();
    const hace7dias = new Date();
    hace7dias.setDate(hoy.getDate() - 7);

    const recargasSemana = clientes.filter(c =>
        c.recargas.some(r => new Date(r.fecha) >= hace7dias)
    ).length;

    /* ------------------------------
       6. Construcción del HTML
       ------------------------------ */
    const html = `
        <div class="tarjeta">
            <h2>Resumen general</h2>
            <p><strong>Total de clientes:</strong> ${totalClientes}</p>
            <p><strong>Clientes activos:</strong> ${activos}</p>
            <p><strong>Clientes inactivos:</strong> ${inactivos}</p>
            <p><strong>Nunca recargaron:</strong> ${nuncaRecargaron}</p>
        </div>

        <div class="tarjeta">
            <h2>Actividad</h2>
            <p><strong>Total de recargas:</strong> ${totalRecargas}</p>
            <p><strong>Botellones regalados:</strong> ${totalRegalados}</p>
            <p><strong>Promedio de recargas por cliente:</strong> ${promedioRecargas}</p>
            <p><strong>Porcentaje de clientes activos:</strong> ${porcentajeActivos}%</p>
            <p><strong>Clientes que recargaron esta semana:</strong> ${recargasSemana}</p>
        </div>

        <div class="tarjeta">
            <h2>Últimos movimientos</h2>
            <p><strong>Última recarga registrada:</strong> ${ultimaRecarga}</p>
            <p><strong>Cliente con más recargas:</strong> ${
                mejorCliente
                    ? `${mejorCliente.nombre} (${maxRecargas} recargas)`
                    : "Ninguno"
            }</p>
        </div>
    `;

    contenedor.innerHTML = html;
}

function obtenerClienteActual() {
    const id = localStorage.getItem("clienteSeleccionadoID");
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    return clientes.find(c => c.id == id);
}


// 🔧 Reparar clientes dañados (recargas debe ser un array)
(function repararClientes() {
    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    let reparado = false;

    clientes = clientes.map(c => {
        if (!Array.isArray(c.recargas)) {
            c.recargas = [];
            reparado = true;
        }
        if (typeof c.regalados !== "number") {
            c.regalados = 0;
            reparado = true;
        }
        return c;
    });

    if (reparado) {
        localStorage.setItem("clientes", JSON.stringify(clientes));
        console.log("Clientes reparados correctamente.");
    }
})();
