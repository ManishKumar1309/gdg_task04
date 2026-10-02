/**
 * CRM - Common Application Logic & Data Layer
 * Vanilla JavaScript (ES6)
 */

// --- Data Layer & LocalStorage Manager ---
const CRMData = {
  KEYS: {
    CUSTOMERS: 'crm_customers',
    LEADS: 'crm_leads',
    TASKS: 'crm_tasks',
    SALES: 'crm_sales',
    ACTIVITIES: 'crm_activities',
    AUTH: 'crm_logged_in',
    USER: 'crm_user'
  },

  // Initialize realistic dummy data if not already present
  init() {
    if (!localStorage.getItem(this.KEYS.CUSTOMERS)) {
      const defaultCustomers = [
        {
          id: 'cust-1',
          name: 'Rahul Sharma',
          email: 'rahul@example.com',
          phone: '9876543210',
          company: 'TechNova',
          status: 'Active',
          createdAt: '2026-09-10'
        },
        {
          id: 'cust-2',
          name: 'Priya Singh',
          email: 'priya@example.com',
          phone: '9876543211',
          company: 'CloudWorks',
          status: 'Active',
          createdAt: '2026-09-12'
        },
        {
          id: 'cust-3',
          name: 'Aman Verma',
          email: 'aman@example.com',
          phone: '9876543212',
          company: 'InnoSoft',
          status: 'Inactive',
          createdAt: '2026-09-15'
        },
        {
          id: 'cust-4',
          name: 'Neha Gupta',
          email: 'neha@example.com',
          phone: '9876543213',
          company: 'WebCore',
          status: 'Active',
          createdAt: '2026-09-18'
        },
        {
          id: 'cust-5',
          name: 'Rohit Kumar',
          email: 'rohit@example.com',
          phone: '9876543214',
          company: 'DataTech',
          status: 'Pending',
          createdAt: '2026-09-22'
        },
        {
          id: 'cust-6',
          name: 'Ananya Iyer',
          email: 'ananya@example.com',
          phone: '9876543215',
          company: 'StellarAI',
          status: 'Active',
          createdAt: '2026-09-24'
        }
      ];
      localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(defaultCustomers));
    }

    if (!localStorage.getItem(this.KEYS.LEADS)) {
      const defaultLeads = [
        {
          id: 'lead-1',
          name: 'Arjun Mehta',
          company: 'FinTech Pro',
          contact: '9876500001',
          status: 'New',
          followUpDate: '2026-09-28'
        },
        {
          id: 'lead-2',
          name: 'Sneha Kapoor',
          company: 'BrightLabs',
          contact: '9876500002',
          status: 'Contacted',
          followUpDate: '2026-09-30'
        },
        {
          id: 'lead-3',
          name: 'Vikas Jain',
          company: 'NextGen',
          contact: '9876500003',
          status: 'Converted',
          followUpDate: '2026-10-02'
        },
        {
          id: 'lead-4',
          name: 'Karan Singh',
          company: 'SoftEdge',
          contact: '9876500004',
          status: 'New',
          followUpDate: '2026-10-04'
        },
        {
          id: 'lead-5',
          name: 'Pooja Desai',
          company: 'HealthSync',
          contact: '9876500005',
          status: 'Contacted',
          followUpDate: '2026-10-06'
        }
      ];
      localStorage.setItem(this.KEYS.LEADS, JSON.stringify(defaultLeads));
    }

    if (!localStorage.getItem(this.KEYS.TASKS)) {
      const defaultTasks = [
        {
          id: 'task-1',
          task: 'Call Rahul Sharma',
          date: '2026-09-28',
          priority: 'High',
          status: 'Pending'
        },
        {
          id: 'task-2',
          task: 'Send proposal to TechNova',
          date: '2026-09-29',
          priority: 'Medium',
          status: 'In Progress'
        },
        {
          id: 'task-3',
          task: 'Follow up with Arjun',
          date: '2026-09-30',
          priority: 'High',
          status: 'Pending'
        },
        {
          id: 'task-4',
          task: 'Update customer details',
          date: '2026-10-01',
          priority: 'Low',
          status: 'Completed'
        },
        {
          id: 'task-5',
          task: 'Schedule demo with BrightLabs',
          date: '2026-10-03',
          priority: 'Medium',
          status: 'Pending'
        },
        {
          id: 'task-6',
          task: 'Prepare quarterly sales pipeline',
          date: '2026-10-05',
          priority: 'High',
          status: 'In Progress'
        }
      ];
      localStorage.setItem(this.KEYS.TASKS, JSON.stringify(defaultTasks));
    }

    if (!localStorage.getItem(this.KEYS.SALES)) {
      // Won deals sum exactly to ₹8,45,000 (250000 + 180000 + 215000 + 200000)
      const defaultSales = [
        {
          id: 'sale-1',
          customer: 'Rahul Sharma',
          company: 'TechNova',
          dealValue: 250000,
          date: '2026-09-20',
          status: 'Won'
        },
        {
          id: 'sale-2',
          customer: 'Priya Singh',
          company: 'CloudWorks',
          dealValue: 180000,
          date: '2026-09-24',
          status: 'Won'
        },
        {
          id: 'sale-3',
          customer: 'Vikas Jain',
          company: 'NextGen',
          dealValue: 215000,
          date: '2026-09-26',
          status: 'Won'
        },
        {
          id: 'sale-4',
          customer: 'Arjun Mehta',
          company: 'FinTech Pro',
          dealValue: 200000,
          date: '2026-09-27',
          status: 'Won'
        },
        {
          id: 'sale-5',
          customer: 'Sneha Kapoor',
          company: 'BrightLabs',
          dealValue: 120000,
          date: '2026-09-29',
          status: 'Pending'
        },
        {
          id: 'sale-6',
          customer: 'Karan Singh',
          company: 'SoftEdge',
          dealValue: 95000,
          date: '2026-10-01',
          status: 'Pending'
        },
        {
          id: 'sale-7',
          customer: 'Aman Verma',
          company: 'InnoSoft',
          dealValue: 150000,
          date: '2026-09-18',
          status: 'Lost'
        }
      ];
      localStorage.setItem(this.KEYS.SALES, JSON.stringify(defaultSales));
    }

    if (!localStorage.getItem(this.KEYS.ACTIVITIES)) {
      const defaultActivities = [
        {
          id: 'act-1',
          type: 'deal',
          text: 'Sales deal closed with TechNova (₹2,50,000)',
          time: '15 mins ago',
          timestamp: Date.now() - 15 * 60 * 1000
        },
        {
          id: 'act-2',
          type: 'customer',
          text: 'Rahul Sharma added as a new customer',
          time: '1 hour ago',
          timestamp: Date.now() - 60 * 60 * 1000
        },
        {
          id: 'act-3',
          type: 'lead',
          text: 'New lead added from website: Arjun Mehta (FinTech Pro)',
          time: '3 hours ago',
          timestamp: Date.now() - 3 * 60 * 60 * 1000
        },
        {
          id: 'act-4',
          type: 'task',
          text: 'Follow-up task completed: Update customer details',
          time: 'Yesterday',
          timestamp: Date.now() - 24 * 60 * 60 * 1000
        },
        {
          id: 'act-5',
          type: 'customer',
          text: 'Priya Singh updated customer information',
          time: '2 days ago',
          timestamp: Date.now() - 48 * 60 * 60 * 1000
        }
      ];
      localStorage.setItem(this.KEYS.ACTIVITIES, JSON.stringify(defaultActivities));
    }
  },

  // Customers
  getCustomers() {
    return JSON.parse(localStorage.getItem(this.KEYS.CUSTOMERS) || '[]');
  },
  saveCustomers(customers) {
    localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  // Leads
  getLeads() {
    return JSON.parse(localStorage.getItem(this.KEYS.LEADS) || '[]');
  },
  saveLeads(leads) {
    localStorage.setItem(this.KEYS.LEADS, JSON.stringify(leads));
  },

  // Tasks
  getTasks() {
    return JSON.parse(localStorage.getItem(this.KEYS.TASKS) || '[]');
  },
  saveTasks(tasks) {
    localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
  },

  // Sales
  getSales() {
    return JSON.parse(localStorage.getItem(this.KEYS.SALES) || '[]');
  },
  saveSales(sales) {
    localStorage.setItem(this.KEYS.SALES, JSON.stringify(sales));
  },

  // Activities
  getActivities() {
    return JSON.parse(localStorage.getItem(this.KEYS.ACTIVITIES) || '[]');
  },
  addActivity(text, type = 'customer') {
    const activities = this.getActivities();
    const newActivity = {
      id: 'act-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      type,
      text,
      time: 'Just now',
      timestamp: Date.now()
    };
    activities.unshift(newActivity);
    if (activities.length > 20) activities.pop(); // keep latest 20
    localStorage.setItem(this.KEYS.ACTIVITIES, JSON.stringify(activities));
  },
  deleteActivity(id) {
    const activities = this.getActivities();
    const filtered = activities.filter((act, idx) => {
      const actId = act.id || ('act-' + idx);
      return actId !== id;
    });
    localStorage.setItem(this.KEYS.ACTIVITIES, JSON.stringify(filtered));
  },
  clearActivities() {
    localStorage.setItem(this.KEYS.ACTIVITIES, JSON.stringify([]));
  },

  // Helper: Format Indian Rupee currency
  formatINR(val) {
    const num = Number(val) || 0;
    return '₹' + num.toLocaleString('en-IN');
  },

  // Helper: Format date
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day.toString().padStart(2, '0')} ${months[monthIndex]} ${year}`;
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate().toString().padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  },

  // Generate unique ID
  generateId(prefix = 'id') {
    return prefix + '-' + Math.random().toString(36).substr(2, 9);
  }
};

// Initialize seed data on load
CRMData.init();

// --- Authentication & Session Management ---
const Auth = {
  isLoggedIn() {
    return localStorage.getItem('crm_logged_in') === 'true' || sessionStorage.getItem('crm_logged_in') === 'true';
  },

  login(remember = false) {
    if (remember) {
      localStorage.setItem('crm_logged_in', 'true');
    } else {
      sessionStorage.setItem('crm_logged_in', 'true');
    }
  },

  logout() {
    localStorage.removeItem('crm_logged_in');
    sessionStorage.removeItem('crm_logged_in');
    localStorage.removeItem('crm_current_user_name');
    window.location.href = 'index.html';
  },

  // Route protection
  checkAuth(isLoginPage = false) {
    const logged = this.isLoggedIn();
    if (isLoginPage && logged) {
      window.location.href = 'dashboard.html';
    } else if (!isLoginPage && !logged) {
      window.location.href = 'index.html';
    }
  }
};

// --- Dark / Light Theme Manager ---
const Theme = {
  KEY: 'crm_theme',

  isLoginPage() {
    return (document.body && document.body.classList.contains('login-body')) ||
           !!document.querySelector('.login-card') ||
           window.location.pathname.toLowerCase().endsWith('index.html');
  },

  init() {
    // Keep login page permanently in light mode
    if (this.isLoginPage()) {
      document.documentElement.setAttribute('data-theme', 'light');
      return;
    }

    const saved = localStorage.getItem(this.KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = saved || (prefersDark ? 'dark' : 'light');
    this.apply(currentTheme, false);

    const bindButtons = () => {
      document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          this.toggle();
        };
      });
      this.updateIcons(document.documentElement.getAttribute('data-theme') || 'light');
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindButtons);
    } else {
      bindButtons();
    }
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.KEY, theme);
    this.updateIcons(theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
  },

  updateIcons(theme) {
    document.querySelectorAll('.theme-toggle-btn i').forEach(icon => {
      if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
      } else {
        icon.className = 'fa-regular fa-moon';
      }
    });
  }
};

// Auto initialize theme
Theme.init();

// --- Universal Form Validation Engine ---
const CRMValidator = {
  // 1. Phone number: exactly 10 digits, numbers only
  validatePhone(value, required = true) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return required ? 'Phone number must be exactly 10 digits.' : null;
    }
    if (/\D/.test(trimmed)) {
      return 'Phone number must contain numbers only.';
    }
    if (trimmed.length !== 10) {
      return 'Phone number must be exactly 10 digits.';
    }
    return null;
  },

  // 2. Name: letters and spaces only, min 2 characters
  validateName(value, fieldLabel = 'Name') {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return `Please enter a valid ${fieldLabel.toLowerCase()}.`;
    }
    if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
      return `${fieldLabel} should contain letters only.`;
    }
    if (trimmed.length < 2) {
      return `${fieldLabel} must be at least 2 characters long.`;
    }
    return null;
  },

  // 3. Email: proper format
  validateEmail(value, required = true) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return required ? 'Please enter a valid email address.' : null;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address.';
    }
    return null;
  },

  // 4. Company Name: min 2 characters
  validateCompany(value, required = true) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return required ? 'Company name is required.' : null;
    }
    if (trimmed.length < 2) {
      return 'Company name must be at least 2 characters long.';
    }
    if (/[<>{}]/.test(trimmed)) {
      return 'Company name contains invalid characters.';
    }
    return null;
  },

  // 5. Deal Value: positive number > 0
  validateDealValue(value) {
    const trimmed = (value || '').toString().trim();
    if (!trimmed) {
      return 'Deal value is required.';
    }
    const num = Number(trimmed);
    if (isNaN(num) || num <= 0) {
      return 'Deal value must be a positive number greater than 0.';
    }
    return null;
  },

  // 6. Date validation: valid date string
  validateDate(value, required = true, fieldLabel = 'Date') {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return required ? `${fieldLabel} is required.` : null;
    }
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      return `Please select a valid ${fieldLabel.toLowerCase()}.`;
    }
    return null;
  },

  // 7. Task description: min 3 characters
  validateTask(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return 'Task description is required.';
    }
    if (trimmed.length < 3) {
      return 'Task description must be at least 3 characters long.';
    }
    return null;
  },

  // 8. Password: min 6 characters
  validatePassword(value, minLength = 6) {
    if (!value) return 'Password is required.';
    if (value.length < minLength) return `Password must be at least ${minLength} characters long.`;
    return null;
  },

  validateConfirmPassword(confirmValue, passwordValue) {
    if (!confirmValue) return 'Please confirm your password.';
    if (confirmValue !== passwordValue) return 'Passwords do not match.';
    return null;
  },

  // Generic required
  validateRequired(value, fieldLabel = 'This field') {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return `${fieldLabel} is required.`;
    }
    return null;
  },

  // UI Error Display Helpers
  showError(input, message) {
    if (!input) return;
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');

    const parent = input.closest('.form-group') || input.parentElement;
    let errorEl = parent.querySelector('.form-error-msg');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error-msg';
      parent.appendChild(errorEl);
    }
    errorEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${message}</span>`;
  },

  clearError(input) {
    if (!input) return;
    input.classList.remove('is-invalid');
    const parent = input.closest('.form-group') || input.parentElement;
    if (parent) {
      const errorEl = parent.querySelector('.form-error-msg');
      if (errorEl) {
        errorEl.remove();
      }
    }
  },

  clearFormErrors(form) {
    if (!form) return;
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.form-error-msg').forEach(el => el.remove());
  },

  _normalizeSchema(schema) {
    if (Array.isArray(schema)) {
      return schema.map(item => ({
        selector: item.selector,
        type: item.type || (typeof item.selector === 'string' && (item.selector.includes('phone') || item.selector.includes('contact')) ? 'phone' : 'text'),
        validate: item.validate || item.fn
      }));
    }
    if (schema && typeof schema === 'object') {
      return Object.keys(schema).map(key => {
        const val = schema[key];
        if (typeof val === 'function') {
          return {
            selector: key,
            type: (key.includes('phone') || key.includes('contact')) ? 'phone' : 'text',
            validate: val
          };
        }
        return {
          selector: key,
          type: val.type || ((key.includes('phone') || key.includes('contact')) ? 'phone' : 'text'),
          validate: val.validate || val.fn
        };
      });
    }
    return [];
  },

  // Bind real-time input and blur validation
  setupForm(form, schema) {
    if (!form) return;
    const normalized = this._normalizeSchema(schema);

    normalized.forEach(fieldDef => {
      const input = typeof fieldDef.selector === 'string' ? form.querySelector(fieldDef.selector) : fieldDef.selector;
      if (!input) return;

      // Phone auto-sanitizer: numbers only, max 10 digits
      if (fieldDef.type === 'phone') {
        input.setAttribute('maxlength', '10');
        input.setAttribute('inputmode', 'numeric');
        input.addEventListener('input', () => {
          input.value = input.value.replace(/\D/g, '').slice(0, 10);
          if (input.classList.contains('is-invalid')) {
            const err = fieldDef.validate(input.value);
            if (!err) CRMValidator.clearError(input);
            else CRMValidator.showError(input, err);
          }
        });
      } else {
        input.addEventListener('input', () => {
          if (input.classList.contains('is-invalid')) {
            const err = fieldDef.validate(input.value);
            if (!err) CRMValidator.clearError(input);
            else CRMValidator.showError(input, err);
          }
        });
      }

      input.addEventListener('blur', () => {
        const err = fieldDef.validate(input.value);
        if (err) {
          CRMValidator.showError(input, err);
        } else {
          CRMValidator.clearError(input);
        }
      });

      if (input.tagName === 'SELECT') {
        input.addEventListener('change', () => {
          const err = fieldDef.validate(input.value);
          if (err) CRMValidator.showError(input, err);
          else CRMValidator.clearError(input);
        });
      }
    });
  },

  // Validate all fields on submit
  validateForm(form, schema) {
    if (!form) return true;
    const normalized = this._normalizeSchema(schema);
    let isValid = true;
    let firstInvalid = null;

    normalized.forEach(fieldDef => {
      const input = typeof fieldDef.selector === 'string' ? form.querySelector(fieldDef.selector) : fieldDef.selector;
      if (!input) return;

      const err = fieldDef.validate(input.value);
      if (err) {
        isValid = false;
        CRMValidator.showError(input, err);
        if (!firstInvalid) {
          firstInvalid = input;
        }
      } else {
        CRMValidator.clearError(input);
      }
    });

    if (!isValid && firstInvalid) {
      firstInvalid.focus();
    }

    return isValid;
  }
};

