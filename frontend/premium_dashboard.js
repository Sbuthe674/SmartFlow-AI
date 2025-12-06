// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:8000',
    ENDPOINTS: {
        TICKETS: '/api/tickets',
        USERS: '/api/users',
        AUTH: '/auth',
        EMAIL: '/api/email'
    }
};

// Визуализация маршрутизации в реальном времени
class FlowVisualization {
    constructor() {
        this.isActive = true;
        this.counters = {
            processed: 1847,
            automation: 52.4,
            avgResponse: 1.2
        };
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.setupControls();
        this.startRealTimeUpdates();
    }

    setupControls() {
        const startBtn = document.getElementById('start-viz');
        const pauseBtn = document.getElementById('pause-viz');
        const resetBtn = document.getElementById('reset-viz');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startVisualization());
        }
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pauseVisualization());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetVisualization());
        }
    }

    startVisualization() {
        this.isActive = true;
        this.toggleAnimations(true);
        this.updateButtonStates('start');
        this.startRealTimeUpdates();
    }

    pauseVisualization() {
        this.isActive = false;
        this.toggleAnimations(false);
        this.updateButtonStates('pause');
        this.stopRealTimeUpdates();
    }

    resetVisualization() {
        this.counters = { processed: 0, automation: 52.4, avgResponse: 1.2 };
        this.updateCounters();
        this.isActive = true;
        this.toggleAnimations(true);
        this.updateButtonStates('start');
    }

    toggleAnimations(active) {
        const svg = document.querySelector('.flow-svg');
        if (!svg) return;

        const animations = svg.querySelectorAll('animateMotion, animate, animateTransform');
        animations.forEach(anim => {
            if (active) {
                anim.beginElement();
            } else {
                anim.endElement();
            }
        });
    }

    updateButtonStates(activeState) {
        const buttons = {
            start: document.getElementById('start-viz'),
            pause: document.getElementById('pause-viz'),
            reset: document.getElementById('reset-viz')
        };

        // Remove active class from all buttons
        Object.values(buttons).forEach(btn => {
            if (btn) btn.classList.remove('active');
        });

        // Add active class to current button
        if (buttons[activeState]) {
            buttons[activeState].classList.add('active');
        }
    }

    startRealTimeUpdates() {
        if (this.updateInterval) return;
        
        this.updateInterval = setInterval(() => {
            if (this.isActive) {
                this.updateCounters();
            }
        }, 2000);
    }

    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    updateCounters() {
        // Simulate real-time data changes
        this.counters.processed += Math.floor(Math.random() * 5) + 1;
        this.counters.automation += (Math.random() - 0.5) * 0.2;
        this.counters.avgResponse += (Math.random() - 0.5) * 0.1;

        // Ensure realistic ranges
        this.counters.automation = Math.max(45, Math.min(60, this.counters.automation));
        this.counters.avgResponse = Math.max(0.8, Math.min(2.5, this.counters.avgResponse));

        // Update DOM
        this.updateCounterDisplay('processed-count', this.counters.processed.toLocaleString());
        this.updateCounterDisplay('automation-rate', `${this.counters.automation.toFixed(1)}%`);
        this.updateCounterDisplay('avg-response', `${this.counters.avgResponse.toFixed(1)}s`);
    }

    updateCounterDisplay(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            // Add pulse effect
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }
}

// Initialize flow visualization when DOM is loaded
let flowViz = null;

// Utility function for API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    // Add authorization header if token exists
    const token = localStorage.getItem('access_token');
    if (token) {
        defaultOptions.headers.Authorization = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Show notification function
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.api-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `api-notification api-notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 350px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#007bff'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// Check API connection
async function checkApiConnection() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/docs`);
        return response.ok;
    } catch (error) {
        console.error('API connection failed:', error);
        return false;
    }
}

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

