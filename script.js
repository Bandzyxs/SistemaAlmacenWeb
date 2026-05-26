// ⚡ LLAVE DE PIXABAY INYECTADA DIRECTAMENTE
const PIXABAY_API_KEY = '56024048-9ab7a0dafe14e06f31baf7acc';

// 🔥 CARGAMOS LOS DATOS LOCALES AL INICIAR (Inventario e Historial)
window.inventarioGlobal = JSON.parse(localStorage.getItem('inventarioNeon')) || [];
window.historialGlobal = JSON.parse(localStorage.getItem('historialNeon')) || [];

function guardarLocal() {
    localStorage.setItem('inventarioNeon', JSON.stringify(window.inventarioGlobal));
}

// 🔥 FUNCIONES DEL HISTORIAL
function renderizarHistorial() {
    const lista = document.getElementById('historial');
    lista.innerHTML = '';
    window.historialGlobal.forEach(texto => {
        const li = document.createElement('li');
        li.textContent = texto;
        lista.appendChild(li);
    });
}

function registrarHistorial(accion) {
    const texto = `[${new Date().toLocaleTimeString()}] ${accion}`;
    
    // Lo guardamos al inicio de la lista
    window.historialGlobal.unshift(texto);
    
    // Opcional: Mantener solo los últimos 50 movimientos para no saturar la memoria
    if(window.historialGlobal.length > 50) window.historialGlobal.pop();
    
    // Guardar en almacenamiento local
    localStorage.setItem('historialNeon', JSON.stringify(window.historialGlobal));
    
    renderizarHistorial();
}

// 🔥 AGREGAR PRODUCTO
async function agregarProducto() {
    const nombre = document.getElementById('nombre').value;
    const categoria = document.getElementById('categoria').value;
    const cantidad = document.getElementById('cantidad').value;

    if(!nombre || !categoria || !cantidad) return alert("⚡ Por favor, completa todos los campos.");

    const inputNombre = document.getElementById('nombre');
    const placeholderOriginal = inputNombre.placeholder;
    inputNombre.placeholder = "Buscando imagen...";
    
    let imgUrl = '';
    try {
        const keyword = encodeURIComponent(nombre.toLowerCase());
        const response = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${keyword}&image_type=photo&per_page=3&lang=es`);
        const data = await response.json();
        
        if (data.hits && data.hits.length > 0) {
            imgUrl = data.hits[0].previewURL; 
        } else {
            imgUrl = 'https://via.placeholder.com/100/1f2937/06b6d4?text=Sin+Foto';
        }
    } catch (error) {
        imgUrl = 'https://via.placeholder.com/100/1f2937/ec4899?text=Error';
    }

    // 🔥 GUARDAR CON UN ID ÚNICO Y MARCA DE TIEMPO
    const nuevoProducto = {
        id: Date.now().toString(),
        nombre: nombre,
        categoria: categoria,
        cantidad: cantidad,
        imgUrl: imgUrl,
        fecha: new Date().toISOString()
    };

    window.inventarioGlobal.push(nuevoProducto);
    guardarLocal();
    
    registrarHistorial(`🟢 Alta: Se agregó "${nombre}"`);
    
    // Limpiar campos de entrada
    document.getElementById('nombre').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('cantidad').value = '';
    inputNombre.placeholder = placeholderOriginal;
    
    renderizar(window.inventarioGlobal);
}

// 🔥 BORRAR DEL ALMACENAMIENTO LOCAL
function eliminar(id, nombre) {
    window.inventarioGlobal = window.inventarioGlobal.filter(p => p.id !== id);
    guardarLocal();
    registrarHistorial(`🔴 Baja: Se eliminó "${nombre}"`);
    renderizar(window.inventarioGlobal);
}

// 🔥 RENDERIZAR TABLA DE INVENTARIO
function renderizar(datos) {
    const filtro = document.getElementById('busqueda').value.toLowerCase();
    const tbody = document.querySelector('#tablaInventario tbody');
    tbody.innerHTML = '';
    
    let filtrado = datos.filter(p => p.nombre.toLowerCase().includes(filtro));
    
    const grupos = filtrado.reduce((acc, obj) => {
        acc[obj.categoria] = acc[obj.categoria] || [];
        acc[obj.categoria].push(obj);
        return acc;
    }, {});

    for (const cat in grupos) {
        tbody.innerHTML += `<tr><td colspan="5" class="cat-header">📁 Categoría: ${cat}</td></tr>`;
        grupos[cat].forEach(p => {
            const imagenFinal = p.imgUrl || 'https://via.placeholder.com/100/1f2937/a5f3fc?text=Nuevo';

            tbody.innerHTML += `
            <tr>
                <td><img src="${imagenFinal}" alt="${p.nombre}" class="item-img" title="Vista previa de ${p.nombre}"></td>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.categoria}</td>
                <td>${p.cantidad}</td>
                <td><button class="btn-eliminar" onclick="eliminar('${p.id}', '${p.nombre}')">🗑️ Eliminar</button></td>
            </tr>`;
        });
    }
}

// 🔥 CARGA INICIAL AL ABRIR LA PÁGINA
renderizar(window.inventarioGlobal);
renderizarHistorial();
