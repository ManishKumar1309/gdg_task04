/**
 * CRM - Dashboard JavaScript
 */

// Global Chart Instances
const dashboardCharts = {
  salesLine: null,
  leadStatus: null,
  monthlyLeads: null
};

document.addEventListener('DOMContentLoaded', () => {
  // Enforce authentication
  Auth.checkAuth(false);

  // Initialize Dashboard Views
  loadStatCards();
  initDashboardCharts();
  loadRecentActivities();
  setupActivityActions();
  setupQuickActionModals();

  // Listen for storage events (multi-tab sync)
  window.addEventListener('storage', (e) => {
    if (['crm_sales', 'crm_leads', 'crm_customers', 'crm_tasks'].includes(e.key)) {
      loadStatCards();
      updateDashboardCharts();
      loadRecentActivities();
    }
  });

  // Observe theme changes to adapt Chart.js colors immediately
  const themeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        updateDashboardCharts(true);
        break;
      }
    }
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
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
 * Helper: Resolve Chart Colors matching NEXORA Dark/Light Themes
 */
function getChartTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    isDark,
    textColor: isDark ? '#94a3b8' : '#64748b',
    headingColor: isDark ? '#f8fafc' : '#0f172a',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    cardBg: isDark ? '#141416' : '#ffffff',
    tooltipBg: isDark ? '#1e1e24' : '#0f172a',
    tooltipText: isDark ? '#f8fafc' : '#ffffff',
    tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    emerald: '#10b981',
    emeraldHover: '#34d399',
    purple: '#8b5cf6',
    purpleHover: '#a78bfa',
    sky: '#38bdf8',
    amber: '#f59e0b'
  };
}

/**
 * 2. Initialize and Render all 3 Chart.js Charts
 */
function initDashboardCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js library is loading...');
    setTimeout(initDashboardCharts, 50);
    return;
  }
  updateDashboardCharts();
}

/**
 * Refresh or build all 3 charts
 */
function updateDashboardCharts(isThemeChangeOnly = false) {
  if (typeof Chart === 'undefined') return;

  renderMonthlySalesLineChart();
  renderLeadStatusDoughnutChart();
  renderMonthlyLeadsBarChart();
}

/**
 * Chart 1: Monthly Sales — Line Chart (Jan - Dec)
 */
function renderMonthlySalesLineChart() {
  const canvas = document.getElementById('monthly-sales-chart');
  if (!canvas) return;

  const theme = getChartTheme();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Baseline monthly revenue data (clearly identified sample data for historical run rate)
  const monthlyRevenue = [95000, 120000, 140000, 110000, 160000, 220000, 185000, 210000, 0, 0, 0, 0];

  // Aggregate actual sales records from CRMData
  const sales = CRMData.getSales();
  sales.forEach(sale => {
    if (sale.status === 'Won' && sale.date) {
      const parts = sale.date.split('-');
      if (parts.length >= 2) {
        const mIdx = parseInt(parts[1], 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          monthlyRevenue[mIdx] += (Number(sale.dealValue) || 0);
        }
      }
    }
  });

  const totalSalesRevenue = monthlyRevenue.reduce((sum, v) => sum + v, 0);
  const totalBadgeEl = document.getElementById('sales-chart-total-badge');
  if (totalBadgeEl) {
    totalBadgeEl.textContent = `Total: ${CRMData.formatINR(totalSalesRevenue)}`;
  }

  // Destroy previous instance to avoid duplicates
  if (dashboardCharts.salesLine) {
    dashboardCharts.salesLine.destroy();
    dashboardCharts.salesLine = null;
  }

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 280);
  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.32)');
  gradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.04)');
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

  dashboardCharts.salesLine = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Won Revenue',
        data: monthlyRevenue,
        borderColor: theme.emerald,
        borderWidth: 3,
        backgroundColor: gradient,
        fill: true,
        tension: 0.38,
        pointBackgroundColor: theme.emerald,
        pointBorderColor: theme.cardBg,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: theme.emeraldHover,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipText,
          bodyColor: theme.tooltipText,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              return ' Won Revenue: ' + CRMData.formatINR(context.parsed.y);
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: theme.textColor,
            font: {
              family: 'Inter, sans-serif',
              size: 11,
              weight: '500'
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: theme.gridColor,
            drawBorder: false
          },
          ticks: {
            color: theme.textColor,
            font: {
              family: 'Inter, sans-serif',
              size: 11
            },
            callback: function(val) {
              if (val >= 100000) {
                const l = val / 100000;
                return '₹' + (Number.isInteger(l) ? l : l.toFixed(1)) + 'L';
              } else if (val >= 1000) {
                return '₹' + Math.round(val / 1000) + 'k';
              }
              return '₹' + val;
            }
          }
        }
      }
    }
  });
}

