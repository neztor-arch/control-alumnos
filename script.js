const formLogin = document.getElementById('formLogin');
const loginScreen = document.getElementById('loginScreen');
const appShell = document.getElementById('appShell');
const btnSalir = document.getElementById('btnSalir');
const formAlumno = document.getElementById('formAlumno');
const listaAlumnos = document.getElementById('listaAlumnos');
const formTitle = document.getElementById('formTitle');
const btnCancelar = document.getElementById('btnCancelar');
const alumnoIdInput = document.getElementById('alumnoId');
const nombreInput = document.getElementById('nombre');
const cursoInput = document.getElementById('curso');
const calificacionInput = document.getElementById('calificacion');
const estadoInput = document.getElementById('estado');
const totalAlumnos = document.getElementById('totalAlumnos');
const aprobados = document.getElementById('aprobados');
const promedio = document.getElementById('promedio');
const listaInfo = document.getElementById('listaInfo');

const STORAGE_KEY = 'control-alumnos-data';
const SESSION_KEY = 'control-alumnos-logged';

const initialStudents = [
    { id: 1, nombre: 'Ana López', curso: '1°A', calificacion: 9.2, estado: 'Activo' },
    { id: 2, nombre: 'Luis Pérez', curso: '2°B', calificacion: 7.5, estado: 'Activo' },
    { id: 3, nombre: 'Marta Díaz', curso: '3°C', calificacion: 6.4, estado: 'Inactivo' }
];

let students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialStudents;
let editingId = null;

function saveStudents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function showLogin() {
    loginScreen.classList.remove('hidden');
    appShell.classList.add('hidden');
}

function showApp() {
    loginScreen.classList.add('hidden');
    appShell.classList.remove('hidden');
}

function resetForm() {
    formAlumno.reset();
    alumnoIdInput.value = '';
    editingId = null;
    formTitle.textContent = 'Agregar alumno';
    btnCancelar.classList.add('hidden');
}

function renderStats() {
    const total = students.length;
    const aprobadosCount = students.filter((student) => Number(student.calificacion) >= 7).length;
    const promedioValue = total
        ? (students.reduce((sum, student) => sum + Number(student.calificacion), 0) / total).toFixed(1)
        : '0.0';

    totalAlumnos.textContent = total;
    aprobados.textContent = aprobadosCount;
    promedio.textContent = promedioValue;
}

function renderStudents() {
    if (!students.length) {
        listaAlumnos.innerHTML = '<tr><td colspan="5" class="empty">Aún no hay alumnos registrados.</td></tr>';
        listaInfo.textContent = '0 registros';
        renderStats();
        return;
    }

    listaAlumnos.innerHTML = students
        .map((student) => `
            <tr>
                <td>${student.nombre}</td>
                <td>${student.curso}</td>
                <td>${student.calificacion}</td>
                <td>${student.estado}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn edit" data-id="${student.id}" type="button">Editar</button>
                        <button class="action-btn delete" data-id="${student.id}" type="button">Eliminar</button>
                    </div>
                </td>
            </tr>
        `)
        .join('');

    listaInfo.textContent = `${students.length} registros`;
    renderStats();
}

function handleLogin(event) {
    event.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const contraseña = document.getElementById('contraseña').value.trim();

    if (usuario === 'admin' && contraseña === '1234') {
        localStorage.setItem(SESSION_KEY, 'true');
        showApp();
        renderStudents();
    } else {
        alert('Usuario o contraseña incorrectos');
    }
}

formLogin.addEventListener('submit', handleLogin);

btnSalir.addEventListener('click', () => {
    localStorage.removeItem(SESSION_KEY);
    showLogin();
});

formAlumno.addEventListener('submit', (event) => {
    event.preventDefault();

    const alumno = {
        id: editingId || Date.now(),
        nombre: nombreInput.value.trim(),
        curso: cursoInput.value.trim(),
        calificacion: Number(calificacionInput.value),
        estado: estadoInput.value
    };

    if (!alumno.nombre || !alumno.curso || !alumno.calificacion) {
        alert('Completa todos los campos del alumno');
        return;
    }

    if (editingId) {
        students = students.map((student) => (student.id === editingId ? alumno : student));
    } else {
        students = [alumno, ...students];
    }

    saveStudents();
    renderStudents();
    resetForm();
});

listaAlumnos.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const id = Number(button.dataset.id);

    if (button.classList.contains('delete')) {
        students = students.filter((student) => student.id !== id);
        saveStudents();
        renderStudents();
        if (editingId === id) {
            resetForm();
        }
        return;
    }

    if (button.classList.contains('edit')) {
        const student = students.find((item) => item.id === id);
        if (!student) return;

        editingId = id;
        alumnoIdInput.value = id;
        nombreInput.value = student.nombre;
        cursoInput.value = student.curso;
        calificacionInput.value = student.calificacion;
        estadoInput.value = student.estado;
        formTitle.textContent = 'Editar alumno';
        btnCancelar.classList.remove('hidden');
    }
});

btnCancelar.addEventListener('click', resetForm);

if (localStorage.getItem(SESSION_KEY) === 'true') {
    showApp();
    renderStudents();
} else {
    showLogin();
}