// Datos simulados (Mock data) enriquecidos
const initialData = [
    { id: 1, name: "Ana Martínez", email: "ana.m@techsolutions.com", position: "Project Manager", dept: "IT", status: "Activo" },
    { id: 2, name: "Carlos López", email: "carlos.l@techsolutions.com", position: "Especialista SEO", dept: "Marketing", status: "Activo" },
    { id: 3, name: "Laura Sánchez", email: "laura.s@techsolutions.com", position: "Ejecutiva de Cuentas", dept: "Ventas", status: "Vacaciones" },
    { id: 4, name: "Miguel Torres", email: "miguel.t@techsolutions.com", position: "Desarrollador Backend", dept: "IT", status: "Activo" },
    { id: 5, name: "Sofía Ruiz", email: "sofia.r@techsolutions.com", position: "Reclutadora", dept: "RRHH", status: "Inactivo" }
];

if (!localStorage.getItem('employees')) {
    localStorage.setItem('employees', JSON.stringify(initialData));
}

let employees = JSON.parse(localStorage.getItem('employees'));
let currentId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;

// Referencias DOM
const tableBody = document.getElementById('employee-table-body');
const formContainer = document.getElementById('crud-form-container');
const form = document.getElementById('employee-form');
const formTitle = document.getElementById('form-title');
const searchInput = document.getElementById('search-input');
const deptFilter = document.getElementById('filter-dept');
const showingEntries = document.getElementById('showing-entries');

// Variables para gráficas
let myDeptChart, myStatusChart;

// Inicialización global
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    renderTable();
});

// ================= LÓGICA PRINCIPAL (CRUD) =================

// READ: Leer y Filtrar
function renderTable() {
    let term = searchInput.value.toLowerCase();
    let selectedDept = deptFilter.value;

    let filteredData = employees.filter(emp => {
        let matchText = emp.name.toLowerCase().includes(term) || 
                        emp.position.toLowerCase().includes(term) ||
                        emp.email.toLowerCase().includes(term);
        let matchDept = (selectedDept === "Todos") || (emp.dept === selectedDept);
        return matchText && matchDept;
    });

    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted">
            <i class="bi bi-inbox fs-1 d-block mb-3"></i>No se encontraron registros</td></tr>`;
        showingEntries.textContent = "Mostrando 0 registros";
    } else {
        filteredData.forEach((emp, index) => {
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random&color=fff&rounded=true&bold=true`;
            
            // Colores por estado
            let statusColor = "bg-success";
            if (emp.status === "Vacaciones") statusColor = "bg-warning text-dark";
            if (emp.status === "Inactivo") statusColor = "bg-danger";

            // Colores por Depto
            let deptColor = 'bg-secondary';
            if(emp.dept === 'IT') deptColor = 'bg-primary';
            else if(emp.dept === 'Marketing') deptColor = 'text-bg-warning';
            else if(emp.dept === 'Ventas') deptColor = 'bg-info text-dark';
            else if(emp.dept === 'RRHH') deptColor = 'bg-danger';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-center fw-bold text-muted">${index + 1}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${avatarUrl}" class="avatar me-3 shadow-sm" alt="${emp.name}">
                        <div>
                            <div class="fw-bold">${emp.name}</div>
                            <div class="text-muted small"><i class="bi bi-envelope me-1"></i>${emp.email}</div>
                        </div>
                    </div>
                </td>
                <td class="fw-semibold text-secondary">${emp.position}</td>
                <td><span class="badge ${deptColor} rounded-pill px-3">${emp.dept}</span></td>
                <td><span class="badge ${statusColor} status-badge rounded-pill"><i class="bi bi-record-circle me-1"></i>${emp.status}</span></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary shadow-sm me-1" onclick="editEmployee(${emp.id})" title="Editar"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger shadow-sm" onclick="deleteEmployee(${emp.id})" title="Eliminar"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        showingEntries.textContent = `Mostrando ${filteredData.length} de ${employees.length} registros en total.`;
    }

    updateDashboardStats();
    updateCharts();
}

// LISTENERS Búsqueda y Filtro
searchInput.addEventListener('input', renderTable);
deptFilter.addEventListener('change', renderTable);

