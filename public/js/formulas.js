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

    formula.forEach(item => {
        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${item.MATERIA_NOMBRE}</td>
                <td>${item.CANTIDAD}</td>
                <td>${item.MEDIDA}</td>
                <td>${item.PORCENTAJE}%</td>
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
