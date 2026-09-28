/**
 * CRM - Dashboard JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Enforce authentication
  Auth.checkAuth(false);

  // Initialize Dashboard Views
  loadStatCards();
  loadSalesChart();
  loadRecentActivities();
  setupQuickActionModals();
});

/**
 * 1. Calculate & Render Dynamic Metric Cards
 */
function loadStatCards() {
  const customers = CRMData.getCustomers();
  const leads = CRMData.getLeads();
  const tasks = CRMData.getTasks();
  const sales = CRMData.getSales();

  // Dynamically calculate metrics
  const totalCustomersCount = customers.length;
  const totalLeadsCount = leads.length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;

  // Calculate won deals total revenue
  const wonSalesTotal = sales
    .filter(s => s.status === 'Won')
    .reduce((sum, item) => sum + (Number(item.dealValue) || 0), 0);

  // Animate numbers
  animateCounter('stat-customers-val', totalCustomersCount);
  animateCounter('stat-leads-val', totalLeadsCount);
  animateCounter('stat-tasks-val', pendingTasksCount);

  const salesEl = document.getElementById('stat-sales-val');
  if (salesEl) {
    salesEl.textContent = CRMData.formatINR(wonSalesTotal);
  }
}

/**
 * Number counting animation for polished feel
 */
function animateCounter(id, targetValue) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = 0;
  const duration = 800;
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quartic
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    const currentVal = Math.floor(easeProgress * targetValue);
    el.textContent = currentVal.toLocaleString('en-IN');

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      el.textContent = targetValue.toLocaleString('en-IN');
    }
  }
  requestAnimationFrame(updateCount);
}

/**
 * 2. Pure CSS / HTML / JS Sales Overview Bar Chart
 */
function loadSalesChart() {
  const chartWrapper = document.getElementById('sales-bar-chart');
  if (!chartWrapper) return;

  // Monthly sales data (Jan - Jun)
  const monthlyData = [
    { month: 'Jan', value: 95000 },
    { month: 'Feb', value: 120000 },
    { month: 'Mar', value: 140000 },
    { month: 'Apr', value: 110000 },
    { month: 'May', value: 160000 },
    { month: 'Jun', value: 220000 }
  ];

  const maxValue = 250000; // Y-axis ceiling
  chartWrapper.innerHTML = '';

  // Render horizontal grid lines
  const gridLevels = [0, 50000, 100000, 150000, 200000, 250000];
  gridLevels.forEach(val => {
    const bottomPercent = (val / maxValue) * 100;
    const gridLine = document.createElement('div');
    gridLine.className = 'chart-grid-line';
    gridLine.style.bottom = `${bottomPercent}%`;

    const label = document.createElement('span');
    label.className = 'chart-y-label';
    label.style.bottom = `${bottomPercent}%`;
    label.textContent = val === 0 ? '₹0' : `₹${val / 1000}k`;

    chartWrapper.appendChild(gridLine);
    chartWrapper.appendChild(label);
  });

  // Render bars for each month
  monthlyData.forEach((item, index) => {
    const percentHeight = Math.min((item.value / maxValue) * 100, 100);

    const col = document.createElement('div');
    col.className = 'bar-column';
    col.innerHTML = `
      <div class="bar-track">
        <div class="bar-fill" id="bar-fill-${index}" style="height: 0%;">
          <div class="bar-tooltip">${item.month}: ${CRMData.formatINR(item.value)}</div>
        </div>
      </div>
      <div class="bar-label">${item.month}</div>
    `;

    chartWrapper.appendChild(col);

    // Staggered animation for bar fill heights
    setTimeout(() => {
      const fillEl = document.getElementById(`bar-fill-${index}`);
      if (fillEl) {
        fillEl.style.height = `${percentHeight}%`;
      }
    }, 150 + index * 100);
  });
}

/**
 * 3. Render Recent Activities Feed
 */
