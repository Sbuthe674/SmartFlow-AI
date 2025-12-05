document.addEventListener('DOMContentLoaded', function() {
    
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

});

// Добавляем стиль анимации в JS
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(styleSheet);