document.addEventListener('DOMContentLoaded', async function() {
    
    // Проверка подключения к API
    const isApiConnected = await checkApiConnection();
    if (!isApiConnected) {
        console.error('❌ Не удалось подключиться к API серверу');
        showNotification('Ошибка подключения к серверу. Проверьте, что backend запущен на порту 8000.', 'error');
    } else {
        console.log('✅ Успешное подключение к API');
        showNotification('Подключение к серверу установлено', 'success');
    }
    
    // Инициализация языка
    updateContent(currentLang);
    
    // Инициализация визуализации потоков
    try {
        flowViz = new FlowVisualization();
        console.log('✅ Визуализация маршрутизации инициализирована');
    } catch (error) {
        console.error('❌ Ошибка инициализации визуализации:', error);
    }
    
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
        
        // Инициализация данных дашборда после загрузки пользователя
        setTimeout(initializeDashboard, 1000);
    } else if (!userData) {
        // Redirect to main page if no user data
        window.location.href = 'http://localhost:8081/';
        return;
    }
    
    // Logout button handler
    document.querySelector('.logout-btn').addEventListener('click', function() {
        localStorage.removeItem('user');
        localStorage.removeItem('user_type');
        localStorage.removeItem('access_token');
        window.location.href = 'http://localhost:8081/';
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
    
    // Initialize default active section (overview)
    function initializeActiveSection() {
        // Hide all sections first
        document.querySelectorAll('.section-content').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show overview section by default
        const overviewSection = document.getElementById('overview');
        if (overviewSection) {
            overviewSection.style.display = 'block';
        }
        
        // Make sure overview menu item is active
        document.querySelectorAll('.menu-item').forEach(menuItem => {
            menuItem.classList.remove('active');
        });
        
        const overviewMenuItem = document.querySelector('[data-section="overview"]');
        if (overviewMenuItem) {
            overviewMenuItem.classList.add('active');
        }
    }
    
    // Call initialization
    initializeActiveSection();
    
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
    
    // === ФУНКЦИОНАЛЬНОСТЬ БАЗЫ ЗНАНИЙ ===
    
    // Настройка обработчиков для базы знаний
    function setupKnowledgeBaseActions() {
        console.log('🧠 Настраиваю обработчики базы знаний...');
        
        // Кнопка добавления документа
        const addDocBtn = document.querySelector('.knowledge-actions .action-btn-primary');
        if (addDocBtn) {
            addDocBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showAddDocumentModal();
            });
        }
        
        // Кнопки редактирования документов
        document.querySelectorAll('.doc-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const docItem = e.target.closest('.knowledge-item');
                const docName = docItem.querySelector('.doc-name').textContent;
                editDocument(docName, docItem);
            });
        });
        
        // Кнопки удаления документов
        document.querySelectorAll('.doc-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const docItem = e.target.closest('.knowledge-item');
                const docName = docItem.querySelector('.doc-name').textContent;
                deleteDocument(docName, docItem);
            });
        });
        
        // Кнопка поиска
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                performSearch();
            });
        }
        
        // Поиск по Enter
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    performSearch();
                }
            });
        }
        
        console.log('✅ Обработчики базы знаний установлены');
    }
    
    // Функция показа модального окна добавления документа
    function showAddDocumentModal() {
        console.log('📄 Открываю модальное окно добавления документа');
        
        const modal = document.createElement('div');
        modal.className = 'knowledge-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📄 Добавить документ в базу знаний</h3>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <form id="add-document-form" class="document-form">
                        <div class="form-group">
                            <label for="doc-name">Название документа:</label>
                            <input type="text" id="doc-name" placeholder="Введите название документа" required>
                        </div>
                        <div class="form-group">
                            <label for="doc-type">Тип документа:</label>
                            <select id="doc-type">
                                <option value="pdf">📄 PDF</option>
                                <option value="docx">📝 Word Document</option>
                                <option value="xlsx">📊 Excel</option>
                                <option value="txt">📋 Текстовый файл</option>
                                <option value="md">📝 Markdown</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="doc-file">Файл:</label>
                            <div class="file-upload">
                                <input type="file" id="doc-file" accept=".pdf,.docx,.xlsx,.txt,.md">
                                <label for="doc-file" class="file-label">
                                    📎 Выберите файл или перетащите сюда
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="doc-description">Описание (опционально):</label>
                            <textarea id="doc-description" placeholder="Краткое описание содержимого документа"></textarea>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="doc-auto-index" checked>
                                Автоматически индексировать для поиска
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary modal-close">Отмена</button>
                    <button class="btn-primary" onclick="addDocument()">Добавить документ</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Обработчики закрытия
        modal.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
            el.addEventListener('click', () => modal.remove());
        });
        
        // Обработка drag & drop
        const fileUpload = modal.querySelector('.file-upload');
        const fileInput = modal.querySelector('#doc-file');
        
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.classList.add('dragover');
        });
        
        fileUpload.addEventListener('dragleave', () => {
            fileUpload.classList.remove('dragover');
        });
        
        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                updateFileLabel(files[0].name);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                updateFileLabel(e.target.files[0].name);
            }
        });
        
        function updateFileLabel(filename) {
            const label = modal.querySelector('.file-label');
            label.textContent = `📎 ${filename}`;
            label.style.color = 'var(--accent-green)';
        }
    }
    
    // Функция добавления документа
    function addDocument() {
        console.log('📝 Добавляю новый документ');
        
        const form = document.getElementById('add-document-form');
        const formData = new FormData(form);
        
        const docName = document.getElementById('doc-name').value;
        const docType = document.getElementById('doc-type').value;
        const docFile = document.getElementById('doc-file').files[0];
        const docDescription = document.getElementById('doc-description').value;
        const autoIndex = document.getElementById('doc-auto-index').checked;
        
        if (!docName) {
            showKnowledgeNotification('Введите название документа', 'error');
            return;
        }
        
        if (!docFile) {
            showKnowledgeNotification('Выберите файл для загрузки', 'error');
            return;
        }
        
        // Эмуляция загрузки
        const modal = document.querySelector('.knowledge-modal');
        const addBtn = modal.querySelector('.btn-primary');
        const originalText = addBtn.textContent;
        
        addBtn.textContent = '⏳ Загрузка...';
        addBtn.disabled = true;
        
        setTimeout(() => {
            // Добавляем документ в список
            addDocumentToList({
                name: docName,
                type: docType,
                file: docFile,
                description: docDescription,
                size: formatFileSize(docFile.size),
                status: 'active'
            });
            
            // Обновляем статистику
            updateKnowledgeStats(1, docFile.size);
            
            modal.remove();
            showKnowledgeNotification(`Документ "${docName}" успешно добавлен в базу знаний`, 'success');
            
            if (autoIndex) {
                setTimeout(() => {
                    showKnowledgeNotification('Индексация документа завершена', 'info');
                }, 2000);
            }
        }, 1500);
    }
    
    // Функция добавления документа в список
    function addDocumentToList(doc) {
        const knowledgeList = document.querySelector('.knowledge-list');
        const docItem = document.createElement('div');
        docItem.className = 'knowledge-item';
        docItem.innerHTML = `
            <div class="doc-icon">${getDocIcon(doc.type)}</div>
            <div class="doc-info">
                <div class="doc-name">${doc.name}</div>
                <div class="doc-meta">${doc.type.toUpperCase()} • ${doc.size} • Только что добавлен</div>
            </div>
            <div class="doc-status active">Активен</div>
            <div class="doc-actions">
                <button class="doc-btn edit" onclick="editDocumentByElement(this)">✏️</button>
                <button class="doc-btn delete" onclick="deleteDocumentByElement(this)">🗑️</button>
            </div>
        `;
        
        knowledgeList.appendChild(docItem);
        
        // Анимация появления
        docItem.style.transform = 'translateY(-10px)';
        docItem.style.opacity = '0';
        setTimeout(() => {
            docItem.style.transition = 'all 0.3s ease';
            docItem.style.transform = 'translateY(0)';
            docItem.style.opacity = '1';
        }, 100);
    }
    
    // Функция получения иконки документа
    function getDocIcon(type) {
        const icons = {
            'pdf': '📄',
            'docx': '📝',
            'xlsx': '📊',
            'txt': '📋',
            'md': '📝'
        };
        return icons[type] || '📄';
    }
    
    // Функция форматирования размера файла
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Функция редактирования документа
    function editDocument(docName, docElement) {
        console.log('✏️ Редактирование документа:', docName);
        
        const modal = document.createElement('div');
        modal.className = 'knowledge-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>✏️ Редактировать документ</h3>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Название:</label>
                        <input type="text" id="edit-doc-name" value="${docName}">
                    </div>
                    <div class="form-group">
                        <label>Статус:</label>
                        <select id="edit-doc-status">
                            <option value="active">✅ Активен</option>
                            <option value="inactive">❌ Неактивен</option>
                            <option value="updating">🔄 Обновляется</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Описание:</label>
                        <textarea id="edit-doc-description" placeholder="Обновить описание..."></textarea>
                    </div>
                    <div class="form-group">
                        <button class="btn-secondary" onclick="reindexDocument('${docName}')">🔄 Переиндексировать</button>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary modal-close">Отмена</button>
                    <button class="btn-primary" onclick="saveDocumentChanges('${docName}')">Сохранить</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Обработчики закрытия
        modal.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
            el.addEventListener('click', () => modal.remove());
        });
    }
    
    // Функция удаления документа
    function deleteDocument(docName, docElement) {
        console.log('🗑️ Удаление документа:', docName);
        
        if (confirm(`Вы уверены, что хотите удалить документ "${docName}"?`)) {
            // Анимация удаления
            docElement.style.transition = 'all 0.3s ease';
            docElement.style.transform = 'scale(0.95)';
            docElement.style.opacity = '0.5';
            
            setTimeout(() => {
                const docMeta = docElement.querySelector('.doc-meta').textContent;
                const sizeMatch = docMeta.match(/(\d+\.?\d*)\s*(KB|MB|GB)/);
                let fileSize = 0;
                
                if (sizeMatch) {
                    const size = parseFloat(sizeMatch[1]);
                    const unit = sizeMatch[2];
                    fileSize = unit === 'MB' ? size * 1024 * 1024 : 
                              unit === 'KB' ? size * 1024 : size;
                }
                
                docElement.remove();
                updateKnowledgeStats(-1, -fileSize);
                showKnowledgeNotification(`Документ "${docName}" удален из базы знаний`, 'success');
            }, 300);
        }
    }
    
    // Функция выполнения поиска
    function performSearch() {
        const searchInput = document.querySelector('.search-input');
        const query = searchInput.value.trim();
        
        if (!query) {
            showKnowledgeNotification('Введите запрос для поиска', 'error');
            return;
        }
        
        console.log('🔍 Выполняю поиск:', query);
        
        const searchBtn = document.querySelector('.search-btn');
        const originalText = searchBtn.textContent;
        
        searchBtn.textContent = '⏳ Поиск...';
        searchBtn.disabled = true;
        
        // Эмуляция поиска
        setTimeout(() => {
            const resultsContainer = document.querySelector('.search-results');
            
            // Генерируем случайные результаты поиска
            const mockResults = generateMockSearchResults(query);
            
            resultsContainer.innerHTML = '';
            
            mockResults.forEach((result, index) => {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                resultItem.style.opacity = '0';
                resultItem.innerHTML = `
                    <div class="result-score">${result.score}%</div>
                    <div class="result-text">"${result.text}"</div>
                    <div class="result-source">Источник: ${result.source}</div>
                `;
                
                resultsContainer.appendChild(resultItem);
                
                // Анимированное появление результатов
                setTimeout(() => {
                    resultItem.style.transition = 'all 0.3s ease';
                    resultItem.style.opacity = '1';
                }, index * 100);
            });
            
            searchBtn.textContent = originalText;
            searchBtn.disabled = false;
            
            showKnowledgeNotification(`Найдено ${mockResults.length} результатов для "${query}"`, 'success');
        }, 1500);
    }
    
    // Функция генерации результатов поиска
    function generateMockSearchResults(query) {
        const mockData = [
            {
                text: `Для ${query} обратитесь к разделу документации или к администратору системы`,
                source: 'Инструкция по работе с CRM',
                score: Math.floor(Math.random() * 20) + 80
            },
            {
                text: `Информация о ${query} содержится в актуальной версии тарифных планов`,
                source: 'Тарифные планы компании',
                score: Math.floor(Math.random() * 25) + 75
            },
            {
                text: `По вопросам ${query} рекомендуем ознакомиться с политикой безопасности`,
                source: 'Политика безопасности',
                score: Math.floor(Math.random() * 30) + 70
            }
        ];
        
        return mockData.slice(0, Math.floor(Math.random() * 3) + 1);
    }
    
    // Функция обновления статистики базы знаний
    function updateKnowledgeStats(docCountChange, sizeChange) {
        // Обновляем количество документов
        const docCountElement = document.querySelector('.knowledge-stats .stat-item:first-child .stat-number');
        if (docCountElement) {
            const currentCount = parseInt(docCountElement.textContent.replace(',', ''));
            const newCount = currentCount + docCountChange;
            docCountElement.textContent = newCount.toLocaleString();
        }
        
        // Обновляем размер базы (приблизительно)
        const sizeElement = document.querySelector('.knowledge-stats .stat-item:nth-child(2) .stat-number');
        if (sizeElement && sizeChange !== 0) {
            const currentSize = parseFloat(sizeElement.textContent);
            const sizeChangeInMB = Math.abs(sizeChange) / (1024 * 1024);
            const newSize = sizeChange > 0 ? currentSize + sizeChangeInMB : currentSize - sizeChangeInMB;
            sizeElement.textContent = Math.max(0, newSize).toFixed(1) + 'MB';
        }
    }
    
    // Функция показа уведомлений для базы знаний
    function showKnowledgeNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `knowledge-notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10001;
            box-shadow: 0 8px 25px rgba(0,0,0,0.4);
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.1);
            max-width: 400px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : '🧠'}</span>
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
    }
    
    // Инициализация функциональности базы знаний
    setupKnowledgeBaseActions();
    
    // Инициализация функциональности инцидентов
    setupIncidentActions();
    
    // Инициализация функциональности правил маршрутизации
    setupRoutingRulesActions();
    
    // Инициализация функциональности обучения модели
    setupModelTrainingActions();
    
    // Инициализация SLA & KPI функциональности
    setupSLAActions();
    
    // Инициализация визуализации маршрутизации
    setupVisualizationControls();

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

// === ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ БАЗЫ ЗНАНИЙ ===

// Глобальная функция добавления документа (для вызова из модального окна)
window.addDocument = function() {
    console.log('📝 Добавляю новый документ');
    
    const form = document.getElementById('add-document-form');
    
    const docName = document.getElementById('doc-name').value;
    const docType = document.getElementById('doc-type').value;
    const docFile = document.getElementById('doc-file').files[0];
    const docDescription = document.getElementById('doc-description').value;
    const autoIndex = document.getElementById('doc-auto-index').checked;
    
    if (!docName) {
        showKnowledgeNotification('Введите название документа', 'error');
        return;
    }
    
    if (!docFile) {
        showKnowledgeNotification('Выберите файл для загрузки', 'error');
        return;
    }
    
    // Эмуляция загрузки
    const modal = document.querySelector('.knowledge-modal');
    const addBtn = modal.querySelector('.btn-primary');
    const originalText = addBtn.textContent;
    
    addBtn.textContent = '⏳ Загрузка...';
    addBtn.disabled = true;
    
    setTimeout(() => {
        // Добавляем документ в список
        addDocumentToList({
            name: docName,
            type: docType,
            file: docFile,
            description: docDescription,
            size: formatFileSize(docFile.size),
            status: 'active'
        });
        
        // Обновляем статистику
        updateKnowledgeStatsGlobal(1, docFile.size);
        
        modal.remove();
        showKnowledgeNotification(`Документ "${docName}" успешно добавлен в базу знаний`, 'success');
        
        if (autoIndex) {
            setTimeout(() => {
                showKnowledgeNotification('Индексация документа завершена', 'info');
            }, 2000);
        }
    }, 1500);
};

// Функция редактирования документа по элементу
window.editDocumentByElement = function(buttonElement) {
    const docItem = buttonElement.closest('.knowledge-item');
    const docName = docItem.querySelector('.doc-name').textContent;
    editDocumentGlobal(docName, docItem);
};

// Функция удаления документа по элементу
window.deleteDocumentByElement = function(buttonElement) {
    const docItem = buttonElement.closest('.knowledge-item');
    const docName = docItem.querySelector('.doc-name').textContent;
    deleteDocumentGlobal(docName, docItem);
};

// Глобальная функция редактирования документа
window.editDocumentGlobal = function(docName, docElement) {
    console.log('✏️ Редактирование документа:', docName);
    
    const modal = document.createElement('div');
    modal.className = 'knowledge-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>✏️ Редактировать документ</h3>
                <button class="modal-close">✕</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Название:</label>
                    <input type="text" id="edit-doc-name" value="${docName}">
                </div>
                <div class="form-group">
                    <label>Статус:</label>
                    <select id="edit-doc-status">
                        <option value="active">✅ Активен</option>
                        <option value="inactive">❌ Неактивен</option>
                        <option value="updating">🔄 Обновляется</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Описание:</label>
                    <textarea id="edit-doc-description" placeholder="Обновить описание..."></textarea>
                </div>
                <div class="form-group">
                    <button class="btn-secondary" onclick="reindexDocument('${docName}')">🔄 Переиндексировать</button>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary modal-close">Отмена</button>
                <button class="btn-primary" onclick="saveDocumentChanges('${docName}')">Сохранить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики закрытия
    modal.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
        el.addEventListener('click', () => modal.remove());
    });
};

// Глобальная функция удаления документа
window.deleteDocumentGlobal = function(docName, docElement) {
    console.log('🗑️ Удаление документа:', docName);
    
    if (confirm(`Вы уверены, что хотите удалить документ "${docName}"?`)) {
        // Анимация удаления
        docElement.style.transition = 'all 0.3s ease';
        docElement.style.transform = 'scale(0.95)';
        docElement.style.opacity = '0.5';
        
        setTimeout(() => {
            const docMeta = docElement.querySelector('.doc-meta').textContent;
            const sizeMatch = docMeta.match(/(\d+\.?\d*)\s*(KB|MB|GB)/);
            let fileSize = 0;
            
            if (sizeMatch) {
                const size = parseFloat(sizeMatch[1]);
                const unit = sizeMatch[2];
                fileSize = unit === 'MB' ? size * 1024 * 1024 : 
                          unit === 'KB' ? size * 1024 : size;
            }
            
            docElement.remove();
            updateKnowledgeStatsGlobal(-1, -fileSize);
            showKnowledgeNotification(`Документ "${docName}" удален из базы знаний`, 'success');
        }, 300);
    }
};

// Функция сохранения изменений документа
window.saveDocumentChanges = function(originalName) {
    const newName = document.getElementById('edit-doc-name').value;
    const newStatus = document.getElementById('edit-doc-status').value;
    const newDescription = document.getElementById('edit-doc-description').value;
    
    console.log('💾 Сохраняю изменения для документа:', originalName);
    
    // Находим элемент документа в списке
    const docItems = document.querySelectorAll('.knowledge-item');
    let targetDoc = null;
    
    docItems.forEach(item => {
        if (item.querySelector('.doc-name').textContent === originalName) {
            targetDoc = item;
        }
    });
    
    if (targetDoc) {
        // Обновляем название
        targetDoc.querySelector('.doc-name').textContent = newName;
        
        // Обновляем статус
        const statusElement = targetDoc.querySelector('.doc-status');
        statusElement.className = `doc-status ${newStatus}`;
        statusElement.textContent = newStatus === 'active' ? 'Активен' : 
                                   newStatus === 'inactive' ? 'Неактивен' : 'Обновляется';
    }
    
    // Закрываем модальное окно
    const modal = document.querySelector('.knowledge-modal');
    if (modal) modal.remove();
    
    showKnowledgeNotification(`Документ "${newName}" обновлен`, 'success');
};

// Функция переиндексации документа
window.reindexDocument = function(docName) {
    console.log('🔄 Переиндексация документа:', docName);
    
    const btn = event.target;
    const originalText = btn.textContent;
    
    btn.textContent = '⏳ Индексация...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        showKnowledgeNotification(`Документ "${docName}" переиндексирован`, 'success');
    }, 2000);
};

// Глобальные вспомогательные функции
window.addDocumentToList = function(doc) {
    const knowledgeList = document.querySelector('.knowledge-list');
    const docItem = document.createElement('div');
    docItem.className = 'knowledge-item';
    docItem.innerHTML = `
        <div class="doc-icon">${getDocIconGlobal(doc.type)}</div>
        <div class="doc-info">
            <div class="doc-name">${doc.name}</div>
            <div class="doc-meta">${doc.type.toUpperCase()} • ${doc.size} • Только что добавлен</div>
        </div>
        <div class="doc-status active">Активен</div>
        <div class="doc-actions">
            <button class="doc-btn edit" onclick="editDocumentByElement(this)">✏️</button>
            <button class="doc-btn delete" onclick="deleteDocumentByElement(this)">🗑️</button>
        </div>
    `;
    
    knowledgeList.appendChild(docItem);
    
    // Анимация появления
    docItem.style.transform = 'translateY(-10px)';
    docItem.style.opacity = '0';
    setTimeout(() => {
        docItem.style.transition = 'all 0.3s ease';
        docItem.style.transform = 'translateY(0)';
        docItem.style.opacity = '1';
    }, 100);
};

window.getDocIconGlobal = function(type) {
    const icons = {
        'pdf': '📄',
        'docx': '📝',
        'xlsx': '📊',
        'txt': '📋',
        'md': '📝'
    };
    return icons[type] || '📄';
};

window.formatFileSize = function(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

window.updateKnowledgeStatsGlobal = function(docCountChange, sizeChange) {
    // Обновляем количество документов
    const docCountElement = document.querySelector('.knowledge-stats .stat-item:first-child .stat-number');
    if (docCountElement) {
        const currentCount = parseInt(docCountElement.textContent.replace(',', ''));
        const newCount = currentCount + docCountChange;
        docCountElement.textContent = newCount.toLocaleString();
    }
    
    // Обновляем размер базы (приблизительно)
    const sizeElement = document.querySelector('.knowledge-stats .stat-item:nth-child(2) .stat-number');
    if (sizeElement && sizeChange !== 0) {
        const currentSize = parseFloat(sizeElement.textContent);
        const sizeChangeInMB = Math.abs(sizeChange) / (1024 * 1024);
        const newSize = sizeChange > 0 ? currentSize + sizeChangeInMB : currentSize - sizeChangeInMB;
        sizeElement.textContent = Math.max(0, newSize).toFixed(1) + 'MB';
    }
};

window.showKnowledgeNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `knowledge-notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10001;
        box-shadow: 0 8px 25px rgba(0,0,0,0.4);
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.1);
        max-width: 400px;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : '🧠'}</span>
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

