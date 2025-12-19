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

document.addEventListener('DOMContentLoaded', () => {
    cargarAccordionProductos();
    activarBuscadorAccordion();
});

async function cargarAccordionProductos() {
    const response = await fetch('/api/materiaProducto');
    const productos = await response.json();

    const accordion = document.getElementById('accordion');
    accordion.innerHTML = '';

    productos.forEach((prod, index) => {

        const collapseId = `producto_${prod.ID}`;
        const abierto = index === 0 ? 'in' : '';

        accordion.insertAdjacentHTML('beforeend', `
            <div class="panel panel-info">
                <div class="panel-heading">
                    <h4 class="panel-title">
                        <a data-toggle="collapse"
                           data-parent="#accordion"
                           href="#${collapseId}">
                            ${prod.NOMBRE}
                        </a>
                    </h4>
                </div>

                <div id="${collapseId}" class="panel-collapse collapse ${abierto}">
                    <div class="panel-body">

                        <p>${prod.DESCRIPCION || ''}</p>

                        <!-- Accordion Presentaciones -->
                        <div class="panel-group"
                             id="accordionPresentaciones_${prod.ID}">
                        </div>

                    </div>
                </div>
            </div>
        `);

        cargarPresentaciones(prod.ID);
    });
}

async function cargarPresentaciones(productoId) {
    const response = await fetch(`/api/materiaProducto/producto/${productoId}`);
    const presentaciones = await response.json();

    const accordion = document.getElementById(`accordionPresentaciones_${productoId}`);
    accordion.innerHTML = '';

    presentaciones.forEach(pres => {

        const collapseId = `pres_${productoId}_${pres.ID}`;

        accordion.insertAdjacentHTML('beforeend', `
            <div class="panel panel-success">
                <div class="panel-heading">
                    <h4 class="panel-title">
                        <a data-toggle="collapse"
                           data-parent="#accordionPresentaciones_${productoId}"
                           href="#${collapseId}">
                            Presentación: ${pres.TAMANO_L} L
                        </a>
                    </h4>
                </div>

                <div id="${collapseId}" class="panel-collapse collapse">
                    <div class="panel-body">

                        <!-- Tabla de materias -->
                        <table class="table table-bordered table-sm"
                               id="tabla_${productoId}_${pres.ID}">
                            <thead>
                                <tr>
                                    <th>Materia</th>
                                    <th>Cantidad</th>
                                    <th>Medida</th>
                                    <th>%</th>
                                    <th>IVA</th>
                                    <th>Costo Unitario</th>
                                    <th>Costo Unitario IVA</th>
                                    <th>Costo Unitario Tanque</th>
                                    <th>Costo Unitario Tanque IVA</th>
                                    <th>Estado</th>
                                    <th>Registrado</th>
                                    <th>Modificado por</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>

                    </div>
                </div>
            </div>
        `);

        cargarFormula(productoId, pres.ID);
    });
}

