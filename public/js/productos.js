document.addEventListener("DOMContentLoaded", function() {
    cargarProducto();
    
    // Después de cargar, verificar si hay un ID de registro para reposicionar
    setTimeout(() => {
        const registroId = localStorage.getItem('productoParaRecargar');
        if (registroId) {
            localStorage.removeItem('productoParaRecargar');
            
            if ($.fn.dataTable.isDataTable("#tablaProducto")) {
                const datatable = $('#tablaProducto').DataTable();
                
                // Buscar la fila con ese ID
                const allRows = datatable.rows().nodes();
                let rowIndex = -1;
                for (let i = 0; i < allRows.length; i++) {
                    if (allRows[i].getAttribute('data-id') === registroId) {
                        rowIndex = i;
                        break;
                    }
                }
                // Si encontramos la fila, navegar a su página
                if (rowIndex >= 0) {
                    const pageLength = datatable.page.len();
                    const page = Math.floor(rowIndex / pageLength);
                    datatable.page(page).draw(false);
                    
                    // Destacar la fila
                    setTimeout(() => {
                        const fila = document.querySelector(`tr[data-id="${registroId}"]`);
                        if (fila) {
                            fila.style.backgroundColor = '#fffacd';
                            fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            setTimeout(() => {
                                fila.style.backgroundColor = '';
                            }, 2000);
                        }
                    }, 100);
                }
            }
        }
    }, 300);
});

// Obtener rol del usuario al cargar la página y normalizar
window.currentUserRoleId = (function(){
  try{
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    const rawRol = usuarioActual.rol_id ?? usuarioActual.ROL_ID ?? usuarioActual.ROLE_ID ?? usuarioActual.rol ?? usuarioActual.ROLE ?? usuarioActual.ROL;
    const rol = rawRol != null ? Number(rawRol) : null;
    return Number.isFinite(rol) ? rol : null;
  }catch(e){
    return null;
  }
})();

function cargarProducto() {

    fetch("http://localhost:3000/api/productos")
        .then(res => {
            return res.json();
        })
        .then(data => {
      // Guardar datos globalmente para poder acceder desde editarProveedor
      window.productoData = data || [];

      const tbody = document.querySelector("#tablaProducto tbody");
            if (!tbody) {
                return;
            }
            
            tbody.innerHTML = "";

            data.forEach(p => {
              // Mostrar botón eliminar solo si el rol del usuario es 1 o 2
              const canDelete = (window.currentUserRoleId === 1 || window.currentUserRoleId === 2);
              tbody.innerHTML += `
                <tr data-id="${p.ID}">
                  <td>${p.NOMBRE}</td>
                  <td>${p.DESCRIPCION}</td>
                  <td>${p.ESTADO}</td>
                  <td>${p.FECHA_REGISTRO}</td>
                  <td>${p.USUARIO_NOMBRE || p.USUARIO_ULT_MOD || ''}</td>
                  <td style="text-align: left;">
                    <button class="btn btn-warning btn-sm" onclick="editarProducto(${p.ID})">Editar</button>
                    ${canDelete ? `<button class="btn btn-danger btn-sm" style="margin-left:6px;" onclick="eliminarProductoById(${p.ID})">Eliminar</button>` : ''}
                  </td>
                </tr>`;
            });
            
            // Destruir DataTable anterior si existe
            if ($.fn.dataTable.isDataTable("#tablaProducto")) {
                $('#tablaProducto').DataTable().destroy();
            }
            
            // Inicializar DataTable
            $('#tablaProducto').dataTable({
                "pageLength": 10,
                "aLengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]]
            });
        })
        .catch(err => {
            console.error("Detalles:", err.message);
        });
}


// Abre el modal de edición y rellena los campos con los datos del producto
function editarProducto(id) {
  const producto = (window.productoData || []).find(p => p.ID == id);
  if (!producto) {
    console.error('❌ Producto no encontrado:', id);
    return;
  }

  // Rellenar inputs del modal (deben existir en el HTML)
  const setVal = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.value = value || '';
  };

  setVal('#provId', producto.ID);
  setVal('#provNombre', producto.NOMBRE);
  setVal('#provDescripcion', producto.DESCRIPCION);
  setVal('#provEstado', producto.ESTADO);


  // Verificar rol del usuario para mostrar/ocultar botón eliminar
  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  const btnEliminar = document.querySelector('#btnEliminarProducto');

  // Buscar el campo del rol en varias formas (case-insensitive)
  const findKeyCI = (obj, target) => {
    if (!obj) return undefined;
    const lower = target.toLowerCase();
    const k = Object.keys(obj).find(key => key && key.toString().toLowerCase() === lower);
    return k ? obj[k] : undefined;
  };
  const rawRol = (
    usuarioActual.rol_id ?? usuarioActual.ROL_ID ?? usuarioActual.ROLE_ID ?? usuarioActual.rol ?? usuarioActual.ROLE ?? usuarioActual.ROL ??
    findKeyCI(usuarioActual, 'rol_id') ?? findKeyCI(usuarioActual, 'role_id') ?? findKeyCI(usuarioActual, 'rol')
  );

  // Normalizar a número cuando sea posible
  const rolId = rawRol != null ? Number(rawRol) : null;

  if (btnEliminar) {
    // Mostrar botón solo si rol_id es 1 o 2
    if (Number.isFinite(rolId) && (rolId === 1 || rolId === 2)) {
      btnEliminar.style.display = 'block';
    } else {
      btnEliminar.style.display = 'none';
    }
  }

  // Mostrar modal con Bootstrap
  if (typeof $ === 'function' && $.fn && $.fn.modal) {
    $('#editProductoModal').modal('show');
  } else {
    console.warn('Bootstrap modal no disponible.');
  }
}


