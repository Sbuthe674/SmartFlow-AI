// Переводы для интерфейса
const translations = {
    ru: {
        // Общие
        lang_current: 'RU',
        lang_ru: 'RU',
        lang_kz: 'KZ', 
        lang_en: 'EN',
        system_status: 'СИСТЕМА АКТИВНА',
        
        // Меню
        menu_monitoring: 'МОНИТОРИНГ',
        menu_overview: 'Обзор (Mission Control)',
        menu_incidents: 'Лента Инцидентов',
        menu_ai_management: 'УПРАВЛЕНИЕ AI',
        menu_knowledge: 'База Знаний (RAG)',
        menu_routing: 'Правила Маршрутизации',
        menu_training: 'Обучение Модели',
        menu_reports: 'ОТЧЕТНОСТЬ',
        menu_sla: 'SLA & KPI',
        menu_lang_stats: 'Языковая Статистика',
        
        // KPI
        kpi_automation: 'Автоматизация',
        kpi_goal: 'Цель: 50%',
        kpi_accuracy: 'Точность AI',
        kpi_errors: 'Ошибки: 0.9%',
        kpi_fte_saved: 'Сэкономлено FTE',
        kpi_first_line: '1-я линия',
        kpi_avg_sla: 'Avg. SLA',
        kpi_instant: 'Мгновенно'
    },
    kz: {
        // Общие
        lang_current: 'KZ',
        lang_ru: 'RU',
        lang_kz: 'KZ',
        lang_en: 'EN',
        system_status: 'ЖҮЙЕ БЕЛСЕНДІ',
        
        // Меню
        menu_monitoring: 'МОНИТОРИНГ',
        menu_overview: 'Шолу (Mission Control)',
        menu_incidents: 'Оқиғалар жолағы',
        menu_ai_management: 'AI БАСҚАРУ',
        menu_knowledge: 'Білім базасы (RAG)',
        menu_routing: 'Бағыттау ережелері',
        menu_training: 'Модельді оқыту',
        menu_reports: 'ЕСЕПТІЛІК',
        menu_sla: 'SLA & KPI',
        menu_lang_stats: 'Тілдік статистика',
        
        // KPI
        kpi_automation: 'Автоматтандыру',
        kpi_goal: 'Мақсат: 50%',
        kpi_accuracy: 'AI дәлдігі',
        kpi_errors: 'Қателер: 0.9%',
        kpi_fte_saved: 'Үнемделген FTE',
        kpi_first_line: '1-ші желі',
        kpi_avg_sla: 'Орташа SLA',
        kpi_instant: 'Лезде'
    },
    en: {
        // Общие
        lang_current: 'EN',
        lang_ru: 'RU',
        lang_kz: 'KZ',
        lang_en: 'EN', 
        system_status: 'SYSTEM ACTIVE',
        
        // Меню
        menu_monitoring: 'MONITORING',
        menu_overview: 'Overview (Mission Control)',
        menu_incidents: 'Incidents Feed',
        menu_ai_management: 'AI MANAGEMENT',
        menu_knowledge: 'Knowledge Base (RAG)',
        menu_routing: 'Routing Rules',
        menu_training: 'Model Training',
        menu_reports: 'REPORTS',
        menu_sla: 'SLA & KPI',
        menu_lang_stats: 'Language Statistics',
        
        // KPI
        kpi_automation: 'Automation',
        kpi_goal: 'Goal: 50%',
        kpi_accuracy: 'AI Accuracy',
        kpi_errors: 'Errors: 0.9%',
        kpi_fte_saved: 'FTE Saved',
        kpi_first_line: '1st line',
        kpi_avg_sla: 'Avg. SLA',
        kpi_instant: 'Instant'
    }
};

let currentLang = 'ru';