// API Data Loading Functions
async function loadDashboardData() {
    try {
        showNotification('Загрузка данных...', 'info');
        
        // Load tickets data
        const tickets = await loadTicketsData();
        console.log('Загружены тикеты:', tickets);
        
        // Update dashboard stats
        updateDashboardStats(tickets);
        
        showNotification('Данные успешно загружены', 'success');
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showNotification(`Ошибка загрузки данных: ${error.message}`, 'error');
    }
}

async function loadTicketsData() {
    try {
        return await apiCall(API_CONFIG.ENDPOINTS.TICKETS);
    } catch (error) {
        console.error('Ошибка загрузки тикетов:', error);
        // Return mock data if API fails
        return [
            { id: 1, title: 'Тестовый тикет', status: 'open', priority: 'high', created_at: new Date().toISOString() },
            { id: 2, title: 'Проблема с подключением', status: 'in_progress', priority: 'medium', created_at: new Date().toISOString() }
        ];
    }
}

function updateDashboardStats(tickets) {
    // Update incidents count
    const incidentsElement = document.querySelector('.stat-value');
    if (incidentsElement && tickets) {
        const openIncidents = tickets.filter(t => t.status === 'open').length;
        incidentsElement.textContent = openIncidents.toString();
    }
    
    // Update other stats as needed
    console.log('Статистика обновлена');
}