function loadRecentActivities() {
  const listEl = document.getElementById('activities-feed');
  if (!listEl) return;

  const activities = CRMData.getActivities();
  if (activities.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state" style="padding: 24px 0;">
        <i class="fa-regular fa-clock empty-state-icon" style="width: 44px; height: 44px; font-size: 20px;"></i>
        <p style="margin: 0; font-size: 13px;">No recent activities yet.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = activities.slice(0, 6).map(act => {
    let iconClass = 'fa-solid fa-user-plus';
    let typeClass = act.type || 'customer';

    if (act.type === 'deal') {
      iconClass = 'fa-solid fa-handshake';
    } else if (act.type === 'lead') {
      iconClass = 'fa-solid fa-bullseye';
    } else if (act.type === 'task') {
      iconClass = 'fa-solid fa-circle-check';
    }

    return `
      <div class="activity-item">
        <div class="activity-avatar ${typeClass}">
          <i class="${iconClass}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-text">${escapeHtml(act.text)}</div>
          <div class="activity-time">
            <i class="fa-regular fa-clock"></i>
            <span>${act.time || 'Recently'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 4. Wire Quick Action Modals on Dashboard
 */
function setupQuickActionModals() {
  // Setup Add Customer Modal
  const openCustomerModalBtn = document.getElementById('qa-add-customer-btn');
  const customerModal = document.getElementById('quick-customer-modal');
  const customerForm = document.getElementById('quick-customer-form');
  const closeCustomerModalBtn = document.getElementById('close-quick-customer-modal');
  const cancelCustomerModalBtn = document.getElementById('cancel-quick-customer-modal');

  if (openCustomerModalBtn && customerModal) {
    openCustomerModalBtn.addEventListener('click', () => {
      customerForm.reset();
      customerModal.classList.add('open');
    });
  }

  [closeCustomerModalBtn, cancelCustomerModalBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', () => customerModal.classList.remove('open'));
  });

  if (customerForm) {
    customerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('qc-name').value.trim();
      const email = document.getElementById('qc-email').value.trim();
      const phone = document.getElementById('qc-phone').value.trim();
      const company = document.getElementById('qc-company').value.trim();
      const status = document.getElementById('qc-status').value;

      if (!name || !email || !company) {
        showToast('Please fill in all required customer fields.', 'error');
        return;
      }

      const customers = CRMData.getCustomers();
      const newCustomer = {
        id: CRMData.generateId('cust'),
        name,
        email,
        phone: phone || 'N/A',
        company,
        status,
        createdAt: new Date().toISOString().split('T')[0]
      };

      customers.unshift(newCustomer);
      CRMData.saveCustomers(customers);
      CRMData.addActivity(`${name} added as a new customer`, 'customer');

      customerModal.classList.remove('open');
      showToast(`Customer "${name}" added successfully!`, 'success');
      loadStatCards();
      loadRecentActivities();
    });
  }

  // Setup Add Lead Modal
  const openLeadModalBtn = document.getElementById('qa-add-lead-btn');
  const leadModal = document.getElementById('quick-lead-modal');
  const leadForm = document.getElementById('quick-lead-form');
  const closeLeadModalBtn = document.getElementById('close-quick-lead-modal');
  const cancelLeadModalBtn = document.getElementById('cancel-quick-lead-modal');

  if (openLeadModalBtn && leadModal) {
    openLeadModalBtn.addEventListener('click', () => {
      leadForm.reset();
      leadModal.classList.add('open');
    });
  }

  [closeLeadModalBtn, cancelLeadModalBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', () => leadModal.classList.remove('open'));
  });

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('ql-name').value.trim();
      const company = document.getElementById('ql-company').value.trim();
      const contact = document.getElementById('ql-contact').value.trim();
      const status = document.getElementById('ql-status').value;
      const followUpDate = document.getElementById('ql-date').value;

      if (!name || !company || !contact) {
        showToast('Please fill in all required lead fields.', 'error');
        return;
      }

      const leads = CRMData.getLeads();
      const newLead = {
        id: CRMData.generateId('lead'),
        name,
        company,
        contact,
        status,
        followUpDate: followUpDate || new Date().toISOString().split('T')[0]
      };

      leads.unshift(newLead);
      CRMData.saveLeads(leads);
      CRMData.addActivity(`New lead added: ${name} (${company})`, 'lead');

      leadModal.classList.remove('open');
      showToast(`Lead "${name}" added successfully!`, 'success');
      loadStatCards();
      loadRecentActivities();
    });
  }

  // Setup Add Task Modal
  const openTaskModalBtn = document.getElementById('qa-add-task-btn');
  const taskModal = document.getElementById('quick-task-modal');
  const taskForm = document.getElementById('quick-task-form');
  const closeTaskModalBtn = document.getElementById('close-quick-task-modal');
  const cancelTaskModalBtn = document.getElementById('cancel-quick-task-modal');

  if (openTaskModalBtn && taskModal) {
    openTaskModalBtn.addEventListener('click', () => {
      taskForm.reset();
      taskModal.classList.add('open');
    });
  }

  [closeTaskModalBtn, cancelTaskModalBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', () => taskModal.classList.remove('open'));
  });

  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const task = document.getElementById('qt-task').value.trim();
      const date = document.getElementById('qt-date').value;
      const priority = document.getElementById('qt-priority').value;
      const status = document.getElementById('qt-status').value;

      if (!task || !date) {
        showToast('Please provide a task description and due date.', 'error');
        return;
      }

      const tasks = CRMData.getTasks();
      const newTask = {
        id: CRMData.generateId('task'),
        task,
        date,
        priority,
        status
      };

      tasks.unshift(newTask);
      CRMData.saveTasks(tasks);
      CRMData.addActivity(`New task created: ${task}`, 'task');

      taskModal.classList.remove('open');
      showToast('Task added successfully!', 'success');
      loadStatCards();
      loadRecentActivities();
    });
  }

  // Close modals on overlay backdrop click
  [customerModal, leadModal, taskModal].forEach(m => {
    if (m) {
      m.addEventListener('click', (e) => {
        if (e.target === m) m.classList.remove('open');
      });
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