// Функция обновления контента
function updateContent(lang) {
    const langData = translations[lang] || translations['ru'];
    
    // Обновляем все элементы с data-key
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (langData[key]) {
            element.textContent = langData[key];
        }
    });
    
    // Обновляем язык документа и отображаемый язык
    document.documentElement.lang = lang;
    const currentLangElement = document.querySelector('.current-lang');
    if (currentLangElement) {
        currentLangElement.textContent = langData.lang_current;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Инициализация языка
    updateContent(currentLang);
    
    // Обработчики переключения языка
    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', function() {
            const newLang = this.getAttribute('data-lang');
            if (newLang !== currentLang) {
                currentLang = newLang;
                updateContent(currentLang);
            }
        });
    });
    
    // Закрытие dropdown при клике вне его
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.language-switcher')) {
            document.querySelectorAll('.lang-dropdown').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });
    
    // Load user data from localStorage
    const userData = localStorage.getItem('user');
    const userType = localStorage.getItem('user_type');
    
    if (userData && userType === 'company') {
        try {
            const user = JSON.parse(userData);
            
            // Update user info in sidebar
            const userNameElement = document.querySelector('.user-name');
            const userRoleElement = document.querySelector('.user-role');
            
            if (userNameElement) {
                userNameElement.textContent = user.company_name || user.username || 'Company';
            }
            if (userRoleElement) {
                userRoleElement.textContent = 'Administrator';
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных пользователя:', error);
        }
    } else if (!userData) {
        // Redirect to main page if no user data
        window.location.href = 'http://localhost:3000/';
        return;
    }
    
    // Logout button handler
    document.querySelector('.logout-btn').addEventListener('click', function() {
        localStorage.removeItem('user');
        localStorage.removeItem('user_type');
        localStorage.removeItem('access_token');
        window.location.href = 'http://localhost:3000/';
    });
    
    // Navigation between sections
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            if (!targetSection) return;
            
            // Remove active class from all menu items
            document.querySelectorAll('.menu-item').forEach(menuItem => {
                menuItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.section-content').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show target section
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.style.display = 'block';
            }
        });
    });
    
    // 1. ГЕНЕРАТОР ИНЦИДЕНТОВ (LIVE FEED)
    const logFeed = document.getElementById('log-feed');
    
    const messages = [
        { text: "Құпия сөзді қалай өзгертуге болады?", lang: "KZ", type: "Chat" },
        { text: "Ошибка 404 при входе в CRM", lang: "RU", type: "Portal" },
        { text: "Не работает VPN подключение", lang: "RU", type: "Email" },
        { text: "Справка 2-НДФЛ қажет", lang: "KZ", type: "Chat" },
        { text: "Access denied to folder X", lang: "EN", type: "Email" },
        { text: "Принтер не печатает на 3 этаже", lang: "RU", type: "Portal" }
    ];

    function addLogEntry() {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const time = new Date().toLocaleTimeString('ru-RU');
        
        // Логика решения (симуляция)
        const isAuto = Math.random() > 0.3; // 70% авто
        const actionText = isAuto ? "→ Отправлена инструкция (Auto)" : "→ Эскалация на L2 (Support)";
        const actionClass = isAuto ? "action-auto" : "action-escalate";

        const div = document.createElement('div');
        div.className = 'log-item';
        div.innerHTML = `
            <div class="log-time">${time}</div>
            <div class="log-content">
                <span class="tag tag-${msg.lang === 'KZ' ? 'kz' : 'chat'}">${msg.lang}</span>
                <span class="tag tag-chat">${msg.type}</span>
                <span class="log-msg">"${msg.text}"</span>
            </div>
            <div class="log-action ${actionClass}">${actionText}</div>
        `;

        // Добавляем наверх с анимацией
        div.style.animation = "fadeIn 0.5s ease";
        logFeed.insertBefore(div, logFeed.firstChild);

        // Удаляем старые, если больше 20
        if (logFeed.children.length > 20) {
            logFeed.lastElementChild.remove();
        }
    }

    // Запускаем генерацию каждые 2-4 секунды
    setInterval(addLogEntry, 2500);
    addLogEntry(); // Сразу один

    // 2. АНИМАЦИЯ ПОТОКА (Случайные всплески на линиях SVG)
    const connectionLines = document.querySelectorAll('.connection-line');
    
    setInterval(() => {
        connectionLines.forEach(line => {
            // Случайное изменение скорости анимации для эффекта нагрузки
            const speed = (Math.random() * 0.5 + 0.5) + 's';
            line.style.animationDuration = speed;
            
            // Случайный цвет (иногда красный при нагрузке)
            if (Math.random() > 0.9) {
                line.style.stroke = 'var(--accent-red)';
            } else {
                line.style.stroke = 'var(--border-panel)';
            }
        });
    }, 2000);

    // 3. ОБНОВЛЕНИЕ KPI
    const kpiValues = document.querySelectorAll('.kpi-mini .value');
    
    setInterval(() => {
        kpiValues.forEach(kpi => {
            if (kpi.textContent.includes('%')) {
                let val = parseFloat(kpi.textContent);
                let change = (Math.random() - 0.5) * 0.2;
                val = (val + change).toFixed(1);
                if (val > 100) val = 100;
                kpi.textContent = val + '%';
            }
        });
    }, 3000);

    // === ФУНКЦИОНАЛЬНОСТЬ ИНЦИДЕНТОВ ===
    
    // Обработчики для кнопок действий с инцидентами
    function setupIncidentActions() {
        console.log('🔧 Настраиваю обработчики кнопок инцидентов...');
        
        // Кнопки "Просмотр"
        document.querySelectorAll('.action-btn.view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const incidentItem = e.target.closest('.incident-item');
                const incidentId = incidentItem.querySelector('.incident-id').textContent;
                viewIncident(incidentId, incidentItem);
            });
        });
        
        // Кнопки "Эскалация"
        document.querySelectorAll('.action-btn.escalate').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const incidentItem = e.target.closest('.incident-item');
                const incidentId = incidentItem.querySelector('.incident-id').textContent;
                escalateIncident(incidentId, incidentItem);
            });
        });
        
        // Кнопки "Решить"
        document.querySelectorAll('.action-btn.resolve').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const incidentItem = e.target.closest('.incident-item');
                const incidentId = incidentItem.querySelector('.incident-id').textContent;
                resolveIncident(incidentId, incidentItem);
            });
        });
        
        // Кнопка обновления
        document.querySelector('.refresh-btn').addEventListener('click', (e) => {
            e.preventDefault();
            refreshIncidents();
        });
        
        // Фильтр по типам
        document.querySelector('.filter-select').addEventListener('change', (e) => {
            filterIncidents(e.target.value);
        });
        
        // Фильтр по времени
        document.querySelector('.time-filter').addEventListener('change', (e) => {
            updateIncidentStats(e.target.value);
        });
        
        console.log('✅ Обработчики инцидентов установлены');
    }
    
    // Функция просмотра инцидента
    function viewIncident(incidentId, incidentElement) {
        console.log('👁️ Просмотр инцидента:', incidentId);
        
        const incidentTitle = incidentElement.querySelector('.incident-title').textContent;
        const incidentPriority = incidentElement.querySelector('.incident-priority').textContent;
        const incidentTime = incidentElement.querySelector('.incident-time').textContent;
        const incidentImpact = incidentElement.querySelector('.incident-impact').textContent;
        const incidentAssignee = incidentElement.querySelector('.incident-assignee').textContent;
        
        // Создаем модальное окно с деталями
        showIncidentModal({
            id: incidentId,
            title: incidentTitle,
            priority: incidentPriority,
            time: incidentTime,
            impact: incidentImpact,
            assignee: incidentAssignee,
            status: 'Активный',
            description: 'Подробное описание инцидента будет загружено из системы мониторинга...'
        });
    }
    
    // Функция эскалации инцидента
    function escalateIncident(incidentId, incidentElement) {
        console.log('⚡ Эскалация инцидента:', incidentId);
        
        if (confirm('Вы уверены, что хотите эскалировать этот инцидент?')) {
            // Обновляем приоритет
            const priorityElement = incidentElement.querySelector('.incident-priority');
            const currentPriority = priorityElement.textContent;
            
            let newPriority = 'КРИТИЧЕСКИЙ';
            let newClass = 'critical';
            
            if (currentPriority === 'СРЕДНИЙ') {
                newPriority = 'ВЫСОКИЙ';
                newClass = 'high';
            } else if (currentPriority === 'ВЫСОКИЙ') {
                newPriority = 'КРИТИЧЕСКИЙ';
                newClass = 'critical';
            }
            
            priorityElement.textContent = newPriority;
            priorityElement.className = `incident-priority ${newClass}`;
            incidentElement.className = `incident-item ${newClass}`;
            
            // Обновляем время
            incidentElement.querySelector('.incident-time').textContent = 'только что';
            
            showNotification(`Инцидент ${incidentId} эскалирован до уровня "${newPriority}"`, 'warning');
            
            // Эмуляция отправки в систему
            setTimeout(() => {
                console.log(`📡 Инцидент ${incidentId} эскалирован в системе`);
            }, 1000);
        }
    }
    
    // Функция решения инцидента
    function resolveIncident(incidentId, incidentElement) {
        console.log('✅ Решение инцидента:', incidentId);
        
        if (confirm('Вы уверены, что инцидент решен?')) {
            // Анимация решения
            incidentElement.style.transition = 'all 0.3s ease';
            incidentElement.style.opacity = '0.5';
            incidentElement.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                incidentElement.remove();
                updateIncidentCount(-1);
                showNotification(`Инцидент ${incidentId} успешно решен`, 'success');
            }, 300);
            
            // Эмуляция обновления в системе
            setTimeout(() => {
                console.log(`📡 Инцидент ${incidentId} отмечен как решенный в системе`);
            }, 1000);
        }
    }
    
    // Функция обновления списка инцидентов
    function refreshIncidents() {
        console.log('🔄 Обновление списка инцидентов...');
        
        const refreshBtn = document.querySelector('.refresh-btn');
        const originalText = refreshBtn.textContent;
        
        refreshBtn.textContent = '⏳';
        refreshBtn.disabled = true;
        
        // Эмуляция загрузки
        setTimeout(() => {
            refreshBtn.textContent = originalText;
            refreshBtn.disabled = false;
            showNotification('Список инцидентов обновлен', 'info');
            
            // Можно добавить логику реальной загрузки данных
            console.log('📡 Данные инцидентов синхронизированы с сервером');
        }, 1500);
    }
    
    // Функция фильтрации инцидентов
    function filterIncidents(filterType) {
        console.log('🔍 Фильтрация инцидентов по:', filterType);
        
        const incidents = document.querySelectorAll('.incident-item');
        
        incidents.forEach(incident => {
            const priority = incident.querySelector('.incident-priority').textContent.toLowerCase();
            let shouldShow = true;
            
            switch (filterType) {
                case 'Критические':
                    shouldShow = priority.includes('критический');
                    break;
                case 'Высокие':
                    shouldShow = priority.includes('высокий');
                    break;
                case 'Средние':
                    shouldShow = priority.includes('средний');
                    break;
                default: // 'Все типы'
                    shouldShow = true;
            }
            
            incident.style.display = shouldShow ? 'block' : 'none';
        });
        
        showNotification(`Применен фильтр: ${filterType}`, 'info');
    }
    
    // Функция показа модального окна с деталями инцидента
    function showIncidentModal(incident) {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'incident-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${incident.id}: ${incident.title}</h3>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <div class="incident-info-grid">
                        <div class="info-item">
                            <label>Приоритет:</label>
                            <span class="priority-badge ${incident.priority.toLowerCase()}">${incident.priority}</span>
                        </div>
                        <div class="info-item">
                            <label>Время создания:</label>
                            <span>${incident.time}</span>
                        </div>
                        <div class="info-item">
                            <label>Статус:</label>
                            <span class="status-active">${incident.status}</span>
                        </div>
                        <div class="info-item">
                            <label>Воздействие:</label>
                            <span>${incident.impact}</span>
                        </div>
                        <div class="info-item">
                            <label>Назначен:</label>
                            <span>${incident.assignee}</span>
                        </div>
                    </div>
                    <div class="incident-description">
                        <h4>Описание:</h4>
                        <p>${incident.description}</p>
                    </div>
                    <div class="incident-timeline">
                        <h4>Временная шкала:</h4>
                        <div class="timeline-item">
                            <span class="timeline-time">${incident.time}</span>
                            <span class="timeline-event">Инцидент создан автоматически</span>
                        </div>
                        <div class="timeline-item">
                            <span class="timeline-time">1 мин назад</span>
                            <span class="timeline-event">Назначена команда для расследования</span>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary modal-close">Закрыть</button>
                    <button class="btn-primary" onclick="escalateCurrentIncident('${incident.id}')">Эскалировать</button>
                    <button class="btn-success" onclick="resolveCurrentIncident('${incident.id}')">Решить</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Обработчики для закрытия модального окна
        modal.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
            el.addEventListener('click', () => {
                modal.remove();
            });
        });
    }
    
    // Функция обновления счетчика инцидентов
    function updateIncidentCount(change) {
        const activeCountElement = document.querySelector('.stat-card.red .stat-number');
        const currentCount = parseInt(activeCountElement.textContent);
        const newCount = Math.max(0, currentCount + change);
        activeCountElement.textContent = newCount;
        
        // Обновляем также счетчик решенных
        if (change < 0) {
            const resolvedCountElement = document.querySelector('.stat-card.orange .stat-number');
            const resolvedCount = parseInt(resolvedCountElement.textContent);
            resolvedCountElement.textContent = resolvedCount + Math.abs(change);
        }
    }
    
    // Функция обновления статистики инцидентов
    function updateIncidentStats(period) {
        console.log('📊 Обновление статистики за период:', period);
        
        // Эмуляция загрузки новых данных
        const statCards = document.querySelectorAll('.stat-card .stat-number');
        statCards.forEach(card => {
            if (!card.textContent.includes('%')) {
                const currentValue = parseInt(card.textContent);
                const variation = Math.floor(Math.random() * 5) - 2; // ±2
                const newValue = Math.max(0, currentValue + variation);
                card.textContent = newValue;
            }
        });
        
        showNotification(`Статистика обновлена для периода: ${period}`, 'info');
    }
    
    // Функция показа уведомлений
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : type === 'error' ? '#F44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Инициализация функциональности инцидентов
    setupIncidentActions();

});

// === ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ МОДАЛЬНОГО ОКНА ===

// Функция эскалации из модального окна
window.escalateCurrentIncident = function(incidentId) {
    console.log('⚡ Эскалация из модального окна:', incidentId);
    
    const incidentElements = document.querySelectorAll('.incident-item');
    let targetIncident = null;
    
    incidentElements.forEach(element => {
        if (element.querySelector('.incident-id').textContent === incidentId) {
            targetIncident = element;
        }
    });
    
    if (targetIncident) {
        const priorityElement = targetIncident.querySelector('.incident-priority');
        const currentPriority = priorityElement.textContent;
        
        let newPriority = 'КРИТИЧЕСКИЙ';
        let newClass = 'critical';
        
        if (currentPriority === 'СРЕДНИЙ') {
            newPriority = 'ВЫСОКИЙ';
            newClass = 'high';
        } else if (currentPriority === 'ВЫСОКИЙ') {
            newPriority = 'КРИТИЧЕСКИЙ';
            newClass = 'critical';
        }
        
        priorityElement.textContent = newPriority;
        priorityElement.className = `incident-priority ${newClass}`;
        targetIncident.className = `incident-item ${newClass}`;
        targetIncident.querySelector('.incident-time').textContent = 'только что';
        
        // Обновляем приоритет в модальном окне
        const modalPriorityBadge = document.querySelector('.priority-badge');
        if (modalPriorityBadge) {
            modalPriorityBadge.textContent = newPriority;
            modalPriorityBadge.className = `priority-badge ${newPriority.toLowerCase()}`;
        }
        
        showModalNotification(`Инцидент ${incidentId} эскалирован до уровня "${newPriority}"`, 'warning');
    }
    
    // Закрываем модальное окно
    const modal = document.querySelector('.incident-modal');
    if (modal) modal.remove();
};

