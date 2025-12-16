document.addEventListener("DOMContentLoaded", function() {
    cargarPresentaciones();
    
    // Después de cargar, verificar si hay un ID de registro para reposicionar
    setTimeout(() => {
        const registroId = localStorage.getItem('presentacionesParaRecargar');
        if (registroId) {
            localStorage.removeItem('presentacionesParaRecargar');
            
            if ($.fn.dataTable.isDataTable("#tablaPresentaciones")) {
                const datatable = $('#tablaPresentaciones').DataTable();
                
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

function cargarPresentaciones() {
    console.log("🔄 Iniciando carga de presentaciones...");
    
    fetch("http://localhost:3000/api/presentaciones")
        .then(res => {
            return res.json();
        })
        .then(data => {
      // Guardar datos globalmente para poder acceder desde editarPresentacion
      window.presentacionesData = data || [];

      const tbody = document.querySelector("#tablaPresentaciones tbody");
            if (!tbody) {
                return;
            }
            
            tbody.innerHTML = "";

            data.forEach(p => {
              // Mostrar botón eliminar solo si el rol del usuario es 1 o 2
              const canDelete = (window.currentUserRoleId === 1 || window.currentUserRoleId === 2);
              tbody.innerHTML += `
                <tr data-id="${p.ID}">
                  <td>${p.TAMANO_L}</td>
                  <td>${p.DESCRIPCION}</td>
                  <td>${p.COSTO_VENTA}</td>
                  <td>${p.PROVEEDOR_NOMBRE || p.PROVEEDOR_ID || ''}</td>
                  <td>${p.FECHA_REGISTRO}</td>
                  <td>${p.ESTADO}</td>
                  <td style="text-align: left;">
                    <button class="btn btn-warning btn-sm" onclick="editarPresentaciones(${p.ID})">Editar</button>
                    ${canDelete ? `<button class="btn btn-danger btn-sm" style="margin-left:6px;" onclick="eliminarPresentacionesById(${p.ID})">Eliminar</button>` : ''}
                  </td>
                </tr>`;
            });
            
            // Destruir DataTable anterior si existe
            if ($.fn.dataTable.isDataTable("#tablaPresentaciones")) {
                $('#tablaPresentaciones').DataTable().destroy();
            }
            
            // Inicializar DataTable
            $('#tablaPresentaciones').dataTable({
                "pageLength": 10,
                "aLengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]]
            });
        })
        .catch(err => {
            console.error("Detalles:", err.message);
        });
}


// Abre el modal de edición y rellena los campos con los datos del presentaciones
function editarPresentaciones(id) {
 
  const p = (window.presentacionesData || []).find(p => p.ID == id);
  if (!p) {
    return;
  }


  const setVal = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.value = value || '';
  };

  setVal('#presentacionId', p.ID);
  setVal('#presentacionTamano', p.TAMANO_L);
  setVal('#presentacionDescripcion', p.DESCRIPCION);
  setVal('#presentacionCostoVenta', p.COSTO_VENTA);
  setVal('#presentacionProveedor', p.PROVEEDOR_NOMBRE || p.PROVEEDOR_ID || '');
  
  // Normalizar estado: convertir a mayúscula inicial para coincidir con las opciones del select
  const estadoNormalizado = p.ESTADO 
    ? p.ESTADO.trim().charAt(0).toUpperCase() + p.ESTADO.trim().slice(1).toLowerCase()
    : 'Activo';
  setVal('#presentacionEstado', estadoNormalizado);
  
  // Verificar rol del usuario para mostrar/ocultar botón eliminar
  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  const btnEliminar = document.querySelector('#btnEliminarPresentaciones');

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
    $('#editPresentacionesModal').modal('show');
  } else {
    console.warn('Bootstrap modal no disponible.');
  }
}


// Guardar cambios del presentaciones
function guardarPresentaciones() {
  // 0. OBTENER DATOS DEL USUARIO LOGUEADO
  let usuarioId = null;
  try {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    usuarioId = usuarioActual.id ?? usuarioActual.ID ?? usuarioActual.USUARIOS_ID ?? null;
  } catch (e) {
    console.error('❌ Error al obtener datos del usuario:', e.message);
  }

  const id = document.querySelector('#presentacionId').value;
  const tamano = document.querySelector('#presentacionTamano').value;
  const descripcion = document.querySelector('#presentacionDescripcion').value;
  const costo = document.querySelector('#presentacionCostoVenta').value;
  const estado = document.querySelector('#presentacionEstado').value;
  
  // Obtener PROVEEDOR_ID desde los datos cargados
  const p = (window.presentacionesData || []).find(pr => pr.ID == id);
  const proveedor_id = p ? p.PROVEEDOR_ID : null;

  // Generar timestamp en formato YYYY-MM-DD HH:MM:SS
  const now = new Date();
  const año = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const dia = String(now.getDate()).padStart(2, '0');
  const horas = String(now.getHours()).padStart(2, '0');
  const minutos = String(now.getMinutes()).padStart(2, '0');
  const segundos = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

  // Validar campos (corregidos)
  if (!tamano || !descripcion || !costo) {
    alert('Por favor, completa todos los campos (Tamaño, Descripción, Costo)');
    return;
  }

  // Guardar ID del registro para reposicionar después de recargar
  localStorage.setItem('presentacionesParaRecargar', id);

  // Enviar cambios al servidor
  fetch(`http://localhost:3000/api/presentaciones/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      TAMANO_L: tamano,
      DESCRIPCION: descripcion,
      COSTO_VENTA: costo,
      ESTADO: estado,
      PROVEEDOR_ID: proveedor_id,
      FECHA_REGISTRO: timestamp
    })
     
  })
  
  .then(res => {
    console.log(timestamp);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    alert('Presentación actualizada correctamente');
    
    // Cerrar modal
    $('#editPresentacionesModal').modal('hide');
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
  const btnGuardar = document.querySelector('#btnGuardarPresentaciones');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarPresentaciones);
  }
});


// Función para eliminar    una presentación por ID
// Eliminar presentación por ID (usado desde el botón en la fila)
function eliminarPresentacionesById(id) {
  const p = (window.presentacionesData || []).find(p => p.ID == id) || {};
  const tamano = p.TAMANO_L|| '';

  // Confirmar eliminación
  const confirmacion = confirm(`¿Estás seguro de que deseas eliminar a "${tamano}"? Esta acción no se puede deshacer.`);
  if (!confirmacion) return;

  console.log('🗑️ Eliminando presentación ID:', id);

  fetch(`http://localhost:3000/api/presentaciones/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log('✅ Presentación eliminada:', data);
    alert('Presentación eliminada correctamente');
    
    // Limpiar localStorage (ya que el registro no existe)
    localStorage.removeItem('presentacionesParaRecargar');
    
    // Recargar página completa después de 500ms
    setTimeout(() => {
      location.reload();
    }, 500);
  })
  .catch(err => {
    alert('Error al eliminar presentación: ' + err.message);
  });
}

// Mantener compatibilidad: eliminar desde modal (si usas modal)
function eliminarPresentaciones() {
  const id = document.querySelector('#pId') ? document.querySelector('#pId').value : null;
  if (id) eliminarPresentacionesById(id);
}

// Abre el modal para agregar un nuevo presentaciones
function abrirModalAgregarPresentaciones() {
 
  // Limpiar campos del modal
  document.querySelector('#addTamano').value = '';
  document.querySelector('#addDescripcion').value = '';
  document.querySelector('#addCosto').value = '';
  document.querySelector('#addProveedor').value = '';
  document.querySelector('#addEstado').value = 'Activo';
  
  // Cargar proveedores en el select
    const selectProveedor = document.querySelector('#addProveedor');
    if(selectProveedor) {
    selectProveedor.innerHTML = '<option value="">Seleccionar proveedor</option>';
    fetch('http://localhost:3000/api/proveedores')
    .then(res => res.json())
      .then(proveedores => {
        proveedores
          .filter(p => (p.ESTADO || p.estado || '').toString().toLowerCase() === 'activo')
          .forEach(prov => {
            const option = document.createElement('option');
            option.value = prov.ID;
            option.textContent = prov.NOMBRE || prov.nombre || '';
            selectProveedor.appendChild(option);
          });
      })
      .catch(err => {
        console.error('❌ Error al cargar proveedores para el modal agregar:', err);
      });
  }

  // Mostrar modal
  if (typeof $ === 'function' && $.fn && $.fn.modal) {
    $('#addPresentacionesModal').modal('show');
  } else {
    console.warn('Bootstrap modal no disponible.');
  }
}

// Guardar nueva presentación
function agregarPresentaciones() {
  const tamano = document.querySelector('#addTamano').value;
  const descripcion = document.querySelector('#addDescripcion').value;
  const costo = document.querySelector('#addCosto').value;
  const proveedor_id = document.querySelector('#addProveedor').value;
  const estado = document.querySelector('#addEstado').value;
  
  // Validar campos
  if (!tamano || !descripcion || !costo || !proveedor_id) {
    alert('Por favor, completa todos los campos incluido el proveedor');
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
  
  // Preparar datos para enviar
  const datosPresentaciones = {
    TAMANO_L: tamano,
    DESCRIPCION: descripcion,
    COSTO_VENTA: costo,
    PROVEEDOR_ID: parseInt(proveedor_id),
    ESTADO: estado,
    FECHA_REGISTRO: timestamp
  };
  
  // Enviar al servidor
  fetch('http://localhost:3000/api/presentaciones', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosPresentaciones)
  })
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    alert('Presentación agregada correctamente');
    
    // Cerrar modal
    $('#addPresentacionesModal').modal('hide');
    
    // Recargar página después de 500ms
    setTimeout(() => {
      location.reload();
    }, 500);
  })
  .catch(err => {
    alert('Error al agregar presentación: ' + err.message);
  });
}

// Evento del botón agregar
document.addEventListener("DOMContentLoaded", function() {
  const btnAgregar = document.querySelector('#btnAgregarPresentaciones');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', agregarPresentaciones);
  }
});