// Formularios UX
function showAddForm() {
    form.reset();
    document.getElementById('emp-id').value = '';
    formTitle.innerHTML = '<i class="bi bi-person-plus-fill me-2"></i> Nuevo Empleado';
    formContainer.style.display = 'block';
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function hideForm() { formContainer.style.display = 'none'; }

function editEmployee(id) {
    const emp = employees.find(e => e.id === id);
    if (emp) {
        document.getElementById('emp-id').value = emp.id;
        document.getElementById('emp-name').value = emp.name;
        document.getElementById('emp-email').value = emp.email;
        document.getElementById('emp-position').value = emp.position;
        document.getElementById('emp-dept').value = emp.dept;
        document.getElementById('emp-status').value = emp.status;
        
        formTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i> Editar Empleado';
        formContainer.style.display = 'block';
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('emp-id').value;
    
    const empData = {
        name: document.getElementById('emp-name').value,
        email: document.getElementById('emp-email').value,
        position: document.getElementById('emp-position').value,
        dept: document.getElementById('emp-dept').value,
        status: document.getElementById('emp-status').value
    };

    if (id) {
        const index = employees.findIndex(e => e.id === parseInt(id));
        employees[index] = { ...employees[index], ...empData };
        showToast(`Registro actualizado exitosamente`, 'primary');
    } else {
        employees.unshift({ id: currentId++, ...empData });
        showToast(`Empleado ${empData.name} añadido correctamente`, 'success');
    }

    saveAndRender();
    hideForm();
});

function deleteEmployee(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro permanentemente?')) {
        let empToDelete = employees.find(e => e.id === id);
        employees = employees.filter(e => e.id !== id);
        saveAndRender();
        showToast(`Se ha eliminado a ${empToDelete.name}`, 'danger');
    }
}

function saveAndRender() {
    localStorage.setItem('employees', JSON.stringify(employees));
    renderTable();
}

// ================= INTERFAZ Y UTILIDADES =================

// Sistema de Notificaciones Toast
function showToast(message, colorClass = 'success') {
    const toastEl = document.getElementById('liveToast');
    const toastBody = document.getElementById('toast-message');
    
    // Configurar clase y texto
    toastEl.className = `toast align-items-center text-bg-${colorClass} border-0`;
    toastBody.innerHTML = message;
    
    // Mostrar
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

// Actualizar KPIs numéricos
function updateDashboardStats() {
    document.getElementById('stat-total').textContent = employees.length;
    document.getElementById('stat-active').textContent = employees.filter(e => e.status === 'Activo').length;
}

// Exportar a CSV
function exportToCSV() {
    if (employees.length === 0) return showToast("No hay datos para exportar", "warning");

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Nombre,Email,Puesto,Departamento,Estado\n";

    employees.forEach(function(rowArray) {
        let row = `${rowArray.id},"${rowArray.name}","${rowArray.email}","${rowArray.position}","${rowArray.dept}","${rowArray.status}"`;
        csvContent += row + "\r\n";
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "empleados_techsolutions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Archivo CSV descargado", "info");
}

// Tema Oscuro / Claro
function initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', currentTheme);
    updateThemeIcon(themeBtn, currentTheme);

    themeBtn.addEventListener('click', () => {
        let isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        let newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(themeBtn, newTheme);
        
        // Actualizar paleta de gráficos al cambiar el tema
        Chart.defaults.color = newTheme === 'dark' ? '#adb5bd' : '#6c757d';
        updateCharts();
    });
}

function updateThemeIcon(btn, theme) {
    if (theme === 'dark') {
        btn.innerHTML = '<i class="bi bi-sun-fill fs-5 text-warning"></i>';
    } else {
        btn.innerHTML = '<i class="bi bi-moon-stars-fill fs-5"></i>';
    }
}

// ================= GRÁFICOS (Chart.js) =================
Chart.defaults.font.family = 'Inter';

function updateCharts() {
    const deptCounts = { "IT": 0, "RRHH": 0, "Ventas": 0, "Marketing": 0 };
    const statusCounts = { "Activo": 0, "Vacaciones": 0, "Inactivo": 0 };

    employees.forEach(e => {
        if(deptCounts[e.dept] !== undefined) deptCounts[e.dept]++;
        if(statusCounts[e.status] !== undefined) statusCounts[e.status]++;
    });

    renderDeptChart(deptCounts);
    renderStatusChart(statusCounts);
}

function renderDeptChart(data) {
    const ctx = document.getElementById('deptChart');
    if(myDeptChart) myDeptChart.destroy();

    myDeptChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: ['#0d6efd', '#dc3545', '#0dcaf0', '#ffc107'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, color: Chart.defaults.color } }
            },
            cutout: '70%'
        }
    });
}

function renderStatusChart(data) {
    const ctx = document.getElementById('statusChart');
    if(myStatusChart) myStatusChart.destroy();

    myStatusChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Personal',
                data: Object.values(data),
                backgroundColor: ['#198754', '#ffc107', '#dc3545'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, color: Chart.defaults.color } },
                x: { grid: { display: false }, ticks: { color: Chart.defaults.color } }
            }
        }
    });
}