document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.course-item input[type="checkbox"]');
    const totalElectivesCreditsSpan = document.getElementById('total-electives-credits');
    const addElectiveBtn = document.querySelector('.add-elective-btn');
    const electiveNameInput = document.querySelector('.new-elective-name');
    const electiveCreditsInput = document.querySelector('.new-elective-credits');
    const electiveCoursesList = document.getElementById('elective-courses');

    // --- Funcionalidad para cursos obligatorios (marcar aprobado) ---
    checkboxes.forEach(checkbox => {
        // Cargar estado guardado (si existe)
        const courseName = checkbox.nextElementSibling.textContent; // Obtiene el nombre del curso
        const savedState = localStorage.getItem(`course_${courseName}`);
        if (savedState === 'approved') {
            checkbox.checked = true;
            checkbox.closest('.course-item').classList.add('approved');
        }

        checkbox.addEventListener('change', (event) => {
            const courseItem = event.target.closest('.course-item');
            const currentCourseName = event.target.nextElementSibling.textContent;

            if (event.target.checked) {
                courseItem.classList.add('approved');
                localStorage.setItem(`course_${currentCourseName}`, 'approved');
            } else {
                courseItem.classList.remove('approved');
                localStorage.removeItem(`course_${currentCourseName}`); // Eliminar si se desmarca
            }
        });
    });

    // --- Funcionalidad para Electivas ---

    // Función para calcular y mostrar el total de créditos de electivas
    function updateTotalElectivesCredits() {
        let totalCredits = 0;
        document.querySelectorAll('.elective-item input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.checked) {
                totalCredits += parseInt(checkbox.dataset.credits || 0);
            }
        });
        totalElectivesCreditsSpan.textContent = totalCredits;
        // Guardar el total en localStorage para persistencia
        localStorage.setItem('totalElectivesCredits', totalCredits);
    }

    // Función para guardar las electivas en localStorage
    function saveElectives() {
        const electives = [];
        document.querySelectorAll('.elective-item').forEach(item => {
            const name = item.querySelector('.elective-name').textContent;
            const credits = item.querySelector('.elective-credits').dataset.credits; // Asegúrate de obtener el data-credits
            const isChecked = item.querySelector('input[type="checkbox"]').checked;
            electives.push({ name, credits: parseInt(credits), checked: isChecked });
        });
        localStorage.setItem('electives', JSON.stringify(electives));
    }

    // Función para añadir una electiva al DOM y guardar
    function addElective(name, credits, isChecked = false) {
        if (!name || isNaN(credits) || credits <= 0) {
            alert('Por favor, ingresa un nombre y créditos válidos para la electiva.');
            return;
        }

        const electiveItem = document.createElement('div');
        electiveItem.classList.add('elective-item');
        electiveItem.innerHTML = `
            <label>
                <input type="checkbox" data-credits="${credits}" ${isChecked ? 'checked' : ''}>
                <span class="elective-name">${name}</span>
            </label>
            <span class="elective-credits" data-credits="${credits}">Cr: ${credits}</span>
            <button class="remove-elective-btn">X</button>
        `;

        // Añadir evento para el checkbox de la electiva
        const electiveCheckbox = electiveItem.querySelector('input[type="checkbox"]');
        electiveCheckbox.addEventListener('change', () => {
            updateTotalElectivesCredits();
            saveElectives(); // Guardar el estado de checked
        });

        // Añadir evento para eliminar la electiva
        const removeButton = electiveItem.querySelector('.remove-elective-btn');
        removeButton.addEventListener('click', () => {
            electiveItem.remove();
            updateTotalElectivesCredits();
            saveElectives(); // Guardar después de eliminar
        });

        // Insertar la nueva electiva antes del grupo de input si no es el input group
        if (electiveCoursesList.lastElementChild && !electiveCoursesList.lastElementChild.classList.contains('elective-input-group')) {
             electiveCoursesList.appendChild(electiveItem);
        } else if (electiveCoursesList.firstElementChild && electiveCoursesList.firstElementChild.classList.contains('elective-input-group')) {
            electiveCoursesList.insertBefore(electiveItem, electiveCoursesList.firstElementChild.nextSibling); // Inserta después del input group
        } else {
            electiveCoursesList.appendChild(electiveItem); // Si no hay nada, simplemente añade
        }


        electiveNameInput.value = '';
        electiveCreditsInput.value = '';
        updateTotalElectivesCredits(); // Recalcular total inmediatamente
    }

    // Cargar electivas guardadas al inicio
    function loadElectives() {
        const savedElectives = JSON.parse(localStorage.getItem('electives') || '[]');
        savedElectives.forEach(elective => {
            addElective(elective.name, elective.credits, elective.checked);
        });
        updateTotalElectivesCredits(); // Asegurarse de que el total sea correcto al cargar
    }

    // Evento para el botón "Agregar Electiva"
    addElectiveBtn.addEventListener('click', () => {
        const name = electiveNameInput.value.trim();
        const credits = parseInt(electiveCreditsInput.value);
        addElective(name, credits);
        saveElectives(); // Guardar la nueva electiva
    });

    // Permitir agregar con Enter en los campos de input
    electiveNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addElectiveBtn.click();
        }
    });
    electiveCreditsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addElectiveBtn.click();
        }
    });


    // Ejecutar al cargar la página
    loadElectives();
});
