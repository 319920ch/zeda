document.addEventListener("DOMContentLoaded", function() {
    cargarMateria();
    
    // Después de cargar, verificar si hay un ID de registro para reposicionar
    setTimeout(() => {
        const registroId = localStorage.getItem('materiaParaRecargar');
        if (registroId) {
            localStorage.removeItem('materiaParaRecargar');
            
            if ($.fn.dataTable.isDataTable("#tablaMateria")) {
                const datatable = $('#tablaMateria').DataTable();
                
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

function cargarMateria() {
    console.log("🔄 Iniciando carga de materia prima...");
    
    fetch("http://localhost:3000/api/materia")
        .then(res => {
            return res.json();
        })
        .then(data => {
      // Guardar datos globalmente para poder acceder desde editarProveedor
      window.materiaData = data || [];

      const tbody = document.querySelector("#tablaMateria tbody");
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
                  <td>${p.PROVEEDOR_NOMBRE || p.PROVEEDOR_ID || ''}</td>
                  <td>${p.ESTADO}</td>
                  <td>${p.FECHA_REGISTRO}</td>
                  <td>${p.USUARIO_NOMBRE || p.USUARIO_ULT_MOD || ''}</td>
                  <td style="text-align: left;">
                    <button class="btn btn-warning btn-sm" onclick="editarMateria(${p.ID})">Editar</button>
                    ${canDelete ? `<button class="btn btn-danger btn-sm" style="margin-left:6px;" onclick="eliminarMateriaById(${p.ID})">Eliminar</button>` : ''}
                  </td>
                </tr>`;
            });
            
            // Destruir DataTable anterior si existe
            if ($.fn.dataTable.isDataTable("#tablaMateria")) {
                $('#tablaMateria').DataTable().destroy();
            }
            
            // Inicializar DataTable
            $('#tablaMateria').dataTable({
                "pageLength": 10,
                "aLengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]]
            });
        })
        .catch(err => {
            console.error("Detalles:", err.message);
        });
}


// Abre el modal de edición y rellena los campos con los datos del proveedor
function editarMateria(id) {
  const prov = (window.materiaData || []).find(p => p.ID == id);
  if (!prov) {
    console.error('Materia no encontrado:', id);
    return;
  }

  // Rellenar inputs del modal (deben existir en el HTML)
  const setVal = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.value = value || '';
  };

  setVal('#provId', prov.ID);
  setVal('#provNombre', prov.NOMBRE);
  setVal('#provDescripcion', prov.DESCRIPCION);
  setVal('#provProveedor', prov.PROVEEDOR_ID);
  setVal('#provEstado', prov.ESTADO);

  // Verificar rol del usuario para mostrar/ocultar botón eliminar
  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  const btnEliminar = document.querySelector('#btnEliminarMateria');

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
    $('#editMateriaModal').modal('show');
  } else {
    console.warn('Bootstrap modal no disponible.');
  }
}


// Guardar cambios del proveedor
function guardarMateria() {
  const id = document.querySelector('#provId').value;
  const nombre = document.querySelector('#provNombre').value;
  const descripcion = document.querySelector('#provDescripcion').value;
  const proveedor = document.querySelector('#provProveedor').value;
  const estado = document.querySelector('#provEstado').value;
  
  // Generar timestamp en formato YYYY-MM-DD HH:MM:SS
  const now = new Date();
  const año = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const dia = String(now.getDate()).padStart(2, '0');
  const horas = String(now.getHours()).padStart(2, '0');
  const minutos = String(now.getMinutes()).padStart(2, '0');
  const segundos = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

  // Validar campos
  if (!nombre || !direccion || !contacto) {
    alert('Por favor, completa todos los campos');
    return;
  }

  // Guardar ID del registro para reposicionar después de recargar
  localStorage.setItem('proveedorParaRecargar', id);

  // Enviar cambios al servidor
  fetch(`http://localhost:3000/api/materia/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      NOMBRE: nombre,
      DESCRIPCION: descripcion,
      PROVEEDOR_ID: proveedor,
      ESTADO: estado,
      FECHA_REGISTRO: timestamp, 
      UUSUARIO_ULT_MOD: 'UsuarioActual' 
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
    alert('Materia actualizada correctamente');
    
    // Cerrar modal
    $('#editMateriaModal').modal('hide');
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
  const btnGuardar = document.querySelector('#btnGuardarMateria');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarMateria);
  }
});


// Función para eliminar materia
// Eliminar materia por ID (usado desde el botón en la fila)
function eliminarMateriaById(id) {
  const prov = (window.proveedoresData || []).find(p => p.ID == id) || {};
  const nombre = prov.NOMBRE || '';

  // Confirmar eliminación
  const confirmacion = confirm(`¿Estás seguro de que deseas eliminar a "${nombre}"? Esta acción no se puede deshacer.`);
  if (!confirmacion) return;

  console.log('🗑️ Eliminando materia ID:', id);

  fetch(`http://localhost:3000/api/proveedores/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log('Materia eliminada:', data);
    alert('Materia eliminada correctamente');
    
    // Limpiar localStorage (ya que el registro no existe)
    localStorage.removeItem('materiaParaRecargar');
    
    // Recargar página completa después de 500ms
    setTimeout(() => {
      location.reload();
    }, 500);
  })
  .catch(err => {
    alert('Error al eliminar materia: ' + err.message);
  });
}

// Mantener compatibilidad: eliminar desde modal (si usas modal)
function eliminarMateria() {
  const id = document.querySelector('#provId') ? document.querySelector('#provId').value : null;
  if (id) eliminarMateriaById(id);
}

// Abre el modal para agregar un nuevo proveedor
function abrirModalAgregarMateria() {
 
  // Limpiar campos del modal
  document.querySelector('#addNombre').value = '';
  document.querySelector('#addDescripcion').value = '';
  document.querySelector('#addProveedor').value = '';
  document.querySelector('#addEstado').value = 'Activo';
  
  // Mostrar modal
  if (typeof $ === 'function' && $.fn && $.fn.modal) {
    $('#addMateriaModal').modal('show');
  } else {
    console.warn('Bootstrap modal no disponible.');
  }
}

// Guardar nuevo proveedor
function agregarMateria() {
  const nombre = document.querySelector('#addNombre').value;
  const descripcion = document.querySelector('#addDescripcion').value;
  const proveedor = document.querySelector('#addProveedor').value;
  const estado = document.querySelector('#addEstado').value;
  
  // Validar campos
  if (!nombre || !descripcion || !proveedor) {
    alert('Por favor, completa todos los campos');
    return;
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
  const datosProveedor = {
    NOMBRE: nombre,
    DESCRIPCION: descripcion,
    PROVEEDOR: proveedor,
    ESTADO: estado,
    FECHA_REGISTRO: timestamp,
    UUSUARIO_ULT_MOD: 'UsuarioActual'
  };
  
  // Enviar al servidor
  fetch('http://localhost:3000/api/proveedores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosMateria)
  })
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    alert('Materia agregada correctamente');
    
    // Cerrar modal
    $('#addMateriaModal').modal('hide');
    
    // Recargar página después de 500ms
    setTimeout(() => {
      location.reload();
    }, 500);
  })
  .catch(err => {
    alert('Error al agregar materia: ' + err.message);
  });
}

// Evento del botón agregar
document.addEventListener("DOMContentLoaded", function() {
  const btnAgregar = document.querySelector('#btnAgregarMateria');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', agregarMateria);
  }
});