/**
 * Chart 2: Lead Status — Doughnut Chart (New, Contacted, Converted)
 */
function renderLeadStatusDoughnutChart() {
  const canvas = document.getElementById('lead-status-chart');
  const legendEl = document.getElementById('lead-status-legend');
  if (!canvas) return;

  const theme = getChartTheme();
  const leads = CRMData.getLeads();

  const counts = {
    New: 0,
    Contacted: 0,
    Converted: 0
  };

  leads.forEach(l => {
    if (counts[l.status] !== undefined) {
      counts[l.status]++;
    } else {
      counts.New++;
    }
  });

  const totalLeads = leads.length;
  const statusLabels = ['New', 'Contacted', 'Converted'];
  const statusData = [counts.New, counts.Contacted, counts.Converted];
  const statusColors = [theme.sky, theme.amber, theme.emerald];
  const statusHoverColors = ['#0284c7', '#d97706', '#059669'];

  // Render Custom HTML Legend with Counts and Percentages
  if (legendEl) {
    legendEl.innerHTML = statusLabels.map((label, idx) => {
      const count = statusData[idx];
      const pct = totalLeads ? Math.round((count / totalLeads) * 100) : 0;
      return `
        <div class="doughnut-legend-item">
          <div class="doughnut-legend-left">
            <span class="legend-badge-dot" style="background: ${statusColors[idx]};"></span>
            <span class="doughnut-legend-label">${label}</span>
          </div>
          <div class="doughnut-legend-right">
            <span class="doughnut-legend-count">${count}</span>
            <span class="doughnut-legend-pct">${pct}%</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Destroy previous instance to avoid duplicates
  if (dashboardCharts.leadStatus) {
    dashboardCharts.leadStatus.destroy();
    dashboardCharts.leadStatus = null;
  }

  // Center Text Plugin displaying Total Leads in the hole of the doughnut
  const centerTextPlugin = {
    id: 'leadDoughnutCenterText',
    beforeDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea || !ctx) return;
      const { left, right, top, bottom } = chartArea;
      ctx.save();
      const currentTheme = getChartTheme();
      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillStyle = currentTheme.textColor;
      ctx.fillText('TOTAL LEADS', centerX, centerY - 11);

      ctx.font = '700 24px Inter, sans-serif';
      ctx.fillStyle = currentTheme.headingColor;
      ctx.fillText(totalLeads.toString(), centerX, centerY + 13);
      ctx.restore();
    }
  };

  const ctx = canvas.getContext('2d');
  dashboardCharts.leadStatus = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: statusLabels,
      datasets: [{
        data: totalLeads === 0 ? [1, 1, 1] : statusData,
        backgroundColor: totalLeads === 0 ? ['#e2e8f0', '#e2e8f0', '#e2e8f0'] : statusColors,
        hoverBackgroundColor: totalLeads === 0 ? ['#cbd5e1', '#cbd5e1', '#cbd5e1'] : statusHoverColors,
        borderColor: theme.cardBg,
        borderWidth: 3,
        hoverOffset: totalLeads === 0 ? 0 : 6
      }]
    },
    plugins: [centerTextPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: totalLeads > 0,
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipText,
          bodyColor: theme.tooltipText,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          callbacks: {
            label: function(context) {
              const val = context.parsed;
              const pct = totalLeads ? Math.round((val / totalLeads) * 100) : 0;
              return ` ${context.label}: ${val} leads (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Chart 3: Monthly Leads — Bar Chart (Jan - Dec)
 */
function renderMonthlyLeadsBarChart() {
  const canvas = document.getElementById('monthly-leads-chart');
  if (!canvas) return;

  const theme = getChartTheme();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Baseline monthly leads generated across the year (sample benchmark for months prior to current tracking)
  const monthlyLeads = [8, 12, 15, 11, 19, 24, 21, 26, 0, 0, 0, 0];

  const leads = CRMData.getLeads();
  leads.forEach(lead => {
    const dateStr = lead.followUpDate || lead.createdAt || '2026-09-15';
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const mIdx = parseInt(parts[1], 10) - 1;
      if (mIdx >= 0 && mIdx < 12) {
        monthlyLeads[mIdx] += 1;
      }
    }
  });

  const totalLeadsYear = monthlyLeads.reduce((a, b) => a + b, 0);
  const leadsBadgeEl = document.getElementById('leads-chart-total-badge');
  if (leadsBadgeEl) {
    leadsBadgeEl.textContent = `Total: ${totalLeadsYear} Leads`;
  }

  // Destroy previous instance to avoid duplicates
  if (dashboardCharts.monthlyLeads) {
    dashboardCharts.monthlyLeads.destroy();
    dashboardCharts.monthlyLeads = null;
  }

  const ctx = canvas.getContext('2d');
  dashboardCharts.monthlyLeads = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Leads Generated',
        data: monthlyLeads,
        backgroundColor: 'rgba(139, 92, 246, 0.82)',
        hoverBackgroundColor: 'rgba(139, 92, 246, 1)',
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 32
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipText,
          bodyColor: theme.tooltipText,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          callbacks: {
            label: function(context) {
              return ` Leads Generated: ${context.parsed.y} leads`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: theme.textColor,
            font: {
              family: 'Inter, sans-serif',
              size: 11,
              weight: '500'
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: theme.gridColor,
            drawBorder: false
          },
          ticks: {
            precision: 0,
            color: theme.textColor,
            font: {
              family: 'Inter, sans-serif',
              size: 11
            }
          }
        }
      }
    }
  });
}

/**
 * 3. Render Recent Activities Feed
 */
function loadRecentActivities() {
  const listEl = document.getElementById('activities-feed');
  const clearBtn = document.getElementById('clear-activities-btn');
  if (!listEl) return;

  const activities = CRMData.getActivities();
  if (clearBtn) {
    clearBtn.disabled = activities.length === 0;
  }

  if (activities.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state" style="padding: 24px 0;">
        <i class="fa-regular fa-clock empty-state-icon" style="width: 44px; height: 44px; font-size: 20px;"></i>
        <p style="margin: 0; font-size: 13px;">No recent activities yet.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = activities.slice(0, 10).map((act, index) => {
    const actId = act.id || ('act-' + index);
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
      <div class="activity-item" data-id="${actId}">
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
        <button type="button" class="activity-delete-btn" data-id="${actId}" title="Delete activity" aria-label="Delete this activity">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
  }).join('');
}

/**
 * Wire delete & clear actions for Recent Activities
 */
function setupActivityActions() {
  const listEl = document.getElementById('activities-feed');
  const clearBtn = document.getElementById('clear-activities-btn');

  if (listEl) {
    listEl.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.activity-delete-btn');
      if (!deleteBtn) return;

      const actId = deleteBtn.getAttribute('data-id');
      if (!actId) return;

      const itemEl = deleteBtn.closest('.activity-item');
      if (itemEl) {
        itemEl.classList.add('removing');
      }

      setTimeout(() => {
        CRMData.deleteActivity(actId);
        loadRecentActivities();
        showToast('Activity removed.', 'info');
      }, 180);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const activities = CRMData.getActivities();
      if (activities.length === 0) return;

      confirmAction({
        title: 'Clear All Activities',
        message: 'Are you sure you want to clear all recent activities? This action cannot be undone.',
        confirmText: 'Clear All',
        onConfirm: () => {
          CRMData.clearActivities();
          loadRecentActivities();
          showToast('All recent activities cleared.', 'info');
        }
      });
    });
  }
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

  const quickCustomerSchema = {
    '#qc-name': (val) => CRMValidator.validateName(val, 'Customer name'),
    '#qc-email': (val) => CRMValidator.validateEmail(val),
    '#qc-phone': {
      type: 'phone',
      fn: (val) => CRMValidator.validatePhone(val, false)
    },
    '#qc-company': (val) => CRMValidator.validateCompany(val, true),
    '#qc-status': (val) => CRMValidator.validateRequired(val, 'Status')
  };

  if (customerForm) {
    CRMValidator.setupForm(customerForm, quickCustomerSchema);
  }

  if (openCustomerModalBtn && customerModal) {
    openCustomerModalBtn.addEventListener('click', () => {
      customerForm.reset();
      CRMValidator.clearFormErrors(customerForm);
      customerModal.classList.add('open');
    });
  }

  [closeCustomerModalBtn, cancelCustomerModalBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', () => customerModal.classList.remove('open'));
  });

  if (customerForm) {
    customerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!CRMValidator.validateForm(customerForm, quickCustomerSchema)) {
        return;
      }

      const name = document.getElementById('qc-name').value.trim();
      const email = document.getElementById('qc-email').value.trim();
      const phone = document.getElementById('qc-phone').value.trim();
      const company = document.getElementById('qc-company').value.trim();
      const status = document.getElementById('qc-status').value;

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
      updateDashboardCharts();
    });
  }

  // Setup Add Lead Modal
  const openLeadModalBtn = document.getElementById('qa-add-lead-btn');
  const leadModal = document.getElementById('quick-lead-modal');
  const leadForm = document.getElementById('quick-lead-form');
  const closeLeadModalBtn = document.getElementById('close-quick-lead-modal');
  const cancelLeadModalBtn = document.getElementById('cancel-quick-lead-modal');

  const quickLeadSchema = {
    '#ql-name': (val) => CRMValidator.validateName(val, 'Lead full name'),
    '#ql-company': (val) => CRMValidator.validateCompany(val, true),
    '#ql-contact': {
      type: 'phone',
      fn: (val) => CRMValidator.validatePhone(val, true)
    },
    '#ql-status': (val) => CRMValidator.validateRequired(val, 'Status'),
    '#ql-date': (val) => CRMValidator.validateDate(val, false, 'Follow-up date')
  };

  if (leadForm) {
    CRMValidator.setupForm(leadForm, quickLeadSchema);
  }

  if (openLeadModalBtn && leadModal) {
    openLeadModalBtn.addEventListener('click', () => {
      leadForm.reset();
      CRMValidator.clearFormErrors(leadForm);
      leadModal.classList.add('open');
    });
  }

  [closeLeadModalBtn, cancelLeadModalBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', () => leadModal.classList.remove('open'));
  });

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!CRMValidator.validateForm(leadForm, quickLeadSchema)) {
        return;
      }

      const name = document.getElementById('ql-name').value.trim();
      const company = document.getElementById('ql-company').value.trim();
      const contact = document.getElementById('ql-contact').value.trim();
      const status = document.getElementById('ql-status').value;
      const followUpDate = document.getElementById('ql-date').value;

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
      updateDashboardCharts();
    });
  }

  // Setup Add Task Modal
  const openTaskModalBtn = document.getElementById('qa-add-task-btn');
  const taskModal = document.getElementById('quick-task-modal');
  const taskForm = document.getElementById('quick-task-form');
  const closeTaskModalBtn = document.getElementById('close-quick-task-modal');
  const cancelTaskModalBtn = document.getElementById('cancel-quick-task-modal');

  const quickTaskSchema = {
    '#qt-task': (val) => CRMValidator.validateTask(val),
    '#qt-date': (val) => CRMValidator.validateDate(val, true, 'Due date'),
    '#qt-priority': (val) => CRMValidator.validateRequired(val, 'Priority'),
    '#qt-status': (val) => CRMValidator.validateRequired(val, 'Status')
  };

  if (taskForm) {
    CRMValidator.setupForm(taskForm, quickTaskSchema);
  }

  if (openTaskModalBtn && taskModal) {
    openTaskModalBtn.addEventListener('click', () => {
      taskForm.reset();
      CRMValidator.clearFormErrors(taskForm);
      taskModal.classList.add('open');
    });
  }

  [closeTaskModalBtn, cancelTaskModalBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', () => taskModal.classList.remove('open'));
  });

  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!CRMValidator.validateForm(taskForm, quickTaskSchema)) {
        return;
      }

      const task = document.getElementById('qt-task').value.trim();
      const date = document.getElementById('qt-date').value;
      const priority = document.getElementById('qt-priority').value;
      const status = document.getElementById('qt-status').value;

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
      updateDashboardCharts();
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
