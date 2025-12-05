const API_BASE = 'http://localhost:8000/api';

let currentTickets = [];
let currentTicket = null;

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');

    // Load content for specific tabs
    if (tabName === 'tickets') {
        loadTickets();
    } else if (tabName === 'metrics') {
        loadMetrics();
    }
}

// Load tickets
async function loadTickets() {
    const listEl = document.getElementById('tickets-list');
    listEl.innerHTML = '<p class="loading">Загрузка тикетов...</p>';

    try {
        const statusFilter = document.getElementById('status-filter').value;
        const url = statusFilter 
            ? `${API_BASE}/tickets?status=${statusFilter}`
            : `${API_BASE}/tickets`;

        const response = await fetch(url);
        const tickets = await response.json();

        currentTickets = tickets;

        if (tickets.length === 0) {
            listEl.innerHTML = '<p class="loading">Тикетов не найдено</p>';
            return;
        }

        listEl.innerHTML = tickets.map(ticket => createTicketCard(ticket)).join('');
    } catch (error) {
        listEl.innerHTML = `<p class="loading" style="color: #dc3545;">Ошибка загрузки: ${error.message}</p>`;
    }
}

// Create ticket card HTML
function createTicketCard(ticket) {
    const priorityClass = `priority-${ticket.priority}`;
    const statusClass = `status-${ticket.status}`;
    const date = new Date(ticket.created_at).toLocaleString('ru-RU');

    const statusLabels = {
        'new': 'Новый',
        'in_progress': 'В работе',
        'closed': 'Закрыт',
        'closed_auto': 'Авто-закрыт'
    };

    return `
        <div class="ticket-card" onclick="showTicketDetail(${ticket.id})">
            <div class="ticket-header">
                <span class="ticket-id">#${ticket.id}</span>
                <span class="ticket-status ${statusClass}">${statusLabels[ticket.status]}</span>
            </div>
            <div class="ticket-subject">${ticket.subject}</div>
            <div class="ticket-meta">
                <span>📂 ${ticket.category}</span>
                <span class="${priorityClass}">⚡ ${ticket.priority.toUpperCase()}</span>
                <span>🏢 ${ticket.department}</span>
                <span>🌐 ${ticket.language.toUpperCase()}</span>
                <span>🕐 ${date}</span>
            </div>
            <div style="margin-top: 10px; color: #6c757d; font-size: 0.9rem;">
                ${ticket.summary}
            </div>
        </div>
    `;
}

// Show ticket detail
function showTicketDetail(ticketId) {
    const ticket = currentTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    currentTicket = ticket;

    const detailEl = document.getElementById('ticket-detail');
    const contentEl = document.getElementById('ticket-content');

    const priorityClass = `priority-${ticket.priority}`;
    const statusLabels = {
        'new': 'Новый',
        'in_progress': 'В работе',
        'closed': 'Закрыт',
        'closed_auto': 'Авто-закрыт'
    };

    contentEl.innerHTML = `
        <div class="detail-section">
            <h2>Тикет #${ticket.id}</h2>
            <h3 style="margin-top: 0;">${ticket.subject}</h3>

            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Статус</div>
                    <div class="info-value">${statusLabels[ticket.status]}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Приоритет</div>
                    <div class="info-value ${priorityClass}">${ticket.priority.toUpperCase()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Категория</div>
                    <div class="info-value">${ticket.category}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Отдел</div>
                    <div class="info-value">${ticket.department}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Язык</div>
                    <div class="info-value">${ticket.language.toUpperCase()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Создан</div>
                    <div class="info-value">${new Date(ticket.created_at).toLocaleString('ru-RU')}</div>
                </div>
            </div>

            <h3>📝 Текст обращения</h3>
            <p style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 6px;">${ticket.body}</p>

            <h3>📋 Резюме</h3>
            <p style="background: #e7f3ff; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea;">${ticket.summary}</p>

            <h3>💬 Предложенный ответ</h3>
            <p style="background: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; white-space: pre-wrap;">${ticket.suggested_reply}</p>

            ${ticket.status !== 'closed' && ticket.status !== 'closed_auto' ? `
                <div class="action-buttons">
                    <button class="action-btn btn-progress" onclick="updateTicketStatus('in_progress')">
                        ⏳ В работу
                    </button>
                    <button class="action-btn btn-close" onclick="updateTicketStatus('closed')">
                        ✅ Закрыть
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    detailEl.style.display = 'block';
}

