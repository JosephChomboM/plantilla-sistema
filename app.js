// Datos simulados (Mock data)
const initialData = [
    { id: 1, name: "Ana Martínez", email: "ana.m@techsolutions.com", position: "Project Manager", dept: "IT", status: "Activo" },
    { id: 2, name: "Carlos López", email: "carlos.l@techsolutions.com", position: "Especialista SEO", dept: "Marketing", status: "Activo" },
    { id: 3, name: "Laura Sánchez", email: "laura.s@techsolutions.com", position: "Ejecutiva de Cuentas", dept: "Ventas", status: "Vacaciones" }
];

// Inicializar LocalStorage si está vacío
if (!localStorage.getItem('employees')) {
    localStorage.setItem('employees', JSON.stringify(initialData));
}

let employees = JSON.parse(localStorage.getItem('employees'));
let currentId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;

// Elementos del DOM
const tableBody = document.getElementById('employee-table-body');
const formContainer = document.getElementById('crud-form-container');
const form = document.getElementById('employee-form');
const formTitle = document.getElementById('form-title');

// Inputs
const idInput = document.getElementById('emp-id');
const nameInput = document.getElementById('emp-name');
const emailInput = document.getElementById('emp-email');
const positionInput = document.getElementById('emp-position');
const deptInput = document.getElementById('emp-dept');
const searchInput = document.getElementById('search-input');

// Inicializar vista
renderTable();
updateDashboardStats();

// Búsqueda en tiempo real
searchInput.addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase();
    const filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(term) || 
        emp.position.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term)
    );
    renderTable(filtered);
});

// READ: Leer y mostrar datos en la tabla
function renderTable(data = employees) {
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    No se encontraron registros
                </td>
            </tr>`;
        return;
    }

    data.forEach((emp, index) => {
        // Generar Avatar con Ui-Avatars API
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random&color=fff&rounded=true`;
        
        // Badge de estado
        const statusClass = emp.status === 'Activo' ? 'bg-success' : 'bg-warning text-dark';
        const displayStatus = emp.status || 'Activo';

        // Badge de departamento
        let deptColor = 'bg-secondary';
        if(emp.dept === 'IT') deptColor = 'bg-primary';
        if(emp.dept === 'Marketing') deptColor = 'bg-danger';
        if(emp.dept === 'Ventas') deptColor = 'bg-info text-dark';
        if(emp.dept === 'RRHH') deptColor = 'bg-purple';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center fw-bold text-muted">${index + 1}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${avatarUrl}" class="avatar me-3" alt="${emp.name}">
                    <div>
                        <div class="fw-bold">${emp.name}</div>
                        <div class="text-muted small">${emp.email || 'Sin correo'}</div>
                    </div>
                </div>
            </td>
            <td class="fw-semibold text-secondary">${emp.position}</td>
            <td><span class="badge ${deptColor} rounded-pill">${emp.dept}</span></td>
            <td><span class="badge ${statusClass} status-badge rounded-pill"><i class="bi bi-circle-fill me-1" style="font-size: 0.5rem; vertical-align: middle;"></i>${displayStatus}</span></td>
            <td class="text-center">
                <div class="btn-group shadow-sm">
                    <button class="btn btn-sm btn-light border text-primary" onclick="editEmployee(${emp.id})" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-light border text-danger" onclick="deleteEmployee(${emp.id})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateDashboardStats() {
    document.getElementById('stat-total').textContent = employees.length;
    document.getElementById('stat-active').textContent = employees.filter(e => e.status !== 'Inactivo').length;
}

// Interfaz para agregar
function showAddForm() {
    form.reset();
    idInput.value = '';
    formTitle.innerHTML = '<i class="bi bi-person-plus-fill me-2"></i> Nuevo Empleado';
    formContainer.style.display = 'block';
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function hideForm() {
    formContainer.style.display = 'none';
}

// UPDATE: Cargar datos en el formulario para editar
function editEmployee(id) {
    const emp = employees.find(e => e.id === id);
    if (emp) {
        idInput.value = emp.id;
        nameInput.value = emp.name;
        emailInput.value = emp.email || '';
        positionInput.value = emp.position;
        deptInput.value = emp.dept || '';
        
        formTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i> Editar Registro';
        formContainer.style.display = 'block';
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// DELETE: Eliminar un registro
function deleteEmployee(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de forma permanente?')) {
        employees = employees.filter(e => e.id !== id);
        saveData();
    }
}

// CREATE o UPDATE al enviar el formulario
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = idInput.value;
    
    const empData = {
        name: nameInput.value,
        email: emailInput.value,
        position: positionInput.value,
        dept: deptInput.value,
        status: "Activo"
    };

    if (id) {
        // Update (Actualizar existente)
        const index = employees.findIndex(e => e.id === parseInt(id));
        if (index !== -1) {
            employees[index] = { ...employees[index], ...empData };
        }
    } else {
        // Create (Crear nuevo)
        employees.unshift({
            id: currentId++,
            ...empData
        });
    }

    saveData();
    hideForm();
});

// Guardar en el almacenamiento local y actualizar vistas
function saveData() {
    localStorage.setItem('employees', JSON.stringify(employees));
    renderTable();
    updateDashboardStats();
}