// --- Toast Notifications ---
function showToast(message, type = 'success') {
  // Suppress side popups on login page only
  if ((document.body && document.body.classList.contains('login-body')) ||
      document.querySelector('.login-card') ||
      window.location.pathname.toLowerCase().endsWith('index.html')) {
    return;
  }

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconClass = 'fa-solid fa-circle-check';
  if (type === 'error' || type === 'danger') iconClass = 'fa-solid fa-circle-exclamation';
  if (type === 'info') iconClass = 'fa-solid fa-circle-info';
  if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="${iconClass} toast-icon"></i>
    <div class="toast-message">${message}</div>
    <i class="fa-solid fa-xmark toast-close" title="Dismiss"></i>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });

  container.appendChild(toast);

  // Auto remove after 3.5s
  setTimeout(() => {
    removeToast(toast);
  }, 3500);
}

function removeToast(toast) {
  if (!toast || toast.classList.contains('removing')) return;
  toast.classList.add('removing');
  setTimeout(() => {
    if (toast.parentElement) toast.parentElement.removeChild(toast);
  }, 300);
}

// --- Reusable Confirmation Dialog Modal ---
function confirmAction({ title = 'Are you sure?', message = 'This action cannot be undone.', confirmText = 'Delete', onConfirm }) {
  let modalOverlay = document.getElementById('global-confirm-modal');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'global-confirm-modal';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
      <div class="modal-box confirm-box">
        <div class="confirm-icon">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 class="confirm-title" id="confirm-title">Are you sure?</h3>
        <p class="confirm-desc" id="confirm-message">This action cannot be undone.</p>
        <div class="confirm-actions">
          <button type="button" class="btn-secondary" id="confirm-cancel-btn">Cancel</button>
          <button type="button" class="btn-danger" id="confirm-ok-btn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);
  }

  const titleEl = modalOverlay.querySelector('#confirm-title');
  const msgEl = modalOverlay.querySelector('#confirm-message');
  const okBtn = modalOverlay.querySelector('#confirm-ok-btn');
  const cancelBtn = modalOverlay.querySelector('#confirm-cancel-btn');

  titleEl.textContent = title;
  msgEl.textContent = message;
  okBtn.textContent = confirmText;

  modalOverlay.classList.add('open');

  // Clean listeners
  const newOkBtn = okBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

  newCancelBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('open');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('open');
  });

  newOkBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('open');
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  });
}

