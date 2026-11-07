// QUOTES
const QUOTES = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Dreams don't work unless you do.", author: "John C. Maxwell" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Little by little, a little becomes a lot.", author: "Tanzanian Proverb" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
    { text: "One day or day one — you decide.", author: "Unknown" },
    { text: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
    { text: "You are capable of amazing things.", author: "Unknown" },
    { text: "Make each day your masterpiece.", author: "John Wooden" },
    { text: "Small steps every day lead to big results.", author: "Unknown" },
    { text: "Be so good they can't ignore you.", author: "Steve Martin" },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "You've got this. One task at a time.", author: "Unknown" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "Work hard in silence, let success make the noise.", author: "Frank Ocean" },
    { text: "A year from now you'll wish you had started today.", author: "Karen Lamb" },
];

function displayDailyQuote() {
    const today       = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const dayOfYear   = Math.floor((today - startOfYear) / 86400000);
    const q           = QUOTES[dayOfYear % QUOTES.length];
    document.getElementById('quote-text').textContent   = `"${q.text}"`;
    document.getElementById('quote-author').textContent = `— ${q.author}`;
}

// DATA
const STORAGE_KEY = 'weeklyPlanner_v1';

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { weekStart: null, tasks: {}, weeklyGoals: {} };
    try {
        const data = JSON.parse(raw);
        if (!data.weeklyGoals) data.weeklyGoals = {};
        return data;
    } catch (e) {
        return { weekStart: null, tasks: {}, weeklyGoals: {} };
    }
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// DATE HELPERS
const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function parseDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function getWeekDays(weekStartStr) {
    const start = parseDate(weekStartStr);
    const days  = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(d);
    }
    return days;
}

function getWeekRangeLabel(weekStartStr) {
    const days = getWeekDays(weekStartStr);
    const d0   = days[0], d6 = days[6];
    return `${MONTH_NAMES[d0.getMonth()]} ${d0.getDate()} – ${MONTH_NAMES[d6.getMonth()]} ${d6.getDate()}, ${d6.getFullYear()}`;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// TAB NAVIGATION
let activeTab = 'daily';

function showTab(tabName) {
    activeTab = tabName;
    document.getElementById('tab-daily').classList.toggle('active', tabName === 'daily');
    document.getElementById('tab-goals').classList.toggle('active', tabName === 'goals');
    const data = loadData();
    if (!data.weekStart) return;
    if (tabName === 'daily') {
        document.getElementById('week-container').style.display  = 'block';
        document.getElementById('goals-container').style.display = 'none';
        renderWeek();
    } else {
        document.getElementById('week-container').style.display  = 'none';
        document.getElementById('goals-container').style.display = 'flex';
        renderWeeklyGoals();
    }
}

// RENDER DAILY WEEK
function renderWeek() {
    const data     = loadData();
    const todayStr = formatDate(new Date());

    if (!data.weekStart) {
        document.getElementById('welcome-screen').style.display  = 'flex';
        document.getElementById('week-container').style.display  = 'none';
        document.getElementById('goals-container').style.display = 'none';
        document.getElementById('tab-nav').style.display         = 'none';
        document.getElementById('week-label').textContent        = '';
        document.getElementById('start-date-input').value        = todayStr;
        return;
    }

    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('tab-nav').style.display        = 'flex';
    document.getElementById('week-label').textContent       = getWeekRangeLabel(data.weekStart);

    if (activeTab !== 'daily') return;

    document.getElementById('week-container').style.display  = 'block';
    document.getElementById('goals-container').style.display = 'none';

    const days = getWeekDays(data.weekStart);
    const grid = document.getElementById('week-grid');
    grid.innerHTML = '';

    days.forEach((dayDate, index) => {
        const dateStr = formatDate(dayDate);
        const tasks   = data.tasks[dateStr] || [];
        const isToday = dateStr === todayStr;
        const isPast  = dateStr < todayStr;
        const total   = tasks.length;
        const done    = tasks.filter(t => t.completed).length;
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);

        const col = document.createElement('div');
        col.className    = `day-col${isToday ? ' is-today' : ''}${isPast && !isToday ? ' is-past' : ''}`;
        col.dataset.date = dateStr;

        let tasksHTML = '';
        if (tasks.length === 0) {
            tasksHTML = '<div class="no-tasks-msg">No tasks yet — add one below!</div>';
        } else {
            tasks.forEach(task => {
                const hasNextDay   = index < days.length - 1;
                const nextDateStr  = hasNextDay ? formatDate(days[index + 1]) : null;
                const showCarryBtn = hasNextDay && !task.completed;
                tasksHTML += `
                    <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}" id="task-${task.id}">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}
                            onchange="toggleTask('${dateStr}', '${task.id}', this)" title="Mark complete">
                        <div class="task-content">
                            <div class="task-text">${escapeHtml(task.text)}</div>
                            <span class="priority-tag ${task.priority}">${task.priority}</span>
                        </div>
                        <div class="task-actions">
                            <button class="btn-icon" onclick="openEditModal('${dateStr}', '${task.id}')" title="Edit">✏️</button>
                            ${showCarryBtn ? `<button class="btn-icon" onclick="carryForward('${dateStr}', '${task.id}', '${nextDateStr}')" title="Carry forward">➡️</button>` : ''}
                            <button class="btn-icon" onclick="deleteTask('${dateStr}', '${task.id}')" title="Delete">🗑️</button>
                        </div>
                    </div>`;
            });
        }

        col.innerHTML = `
            <div class="day-head">
                <div class="day-name-label">${DAY_NAMES[dayDate.getDay()]}</div>
                <div class="day-number">${dayDate.getDate()}</div>
                <div class="day-month-label">${MONTH_NAMES[dayDate.getMonth()]} ${dayDate.getFullYear()}</div>
                ${isToday ? '<span class="today-pill">Today</span>' : ''}
            </div>
            <div class="progress-wrap">
                <div class="progress-label"><span>Progress</span><span>${done} / ${total} done</span></div>
                <div class="progress-track"><div class="progress-fill" style="width: ${percent}%"></div></div>
            </div>
            <div class="tasks-list" id="tasks-${dateStr}">${tasksHTML}</div>
            <div class="add-task-form">
                <input type="text" class="task-input" id="input-${dateStr}" placeholder="Add a task..."
                    onkeydown="if(event.key==='Enter') addTask('${dateStr}')">
                <div class="form-row">
                    <select class="priority-select" id="priority-${dateStr}">
                        <option value="medium">🟡 Medium</option>
                        <option value="high">🔴 High</option>
                        <option value="low">🟢 Low</option>
                    </select>
                    <button class="btn-add" onclick="addTask('${dateStr}')">+ Add</button>
                </div>
            </div>`;
        grid.appendChild(col);
    });
}

