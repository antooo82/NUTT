document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    const allCourseItems = document.querySelectorAll('.year-block .course-item'); // Todos los items de cursos obligatorios
    const totalElectivesCreditsSpan = document.getElementById('total-electives-credits');
    const addElectiveBtn = document.getElementById('add-elective-btn');
    const electiveNameInput = document.getElementById('new-elective-name');
    const electiveCreditsInput = document.getElementById('new-elective-credits');
    const electiveCoursesContainer = document.getElementById('elective-courses-container'); // Contenedor para las electivas

    // --- Funcionalidad para cursos obligatorios (marcar con línea) ---

    // Cargar el estado guardado de las materias obligatorias al inicio
    allCourseItems.forEach(item => {
        const courseName = item.dataset.name; // Usamos data-name
        const isApproved = localStorage.getItem(`course_${courseName}`) === 'true'; // Guardamos como string 'true'/'false'

        if (isApproved) {
            item.classList.add('approved');
        }

        // Añadir el listener de clic a cada materia obligatoria
        item.addEventListener('click', () => {
            item.classList.toggle('approved'); // Alternar la clase
            const currentCourseName = item.dataset.name;
            const isCurrentlyApproved = item.classList.contains('approved');
            localStorage.setItem(`course_${currentCourseName}`, isCurrentlyApproved); // Guardar el nuevo estado
        });
    });

    // --- Funcionalidad para Electivas y Optativas ---

    // Función para actualizar el total de créditos de electivas
    function updateTotalElectivesCredits() {
        let totalCredits = 0;
        // Solo sumamos los créditos de las electivas que estén marcadas
        electiveCoursesContainer.querySelectorAll('.elective-item input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.checked) {
                totalCredits += parseInt(checkbox.dataset.credits || 0);
            }
        });
        totalElectivesCreditsSpan.textContent = totalCredits;
        localStorage.setItem('totalElectivesCredits', totalCredits); // Persistir el total
    }

    // Función para guardar todas las electivas en localStorage
    function saveElectives() {
        const electives = [];
        electiveCoursesContainer.querySelectorAll('.elective-item').forEach(item => {
            const name = item.querySelector('.elective-name').textContent;
            const credits = item.querySelector('input[type="checkbox"]').dataset.credits;
            const isChecked = item.querySelector('input[type="checkbox"]').checked;
            electives.push({ name, credits: parseInt(credits), checked: isChecked });
        });
        localStorage.setItem('electives', JSON.stringify(electives));
    }

    // Función para crear y añadir una electiva al DOM
    function createElectiveElement(name, credits, isChecked = false) {
        const electiveItem = document.createElement('div');
        electiveItem.classList.add('elective-item');
        if (isChecked) {
            electiveItem.classList.add('approved');
        }

        electiveItem.innerHTML = `
            <label>
                <input type="checkbox" data-credits="${credits}" ${isChecked ? 'checked' : ''}>
                <span class="elective-name">${name}</span>
            </label>
            <span class="elective-credits">Cr: ${credits}</span>
            <button class="remove-elective-btn">X</button>
        `;

        // Event listener para el checkbox de la electiva
        const electiveCheckbox = electiveItem.querySelector('input[type="checkbox"]');
        electiveCheckbox.addEventListener('change', () => {
            if (electiveCheckbox.checked) {
                electiveItem.classList.add('approved');
            } else {
                electiveItem.classList.remove('approved');
            }
            updateTotalElectivesCredits(); // Recalcular al cambiar el estado
            saveElectives(); // Guardar el nuevo estado
        });

        // Event listener para el botón de eliminar
        const removeButton = electiveItem.querySelector('.remove-elective-btn');
        removeButton.addEventListener('click', () => {
            electiveItem.remove(); // Eliminar del DOM
            updateTotalElectivesCredits(); // Recalcular al eliminar
            saveElectives(); // Guardar la lista actualizada
        });

        return electiveItem;
    }

    // Función para añadir una nueva electiva (desde el input)
    function addNewElective() {
        const name = electiveNameInput.value.trim();
        const credits = parseInt(electiveCreditsInput.value);

        if (!name || isNaN(credits) || credits <= 0) {
            alert('Por favor, ingresa un nombre y créditos válidos para la electiva.');
            return;
        }

        const newElectiveElement = createElectiveElement(name, credits, false); // Nueva electiva, no marcada por defecto
        electiveCoursesContainer.appendChild(newElectiveElement); // Añadir al contenedor

        electiveNameInput.value = ''; // Limpiar campos
        electiveCreditsInput.value = '';
        electiveNameInput.focus(); // Volver a enfocar para fácil adición

        updateTotalElectivesCredits(); // Actualizar total
        saveElectives(); // Guardar la nueva electiva en localStorage
    }

    // Cargar electivas guardadas al inicio de la página
    function loadElectives() {
        const savedElectives = JSON.parse(localStorage.getItem('electives') || '[]');
        savedElectives.forEach(elective => {
            const electiveElement = createElectiveElement(elective.name, elective.credits, elective.checked);
            electiveCoursesContainer.appendChild(electiveElement);
        });
        updateTotalElectivesCredits(); // Asegurar que el total inicial sea correcto
    }

    // --- Event Listeners para Electivas ---
    addElectiveBtn.addEventListener('click', addNewElective);

    // Permitir agregar con Enter en los campos de input de electivas
    electiveNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evitar envío de formulario si existiera
            addNewElective();
        }
    });
    electiveCreditsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evitar envío de formulario
            addNewElective();
        }
    });

    // --- Inicialización al cargar la página ---
    loadElectives(); // Cargar electivas y actualizar total
});