// Auto-load data when dashboard is ready
let dashboardDataLoaded = false;
function initializeDashboard() {
    if (!dashboardDataLoaded) {
        dashboardDataLoaded = true;
        loadDashboardData();
    }
}

// === ROUTING RULES MANAGEMENT === 

let currentEditingRule = null;
let nextRuleId = 4;

// Функции для работы с localStorage
function saveRulesToStorage() {
    try {
        localStorage.setItem('routingRules', JSON.stringify(routingRules));
        localStorage.setItem('nextRuleId', nextRuleId.toString());
        console.log('✅ Правила сохранены в localStorage');
    } catch (error) {
        console.error('❌ Ошибка сохранения правил:', error);
    }
}

function loadRulesFromStorage() {
    try {
        const savedRules = localStorage.getItem('routingRules');
        const savedNextId = localStorage.getItem('nextRuleId');
        
        if (savedRules) {
            routingRules = JSON.parse(savedRules);
            console.log('✅ Загружено правил:', routingRules.length);
        }
        
        if (savedNextId) {
            nextRuleId = parseInt(savedNextId);
        }
        
        // Если нет сохраненных правил, создаем демо-данные
        if (routingRules.length === 0) {
            createDefaultRules();
        }
        
        return true;
    } catch (error) {
        console.error('❌ Ошибка загрузки правил:', error);
        createDefaultRules();
        return false;
    }
}

function createDefaultRules() {
    routingRules = [
        {
            id: 1,
            name: 'Критические системные ошибки',
            conditions: 'Содержит: "ошибка", "не работает", "сбой"',
            actions: 'Немедленная эскалация на L2',
            priority: 10,
            active: true
        },
        {
            id: 2,
            name: 'Запросы на смену пароля',
            conditions: 'Содержит: "пароль", "забыл", "сменить"',
            actions: 'Автоответ с инструкцией + направить в IT',
            priority: 7,
            active: true
        },
        {
            id: 3,
            name: 'Общие вопросы',
            conditions: 'Не соответствует другим правилам',
            actions: 'Базовый AI ответ',
            priority: 1,
            active: false
        }
    ];
    nextRuleId = 4;
    saveRulesToStorage();
}

// Mock data для правил маршрутизации
let routingRules = [];

// Функция инициализации обработчиков правил маршрутизации
function setupRoutingRulesActions() {
    // Загрузить правила из localStorage
    loadRulesFromStorage();
    
    // Обновить DOM с загруженными правилами
    updateRulesDisplay();
    
    // Кнопка создания нового правила
    const createBtn = document.getElementById('create-rule-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            openRuleModal();
        });
    }

    // Обработчики для существующих правил
    setupRuleEventHandlers();
}

// Настройка обработчиков событий для правил
function setupRuleEventHandlers() {
    // Кнопки редактирования
    document.querySelectorAll('.edit-rule').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const ruleItem = e.target.closest('.rule-item');
            const ruleId = parseInt(ruleItem.dataset.ruleId);
            editRule(ruleId);
        });
    });

    // Кнопки удаления
    document.querySelectorAll('.delete-rule').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const ruleItem = e.target.closest('.rule-item');
            const ruleId = parseInt(ruleItem.dataset.ruleId);
            deleteRule(ruleId);
        });
    });

    // Переключатели активности
    document.querySelectorAll('.rule-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const ruleItem = e.target.closest('.rule-item');
            const ruleId = parseInt(ruleItem.dataset.ruleId);
            toggleRule(ruleId);
        });
    });
}

// Создание нового правила
function createNewRule() {
    currentEditingRule = null;
    document.getElementById('rule-modal-title').textContent = 'Создать новое правило';
    
    // Очистить форму
    document.getElementById('rule-name-input').value = '';
    document.getElementById('rule-conditions-input').value = '';
    document.getElementById('rule-actions-input').value = '';
    document.getElementById('rule-priority-input').value = '5';
    document.getElementById('rule-active-input').checked = true;
    
    document.getElementById('rule-modal').style.display = 'flex';
}

// Редактирование существующего правила
function editRule(ruleId) {
    const rule = routingRules.find(r => r.id === ruleId);
    if (!rule) return;

    currentEditingRule = rule;
    document.getElementById('rule-modal-title').textContent = 'Редактировать правило';
    
    // Заполнить форму данными правила
    document.getElementById('rule-name-input').value = rule.name;
    document.getElementById('rule-conditions-input').value = rule.conditions;
    document.getElementById('rule-actions-input').value = rule.actions;
    document.getElementById('rule-priority-input').value = rule.priority;
    document.getElementById('rule-active-input').checked = rule.active;
    
    document.getElementById('rule-modal').style.display = 'flex';
}

// Удаление правила
function deleteRule(ruleId) {
    const rule = routingRules.find(r => r.id === ruleId);
    if (!rule) return;

    if (confirm(`Вы уверены, что хотите удалить правило "${rule.name}"?`)) {
        // Удалить из массива
        routingRules = routingRules.filter(r => r.id !== ruleId);
        
        // Сохранить в localStorage
        saveRulesToStorage();
        
        // Удалить из DOM с анимацией
        const ruleElement = document.querySelector(`[data-rule-id="${ruleId}"]`);
        if (ruleElement) {
            ruleElement.style.transform = 'translateX(-100%)';
            ruleElement.style.opacity = '0';
            setTimeout(() => {
                ruleElement.remove();
                updateRulesStats();
                showRoutingNotification('Правило удалено', 'success');
            }, 300);
        }
    }
}

// Переключение активности правила
function toggleRule(ruleId) {
    const rule = routingRules.find(r => r.id === ruleId);
    if (!rule) return;

    rule.active = !rule.active;
    
    // Сохранить в localStorage
    saveRulesToStorage();
    
    // Обновить в DOM
    const ruleElement = document.querySelector(`[data-rule-id="${ruleId}"]`);
    if (ruleElement) {
        const toggle = ruleElement.querySelector('.rule-toggle');
        
        if (rule.active) {
            ruleElement.classList.remove('inactive');
            ruleElement.classList.add('active');
            toggle.classList.remove('inactive');
            toggle.classList.add('active');
            toggle.textContent = '●';
            toggle.dataset.active = 'true';
        } else {
            ruleElement.classList.remove('active');
            ruleElement.classList.add('inactive');
            toggle.classList.remove('active');
            toggle.classList.add('inactive');
            toggle.textContent = '○';
            toggle.dataset.active = 'false';
        }
        
        updateRulesStats();
        showRoutingNotification(
            rule.active ? 'Правило активировано' : 'Правило деактивировано',
            'success'
        );
    }
}

