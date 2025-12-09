document.addEventListener("DOMContentLoaded", function() {
    cargarProveedores();
});

function cargarProveedores() {
    console.log("🔄 Iniciando carga de proveedores...");
    
    fetch("http://localhost:3000/api/proveedores")
        .then(res => {
            return res.json();
        })
        .then(data => {
            
            const tbody = document.querySelector("#tablaProveedores tbody");
            if (!tbody) {
                return;
            }
            
            tbody.innerHTML = "";

            data.forEach(p => {
                tbody.innerHTML += `
                    <tr>
                        <td>${p.NOMBRE}</td>
                        <td>${p.DIRECCION}</td>
                        <td>${p.CONTACTO}</td>
                        <td>${p.ESTADO}</td>
                        <td>${p.FECHA_REGISTRO}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editarProveedor(${p.ID})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarProveedor(${p.ID})">Eliminar</button>
                        </td>
                    </tr>
                `;
            });
            if ($.fn.dataTable.isDataTable("#tablaProveedores")) {
                $('#tablaProveedores').DataTable().destroy();
            }
            $('#tablaProveedores').dataTable({
                "pageLength": 10,
                "aLengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]]
            });
        })
        .catch(err => {
            console.error("Detalles:", err.message);
        });
}