function escapeHtml(text) {
    return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// TASK ACTIONS
function addTask(dateStr) {
    const input    = document.getElementById(`input-${dateStr}`);
    const priority = document.getElementById(`priority-${dateStr}`);
    const text     = input.value.trim();
    if (!text) { input.focus(); return; }
    const data = loadData();
    if (!data.tasks[dateStr]) data.tasks[dateStr] = [];
    data.tasks[dateStr].push({ id: generateId(), text, priority: priority.value, completed: false, createdAt: Date.now() });
    saveData(data); input.value = ''; input.focus(); renderWeek();
}

function toggleTask(dateStr, taskId, checkbox) {
    const data = loadData();
    const task = (data.tasks[dateStr] || []).find(t => t.id === taskId);
    if (!task) return;
    task.completed = checkbox.checked;
    saveData(data);
    if (task.completed) {
        fireConfetti();
        const el = document.getElementById(`task-${taskId}`);
        if (el) { el.classList.add('just-completed'); setTimeout(() => el.classList.remove('just-completed'), 600); }
    }
    renderWeek();
}

function deleteTask(dateStr, taskId) {
    if (!confirm('Delete this task?')) return;
    const data = loadData();
    if (!data.tasks[dateStr]) return;
    data.tasks[dateStr] = data.tasks[dateStr].filter(t => t.id !== taskId);
    saveData(data); renderWeek();
}

function carryForward(fromDate, taskId, toDate) {
    const data      = loadData();
    const fromTasks = data.tasks[fromDate] || [];
    const taskIndex = fromTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    const task = { ...fromTasks[taskIndex] };
    fromTasks.splice(taskIndex, 1);
    data.tasks[fromDate] = fromTasks;
    if (!data.tasks[toDate]) data.tasks[toDate] = [];
    task.id = generateId(); task.completed = false;
    data.tasks[toDate].push(task);
    saveData(data); renderWeek();
}

// EDIT TASK MODAL
let editingDate = null, editingTaskId = null;

function openEditModal(dateStr, taskId) {
    const task = (loadData().tasks[dateStr] || []).find(t => t.id === taskId);
    if (!task) return;
    editingDate = dateStr; editingTaskId = taskId;
    document.getElementById('edit-task-text').value     = task.text;
    document.getElementById('edit-task-priority').value = task.priority;
    document.getElementById('edit-modal').classList.remove('hidden');
}
function closeEditModal() {
    editingDate = null; editingTaskId = null;
    document.getElementById('edit-modal').classList.add('hidden');
}
function saveEdit() {
    const newText = document.getElementById('edit-task-text').value.trim();
    const newPri  = document.getElementById('edit-task-priority').value;
    if (!newText) return;
    const data = loadData();
    const task = (data.tasks[editingDate] || []).find(t => t.id === editingTaskId);
    if (task) { task.text = newText; task.priority = newPri; saveData(data); }
    closeEditModal(); renderWeek();
}

// WEEK START
function startWeek() {
    const dateStr = document.getElementById('start-date-input').value;
    if (!dateStr) { alert('Please pick a start date!'); return; }
    const data = loadData(); data.weekStart = dateStr; saveData(data); renderWeek();
}
function showWeekModal() {
    document.getElementById('change-week-input').value = loadData().weekStart || formatDate(new Date());
    document.getElementById('week-modal').classList.remove('hidden');
}
function closeWeekModal() { document.getElementById('week-modal').classList.add('hidden'); }
function changeWeek() {
    const dateStr = document.getElementById('change-week-input').value;
    if (!dateStr) return;
    const data = loadData(); data.weekStart = dateStr; saveData(data);
    closeWeekModal();
    if (activeTab === 'daily') renderWeek(); else { renderWeek(); renderWeeklyGoals(); }
}

document.getElementById('edit-modal').addEventListener('click', function(e) { if (e.target === this) closeEditModal(); });
document.getElementById('week-modal').addEventListener('click', function(e) { if (e.target === this) closeWeekModal(); });

// RENDER WEEKLY GOALS
function renderWeeklyGoals() {
    const data  = loadData();
    if (!data.weekStart) return;
    const goals   = data.weeklyGoals[data.weekStart] || [];
    const total   = goals.length;
    const done    = goals.filter(g => g.completed).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    document.getElementById('goals-week-range').textContent   = getWeekRangeLabel(data.weekStart);
    document.getElementById('goals-progress-text').textContent = `${done} / ${total} goals completed`;
    document.getElementById('goals-progress-fill').style.width = `${percent}%`;

    const listEl = document.getElementById('goals-list');
    listEl.innerHTML = '';

    if (total > 0 && done === total) {
        const banner = document.createElement('div');
        banner.className   = 'goals-all-done';
        banner.textContent = '🎉 Amazing! You completed ALL your goals this week!';
        listEl.appendChild(banner);
    }

    if (goals.length === 0) {
        listEl.innerHTML = '<div class="no-goals-msg">No goals set for this week yet — add one below! 👇</div>';
        return;
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sorted = [...goals].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    sorted.forEach(goal => {
        const item = document.createElement('div');
        item.className = `goal-item priority-${goal.priority} ${goal.completed ? 'completed' : ''}`;
        item.id        = `goal-${goal.id}`;
        item.innerHTML = `
            <input type="checkbox" class="goal-checkbox" ${goal.completed ? 'checked' : ''}
                onchange="toggleWeeklyGoal('${goal.id}', this)" title="Mark as achieved">
            <div class="goal-content">
                <div class="goal-text">${escapeHtml(goal.text)}</div>
                <span class="goal-priority-tag ${goal.priority}">${goal.priority} priority</span>
            </div>
            <div class="goal-actions">
                <button class="btn-icon" onclick="openEditGoalModal('${goal.id}')" title="Edit">✏️</button>
                <button class="btn-icon" onclick="deleteWeeklyGoal('${goal.id}')" title="Delete">🗑️</button>
            </div>`;
        listEl.appendChild(item);
    });
}

// WEEKLY GOALS ACTIONS
function addWeeklyGoal() {
    const input    = document.getElementById('goal-input');
    const priority = document.getElementById('goal-priority-select');
    const text     = input.value.trim();
    if (!text) { input.focus(); return; }
    const data = loadData();
    if (!data.weeklyGoals[data.weekStart]) data.weeklyGoals[data.weekStart] = [];
    data.weeklyGoals[data.weekStart].push({ id: generateId(), text, priority: priority.value, completed: false, createdAt: Date.now() });
    saveData(data); input.value = ''; input.focus(); renderWeeklyGoals();
}

function toggleWeeklyGoal(goalId, checkbox) {
    const data  = loadData();
    const goals = data.weeklyGoals[data.weekStart] || [];
    const goal  = goals.find(g => g.id === goalId);
    if (!goal) return;
    goal.completed = checkbox.checked;
    saveData(data);
    if (goal.completed) {
        fireConfetti();
        const el = document.getElementById(`goal-${goalId}`);
        if (el) { el.classList.add('just-completed'); setTimeout(() => el.classList.remove('just-completed'), 600); }
    }
    renderWeeklyGoals();
}

function deleteWeeklyGoal(goalId) {
    if (!confirm('Delete this goal?')) return;
    const data  = loadData();
    const goals = data.weeklyGoals[data.weekStart] || [];
    data.weeklyGoals[data.weekStart] = goals.filter(g => g.id !== goalId);
    saveData(data); renderWeeklyGoals();
}

// EDIT GOAL MODAL
let editingGoalId = null;

function openEditGoalModal(goalId) {
    const data = loadData();
    const goal = (data.weeklyGoals[data.weekStart] || []).find(g => g.id === goalId);
    if (!goal) return;
    editingGoalId = goalId;
    document.getElementById('edit-goal-text').value     = goal.text;
    document.getElementById('edit-goal-priority').value = goal.priority;
    document.getElementById('edit-goal-modal').classList.remove('hidden');
}
function closeEditGoalModal() {
    editingGoalId = null;
    document.getElementById('edit-goal-modal').classList.add('hidden');
}
function saveGoalEdit() {
    const newText = document.getElementById('edit-goal-text').value.trim();
    const newPri  = document.getElementById('edit-goal-priority').value;
    if (!newText) return;
    const data  = loadData();
    const goal  = (data.weeklyGoals[data.weekStart] || []).find(g => g.id === editingGoalId);
    if (goal) { goal.text = newText; goal.priority = newPri; saveData(data); }
    closeEditGoalModal(); renderWeeklyGoals();
}
document.getElementById('edit-goal-modal').addEventListener('click', function(e) { if (e.target === this) closeEditGoalModal(); });

// CONFETTI
const canvas = document.getElementById('confetti-canvas');
const ctx    = canvas.getContext('2d');
let particles = [], animationId = null;
const CONFETTI_COLORS = ['#667eea','#764ba2','#f59e0b','#10b981','#ef4444','#ec4899','#06b6d4','#f97316'];

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createParticle() {
    return { x: Math.random() * canvas.width, y: -20, size: Math.random() * 10 + 5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        speedX: (Math.random() - 0.5) * 5, speedY: Math.random() * 4 + 2,
        rotation: Math.random() * 360, rotationSpeed: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.5 ? 'rect' : 'circle', opacity: 1 };
}

function fireConfetti() {
    if (animationId) { cancelAnimationFrame(animationId); ctx.clearRect(0, 0, canvas.width, canvas.height); }
    particles = [];
    for (let i = 0; i < 90; i++) { const p = createParticle(); p.y = Math.random() * -150; particles.push(p); }
    animateConfetti();
}

function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.x += p.speedX; p.y += p.speedY; p.rotation += p.rotationSpeed; p.speedY += 0.06; p.opacity -= 0.009;
        if (p.opacity <= 0) return;
        ctx.save(); ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180); ctx.fillStyle = p.color;
        if (p.shape === 'rect') { ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2); }
        else { ctx.beginPath(); ctx.arc(0, 0, p.size/2, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
    });
    particles = particles.filter(p => p.opacity > 0 && p.y < canvas.height + 60);
    if (particles.length > 0) { animationId = requestAnimationFrame(animateConfetti); }
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); animationId = null; }
}

// INIT
displayDailyQuote();
renderWeek();