document.addEventListener('DOMContentLoaded', () => {
    const courseItems = document.querySelectorAll('.year-block .course-item'); // Seleccionar div.course-item
    const totalElectivesCreditsSpan = document.getElementById('total-electives-credits');
    const addElectiveBtn = document.querySelector('.add-elective-btn');
    const electiveNameInput = document.querySelector('.new-elective-name');
    const electiveCreditsInput = document.querySelector('.new-elective-credits');
    const electiveCoursesList = document.getElementById('elective-courses');

    // --- Funcionalidad para cursos obligatorios (marcar aprobado con línea) ---
    courseItems.forEach(item => {
        const courseName = item.querySelector('.course-name').textContent; // Obtener el nombre del curso
        const savedState = localStorage.getItem(`course_${courseName}`);

        // Cargar estado guardado (si existe)
        if (savedState === 'approved') {
            item.classList.add('approved');
        }

        item.addEventListener('click', () => { // Escuchar clics en el div.course-item
            item.classList.toggle('approved'); // Alternar la clase 'approved'
            const currentCourseName = item.querySelector('.course-name').textContent;

            if (item.classList.contains('approved')) {
                localStorage.setItem(`course_${currentCourseName}`, 'approved');
            } else {
                localStorage.removeItem(`course_${currentCourseName}`); // Eliminar si se desmarca
            }
        });
    });

    // --- Funcionalidad para Electivas ---
    // (Esta sección permanece casi igual, ya que las electivas usan checkbox)

    // Función para calcular y mostrar el total de créditos de electivas
    function updateTotalElectivesCredits() {
        let totalCredits = 0;
        // Solo cuenta si el checkbox de la electiva está marcado
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
            // Asegúrate de obtener los créditos del span.elective-credits si el checkbox se elimina en el futuro
            const credits = item.querySelector('.elective-credits').dataset.credits;
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
        // El HTML para las electivas mantiene el checkbox
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
        electiveCheckbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                electiveItem.classList.add('approved');
            } else {
                electiveItem.classList.remove('approved');
            }
            updateTotalElectivesCredits();
            saveElectives(); // Guardar el estado de checked
        });

        // Asegurarse de que el color de fondo de la electiva se actualice al cargar
        if (isChecked) {
            electiveItem.classList.add('approved');
        }


        // Añadir evento para eliminar la electiva
        const removeButton = electiveItem.querySelector('.remove-elective-btn');
        removeButton.addEventListener('click', () => {
            electiveItem.remove();
            updateTotalElectivesCredits();
            saveElectives(); // Guardar después de eliminar
        });

        // Insertar la nueva electiva después del input group
        electiveCoursesList.insertBefore(electiveItem, electiveCoursesList.querySelector('.elective-input-group').nextSibling);

        electiveNameInput.value = '';
        electiveCreditsInput.value = '';
        updateTotalElectivesCredits(); // Recalcular total inmediatamente
        saveElectives(); // Guardar la nueva electiva
    }

    // Cargar electivas guardadas al inicio
    function loadElectives() {
        const savedElectives = JSON.parse(localStorage.getItem('electives') || '[]');
        // Insertar las electivas en el orden correcto (después del input group)
        savedElectives.forEach(elective => {
            // Asegurarse de que se añadan antes del input group
            const tempDiv = document.createElement('div'); // Crea un div temporal para contener el item antes de insertarlo
            tempDiv.innerHTML = `
                <div class="elective-item ${elective.checked ? 'approved' : ''}">
                    <label>
                        <input type="checkbox" data-credits="${elective.credits}" ${elective.checked ? 'checked' : ''}>
                        <span class="elective-name">${elective.name}</span>
                    </label>
                    <span class="elective-credits" data-credits="${elective.credits}">Cr: ${elective.credits}</span>
                    <button class="remove-elective-btn">X</button>
                </div>
            `;
            const newItem = tempDiv.firstElementChild; // Obtiene el div.elective-item

            // Añadir evento para el checkbox de la electiva
            const electiveCheckbox = newItem.querySelector('input[type="checkbox"]');
            electiveCheckbox.addEventListener('change', (event) => {
                if (event.target.checked) {
                    newItem.classList.add('approved');
                } else {
                    newItem.classList.remove('approved');
                }
                updateTotalElectivesCredits();
                saveElectives(); // Guardar el estado de checked
            });

            // Añadir evento para eliminar la electiva
            const removeButton = newItem.querySelector('.remove-elective-btn');
            removeButton.addEventListener('click', () => {
                newItem.remove();
                updateTotalElectivesCredits();
                saveElectives(); // Guardar después de eliminar
            });

            electiveCoursesList.insertBefore(newItem, electiveCoursesList.querySelector('.elective-input-group').nextSibling);
        });

        updateTotalElectivesCredits(); // Asegurarse de que el total sea correcto al cargar
    }

    // Evento para el botón "Agregar Electiva"
    addElectiveBtn.addEventListener('click', () => {
        const name = electiveNameInput.value.trim();
        const credits = parseInt(electiveCreditsInput.value);
        addElective(name, credits);
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