// --- Common UI Setup (Sidebar, Header, Logout) ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Sidebar toggle
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const appSidebar = document.querySelector('.app-sidebar');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');

  function openSidebar() {
    if (appSidebar) appSidebar.classList.add('mobile-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
  }

  function closeSidebar() {
    if (appSidebar) appSidebar.classList.remove('mobile-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  // 2. Logout confirmation
  const logoutBtns = document.querySelectorAll('.logout-trigger');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      confirmAction({
        title: 'Sign Out',
        message: 'Are you sure you want to sign out of your CRM session?',
        confirmText: 'Sign Out',
        onConfirm: () => {
          showToast('Signed out successfully.', 'info');
          setTimeout(() => {
            Auth.logout();
          }, 400);
        }
      });
    });
  });

  // 3. Highlight current page in sidebar
  const currentPath = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-item');
  navLinks.forEach(link => {
    const href = link.getAttribute('href')?.toLowerCase();
    if (href && currentPath.includes(href)) {
      link.classList.add('active');
    }
  });

  // 4. Notification toggle
  const notifBtn = document.getElementById('notification-btn');
  const notifDropdown = document.getElementById('notification-dropdown');
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
        notifDropdown.classList.remove('open');
      }
    });
  }

  // 5. Update User Profile Name & Avatar in Header
  const currentUserName = localStorage.getItem('crm_current_user_name') || 'Admin';
  const profileNameEl = document.querySelector('.user-meta .name');
  const profileAvatarEl = document.querySelector('.user-avatar');
  if (profileNameEl) profileNameEl.textContent = currentUserName;
  if (profileAvatarEl) {
    const initials = currentUserName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    profileAvatarEl.textContent = initials || 'AD';
  }
});