async function cargarFormula(productoId, presentacionId) {
    const response = await fetch(
        `/api/materiaProducto/producto/${productoId}/${presentacionId}`
    );
    const formula = await response.json();

    const tbody = document.querySelector(
        `#tabla_${productoId}_${presentacionId} tbody`
    );

    tbody.innerHTML = '';
    console.log(formula);

    formula.forEach(item => {
        console.log(item);

        const canDelete = (window.currentUserRoleId === 1 || window.currentUserRoleId === 2);
        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${item.MATERIA_NOMBRE}</td>
                <td>${item.CANTIDAD}</td>
                <td>${item.MEDIDA}</td>
                <td>${item.PORCENTAJE}%</td>
                <td>${item.IVA}%</td>
                <td>${item.COSTO_UNITARIO}$</td>
                <td>${item.COSTO_UNITARIO_IVA}$</td>
                <td>${item.COSTO_TANQUE}$</td>
                <td>${item.COSTO_TANQUE_IVA}$</td>
                <td>${item.ESTADO}</td>
                <td>${item.FECHA_REGISTRO}</td>
                <td>${item.USUARIO_ULT_MOD_NOMBRE || 'N/A'}</td>
                <td>
                    <button class="btn btn-warning btn-sm"">Editar</button>
                    ${canDelete ? `<button class="btn btn-danger btn-sm" style="margin-left:6px;"">Eliminar</button>` : ''}
                </td>
            </tr>
        `);
    });
}

function activarBuscadorAccordion() {
    const input = document.getElementById('buscadorAccordion');

    input.addEventListener('keyup', () => {
        const texto = input.value.toLowerCase();
        const paneles = document.querySelectorAll('#accordion > .panel');

        paneles.forEach(panel => {
            const titulo = panel
                .querySelector('.panel-title a')
                .textContent
                .toLowerCase();

            panel.style.display = titulo.includes(texto)
                ? ''
                : 'none';
        });
    });
}

function abrirModalAgregarFormula() {
    // Reset del modal
    document.getElementById('selectProducto').value = '';
    document.getElementById('selectPresentacion').innerHTML =
        '<option value="">Seleccione...</option>';
    document.getElementById('selectPresentacion').disabled = true;

    document.querySelector('#tablaMaterias tbody').innerHTML = '';

    // Cargar productos
    cargarProductosSelect();
     cargarMaterias();

    // Abrir modal (Bootstrap 3)
    $('#modalFormula').modal('show');
}

async function cargarProductosSelect() {
    const response = await fetch('/api/productos'); // endpoint de productos
    const productos = await response.json();

    const select = document.getElementById('selectProducto');

    select.innerHTML = '<option value="">Seleccione...</option>';

    productos.forEach(prod => {
        select.insertAdjacentHTML('beforeend', `
            <option value="${prod.ID}">
                ${prod.NOMBRE}
            </option>
        `);
    });
}

document.getElementById('selectProducto')
    .addEventListener('change', e => {

        const productoId = e.target.value;

        const selectPres = document.getElementById('selectPresentacion');

        if (!productoId) {
            selectPres.disabled = true;
            selectPres.innerHTML = '<option value="">Seleccione...</option>';
            return;
        }

        cargarPresentacionesSelect(productoId);
    });

    async function cargarPresentacionesSelect(productoId) {

    const response = await fetch(
        `/api/presentaciones`
    );
    const presentaciones = await response.json();

    const select = document.getElementById('selectPresentacion');

    select.innerHTML = '<option value="">Seleccione...</option>';
    select.disabled = false;

    presentaciones.forEach(pres => {
        select.insertAdjacentHTML('beforeend', `
            <option value="${pres.ID}">
                ${pres.TAMANO_L}
            </option>
        `);
    });
}

function validarPaso2() {
    const producto = document.getElementById('selectProducto').value;
    const presentacion = document.getElementById('selectPresentacion').value;

    document.getElementById('btnAgregarMateria').disabled =
        !producto || !presentacion;
}

document
    .getElementById('tablaMaterias')
    .addEventListener('input', e => {

        const tr = e.target.closest('tr');
        if (!tr) return;

        if (
            e.target.classList.contains('costo_u') ||
            e.target.classList.contains('porcentaje') ||
            e.target.classList.contains('iva')
        ) {
            calcularIvaFila(tr);
        }
    });
function calcularIvaFila(tr) {

    const costoU = parseFloat(tr.querySelector('.costo_u').value) || 0;
    const porcentaje = parseFloat(tr.querySelector('.porcentaje').value) || 0;
    const iva = parseFloat(tr.querySelector('.iva').value) || 0;

    const costoTanque = costoU * porcentaje;
    const costoUIva = costoU + (costoU * iva / 100);
    const costoTanqueIva = costoTanque + (costoTanque * iva / 100);

    tr.querySelector('.costo_tanque').value = costoTanque.toFixed(2);
    tr.querySelector('.costo_u_iva').value = costoUIva.toFixed(2);
    tr.querySelector('.costo_tanque_iva').value = costoTanqueIva.toFixed(2);
}

async function cargarMaterias() {

    const response = await fetch('/api/materia');
    const materias = await response.json();

    const select = document.getElementById('selectMateria');

    select.innerHTML = '<option value="">Seleccione materia...</option>';

    materias.forEach(mat => {
        select.insertAdjacentHTML('beforeend', `
            <option value="${mat.ID}">
                ${mat.NOMBRE}-${mat.PROVEEDOR_NOMBRE}
            </option>
        `);
    });
}

document.getElementById('selectMateria')
    .addEventListener('change', e => {

        document.getElementById('btnAgregarMateria').disabled =
            !e.target.value;
    });

function agregarMateriaTabla() {

    const selectMateria = document.getElementById('selectMateria');
    const materiaId = selectMateria.value;
    const materiaNombre = selectMateria.selectedOptions[0].text;

    if (!materiaId) {
        alert('Seleccione una materia');
        return;
    }

    const tbody = document.querySelector('#tablaMaterias tbody');

    // Evitar duplicados
    if (tbody.querySelector(`tr[data-materia="${materiaId}"]`)) {
        alert('Esta materia ya fue agregada');
        return;
    }

    tbody.insertAdjacentHTML('beforeend', `
        <tr data-materia="${materiaId}">
            <td>${materiaNombre}</td>
            <td><input type="text" class="form-control input-sm medida"></td>
            <td><input type="number" class="form-control input-sm cantidad"></td>
            <td><input type="number" class="form-control input-sm porcentaje"></td>
            <td><input type="number" class="form-control input-sm iva"></td>

            <td><input type="number" class="form-control input-sm costo_u" ></td>
            <td><input type="number" class="form-control input-sm costo_u_iva" readonly></td>            
            <td><input type="number" class="form-control input-sm costo_tanque" readonly></td>
            <td><input type="number" class="form-control input-sm costo_tanque_iva" readonly></td>

            <td>
                <button class="btn btn-danger btn-xs"
                        onclick="this.closest('tr').remove()">
                    X
                </button>
            </td>
        </tr>
    `);

    // reset select
    selectMateria.value = '';
    document.getElementById('btnAgregarMateria').disabled = true;
}

function obtenerMateriasDeTabla() {

    const filas = document.querySelectorAll('#tablaMaterias tbody tr');
    const materias = [];

    filas.forEach(tr => {

        materias.push({
            materia_id: tr.dataset.materia,

            cantidad: parseFloat(
                tr.querySelector('.cantidad').value
            ) || 0,

            medida: tr.querySelector('.medida').value,

            porcentaje: parseFloat(
                tr.querySelector('.porcentaje').value
            ) || 0,

            iva: parseFloat(
                tr.querySelector('.iva').value
            ) || 0,

            costo_u: parseFloat(
                tr.querySelector('.costo_u').value
            ) || 0,

            costo_u_iva: parseFloat(
                tr.querySelector('.costo_u_iva').value
            ) || 0,

            costo_tanque: parseFloat(
                tr.querySelector('.costo_tanque').value
            ) || 0,

            costo_tanque_iva: parseFloat(
                tr.querySelector('.costo_tanque_iva').value
            ) || 0
        });

    });

    return materias;
}

document
  .getElementById('btnGuardarFormula')
  .addEventListener('click', () => {

    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    const productoId = document.getElementById('selectProducto').value;
    const presentacionId = document.getElementById('selectPresentacion').value;
      // 6. GENERAR TIMESTAMP
  const now = new Date();
  const año = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const dia = String(now.getDate()).padStart(2, '0');
  const horas = String(now.getHours()).padStart(2, '0');
  const minutos = String(now.getMinutes()).padStart(2, '0');
  const segundos = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

    console.log('Producto:', document.getElementById('selectProducto')?.value);
console.log('Presentación:', document.getElementById('selectPresentacion')?.value);


    if (!productoId || !presentacionId) {
        alert('Seleccione producto y presentación');
        return;
    }

    const materias = obtenerMateriasDeTabla();

    if (materias.length === 0) {
        alert('Agregue al menos una materia');
        return;
    }

    console.log({
        producto_id: productoId,
        presentacion_id: presentacionId,
        usuario_ult_mod: usuarioActual.ID,
        fecha_registro: timestamp,
        materias
    });
});