// Close ticket detail
function closeTicketDetail() {
    document.getElementById('ticket-detail').style.display = 'none';
    currentTicket = null;
}

// Update ticket status
async function updateTicketStatus(newStatus) {
    if (!currentTicket) return;

    try {
        const response = await fetch(`${API_BASE}/tickets/${currentTicket.id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert('Статус обновлён');
            closeTicketDetail();
            loadTickets();
        } else {
            alert('Ошибка обновления статуса');
        }
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

// Filter tickets
function filterTickets() {
    loadTickets();
}

// Submit new request
async function submitRequest(event) {
    event.preventDefault();

    const subject = document.getElementById('subject').value;
    const text = document.getElementById('text').value;
    const resultEl = document.getElementById('request-result');

    resultEl.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}/ingest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subject, text })
        });

        const result = await response.json();

        if (response.ok) {
            resultEl.className = 'result-box success';
            
            if (result.status === 'closed_auto') {
                resultEl.innerHTML = `
                    <h3>✅ Обращение решено автоматически!</h3>
                    <p><strong>Тикет:</strong> #${result.ticket_id}</p>
                    <p><strong>Категория:</strong> ${result.category}</p>
                    <p><strong>Приоритет:</strong> ${result.priority}</p>
                    <p><strong>Ответ:</strong></p>
                    <p style="background: white; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${result.answer}</p>
                `;
            } else {
                resultEl.innerHTML = `
                    <h3>📋 Тикет создан</h3>
                    <p><strong>Номер тикета:</strong> #${result.ticket_id}</p>
                    <p><strong>Статус:</strong> ${result.status}</p>
                    <p><strong>Категория:</strong> ${result.category}</p>
                    <p><strong>Приоритет:</strong> ${result.priority}</p>
                    <p><strong>Отдел:</strong> ${result.department}</p>
                    <p><strong>Резюме:</strong> ${result.summary}</p>
                `;
            }

            // Clear form
            document.getElementById('new-request-form').reset();
        } else {
            throw new Error('Ошибка обработки запроса');
        }
    } catch (error) {
        resultEl.className = 'result-box error';
        resultEl.innerHTML = `<h3>❌ Ошибка</h3><p>${error.message}</p>`;
    }

    resultEl.style.display = 'block';
}

// Load metrics
async function loadMetrics() {
    const contentEl = document.getElementById('metrics-content');
    contentEl.innerHTML = '<p class="loading">Загрузка метрик...</p>';

    try {
        const response = await fetch(`${API_BASE}/metrics`);
        const metrics = await response.json();

        contentEl.innerHTML = `
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${metrics.total}</div>
                    <div class="metric-label">Всего тикетов</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${metrics.auto_resolved}</div>
                    <div class="metric-label">Авто-решено</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${metrics.manual}</div>
                    <div class="metric-label">Ручная обработка</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${metrics.total > 0 ? Math.round(metrics.auto_resolved / metrics.total * 100) : 0}%</div>
                    <div class="metric-label">Автоматизация</div>
                </div>
            </div>

            <div class="breakdown-section">
                <h3>📂 По категориям</h3>
                <div class="breakdown-list">
                    ${Object.entries(metrics.by_category).map(([cat, count]) => `
                        <div class="breakdown-item">
                            <span class="breakdown-name">${cat}</span>
                            <span class="breakdown-count">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="breakdown-section">
                <h3>📊 По статусам</h3>
                <div class="breakdown-list">
                    ${Object.entries(metrics.by_status).map(([status, count]) => {
                        const labels = {
                            'new': 'Новые',
                            'in_progress': 'В работе',
                            'closed': 'Закрытые',
                            'closed_auto': 'Авто-закрытые'
                        };
                        return `
                            <div class="breakdown-item">
                                <span class="breakdown-name">${labels[status] || status}</span>
                                <span class="breakdown-count">${count}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="breakdown-section">
                <h3>⚡ По приоритетам</h3>
                <div class="breakdown-list">
                    ${Object.entries(metrics.by_priority).map(([priority, count]) => `
                        <div class="breakdown-item">
                            <span class="breakdown-name priority-${priority}">${priority.toUpperCase()}</span>
                            <span class="breakdown-count">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        contentEl.innerHTML = `<p class="loading" style="color: #dc3545;">Ошибка загрузки: ${error.message}</p>`;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTickets();
});