/**
 * CRM - Customers Management JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Enforce authentication
  Auth.checkAuth(false);

  // State
  let editingCustomerId = null;
  let searchTerm = '';
  let statusFilter = 'All';

  // DOM Elements
  const customersTableBody = document.getElementById('customers-table-body');
  const searchInput = document.getElementById('search-customers-input');
  const filterSelect = document.getElementById('filter-customers-status');
  const addCustomerBtn = document.getElementById('open-add-customer-btn');
  const customerModal = document.getElementById('customer-modal');
  const modalTitle = document.getElementById('customer-modal-title');
  const customerForm = document.getElementById('customer-form');
  const closeModalBtn = document.getElementById('close-customer-modal');
  const cancelModalBtn = document.getElementById('cancel-customer-modal');
  const totalCountBadge = document.getElementById('customers-total-count');

  // Initial Render
  renderCustomers();

  // Search Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      renderCustomers();
    });
  }

  // Filter Listener
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      renderCustomers();
    });
  }

  // Open Add Modal
  if (addCustomerBtn) {
    addCustomerBtn.addEventListener('click', () => {
      editingCustomerId = null;
      modalTitle.textContent = 'Add New Customer';
      customerForm.reset();
      CRMValidator.clearFormErrors(customerForm);
      document.getElementById('cust-status').value = 'Active';
      customerModal.classList.add('open');
    });
  }

  // Close Modal
  [closeModalBtn, cancelModalBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        customerModal.classList.remove('open');
      });
    }
  });

  customerModal.addEventListener('click', (e) => {
    if (e.target === customerModal) {
      customerModal.classList.remove('open');
    }
  });

  // Validation Schema for Customers
  const customerSchema = [
    { selector: '#cust-name', validate: (val) => CRMValidator.validateName(val, 'Customer name') },
    { selector: '#cust-email', validate: (val) => CRMValidator.validateEmail(val, true) },
    { selector: '#cust-phone', type: 'phone', validate: (val) => CRMValidator.validatePhone(val, true) },
    { selector: '#cust-company', validate: (val) => CRMValidator.validateCompany(val, true) },
    { selector: '#cust-status', validate: (val) => CRMValidator.validateRequired(val, 'Status') }
  ];

  CRMValidator.setupForm(customerForm, customerSchema);

  // Handle Form Submit (Add or Edit)
  customerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!CRMValidator.validateForm(customerForm, customerSchema)) {
      showToast('Please correct the highlighted errors.', 'error');
      return;
    }

    const name = document.getElementById('cust-name').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const company = document.getElementById('cust-company').value.trim();
    const status = document.getElementById('cust-status').value;

    const customers = CRMData.getCustomers();

    if (editingCustomerId) {
      // Edit existing customer
      const index = customers.findIndex(c => c.id === editingCustomerId);
      if (index !== -1) {
        customers[index] = {
          ...customers[index],
          name,
          email,
          phone: phone || 'N/A',
          company,
          status
        };
        CRMData.saveCustomers(customers);
        CRMData.addActivity(`Updated customer information for ${name}`, 'customer');
        showToast(`Customer "${name}" updated successfully!`, 'success');
      }
    } else {
      // Add new customer
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
      showToast(`Customer "${name}" added successfully!`, 'success');
    }

    customerModal.classList.remove('open');
    renderCustomers();
  });

  /**
   * Render Customers Table
   */
  function renderCustomers() {
    const customers = CRMData.getCustomers();

    // Filter by search & status
    const filtered = customers.filter(c => {
      const matchesSearch = !searchTerm ||
        c.name.toLowerCase().includes(searchTerm) ||
        c.company.toLowerCase().includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm) ||
        (c.phone && c.phone.includes(searchTerm));

      const matchesStatus = statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    if (totalCountBadge) {
      totalCountBadge.textContent = `${filtered.length} of ${customers.length} Customers`;
    }

    if (filtered.length === 0) {
      customersTableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state-icon">
                <i class="fa-solid fa-user-slash"></i>
              </div>
              <h3>No customers found</h3>
              <p>We couldn't find any customers matching your search or filters.</p>
              <button type="button" class="btn-secondary" id="reset-cust-filter-btn">
                <i class="fa-solid fa-rotate-left"></i> Reset Filters
              </button>
            </div>
          </td>
        </tr>
      `;

      const resetBtn = document.getElementById('reset-cust-filter-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          searchTerm = '';
          statusFilter = 'All';
          if (searchInput) searchInput.value = '';
          if (filterSelect) filterSelect.value = 'All';
          renderCustomers();
        });
      }
      return;
    }

    customersTableBody.innerHTML = filtered.map(c => {
      // Initials for avatar
      const initials = c.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      // Badge style
      let badgeClass = 'badge-success';
      if (c.status === 'Inactive') badgeClass = 'badge-danger';
      if (c.status === 'Pending') badgeClass = 'badge-warning';

      return `
        <tr>
          <td>
            <div class="table-user-cell">
              <div class="initial-avatar">${initials}</div>
              <div class="table-user-info">
                <div class="name">${escapeHtml(c.name)}</div>
                <div class="subtext">ID: ${c.id}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(c.email)}</td>
          <td>${escapeHtml(c.phone)}</td>
          <td><strong>${escapeHtml(c.company)}</strong></td>
          <td>
            <span class="badge-status ${badgeClass}">${escapeHtml(c.status)}</span>
          </td>
          <td>
            <div class="table-actions">
              <button type="button" class="btn-icon edit-cust-btn" data-id="${c.id}" title="Edit Customer">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button type="button" class="btn-icon btn-icon-danger delete-cust-btn" data-id="${c.id}" data-name="${escapeHtml(c.name)}" title="Delete Customer">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach Action Listeners
    attachActionListeners();
  }

  function attachActionListeners() {
    // Edit Customer
    document.querySelectorAll('.edit-cust-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    // Delete Customer
    document.querySelectorAll('.delete-cust-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        confirmAction({
          title: 'Delete Customer',
          message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
          confirmText: 'Delete Customer',
          onConfirm: () => {
            deleteCustomer(id, name);
          }
        });
      });
    });
  }

  function openEditModal(id) {
    const customers = CRMData.getCustomers();
    const cust = customers.find(c => c.id === id);
    if (!cust) return;

    editingCustomerId = id;
    modalTitle.textContent = 'Edit Customer';
    CRMValidator.clearFormErrors(customerForm);

    document.getElementById('cust-name').value = cust.name;
    document.getElementById('cust-email').value = cust.email;
    document.getElementById('cust-phone').value = cust.phone === 'N/A' ? '' : cust.phone;
    document.getElementById('cust-company').value = cust.company;
    document.getElementById('cust-status').value = cust.status;

    customerModal.classList.add('open');
  }

  function deleteCustomer(id, name) {
    let customers = CRMData.getCustomers();
    customers = customers.filter(c => c.id !== id);
    CRMData.saveCustomers(customers);

    CRMData.addActivity(`Customer "${name}" was deleted`, 'customer');
    showToast(`Customer "${name}" deleted successfully!`, 'info');
    renderCustomers();
  }
});

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