// Функция решения из модального окна
window.resolveCurrentIncident = function(incidentId) {
    console.log('✅ Решение из модального окна:', incidentId);
    
    if (confirm('Вы уверены, что инцидент решен?')) {
        const incidentElements = document.querySelectorAll('.incident-item');
        let targetIncident = null;
        
        incidentElements.forEach(element => {
            if (element.querySelector('.incident-id').textContent === incidentId) {
                targetIncident = element;
            }
        });
        
        if (targetIncident) {
            targetIncident.style.transition = 'all 0.3s ease';
            targetIncident.style.opacity = '0.5';
            targetIncident.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                targetIncident.remove();
                updateIncidentCountGlobal(-1);
                showModalNotification(`Инцидент ${incidentId} успешно решен`, 'success');
            }, 300);
        }
        
        // Закрываем модальное окно
        const modal = document.querySelector('.incident-modal');
        if (modal) modal.remove();
    }
};

// Глобальная функция обновления счетчика (доступна из модального окна)
window.updateIncidentCountGlobal = function(change) {
    const activeCountElement = document.querySelector('.stat-card.red .stat-number');
    if (activeCountElement) {
        const currentCount = parseInt(activeCountElement.textContent);
        const newCount = Math.max(0, currentCount + change);
        activeCountElement.textContent = newCount;
        
        // Обновляем также счетчик решенных
        if (change < 0) {
            const resolvedCountElement = document.querySelector('.stat-card.orange .stat-number');
            if (resolvedCountElement) {
                const resolvedCount = parseInt(resolvedCountElement.textContent);
                resolvedCountElement.textContent = resolvedCount + Math.abs(change);
            }
        }
    }
};

// Функция показа уведомлений для модального окна
window.showModalNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `modal-notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10001;
        box-shadow: 0 8px 25px rgba(0,0,0,0.4);
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.1);
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
};

// Добавляем стиль анимации в JS
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(styleSheet);