// Открытие модального окна
function openRuleModal(rule = null) {
    if (rule) {
        editRule(rule.id);
    } else {
        createNewRule();
    }
}

// Закрытие модального окна
function closeRuleModal() {
    document.getElementById('rule-modal').style.display = 'none';
    currentEditingRule = null;
}

// Сохранение правила
function saveRule() {
    const name = document.getElementById('rule-name-input').value.trim();
    const conditions = document.getElementById('rule-conditions-input').value.trim();
    const actions = document.getElementById('rule-actions-input').value.trim();
    const priority = parseInt(document.getElementById('rule-priority-input').value);
    const active = document.getElementById('rule-active-input').checked;

    // Валидация
    if (!name || !conditions || !actions) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }

    if (priority < 1 || priority > 10) {
        alert('Приоритет должен быть от 1 до 10');
        return;
    }

    if (currentEditingRule) {
        // Обновление существующего правила
        currentEditingRule.name = name;
        currentEditingRule.conditions = conditions;
        currentEditingRule.actions = actions;
        currentEditingRule.priority = priority;
        currentEditingRule.active = active;
        
        // Обновить в DOM
        updateRuleInDOM(currentEditingRule);
        showRoutingNotification('Правило обновлено', 'success');
    } else {
        // Создание нового правила
        const newRule = {
            id: nextRuleId++,
            name,
            conditions,
            actions,
            priority,
            active
        };
        
        routingRules.push(newRule);
        addRuleToDOM(newRule);
        showRoutingNotification('Правило создано', 'success');
    }

    // Сохранить в localStorage
    saveRulesToStorage();
    updateRulesStats();
    closeRuleModal();
}

// Обновление правила в DOM
function updateRuleInDOM(rule) {
    const ruleElement = document.querySelector(`[data-rule-id="${rule.id}"]`);
    if (!ruleElement) return;

    // Обновить содержимое
    ruleElement.querySelector('.rule-name').textContent = rule.name;
    ruleElement.querySelector('.condition').textContent = rule.conditions;
    ruleElement.querySelector('.action').textContent = rule.actions;
    ruleElement.querySelector('.priority-value').textContent = rule.priority;

    // Обновить класс приоритета
    ruleElement.classList.remove('priority-high', 'priority-medium', 'priority-low');
    if (rule.priority >= 8) {
        ruleElement.classList.add('priority-high');
    } else if (rule.priority >= 5) {
        ruleElement.classList.add('priority-medium');
    } else {
        ruleElement.classList.add('priority-low');
    }

    // Обновить статус активности
    const toggle = ruleElement.querySelector('.rule-toggle');
    if (rule.active) {
        ruleElement.classList.remove('inactive');
        ruleElement.classList.add('active');
        toggle.classList.remove('inactive');
        toggle.classList.add('active');
        toggle.textContent = '●';
    } else {
        ruleElement.classList.remove('active');
        ruleElement.classList.add('inactive');
        toggle.classList.remove('active');
        toggle.classList.add('inactive');
        toggle.textContent = '○';
    }
}

// Функция обновления отображения всех правил
function updateRulesDisplay() {
    const rulesList = document.querySelector('.rules-list');
    if (!rulesList) return;
    
    // Очистить существующие правила (кроме статических)
    const existingRules = rulesList.querySelectorAll('.rule-item');
    existingRules.forEach(rule => {
        // Проверяем, есть ли это правило в нашем массиве
        const ruleId = parseInt(rule.dataset.ruleId);
        if (!routingRules.find(r => r.id === ruleId)) {
            rule.remove();
        }
    });
    
    // Добавить все правила из массива
    routingRules.forEach(rule => {
        const existing = rulesList.querySelector(`[data-rule-id="${rule.id}"]`);
        if (!existing) {
            addRuleToDOM(rule);
        }
    });
    
    // Обновить статистику
    updateRulesStats();
    
    // Переустановить обработчики событий
    setupRuleEventHandlers();
}

// Добавление нового правила в DOM
function addRuleToDOM(rule) {
    const rulesList = document.querySelector('.rules-list');
    const priorityClass = rule.priority >= 8 ? 'priority-high' : 
                         rule.priority >= 5 ? 'priority-medium' : 'priority-low';
    const activeClass = rule.active ? 'active' : 'inactive';
    const toggleClass = rule.active ? 'active' : 'inactive';
    const toggleText = rule.active ? '●' : '○';

    const ruleHTML = `
        <div class="rule-item ${priorityClass} ${activeClass}" data-rule-id="${rule.id}">
            <div class="rule-header">
                <div class="rule-name">${rule.name}</div>
                <div class="rule-controls">
                    <button class="rule-btn edit-rule" title="Редактировать">✏️</button>
                    <button class="rule-btn delete-rule" title="Удалить">🗑️</button>
                    <div class="rule-toggle ${toggleClass}" data-active="${rule.active}">${toggleText}</div>
                </div>
            </div>
            <div class="rule-details">
                <div class="rule-conditions">
                    <span class="condition-label">Условия:</span>
                    <span class="condition">${rule.conditions}</span>
                </div>
                <div class="rule-actions">
                    <span class="action-label">Действие:</span>
                    <span class="action">${rule.actions}</span>
                </div>
                <div class="rule-priority">
                    <span class="priority-label">Приоритет:</span>
                    <span class="priority-value">${rule.priority}</span>
                </div>
            </div>
        </div>
    `;

    rulesList.insertAdjacentHTML('beforeend', ruleHTML);
    
    // Настроить обработчики для нового элемента
    setupRuleEventHandlers();
}

// Обновление статистики правил
function updateRulesStats() {
    const totalRules = routingRules.length;
    const activeRules = routingRules.filter(r => r.active).length;
    const avgPriority = totalRules > 0 ? 
        (routingRules.reduce((sum, r) => sum + r.priority, 0) / totalRules).toFixed(1) : '0';

    document.getElementById('total-rules').textContent = totalRules;
    document.getElementById('active-rules').textContent = activeRules;
    document.getElementById('avg-priority').textContent = avgPriority;
}

// Показать уведомление для правил маршрутизации
function showRoutingNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `routing-notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10001;
        box-shadow: 0 8px 25px rgba(0,0,0,0.4);
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.1);
        max-width: 400px;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : '🔀'}</span>
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
}

// Глобальные функции для модального окна
window.closeRuleModal = closeRuleModal;
window.saveRule = saveRule;

// === ROUTING VISUALIZATION (REAL-TIME) ===

let visualizationState = {
    isRunning: false,
    isPaused: false,
    intervalId: null,
    counters: {
        input: 0,
        critical: 0,
        medium: 0,
        low: 0,
        l2: 0,
        it: 0,
        ai: 0
    },
    totalRequests: 0,
    startTime: null
};

// Инициализация визуализации
function setupVisualizationControls() {
    const startBtn = document.getElementById('start-simulation');
    const stopBtn = document.getElementById('stop-simulation');
    const resetBtn = document.getElementById('reset-simulation');

    if (startBtn) {
        startBtn.addEventListener('click', startVisualization);
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', pauseVisualization);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetVisualization);
    }

    // Добавить hover эффекты для узлов
    setupNodeInteractions();
    
    // Автозапуск визуализации
    setTimeout(startVisualization, 1000);
}

// Настройка интерактивности узлов
function setupNodeInteractions() {
    const nodes = document.querySelectorAll('.flow-node');
    nodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            showNodeTooltip(node);
        });
        
        node.addEventListener('mouseleave', () => {
            hideNodeTooltip();
        });
    });
}

// Показать подсказку для узла
function showNodeTooltip(node) {
    const tooltip = document.createElement('div');
    tooltip.className = 'flow-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 10000;
        pointer-events: none;
        white-space: nowrap;
    `;
    
    const rect = node.getBoundingClientRect();
    const nodeType = node.classList.contains('input-node') ? 'input' :
                    node.classList.contains('rule-node') ? 'rule' : 'output';
    
    let tooltipText = '';
    switch(nodeType) {
        case 'input':
            tooltipText = `Входящие запросы: ${visualizationState.counters.input}`;
            break;
        case 'rule':
            if (node.classList.contains('priority-high')) {
                tooltipText = `Критические: ${visualizationState.counters.critical} (${((visualizationState.counters.critical / visualizationState.totalRequests) * 100 || 0).toFixed(1)}%)`;
            } else if (node.classList.contains('priority-medium')) {
                tooltipText = `Средние: ${visualizationState.counters.medium} (${((visualizationState.counters.medium / visualizationState.totalRequests) * 100 || 0).toFixed(1)}%)`;
            } else {
                tooltipText = `Низкие: ${visualizationState.counters.low} (${((visualizationState.counters.low / visualizationState.totalRequests) * 100 || 0).toFixed(1)}%)`;
            }
            break;
        case 'output':
            if (node.classList.contains('l2-escalation')) {
                tooltipText = `L2 Эскалация: ${visualizationState.counters.l2}`;
            } else if (node.classList.contains('it-department')) {
                tooltipText = `IT Отдел: ${visualizationState.counters.it}`;
            } else {
                tooltipText = `AI Ответы: ${visualizationState.counters.ai}`;
            }
            break;
    }
    
    tooltip.textContent = tooltipText;
    tooltip.style.left = rect.right + 10 + 'px';
    tooltip.style.top = rect.top + (rect.height / 2) - 12 + 'px';
    
    document.body.appendChild(tooltip);
}

