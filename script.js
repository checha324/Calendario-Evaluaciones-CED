        // ==========================================
        // 1. ESTADO GLOBAL DE LA APLICACIÓN (Base de Datos en Memoria)
        // ==========================================
        let state = {
            careers: [
                { id: "c_1", name: "Bachillerato en Computación" },
                { id: "c_2", name: "Bachillerato en Finanzas" },
                { id: "c_3", name: "Bachillerato en Marketing" }
            ],
            courses: [
                // Comunes (con campos manualDay y manualSlot)
                { id: "crs_1", name: "Matemáticas Avanzadas", teacher: "Prof. González", careers: ["c_1", "c_2", "c_3"], manualDay: "", manualSlot: "" },
                { id: "crs_2", name: "Lenguaje y Literatura", teacher: "Profa. Morales", careers: ["c_1", "c_2", "c_3"], manualDay: "", manualSlot: "" },
                { id: "crs_3", name: "Inglés Técnico", teacher: "Prof. Smith", careers: ["c_1", "c_2", "c_3"], manualDay: "", manualSlot: "" },
                { id: "crs_4", name: "Emprendimiento", teacher: "Prof. Díaz", careers: ["c_2", "c_3"], manualDay: "", manualSlot: "" },
                // Específicos
                { id: "crs_5", name: "Programación I", teacher: "Prof. Pérez", careers: ["c_1"], manualDay: "", manualSlot: "" },
                { id: "crs_6", name: "Redes y Seguridad", teacher: "Prof. Pérez", careers: ["c_1"], manualDay: "", manualSlot: "" },
                { id: "crs_7", name: "Contabilidad General", teacher: "Profa. Lima", careers: ["c_2"], manualDay: "", manualSlot: "" },
                { id: "crs_8", name: "Microeconomía", teacher: "Prof. Juárez", careers: ["c_2"], manualDay: "", manualSlot: "" },
                { id: "crs_9", name: "Publicidad Digital", teacher: "Profa. Castro", careers: ["c_3"], manualDay: "", manualSlot: "" }
            ]
        };

        // Variables para renderizado final
        let generatedSchedule = {}; 
        let generationMetadata = {};

        // Inicializar aplicación
        document.addEventListener('DOMContentLoaded', () => {
            // Fecha por defecto: próximo lunes
            const hoy = new Date();
            const diasParaLunes = (8 - hoy.getDay()) % 7 || 7;
            const proximoLunes = new Date(hoy.setDate(hoy.getDate() + diasParaLunes));
            document.getElementById('startDate').valueAsDate = proximoLunes;

            updateAllUIs();
        });

        // ==========================================
        // 2. CONTROLADORES DE INTERFAZ (Tabs & Renders)
        // ==========================================
        function switchTab(tabId) {
            if (tabId === 'calendar') {
                processAndGenerate(); // Auto-generar al entrar a la pestaña calendario
            }
            if (tabId === 'manual') {
                renderManualCourses(); // Refrescar listas al entrar
            }

            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            
            document.getElementById(`tab-${tabId}`).classList.add('active');
            document.querySelector(`button[onclick="switchTab('${tabId}')"]`).classList.add('active');
        }

        function updateAllUIs() {
            renderCareersList();
            renderCoursesList();
            renderCareerCheckboxes();
            renderManualCourses();
        }

        // --- CRUD Carreras ---
        function addCareer(e) {
            e.preventDefault();
            const nameInput = document.getElementById('careerName');
            const newId = 'c_' + Date.now();
            
            state.careers.push({ id: newId, name: nameInput.value });
            nameInput.value = '';
            
            updateAllUIs();
            showStatus('Carrera agregada correctamente');
        }

        function deleteCareer(id) {
            if(!confirm('¿Eliminar carrera? Se quitará de todos los cursos asociados.')) return;
            state.careers = state.careers.filter(c => c.id !== id);
            // Limpiar carreras de los cursos
            state.courses.forEach(course => {
                course.careers = course.careers.filter(cId => cId !== id);
            });
            updateAllUIs();
        }

        function renderCareersList() {
            const list = document.getElementById('careersList');
            list.innerHTML = state.careers.map(c => `
                <li class="data-item">
                    <div class="data-item-info"><strong>${c.name}</strong></div>
                    <button class="btn btn-sm btn-danger" onclick="deleteCareer('${c.id}')">Eliminar</button>
                </li>
            `).join('');
        }

        function renderCareerCheckboxes() {
            const container = document.getElementById('courseCareersCheckboxes');
            if(state.careers.length === 0) {
                container.innerHTML = '<span style="color:var(--danger)">Primero debes agregar carreras.</span>';
                return;
            }
            container.innerHTML = state.careers.map(c => `
                <label class="checkbox-item">
                    <input type="checkbox" name="selectedCareers" value="${c.id}">
                    ${c.name}
                </label>
            `).join('');
        }

        // --- CRUD Cursos ---
        function addCourse(e) {
            e.preventDefault();
            const name = document.getElementById('courseName').value;
            const teacher = document.getElementById('courseTeacher').value;
            
            const checkboxes = document.querySelectorAll('input[name="selectedCareers"]:checked');
            const selectedCareers = Array.from(checkboxes).map(cb => cb.value);

            if (selectedCareers.length === 0) {
                alert("Debes seleccionar al menos una carrera para este curso.");
                return;
            }

            const newId = 'crs_' + Date.now();
            state.courses.push({
                id: newId,
                name,
                teacher,
                careers: selectedCareers,
                manualDay: "",
                manualSlot: ""
            });

            document.getElementById('formCourse').reset();
            updateAllUIs();
            showStatus('Curso agregado correctamente');
        }

        function deleteCourse(id) {
            if(!confirm('¿Eliminar este curso?')) return;
            state.courses = state.courses.filter(c => c.id !== id);
            updateAllUIs();
        }

        function renderCoursesList() {
            const list = document.getElementById('coursesList');
            list.innerHTML = state.courses.map(c => {
                const careerNames = c.careers.map(cId => {
                    const career = state.careers.find(car => car.id === cId);
                    return career ? `<span class="badge">${career.name}</span>` : '';
                }).join('');

                return `
                <li class="data-item">
                    <div class="data-item-info">
                        <strong>${c.name}</strong>
                        <span>🧑‍🏫 ${c.teacher}</span>
                        <div style="margin-top: 5px;">${careerNames}</div>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="deleteCourse('${c.id}')">Eliminar</button>
                </li>
                `;
            }).join('');
        }

        // --- Lógica de Asignación Manual ---
        function updateManualOptions() {
            renderManualCourses(); // Vuelve a renderizar para actualizar el selector de "Bloques" si cambia a 2 o 3 exámenes
        }

        function handleManualChange(courseId, field, value) {
            const course = state.courses.find(c => c.id === courseId);
            if(course) {
                course[field] = value;
            }
        }

        function renderManualCourses() {
            const tbody = document.getElementById('manualCoursesBody');
            const examsPerDay = parseInt(document.getElementById('examsPerDay').value);
            
            // Filtrar solo cursos que pertenecen a más de 1 carrera (Comunes)
            const commonCourses = state.courses.filter(c => c.careers.length > 1);

            if (commonCourses.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted)">No hay cursos comunes registrados actualmente.</td></tr>`;
                return;
            }

            // Opciones de Día (Ofrecemos 10 días de examen como máximo seguro para planificar)
            let dayOptions = `<option value="">Automático (Recomendado)</option>`;
            for(let i=1; i<=10; i++) dayOptions += `<option value="${i}">Día ${i}</option>`;

            // Opciones de Bloque
            let slotOptions = `<option value="">Automático</option>`;
            for(let i=1; i<=examsPerDay; i++) slotOptions += `<option value="${i}">Examen ${i}</option>`;

            tbody.innerHTML = commonCourses.map(c => {
                const careerNames = c.careers.map(cId => state.careers.find(car => car.id === cId)?.name).join(', ');
                
                // Preseleccionar si ya tenían valores
                const daySelect = dayOptions.replace(`value="${c.manualDay}"`, `value="${c.manualDay}" selected`);
                const slotSelect = slotOptions.replace(`value="${c.manualSlot}"`, `value="${c.manualSlot}" selected`);

                return `
                <tr>
                    <td><strong>${c.name}</strong><br><span style="font-size:0.8rem; color:var(--text-muted)">${c.teacher}</span></td>
                    <td style="font-size:0.85rem;">${careerNames}</td>
                    <td>
                        <select class="form-control" onchange="handleManualChange('${c.id}', 'manualDay', this.value)">
                            ${daySelect}
                        </select>
                    </td>
                    <td>
                        <select class="form-control" onchange="handleManualChange('${c.id}', 'manualSlot', this.value)">
                            ${slotSelect}
                        </select>
                    </td>
                </tr>
                `;
            }).join('');
        }

        function showStatus(msg) {
            const el = document.getElementById('status');
            el.innerHTML = `<span style="color:var(--success)">✅ ${msg}</span>`;
            setTimeout(() => el.innerHTML = 'Plataforma lista.', 3000);
        }

        // ==========================================
        // 3. MOTOR DEL ALGORITMO HÍBRIDO (Manual + Greedy)
        // ==========================================
        function processAndGenerate() {
            try {
                // 1. Obtener parámetros
                const startDateStr = document.getElementById('startDate').value;
                const examsPerDay = parseInt(document.getElementById('examsPerDay').value);
                const recessPosition = parseInt(document.getElementById('recessPosition').value);

                if (!startDateStr) throw new Error("Por favor, selecciona una fecha de inicio en la pestaña Parámetros.");
                if (state.careers.length === 0) throw new Error("No hay carreras registradas.");
                if (state.courses.length === 0) throw new Error("No hay cursos registrados.");

                // 2. Inicializar matrices
                const schedule = {}; // schedule[careerId][dayIndex][slotIndex]
                const teacherSchedule = {}; // teacherSchedule[teacherName][dayIndex][slotIndex]

                state.careers.forEach(c => { schedule[c.id] = []; });

                // Función auxiliar para expandir la matriz de días dinámicamente
                function ensureMatrixCapacity(dayIndex) {
                    state.careers.forEach(c => {
                        while (schedule[c.id].length <= dayIndex) {
                            schedule[c.id].push(new Array(examsPerDay).fill(null));
                        }
                    });
                }

                // 3. FASE 1: ASIGNACIÓN MANUAL (Prioridad Absoluta)
                let manualCourses = state.courses.filter(c => c.manualDay !== "" && c.manualSlot !== "");
                
                manualCourses.forEach(course => {
                    const dayIndex = parseInt(course.manualDay) - 1; // UI es 1-based, JS es 0-based
                    const slotIndex = parseInt(course.manualSlot) - 1;
                    
                    ensureMatrixCapacity(dayIndex);

                    // Validar conflictos introducidos por el usuario
                    course.careers.forEach(careerId => {
                        if(schedule[careerId][dayIndex][slotIndex] !== null) {
                            throw new Error(`Conflicto Manual: La carrera ha sido asignada a dos exámenes en el Día ${dayIndex+1}, Examen ${slotIndex+1}. Revisa la pestaña de Cursos Comunes.`);
                        }
                        // Asignar
                        schedule[careerId][dayIndex][slotIndex] = course;
                    });

                    // Bloquear profesor
                    if (course.teacher) {
                        if (!teacherSchedule[course.teacher]) teacherSchedule[course.teacher] = [];
                        while (teacherSchedule[course.teacher].length <= dayIndex) teacherSchedule[course.teacher].push(new Array(examsPerDay).fill(null));
                        
                        if (teacherSchedule[course.teacher][dayIndex][slotIndex] !== null && teacherSchedule[course.teacher][dayIndex][slotIndex] !== course.id) {
                             throw new Error(`Conflicto de Profesor: ${course.teacher} ya tiene asignado otro examen el Día ${dayIndex+1}, Examen ${slotIndex+1}.`);
                        }
                        teacherSchedule[course.teacher][dayIndex][slotIndex] = course.id;
                    }
                });

                // 4. FASE 2: ASIGNACIÓN AUTOMÁTICA (Greedy)
                // Filtrar cursos no manuales y ordenarlos: Comunes primero
                let autoCourses = state.courses.filter(c => c.manualDay === "" || c.manualSlot === "");
                autoCourses.sort((a, b) => b.careers.length - a.careers.length);

                autoCourses.forEach(course => {
                    let dayIndex = 0;
                    let placed = false;
                    
                    while (!placed) {
                        ensureMatrixCapacity(dayIndex);

                        for (let slot = 0; slot < examsPerDay; slot++) {
                            let canAssign = true;

                            // Verificar disponibilidad en las carreras
                            for (let careerId of course.careers) {
                                if (schedule[careerId][dayIndex][slot] !== null) {
                                    canAssign = false; break;
                                }
                            }

                            // Verificar disponibilidad de profesor
                            if (canAssign && course.teacher) {
                                if (!teacherSchedule[course.teacher]) teacherSchedule[course.teacher] = [];
                                while (teacherSchedule[course.teacher].length <= dayIndex) teacherSchedule[course.teacher].push(new Array(examsPerDay).fill(null));
                                
                                const existing = teacherSchedule[course.teacher][dayIndex][slot];
                                if (existing !== null && existing !== course.id) {
                                    canAssign = false;
                                }
                            }

                            // Si pasó validaciones, se asigna
                            if (canAssign) {
                                course.careers.forEach(careerId => {
                                    schedule[careerId][dayIndex][slot] = course;
                                });
                                if (course.teacher) {
                                    teacherSchedule[course.teacher][dayIndex][slot] = course.id;
                                }
                                placed = true;
                                break; // Rompe el loop de slots
                            }
                        }
                        dayIndex++; // Si no cupo en el día, intentar en el siguiente
                    }
                });

                // 5. Determinar días totales
                let maxDays = 0;
                Object.values(schedule).forEach(daysArr => {
                    if (daysArr.length > maxDays) maxDays = daysArr.length;
                });

                // Guardar para renderizado
                generatedSchedule = schedule;
                generationMetadata = { startDateStr, examsPerDay, recessPosition, maxDays, careers: state.careers };

                renderCalendar();
                showStatus(`Calendario generado (${maxDays} días)`);

            } catch (error) {
                alert("❌ Error de Generación:\n\n" + error.message);
                // Si hay error, regresamos a la pestaña manual o config para que corrijan
            }
        }

        // ==========================================
        // 4. RENDERIZADO DEL CALENDARIO
        // ==========================================
        function addBusinessDays(startDateStr, daysToAdd) {
            let currentDate = new Date(startDateStr + 'T12:00:00');
            let resultDate = new Date(currentDate);
            let addedDays = 0;
            
            while (addedDays < daysToAdd) {
                resultDate.setDate(resultDate.getDate() + 1);
                if (resultDate.getDay() !== 0 && resultDate.getDay() !== 6) {
                    addedDays++; // Solo suma si no es Sab(6) o Dom(0)
                }
            }
            return resultDate;
        }

        function formatDate(date) {
            return date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();
        }

        function renderCalendar() {
            const container = document.getElementById('calendar-render-area');
            container.innerHTML = ''; 
            
            const { startDateStr, examsPerDay, recessPosition, maxDays, careers } = generationMetadata;
            const startDateObj = new Date(startDateStr + 'T12:00:00');

            // Cabeceras de días (saltando fines de semana)
            let dateHeaders = [];
            for (let i = 0; i < maxDays; i++) {
                let currentDay = i === 0 ? startDateObj : addBusinessDays(startDateStr, i);
                dateHeaders.push(`DÍA ${i+1}<br><span style="font-size:0.8em; font-weight:normal">${formatDate(currentDay)}</span>`);
            }

            careers.forEach(career => {
                const scheduleDays = generatedSchedule[career.id] || [];
                
                let html = `
                <div class="career-section">
                    <h3 class="career-title">${career.name}</h3>
                    <table class="cal-table">
                        <thead>
                            <tr>
                                <th class="time-col">Bloque</th>
                                ${dateHeaders.map(date => `<th>${date}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                `;

                for (let slot = 0; slot < examsPerDay; slot++) {
                    
                    if (slot === recessPosition) {
                        html += `
                        <tr class="recess-row">
                            <td class="time-col">RECREO</td>
                            <td colspan="${maxDays}">R E C E S O   G E N E R A L</td>
                        </tr>`;
                    }

                    html += `<tr><td class="time-col">Examen ${slot + 1}</td>`;
                    
                    for (let dayIndex = 0; dayIndex < maxDays; dayIndex++) {
                        const dayData = scheduleDays[dayIndex];
                        const course = dayData ? dayData[slot] : null;

                        if (course) {
                            // Identificar si fue asignado manualmente para cambiar su color
                            const isManual = (course.manualDay !== "" && course.manualSlot !== "");
                            const cardClass = isManual ? "course-card manual-assigned" : "course-card";
                            const typeBadge = course.careers.length > 1 ? `<span class="badge" style="background:rgba(255,255,255,0.5); color:#000; padding:2px 5px;">★ Común</span>` : '';

                            html += `
                            <td>
                                <div class="${cardClass}">
                                    <div style="margin-bottom:3px">${typeBadge}</div>
                                    <div class="course-name">${course.name}</div>
                                    <div class="course-teacher">${course.teacher}</div>
                                </div>
                            </td>`;
                        } else {
                            html += `<td><span class="empty-slot">-- Libre --</span></td>`;
                        }
                    }
                    html += `</tr>`;
                }

                if (recessPosition >= examsPerDay) {
                     html += `<tr class="recess-row"><td class="time-col">RECREO</td><td colspan="${maxDays}">R E C E S O   G E N E R A L</td></tr>`;
                }

                html += `</tbody></table></div>`;
                container.innerHTML += html;
            });
        }

        // ==========================================
        // 5. EXPORTACIÓN A PDF
        // ==========================================
        function downloadPDF() {
            const element = document.getElementById('pdf-content');
            
            const opt = {
                margin:       10,
                filename:     `Calendario_CED_${new Date().toLocaleDateString('es-ES')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'letter', orientation: 'landscape' }
            };

            showStatus('Generando PDF, por favor espera...');
            html2pdf().set(opt).from(element).save().then(() => {
                showStatus('PDF descargado exitosamente.');
            });
        }