// Guardar cambios del producto
function guardarProducto() {

  // 0. OBTENER DATOS DEL USUARIO LOGUEADO
  let usuarioId = null;
  let usuarioNombre = 'Desconocido';
  try {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    usuarioId = usuarioActual.id ?? usuarioActual.ID ?? usuarioActual.USUARIOS_ID ?? null;
    usuarioNombre = usuarioActual.nombre ?? usuarioActual.NOMBRE ?? usuarioActual.USUARIOS_NOMBRE ?? 'Desconocido';
  } catch (e) {
    console.error('❌ Error al obtener datos del usuario:', e.message);
  }

  // 1. OBTENER DATOS ACTUALES DEL MODAL
  const form = document.querySelector('#formEditarProducto');
  const formElements = form ? Array.from(form.elements) : [];

  // 2. ANALIZAR CAMPOS DESHABILITADOS

  const disabledFields = [];
  formElements.forEach(el => {
    if (el.id) {
      const isDisabled = el.disabled;
      const isHiddenInput = el.type === 'hidden';
      if (isDisabled && !isHiddenInput) {
        disabledFields.push({
          id: el.id,
          name: el.name,
          value: el.value,
          type: el.type,
          tagName: el.tagName
        });
      }
    }
  });
  
  // 3. OBTENER VALORES ACTUALES
  const id = document.querySelector('#provId').value;
  const nombre = document.querySelector('#provNombre').value;
  const descripcion = document.querySelector('#provDescripcion').value;
  const estado = document.querySelector('#provEstado').value;
  
  const nombreDisabled = document.querySelector('#provNombre').disabled;

  // 4. DETECTAR CAMBIOS (comparar con datos originales)
  const productoOriginal = (window.productoData || []).find(p => p.ID == id);
  const camposModificados = [];
  
  if (productoOriginal) {
    // Comparar descripción (solo si es editable)
    if (!nombreDisabled && descripcion !== (productoOriginal.DESCRIPCION || '')) {
      camposModificados.push({
        campo: 'DESCRIPCION',
        valorOriginal: productoOriginal.DESCRIPCION,
        valorNuevo: descripcion,
        modificado: true
      });
    }
    
    // Comparar estado (siempre es editable)
    if (estado !== (productoOriginal.ESTADO || '')) {
      camposModificados.push({
        campo: 'ESTADO',
        valorOriginal: productoOriginal.ESTADO,
        valorNuevo: estado,
        modificado: true
      });
    }
  } else {
    console.log('   ⚠️ No se encontró producto original para comparación');
  }


  // 5. VALIDAR CAMPOS OBLIGATORIOS (SOLO CAMPOS EDITABLES)
  let validationError = '';
  
  if (!nombre) {
    validationError += 'Nombre está vacío. ';
  }
  if (!descripcion) {
    validationError += 'Descripción está vacía. ';
  }
  
  if (validationError) {
    console.warn('⚠️ ' + validationError + '- No se puede guardar');
    alert('Por favor, completa todos los campos requeridos:\n' + validationError);
    return;
  }
  

  // Guardar ID del registro para reposicionar después de recargar
  localStorage.setItem('productoParaRecargar', id);

  // 6. GENERAR TIMESTAMP
  const now = new Date();
  const año = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const dia = String(now.getDate()).padStart(2, '0');
  const horas = String(now.getHours()).padStart(2, '0');
  const minutos = String(now.getMinutes()).padStart(2, '0');
  const segundos = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

  // 7. PREPARAR DATOS PARA ENVIAR
  // Nota: Aunque NOMBRE y PROVEEDOR están deshabilitados en el frontend,
  // se envían porque la BD los requiere (NOT NULL constraint)
  const datos = {
    NOMBRE: nombre,
    DESCRIPCION: descripcion,
    ESTADO: estado,
    FECHA_REGISTRO: timestamp, 
    USUARIO_ULT_MOD: usuarioId
  };
  

  // 8. ENVIAR CAMBIOS AL SERVIDOR
  fetch(`http://localhost:3000/api/productos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    alert('Producto actualizado correctamente');

    // Cerrar modal
    $('#editProductoModal').modal('hide');
    // Recargar página completa después de 500ms
    setTimeout(() => {
      location.reload();
    }, 500);
  })
  .catch(err => {
    alert('Error al guardar cambios: ' + err.message);
  });
}

// Evento del botón guardar
document.addEventListener("DOMContentLoaded", function() {
  const btnGuardar = document.querySelector('#btnGuardarProducto');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarProducto);
  }
});


// Función para eliminar producto
// Eliminar producto por ID (usado desde el botón en la fila)
function eliminarProductoById(id) {
  // Buscar el producto en los datos cargados (no en proveedores)
  const producto = (window.productoData || []).find(p => p.ID == id) || {};
  const nombre = producto.NOMBRE || '';

  // Validar id
  if (!id) {
    console.warn('ID inválido para eliminar producto:', id);
    return;
  }

  // Confirmar eliminación
  const confirmacion = confirm(`¿Estás seguro de que deseas eliminar el producto "${nombre}"? Esta acción no se puede deshacer.`);
  if (!confirmacion) return;

  console.log('🗑️ Eliminando producto ID:', id, ' Nombre:', nombre);

  fetch(`http://localhost:3000/api/productos/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log('Producto eliminado (response):', data);
    alert('Producto eliminado correctamente');

    // Limpiar localStorage (ya que el registro no existe)
    localStorage.removeItem('productoParaRecargar');
    // Recargar página completa después de 500ms
    setTimeout(() => {
      location.reload();
    }, 500);
  })
  .catch(err => {
    console.error('Error al eliminar producto:', err);
    alert('Error al eliminar producto: ' + err.message);
  });
}

