/**
 * CRM - Sales & Revenue Management JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Enforce authentication
  Auth.checkAuth(false);

  // State
  let editingDealId = null;
  let searchTerm = '';
  let statusFilter = 'All';

  // DOM Elements
  const salesTableBody = document.getElementById('sales-table-body');
  const searchInput = document.getElementById('search-sales-input');
  const filterSelect = document.getElementById('filter-sales-status');
  const addDealBtn = document.getElementById('open-add-deal-btn');
  const dealModal = document.getElementById('deal-modal');
  const modalTitle = document.getElementById('deal-modal-title');
  const dealForm = document.getElementById('deal-form');
  const closeModalBtn = document.getElementById('close-deal-modal');
  const cancelModalBtn = document.getElementById('cancel-deal-modal');

  // Metric elements
  const totalRevenueEl = document.getElementById('metric-total-revenue');
  const closedDealsEl = document.getElementById('metric-closed-deals');
  const pendingDealsEl = document.getElementById('metric-pending-deals');
  const conversionRateEl = document.getElementById('metric-conversion-rate');

  // Initial Render
  renderSales();

  // Validation Schema
  const dealSchema = {
    '#deal-customer': (val) => CRMValidator.validateName(val, 'Customer contact name'),
    '#deal-company': (val) => CRMValidator.validateCompany(val, true),
    '#deal-value': (val) => CRMValidator.validateDealValue(val),
    '#deal-status': (val) => CRMValidator.validateRequired(val, 'Deal status'),
    '#deal-date': (val) => CRMValidator.validateDate(val, true, 'Deal date')
  };

  CRMValidator.setupForm(dealForm, dealSchema);

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      renderSales();
    });
  }

  // Filter
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      renderSales();
    });
  }

  // Open Add Modal
  if (addDealBtn) {
    addDealBtn.addEventListener('click', () => {
      editingDealId = null;
      modalTitle.textContent = 'Add New Sales Deal';
      dealForm.reset();
      CRMValidator.clearFormErrors(dealForm);
      document.getElementById('deal-status').value = 'Pending';
      document.getElementById('deal-date').value = new Date().toISOString().split('T')[0];
      dealModal.classList.add('open');
    });
  }

  // Close Modal
  [closeModalBtn, cancelModalBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => dealModal.classList.remove('open'));
    }
  });

  dealModal.addEventListener('click', (e) => {
    if (e.target === dealModal) dealModal.classList.remove('open');
  });

  // Handle Form Submit (Add or Edit)
  dealForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!CRMValidator.validateForm(dealForm, dealSchema)) {
      return;
    }

    const customer = document.getElementById('deal-customer').value.trim();
    const company = document.getElementById('deal-company').value.trim();
    const dealValue = parseFloat(document.getElementById('deal-value').value);
    const date = document.getElementById('deal-date').value;
    const status = document.getElementById('deal-status').value;

    const sales = CRMData.getSales();

    if (editingDealId) {
      // Edit
      const index = sales.findIndex(s => s.id === editingDealId);
      if (index !== -1) {
        sales[index] = {
          ...sales[index],
          customer,
          company,
          dealValue,
          date,
          status
        };
        CRMData.saveSales(sales);
        CRMData.addActivity(`Updated deal for ${company} (${CRMData.formatINR(dealValue)})`, 'deal');
        showToast('Deal updated successfully!', 'success');
      }
    } else {
      // Add
      const newDeal = {
        id: CRMData.generateId('sale'),
        customer,
        company,
        dealValue,
        date,
        status
      };
      sales.unshift(newDeal);
      CRMData.saveSales(sales);
      CRMData.addActivity(`New deal logged with ${company}: ${CRMData.formatINR(dealValue)}`, 'deal');
      showToast('New deal added successfully!', 'success');
    }

    dealModal.classList.remove('open');
    renderSales();
  });

  /**
   * Render Sales Table and Metric Cards
   */
  function renderSales() {
    const sales = CRMData.getSales();

    // 1. Calculate Metrics
    const wonDeals = sales.filter(s => s.status === 'Won');
    const pendingDeals = sales.filter(s => s.status === 'Pending');
    const totalWonRevenue = wonDeals.reduce((sum, s) => sum + (Number(s.dealValue) || 0), 0);

    const conversionRate = sales.length > 0
      ? ((wonDeals.length / sales.length) * 100).toFixed(1)
      : '0.0';

    if (totalRevenueEl) totalRevenueEl.textContent = CRMData.formatINR(totalWonRevenue);
    if (closedDealsEl) closedDealsEl.textContent = wonDeals.length;
    if (pendingDealsEl) pendingDealsEl.textContent = pendingDeals.length;
    if (conversionRateEl) conversionRateEl.textContent = `${conversionRate}%`;

    // 2. Filter Table Data
    const filtered = sales.filter(s => {
      const matchesSearch = !searchTerm ||
        s.customer.toLowerCase().includes(searchTerm) ||
        s.company.toLowerCase().includes(searchTerm);

      const matchesStatus = statusFilter === 'All' || s.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
      salesTableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state-icon">
                <i class="fa-solid fa-chart-line"></i>
              </div>
              <h3>No deals found</h3>
              <p>We couldn't find any sales deals matching your criteria.</p>
              <button type="button" class="btn-secondary" id="reset-sales-filter-btn">
                <i class="fa-solid fa-rotate-left"></i> Reset Filters
              </button>
            </div>
          </td>
        </tr>
      `;

      const resetBtn = document.getElementById('reset-sales-filter-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          searchTerm = '';
          statusFilter = 'All';
          if (searchInput) searchInput.value = '';
          if (filterSelect) filterSelect.value = 'All';
          renderSales();
        });
      }
      return;
    }

    salesTableBody.innerHTML = filtered.map(s => {
      let badgeClass = 'badge-success';
      if (s.status === 'Pending') badgeClass = 'badge-warning';
      if (s.status === 'Lost') badgeClass = 'badge-danger';

      return `
        <tr>
          <td>
            <div class="table-user-cell">
              <div class="initial-avatar" style="background: #eef2ff; color: #4338ca;">
                ${s.customer.substring(0, 2).toUpperCase()}
              </div>
              <div class="table-user-info">
                <div class="name">${escapeHtml(s.customer)}</div>
                <div class="subtext">Deal ID: ${s.id}</div>
              </div>
            </div>
          </td>
          <td><strong>${escapeHtml(s.company)}</strong></td>
          <td>
            <span style="font-weight: 700; font-size: 14.5px; color: var(--text-main);">
              ${CRMData.formatINR(s.dealValue)}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
              <i class="fa-regular fa-calendar" style="color: var(--text-subtle);"></i>
              <span>${CRMData.formatDate(s.date)}</span>
            </div>
          </td>
          <td>
            <span class="badge-status ${badgeClass}">
              ${escapeHtml(s.status)}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button type="button" class="btn-icon edit-deal-btn" data-id="${s.id}" title="Edit Deal">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button type="button" class="btn-icon btn-icon-danger delete-deal-btn" data-id="${s.id}" data-name="${escapeHtml(s.company)}" title="Delete Deal">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachActionListeners();
  }

  function attachActionListeners() {
    // Edit
    document.querySelectorAll('.edit-deal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    // Delete
    document.querySelectorAll('.delete-deal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const companyName = btn.getAttribute('data-name');
        confirmAction({
          title: 'Delete Deal',
          message: `Are you sure you want to remove the sales deal for "${companyName}"?`,
          confirmText: 'Delete Deal',
          onConfirm: () => {
            deleteDeal(id, companyName);
          }
        });
      });
    });
  }

  function openEditModal(id) {
    const sales = CRMData.getSales();
    const deal = sales.find(s => s.id === id);
    if (!deal) return;

    editingDealId = id;
    modalTitle.textContent = 'Edit Sales Deal';
    CRMValidator.clearFormErrors(dealForm);

    document.getElementById('deal-customer').value = deal.customer;
    document.getElementById('deal-company').value = deal.company;
    document.getElementById('deal-value').value = deal.dealValue;
    document.getElementById('deal-date').value = deal.date;
    document.getElementById('deal-status').value = deal.status;

    dealModal.classList.add('open');
  }

  function deleteDeal(id, companyName) {
    let sales = CRMData.getSales();
    sales = sales.filter(s => s.id !== id);
    CRMData.saveSales(sales);

    CRMData.addActivity(`Sales deal deleted for ${companyName}`, 'deal');
    showToast('Sales deal deleted successfully.', 'info');
    renderSales();
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
