let inventario = JSON.parse(localStorage.getItem('inventario')) || [];

function agregarProducto() {
    const nombre = document.getElementById('nombre').value;
    const categoria = document.getElementById('categoria').value;
    const cantidad = document.getElementById('cantidad').value;

    if(!nombre || !categoria || !cantidad) return alert("Completa todos los campos");

    const producto = { nombre, categoria, cantidad };
    inventario.push(producto);
    localStorage.setItem('inventario', JSON.stringify(inventario));
    
    registrarHistorial(`Alta: ${nombre} (${cantidad} unidades)`);
    renderizar();
}

function eliminar(index) {
    const p = inventario[index];
    inventario.splice(index, 1);
    localStorage.setItem('inventario', JSON.stringify(inventario));
    registrarHistorial(`Baja: Se eliminó ${p.nombre}`);
    renderizar();
}

function registrarHistorial(accion) {
    const lista = document.getElementById('historial');
    const li = document.createElement('li');
    li.textContent = `[${new Date().toLocaleTimeString()}] ${accion}`;
    lista.prepend(li);
}

function renderizar() {
    const tbody = document.querySelector('#tablaInventario tbody');
    tbody.innerHTML = '';
    inventario.forEach((p, index) => {
        tbody.innerHTML += `<tr>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>${p.cantidad}</td>
            <td><button onclick="eliminar(${index})">Eliminar</button></td>
        </tr>`;
    });
}
renderizar();