// Mantener compatibilidad: eliminar desde modal (si usas modal)
function eliminarProducto() {
  const id = document.querySelector('#provId') ? document.querySelector('#provId').value : null;
  if (id) eliminarProductoById(id);
}

function abrirModalAgregarProducto() {
  // Limpiar campos del modal
  document.querySelector('#addNombre').value = '';
  document.querySelector('#addDescripcion').value = '';
  document.querySelector('#addEstado').value = 'Activo';

  // Mostrar modal
  if (typeof $ === 'function' && $.fn && $.fn.modal) {
    $('#addProductoModal').modal('show');
  } else {
    console.warn('Bootstrap modal no disponible.');
  }
}

// Guardar nuevo producto
function agregarProducto() {
  const nombre = document.querySelector('#addNombre').value;
  const descripcion = document.querySelector('#addDescripcion').value;
  const estado = document.querySelector('#addEstado').value;

  // Validar campos
  if (!nombre || !descripcion || !estado) {
    alert('Por favor, completa todos los campos');
    return;
  }

  // Obtener ID de usuario logueado
  let usuarioId = null;
  try {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    usuarioId = usuarioActual.id ?? usuarioActual.ID ?? usuarioActual.USUARIOS_ID ?? null;
  } catch (e) {
    console.error('❌ Error al obtener usuario del localStorage:', e);
  }

  // Generar timestamp en formato YYYY-MM-DD HH:MM:SS
  const now = new Date();
  const año = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const dia = String(now.getDate()).padStart(2, '0');
  const horas = String(now.getHours()).padStart(2, '0');
  const minutos = String(now.getMinutes()).padStart(2, '0');
  const segundos = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

  // Preparar datos para enviar (enviar PROVEEDOR_ID, no nombre)
  const datosProducto = {
    NOMBRE: nombre,
    DESCRIPCION: descripcion,
    ESTADO: estado,
    FECHA_REGISTRO: timestamp,
    USUARIO_ULT_MOD: usuarioId
  };

  console.log('📦 Enviando nuevo producto:', datosProducto);

  // Enviar al servidor (endpoint producto)
  fetch('http://localhost:3000/api/productos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosProducto)
  })
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    alert('Producto agregado correctamente');

    // Cerrar modal
    $('#addProductoModal').modal('hide');

    // Recargar página después de 500ms
    setTimeout(() => {
      location.reload();
    }, 500);
  })
  .catch(err => {
    console.error('Error al agregar producto:', err);
    alert('Error al agregar producto: ' + err.message);
  });
}

// Evento del botón agregar
document.addEventListener("DOMContentLoaded", function() {
  const btnAgregar = document.querySelector('#btnAgregarProducto');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', agregarProducto);
  }
});