// Скрыть подсказку
function hideNodeTooltip() {
    const tooltip = document.querySelector('.flow-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Запуск визуализации
function startVisualization() {
    if (visualizationState.isRunning && !visualizationState.isPaused) return;
    
    visualizationState.isRunning = true;
    visualizationState.isPaused = false;
    visualizationState.startTime = visualizationState.startTime || Date.now();
    
    const svg = document.querySelector('.routing-flow-svg');
    if (svg) {
        svg.classList.remove('paused', 'stopped');
        
        // Показать анимированные потоки
        const particles = svg.querySelectorAll('.flow-particle');
        particles.forEach(particle => {
            particle.style.display = 'block';
        });
    }
    
    // Запустить симуляцию данных
    visualizationState.intervalId = setInterval(simulateDataFlow, 2000);
    
    showRoutingNotification('Визуализация запущена', 'success');
    updateVisualizationButtons();
}

// Пауза визуализации
function pauseVisualization() {
    if (!visualizationState.isRunning) return;
    
    visualizationState.isPaused = true;
    
    const svg = document.querySelector('.routing-flow-svg');
    if (svg) {
        svg.classList.add('paused');
    }
    
    if (visualizationState.intervalId) {
        clearInterval(visualizationState.intervalId);
    }
    
    showRoutingNotification('Визуализация приостановлена', 'info');
    updateVisualizationButtons();
}

// Сброс визуализации
function resetVisualization() {
    visualizationState.isRunning = false;
    visualizationState.isPaused = false;
    visualizationState.startTime = null;
    
    // Сброс счетчиков
    Object.keys(visualizationState.counters).forEach(key => {
        visualizationState.counters[key] = 0;
    });
    visualizationState.totalRequests = 0;
    
    // Остановить анимации
    const svg = document.querySelector('.routing-flow-svg');
    if (svg) {
        svg.classList.add('stopped');
        svg.classList.remove('paused');
        
        const particles = svg.querySelectorAll('.flow-particle');
        particles.forEach(particle => {
            particle.style.display = 'none';
        });
    }
    
    if (visualizationState.intervalId) {
        clearInterval(visualizationState.intervalId);
    }
    
    updateCounterDisplays();
    updateRealTimeMetrics();
    
    showRoutingNotification('Визуализация сброшена', 'info');
    updateVisualizationButtons();
}

// Симуляция потока данных
function simulateDataFlow() {
    if (!visualizationState.isRunning || visualizationState.isPaused) return;
    
    // Генерация случайных запросов
    const newRequests = Math.floor(Math.random() * 5) + 1;
    visualizationState.totalRequests += newRequests;
    visualizationState.counters.input += newRequests;
    
    // Распределение по правилам (согласно приоритетам)
    for (let i = 0; i < newRequests; i++) {
        const rand = Math.random();
        
        if (rand < 0.15) { // 15% критические
            visualizationState.counters.critical++;
            visualizationState.counters.l2++;
        } else if (rand < 0.45) { // 30% средние
            visualizationState.counters.medium++;
            visualizationState.counters.it++;
        } else { // 55% низкие
            visualizationState.counters.low++;
            visualizationState.counters.ai++;
        }
    }
    
    updateCounterDisplays();
    updateRealTimeMetrics();
    
    // Добавить эффект пульсации к активным узлам
    pulseActiveNodes();
}

// Обновление отображения счетчиков
function updateCounterDisplays() {
    const counterElements = {
        'input-counter': visualizationState.counters.input,
        'critical-counter': visualizationState.counters.critical,
        'medium-counter': visualizationState.counters.medium,
        'low-counter': visualizationState.counters.low,
        'l2-counter': visualizationState.counters.l2,
        'it-counter': visualizationState.counters.it,
        'ai-counter': visualizationState.counters.ai
    };
    
    Object.entries(counterElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Обновление метрик в реальном времени
function updateRealTimeMetrics() {
    const elapsedMinutes = visualizationState.startTime ? 
        (Date.now() - visualizationState.startTime) / (1000 * 60) : 0;
    
    const requestsPerMinute = elapsedMinutes > 0 ? 
        Math.round(visualizationState.totalRequests / elapsedMinutes) : 0;
    
    const criticalPercentage = visualizationState.totalRequests > 0 ? 
        ((visualizationState.counters.critical / visualizationState.totalRequests) * 100).toFixed(1) : 0;
    
    const automationRate = visualizationState.totalRequests > 0 ? 
        (((visualizationState.counters.ai + visualizationState.counters.it) / visualizationState.totalRequests) * 100).toFixed(1) : 87;
    
    // Симуляция среднего SLA
    const avgSLA = (2.0 + (Math.random() * 0.8)).toFixed(1);
    
    // Обновить отображение
    const elements = {
        'total-flow': `${requestsPerMinute} запр/мин`,
        'critical-flow': `${criticalPercentage}%`,
        'automation-rate': `${automationRate}%`,
        'avg-sla': `${avgSLA} мин`
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Эффект пульсации активных узлов
function pulseActiveNodes() {
    const nodes = document.querySelectorAll('.flow-node');
    nodes.forEach(node => {
        node.style.transform = 'scale(1.05)';
        setTimeout(() => {
            node.style.transform = 'scale(1)';
        }, 200);
    });
}

// Обновление состояния кнопок
function updateVisualizationButtons() {
    const startBtn = document.getElementById('start-simulation');
    const stopBtn = document.getElementById('stop-simulation');
    const resetBtn = document.getElementById('reset-simulation');
    
    if (startBtn && stopBtn && resetBtn) {
        if (visualizationState.isRunning && !visualizationState.isPaused) {
            startBtn.style.opacity = '0.5';
            stopBtn.style.opacity = '1';
            resetBtn.style.opacity = '1';
        } else if (visualizationState.isPaused) {
            startBtn.style.opacity = '1';
            stopBtn.style.opacity = '0.5';
            resetBtn.style.opacity = '1';
        } else {
            startBtn.style.opacity = '1';
            stopBtn.style.opacity = '0.5';
            resetBtn.style.opacity = '1';
        }
    }
}

// === MODEL TRAINING FUNCTIONALITY ===

let trainingState = {
    isTraining: false,
    isPaused: false,
    progress: 0,
    startTime: null,
    currentTask: '',
    epochs: { current: 0, total: 100 },
    accuracy: 0,
    trainingInterval: null
};

function setupModelTrainingActions() {
    const startBtn = document.getElementById('start-training-btn');
    const pauseBtn = document.getElementById('pause-training-btn');
    const stopBtn = document.getElementById('stop-training-btn');
    const refreshHistoryBtn = document.getElementById('refresh-history');
    
    if (startBtn) startBtn.addEventListener('click', startTraining);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTraining);
    if (stopBtn) stopBtn.addEventListener('click', stopTraining);
    if (refreshHistoryBtn) refreshHistoryBtn.addEventListener('click', refreshTrainingHistory);
}

function startTraining() {
    if (trainingState.isTraining && trainingState.isPaused) {
        resumeTraining();
        return;
    }
    
    const trainingType = document.getElementById('training-type')?.value || 'language';
    const intensity = document.getElementById('training-intensity')?.value || 'medium';
    const backupModel = document.getElementById('backup-model')?.checked || false;
    
    const taskNames = {
        'language': 'Улучшение языковых навыков',
        'classification': 'Улучшение классификации запросов',
        'response': 'Улучшение качества ответов',
        'multilingual': 'Многоязычное обучение'
    };
    
    const intensitySettings = {
        'low': { duration: 120000, updateInterval: 2000 },
        'medium': { duration: 60000, updateInterval: 1000 },
        'high': { duration: 30000, updateInterval: 500 }
    };
    
    trainingState = {
        isTraining: true,
        isPaused: false,
        progress: 0,
        startTime: new Date(),
        currentTask: taskNames[trainingType],
        epochs: { current: 0, total: 100 },
        accuracy: 90 + Math.random() * 8,
        trainingInterval: null,
        settings: intensitySettings[intensity]
    };
    
    if (backupModel) {
        showTrainingNotification('Создание резервной копии модели...', 'info');
    }
    
    updateTrainingUI();
    updateTrainingButtons();
    
    trainingState.trainingInterval = setInterval(updateTrainingProgress, trainingState.settings.updateInterval);
    showTrainingNotification(`Начато обучение: ${trainingState.currentTask}`, 'success');
}

function pauseTraining() {
    if (!trainingState.isTraining) return;
    trainingState.isPaused = true;
    if (trainingState.trainingInterval) {
        clearInterval(trainingState.trainingInterval);
        trainingState.trainingInterval = null;
    }
    updateTrainingButtons();
    showTrainingNotification('Обучение приостановлено', 'warning');
}

function resumeTraining() {
    if (!trainingState.isTraining || !trainingState.isPaused) return;
    trainingState.isPaused = false;
    trainingState.trainingInterval = setInterval(updateTrainingProgress, trainingState.settings.updateInterval);
    updateTrainingButtons();
    showTrainingNotification('Обучение возобновлено', 'success');
}

function stopTraining() {
    if (!trainingState.isTraining) return;
    if (trainingState.trainingInterval) {
        clearInterval(trainingState.trainingInterval);
        trainingState.trainingInterval = null;
    }
    
    const wasCompleted = trainingState.progress >= 100;
    trainingState.isTraining = false;
    trainingState.isPaused = false;
    
    if (wasCompleted) {
        showTrainingNotification('Обучение завершено успешно!', 'success');
        updateModelMetrics();
    } else {
        showTrainingNotification('Обучение остановлено', 'warning');
    }
    
    resetTrainingUI();
    updateTrainingButtons();
}

function updateTrainingProgress() {
    if (!trainingState.isTraining || trainingState.isPaused) return;
    
    const elapsed = new Date() - trainingState.startTime;
    trainingState.progress = Math.min((elapsed / trainingState.settings.duration) * 100, 100);
    trainingState.epochs.current = Math.floor((trainingState.progress / 100) * trainingState.epochs.total);
    
    if (trainingState.progress > 10) {
        trainingState.accuracy = Math.min(trainingState.accuracy + (Math.random() * 0.1), 98.5);
    }
    
    updateTrainingUI();
    if (trainingState.progress >= 100) stopTraining();
}

function updateTrainingUI() {
    const elements = {
        taskName: document.getElementById('training-task-name'),
        progressPercent: document.getElementById('training-progress-percent'),
        progressBar: document.getElementById('training-progress-bar'),
        time: document.getElementById('training-time'),
        epochs: document.getElementById('training-epochs'),
        accuracy: document.getElementById('training-accuracy')
    };
    
    if (elements.taskName) {
        elements.taskName.textContent = trainingState.isTraining ? trainingState.currentTask : 'Готов к обучению';
    }
    
    if (elements.progressPercent) {
        elements.progressPercent.textContent = `${Math.round(trainingState.progress)}%`;
    }
    
    if (elements.progressBar) {
        elements.progressBar.style.width = `${trainingState.progress}%`;
    }
    
    if (elements.time && trainingState.startTime) {
        const elapsed = new Date() - trainingState.startTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        elements.time.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (elements.epochs) {
        elements.epochs.textContent = `${trainingState.epochs.current}/${trainingState.epochs.total}`;
    }
    
    if (elements.accuracy && trainingState.progress > 0) {
        elements.accuracy.textContent = `${trainingState.accuracy.toFixed(1)}%`;
    }
}

function resetTrainingUI() {
    trainingState.progress = 0;
    trainingState.epochs.current = 0;
    trainingState.startTime = null;
    updateTrainingUI();
}

function updateTrainingButtons() {
    const startBtn = document.getElementById('start-training-btn');
    const pauseBtn = document.getElementById('pause-training-btn');
    const stopBtn = document.getElementById('stop-training-btn');
    
    if (startBtn) {
        startBtn.disabled = trainingState.isTraining && !trainingState.isPaused;
        startBtn.textContent = (trainingState.isTraining && trainingState.isPaused) ? '▶️ Продолжить' : 'Начать обучение';
    }
    
    if (pauseBtn) pauseBtn.disabled = !trainingState.isTraining || trainingState.isPaused;
    if (stopBtn) stopBtn.disabled = !trainingState.isTraining;
}

function updateModelMetrics() {
    const improvements = [0.5, 1.2, 0.8, -0.1];
    document.querySelectorAll('.metric-trend').forEach((el, index) => {
        const improvement = improvements[index] || 0;
        el.textContent = improvement > 0 ? `+${improvement.toFixed(1)}%` : `${improvement.toFixed(1)}%`;
        el.className = `metric-trend ${improvement > 0 ? 'positive' : improvement < 0 ? 'negative' : 'neutral'}`;
    });
}

function refreshTrainingHistory() {
    showTrainingNotification('История обновлена', 'info');
}

function showTrainingNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 8px;
        color: white; font-weight: 500; z-index: 10000; transform: translateX(100%);
        transition: transform 0.3s ease; max-width: 350px; backdrop-filter: blur(10px);
    `;
    
    const backgrounds = {
        success: 'rgba(76, 175, 80, 0.9)',
        warning: 'rgba(255, 152, 0, 0.9)',
        error: 'rgba(244, 67, 54, 0.9)',
        info: 'rgba(33, 150, 243, 0.9)'
    };
    
    const icons = { success: '✅', warning: '⚠️', error: '❌', info: '🎓' };
    
    notification.style.background = backgrounds[type] || backgrounds.info;
    notification.innerHTML = `<div style="display: flex; align-items: center; gap: 10px;"><span>${icons[type] || '🎓'}</span><span>${message}</span></div>`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// === SLA & KPI FUNCTIONALITY ===

let slaData = {
    metrics: {
        firstResponse: { value: 12.3, target: 30, unit: 'сек' },
        resolution: { value: 2.8, target: 4, unit: 'ч' },
        escalation: { value: 18.5, target: 24, unit: 'ч' },
        satisfaction: { value: 4.2, target: 4.5, unit: '★' }
    },
    alerts: [],
    thresholds: {
        response: 30,
        resolution: 4,
        escalation: 24
    }
};

function setupSLAActions() {
    // Основные действия
    document.getElementById('refresh-sla')?.addEventListener('click', refreshSLAData);
    document.getElementById('export-sla')?.addEventListener('click', exportSLAReport);
    document.getElementById('configure-sla')?.addEventListener('click', configureSLA);
    
    // Быстрые действия
    document.getElementById('create-sla-alert')?.addEventListener('click', createSLAAlert);
    document.getElementById('schedule-review')?.addEventListener('click', scheduleReview);
    document.getElementById('generate-report')?.addEventListener('click', generateSLAReport);
    
    // Управление порогами
    document.getElementById('update-thresholds')?.addEventListener('click', updateThresholds);
    
    // График
    document.getElementById('update-chart')?.addEventListener('click', updateSLAChart);
    document.getElementById('chart-period')?.addEventListener('change', updateSLAChart);
    
    // Управление алертами
    document.getElementById('clear-alerts')?.addEventListener('click', clearAllAlerts);
    
    // Обработчики для карточек метрик
    setupMetricCards();
    
    // Инициализация
    initializeSLAInterface();
}

function refreshSLAData() {
    showSLANotification('Обновление данных SLA...', 'info');
    
    // Симуляция обновления данных
    setTimeout(() => {
        // Обновляем метрики с небольшими изменениями
        slaData.metrics.firstResponse.value += (Math.random() - 0.5) * 2;
        slaData.metrics.resolution.value += (Math.random() - 0.5) * 0.5;
        slaData.metrics.escalation.value += (Math.random() - 0.5) * 3;
        slaData.metrics.satisfaction.value += (Math.random() - 0.5) * 0.2;
        
        updateSLAMetrics();
        updateSLAChart();
        showSLANotification('Данные успешно обновлены', 'success');
    }, 1500);
}

function exportSLAReport() {
    showSLANotification('Подготовка отчёта...', 'info');
    
    setTimeout(() => {
        // Создаём blob с данными отчёта
        const reportData = {
            timestamp: new Date().toISOString(),
            metrics: slaData.metrics,
            period: document.getElementById('chart-period')?.value || 'week'
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `sla-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSLANotification('Отчёт экспортирован', 'success');
    }, 1000);
}

function configureSLA() {
    const currentThresholds = {
        response: document.getElementById('threshold-response')?.value || 30,
        resolution: document.getElementById('threshold-resolution')?.value || 4,
        escalation: document.getElementById('threshold-escalation')?.value || 24
    };
    
    showSLANotification(`Текущие настройки: Ответ ${currentThresholds.response}с, Решение ${currentThresholds.resolution}ч, Эскалация ${currentThresholds.escalation}ч`, 'info', 6000);
}

function createSLAAlert() {
    const alertTypes = ['critical', 'warning'];
    const alertMessages = [
        'Превышено время первого ответа',
        'Критическое нарушение SLA',
        'Требуется немедленное вмешательство',
        'Неудовлетворённость клиентов растёт'
    ];
    
    const newAlert = {
        id: Date.now(),
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        title: alertMessages[Math.floor(Math.random() * alertMessages.length)],
        desc: `Тикет #${1000 + Math.floor(Math.random() * 100)} требует внимания`,
        time: 'Только что'
    };
    
    addAlertToList(newAlert);
    showSLANotification('Уведомление создано', 'warning');
}

function scheduleReview() {
    const reviewTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Завтра
    showSLANotification(`Проверка SLA запланирована на ${reviewTime.toLocaleDateString('ru')}`, 'success');
}

function generateSLAReport() {
    showSLANotification('Генерация подробного отчёта...', 'info');
    
    setTimeout(() => {
        const report = `
📊 ОТЧЁТ SLA & KPI\n
Дата: ${new Date().toLocaleDateString('ru')}\n\n📈 МЕТРИКИ:\n• Первый ответ: ${slaData.metrics.firstResponse.value.toFixed(1)}с (цель: <${slaData.metrics.firstResponse.target}с)\n• Время решения: ${slaData.metrics.resolution.value.toFixed(1)}ч (цель: <${slaData.metrics.resolution.target}ч)\n• Эскалация: ${slaData.metrics.escalation.value.toFixed(1)}ч (цель: <${slaData.metrics.escalation.target}ч)\n• Удовлетворённость: ${slaData.metrics.satisfaction.value.toFixed(1)}★ (цель: >${slaData.metrics.satisfaction.target}★)\n\n✅ Выполнение SLA: ${calculateSLACompliance().toFixed(1)}%
        `;
        
        console.log(report);
        showSLANotification('Отчёт сгенерирован (см. консоль)', 'success');
    }, 2000);
}

function updateThresholds() {
    const newThresholds = {
        response: parseInt(document.getElementById('threshold-response')?.value) || 30,
        resolution: parseInt(document.getElementById('threshold-resolution')?.value) || 4,
        escalation: parseInt(document.getElementById('threshold-escalation')?.value) || 24
    };
    
    slaData.thresholds = newThresholds;
    slaData.metrics.firstResponse.target = newThresholds.response;
    slaData.metrics.resolution.target = newThresholds.resolution;
    slaData.metrics.escalation.target = newThresholds.escalation;
    
    updateSLAMetrics();
    showSLANotification('Пороговые значения обновлены', 'success');
}

function updateSLAChart() {
    const period = document.getElementById('chart-period')?.value || 'week';
    const bars = document.querySelectorAll('.chart-bar');
    
    bars.forEach(bar => {
        const newHeight = Math.random() * 80 + 20; // 20-100%
        const color = newHeight > 80 ? 'var(--accent-green)' : 
                     newHeight > 60 ? 'var(--accent-orange)' : 'var(--accent-red)';
        
        bar.style.height = `${newHeight}%`;
        bar.style.background = color;
        bar.title = `${newHeight.toFixed(0)}%`;
    });
    
    showSLANotification(`График обновлён для периода: ${period}`, 'info');
}

function clearAllAlerts() {
    const alertsList = document.getElementById('sla-alerts-list');
    const alerts = alertsList?.querySelectorAll('.alert-item');
    
    alerts?.forEach(alert => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateX(-100%)';
        setTimeout(() => alert.remove(), 300);
    });
    
    showSLANotification('Все уведомления очищены', 'success');
}

function setupMetricCards() {
    const cards = document.querySelectorAll('.sla-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.sla-title')?.textContent;
            showSLANotification(`Детализация: ${title}`, 'info');
        });
    });
}

