// ⚡ SE EXTRAEN LAS LLAVES DESDE CONFIG.JS (Oculto localmente mediante tu .gitignore)
const firebaseConfig = CONFIG_SECRETA.FIREBASE;
const PIXABAY_API_KEY = CONFIG_SECRETA.PIXABAY_API_KEY;

// ⚡ INICIALIZAR FIREBASE
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

window.inventarioGlobal = []; // Variable para guardar los datos en vivo

// 🔥 ESCUCHADOR EN TIEMPO REAL: Cada vez que la nube cambie, la tabla se actualiza sola
db.collection("inventario").onSnapshot((querySnapshot) => {
    window.inventarioGlobal = [];
    querySnapshot.forEach((doc) => {
        // Guardamos los datos y también el ID único que Firebase le da al documento
        window.inventarioGlobal.push({ id: doc.id, ...doc.data() });
    });
    renderizar(window.inventarioGlobal);
});

async function agregarProducto() {
    const nombre = document.getElementById('nombre').value;
    const categoria = document.getElementById('categoria').value;
    const cantidad = document.getElementById('cantidad').value;

    if(!nombre || !categoria || !cantidad) return alert("⚡ Por favor, completa todos los campos.");

    const inputNombre = document.getElementById('nombre');
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

    // 🔥 GUARDAR EN LA NUBE
    db.collection("inventario").add({
        nombre: nombre,
        categoria: categoria,
        cantidad: cantidad,
        imgUrl: imgUrl,
        fecha: new Date()
    }).then(() => {
        registrarHistorial(`🟢 Alta: Se agregó "${nombre}"`);
        
        // Limpiar campos
        document.getElementById('nombre').value = '';
        document.getElementById('categoria').value = '';
        document.getElementById('cantidad').value = '';
        inputNombre.placeholder = "Nombre del artículo (ej. Laptop)";
    }).catch((error) => {
        alert("Error al guardar en la nube: Verifica que tu base de datos esté en modo de prueba.");
        console.error(error);
    });
}

// 🔥 BORRAR DE LA NUBE USANDO SU ID ÚNICO
function eliminar(id, nombre) {
    db.collection("inventario").doc(id).delete().then(() => {
        registrarHistorial(`🔴 Baja: Se eliminó "${nombre}"`);
    }).catch((error) => {
        alert("Error al eliminar: " + error);
    });
}

function registrarHistorial(accion) {
    const lista = document.getElementById('historial');
    const li = document.createElement('li');
    li.textContent = `[${new Date().toLocaleTimeString()}] ${accion}`;
    lista.prepend(li);
}

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