function initializeSLAInterface() {
    updateSLAMetrics();
    setupAlertDismissal();
}

function updateSLAMetrics() {
    // Обновляем карточки метрик
    updateMetricCard('first-response-card', slaData.metrics.firstResponse);
    updateMetricCard('resolution-card', slaData.metrics.resolution);
    updateMetricCard('escalation-card', slaData.metrics.escalation);
    updateMetricCard('satisfaction-card', slaData.metrics.satisfaction);
}

function updateMetricCard(cardId, metric) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    const valueEl = card.querySelector('.sla-value');
    const statusEl = card.querySelector('.sla-status');
    const trendEl = card.querySelector('.sla-trend');
    
    if (valueEl) valueEl.textContent = `${metric.value.toFixed(1)}${metric.unit}`;
    
    // Обновляем статус на основе достижения цели
    let status, statusClass;
    if (metric.unit === '★') {
        // Для удовлетворённости: больше = лучше
        if (metric.value >= metric.target) {
            status = '✅ Цель достигнута';
            statusClass = 'status-excellent';
        } else if (metric.value >= metric.target * 0.9) {
            status = '⚠️ Близко к цели';
            statusClass = 'status-warning';
        } else {
            status = '❌ Ниже цели';
            statusClass = 'status-critical';
        }
    } else {
        // Для времени: меньше = лучше
        if (metric.value <= metric.target * 0.7) {
            status = '✅ Превышено';
            statusClass = 'status-excellent';
        } else if (metric.value <= metric.target) {
            status = '✅ Цель достигнута';
            statusClass = 'status-good';
        } else if (metric.value <= metric.target * 1.2) {
            status = '⚠️ Близко к лимиту';
            statusClass = 'status-warning';
        } else {
            status = '❌ Превышен лимит';
            statusClass = 'status-critical';
        }
    }
    
    if (statusEl) {
        statusEl.textContent = status;
        statusEl.className = `sla-status ${statusClass}`;
    }
}

function addAlertToList(alert) {
    const alertsList = document.getElementById('sla-alerts-list');
    if (!alertsList) return;
    
    const alertElement = document.createElement('div');
    alertElement.className = `alert-item ${alert.type}`;
    alertElement.innerHTML = `
        <div class="alert-icon">${alert.type === 'critical' ? '🔴' : '🟡'}</div>
        <div class="alert-content">
            <div class="alert-title">${alert.title}</div>
            <div class="alert-desc">${alert.desc}</div>
            <div class="alert-time">${alert.time}</div>
        </div>
        <button class="alert-dismiss">✕</button>
    `;
    
    alertsList.insertBefore(alertElement, alertsList.firstChild);
    
    // Добавляем обработчик для кнопки закрытия
    const dismissBtn = alertElement.querySelector('.alert-dismiss');
    dismissBtn?.addEventListener('click', () => {
        alertElement.style.opacity = '0';
        alertElement.style.transform = 'translateX(-100%)';
        setTimeout(() => alertElement.remove(), 300);
    });
}

function setupAlertDismissal() {
    document.querySelectorAll('.alert-dismiss').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const alertItem = e.target.closest('.alert-item');
            alertItem.style.opacity = '0';
            alertItem.style.transform = 'translateX(-100%)';
            setTimeout(() => alertItem.remove(), 300);
        });
    });
}

function calculateSLACompliance() {
    const metrics = slaData.metrics;
    let compliance = 0;
    let count = 0;
    
    Object.values(metrics).forEach(metric => {
        if (metric.unit === '★') {
            compliance += metric.value >= metric.target ? 100 : (metric.value / metric.target) * 100;
        } else {
            compliance += metric.value <= metric.target ? 100 : (metric.target / metric.value) * 100;
        }
        count++;
    });
    
    return compliance / count;
}

function showSLANotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 8px;
        color: white; font-weight: 500; z-index: 10000; transform: translateX(100%);
        transition: transform 0.3s ease; max-width: 350px; backdrop-filter: blur(10px);
    `;
    
    const backgrounds = {
        success: 'rgba(76, 175, 80, 0.9)',
        warning: 'rgba(255, 152, 0, 0.9)',
        error: 'rgba(244, 67, 54, 0.9)',
        info: 'rgba(33, 150, 243, 0.9)'
    };
    
    const icons = { success: '✅', warning: '⚠️', error: '❌', info: '📊' };
    
    notification.style.background = backgrounds[type] || backgrounds.info;
    notification.innerHTML = `<div style="display: flex; align-items: center; gap: 10px;"><span>${icons[type] || '📊'}</span><span>${message}</span></div>`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}