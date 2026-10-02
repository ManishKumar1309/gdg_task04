/**
 * CRM - Leads Management JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Enforce authentication
  Auth.checkAuth(false);

  // State
  let editingLeadId = null;
  let searchTerm = '';
  let statusFilter = 'All';

  // DOM Elements
  const leadsTableBody = document.getElementById('leads-table-body');
  const searchInput = document.getElementById('search-leads-input');
  const filterSelect = document.getElementById('filter-leads-status');
  const addLeadBtn = document.getElementById('open-add-lead-btn');
  const leadModal = document.getElementById('lead-modal');
  const modalTitle = document.getElementById('lead-modal-title');
  const leadForm = document.getElementById('lead-form');
  const closeModalBtn = document.getElementById('close-lead-modal');
  const cancelModalBtn = document.getElementById('cancel-lead-modal');

  // Mini summary cards
  const totalCountEl = document.getElementById('leads-count-total');
  const newCountEl = document.getElementById('leads-count-new');
  const contactedCountEl = document.getElementById('leads-count-contacted');
  const convertedCountEl = document.getElementById('leads-count-converted');

  // Initial Render
  renderLeads();

  // Form Validation Schema
  const leadSchema = {
    '#lead-name': (val) => CRMValidator.validateName(val, 'Lead full name'),
    '#lead-company': (val) => CRMValidator.validateCompany(val, true),
    '#lead-contact': {
      type: 'phone',
      fn: (val) => CRMValidator.validatePhone(val, true)
    },
    '#lead-status': (val) => CRMValidator.validateRequired(val, 'Lead status'),
    '#lead-date': (val) => CRMValidator.validateDate(val, false, 'Follow-up date')
  };

  CRMValidator.setupForm(leadForm, leadSchema);

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      renderLeads();
    });
  }

  // Filter
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      renderLeads();
    });
  }

  // Open Add Modal
  if (addLeadBtn) {
    addLeadBtn.addEventListener('click', () => {
      editingLeadId = null;
      modalTitle.textContent = 'Add New Lead';
      leadForm.reset();
      CRMValidator.clearFormErrors(leadForm);
      document.getElementById('lead-status').value = 'New';
      // Default date to today + 3 days
      const d = new Date();
      d.setDate(d.getDate() + 3);
      document.getElementById('lead-date').value = d.toISOString().split('T')[0];
      leadModal.classList.add('open');
    });
  }

  // Close Modal
  [closeModalBtn, cancelModalBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => leadModal.classList.remove('open'));
    }
  });

  leadModal.addEventListener('click', (e) => {
    if (e.target === leadModal) leadModal.classList.remove('open');
  });

  // Submit Lead Form
  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!CRMValidator.validateForm(leadForm, leadSchema)) {
      return;
    }

    const name = document.getElementById('lead-name').value.trim();
    const company = document.getElementById('lead-company').value.trim();
    const contact = document.getElementById('lead-contact').value.trim();
    const status = document.getElementById('lead-status').value;
    const followUpDate = document.getElementById('lead-date').value;

    const leads = CRMData.getLeads();

    if (editingLeadId) {
      // Edit
      const index = leads.findIndex(l => l.id === editingLeadId);
      if (index !== -1) {
        leads[index] = {
          ...leads[index],
          name,
          company,
          contact,
          status,
          followUpDate: followUpDate || leads[index].followUpDate
        };
        CRMData.saveLeads(leads);
        CRMData.addActivity(`Updated lead info for ${name}`, 'lead');
        showToast(`Lead "${name}" updated successfully!`, 'success');
      }
    } else {
      // Add
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
      showToast(`Lead "${name}" added successfully!`, 'success');
    }

    leadModal.classList.remove('open');
    renderLeads();
  });

  /**
   * Render Leads Table
   */
  function renderLeads() {
    const leads = CRMData.getLeads();

    // Update mini stats
    if (totalCountEl) totalCountEl.textContent = leads.length;
    if (newCountEl) newCountEl.textContent = leads.filter(l => l.status === 'New').length;
    if (contactedCountEl) contactedCountEl.textContent = leads.filter(l => l.status === 'Contacted').length;
    if (convertedCountEl) convertedCountEl.textContent = leads.filter(l => l.status === 'Converted').length;

    // Filter
    const filtered = leads.filter(l => {
      const matchesSearch = !searchTerm ||
        l.name.toLowerCase().includes(searchTerm) ||
        l.company.toLowerCase().includes(searchTerm) ||
        (l.contact && l.contact.includes(searchTerm));

      const matchesStatus = statusFilter === 'All' || l.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
      leadsTableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state-icon">
                <i class="fa-solid fa-bullseye"></i>
              </div>
              <h3>No leads found</h3>
              <p>Try searching for a different name, company, or reset the filters.</p>
              <button type="button" class="btn-secondary" id="reset-lead-filter-btn">
                <i class="fa-solid fa-rotate-left"></i> Reset Filters
              </button>
            </div>
          </td>
        </tr>
      `;

      const resetBtn = document.getElementById('reset-lead-filter-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          searchTerm = '';
          statusFilter = 'All';
          if (searchInput) searchInput.value = '';
          if (filterSelect) filterSelect.value = 'All';
          renderLeads();
        });
      }
      return;
    }

    leadsTableBody.innerHTML = filtered.map(lead => {
      const initials = lead.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      let badgeClass = 'badge-info';
      if (lead.status === 'Contacted') badgeClass = 'badge-warning';
      if (lead.status === 'Converted') badgeClass = 'badge-success';

      const isConverted = lead.status === 'Converted';

      return `
        <tr>
          <td>
            <div class="table-user-cell">
              <div class="initial-avatar" style="background: var(--purple-light); color: var(--purple);">${initials}</div>
              <div class="table-user-info">
                <div class="name">${escapeHtml(lead.name)}</div>
                <div class="subtext">Lead ID: ${lead.id}</div>
              </div>
            </div>
          </td>
          <td><strong>${escapeHtml(lead.company)}</strong></td>
          <td>${escapeHtml(lead.contact)}</td>
          <td>
            <span class="badge-status ${badgeClass}">${escapeHtml(lead.status)}</span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
              <i class="fa-regular fa-calendar" style="color: var(--text-subtle);"></i>
              <span>${CRMData.formatDate(lead.followUpDate)}</span>
            </div>
          </td>
          <td>
            <div class="table-actions">
              ${!isConverted ? `
                <button type="button" class="btn-icon btn-icon-success convert-lead-btn" data-id="${lead.id}" data-name="${escapeHtml(lead.name)}" title="Convert to Customer">
                  <i class="fa-solid fa-wand-magic-sparkles"></i>
                </button>
              ` : ''}
              <button type="button" class="btn-icon edit-lead-btn" data-id="${lead.id}" title="Edit Lead">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button type="button" class="btn-icon btn-icon-danger delete-lead-btn" data-id="${lead.id}" data-name="${escapeHtml(lead.name)}" title="Delete Lead">
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
    document.querySelectorAll('.edit-lead-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    // Delete
    document.querySelectorAll('.delete-lead-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        confirmAction({
          title: 'Delete Lead',
          message: `Are you sure you want to remove lead "${name}"?`,
          confirmText: 'Delete Lead',
          onConfirm: () => {
            deleteLead(id, name);
          }
        });
      });
    });

    // Convert Lead to Customer
    document.querySelectorAll('.convert-lead-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        convertLead(id, name);
      });
    });
  }

  function openEditModal(id) {
    const leads = CRMData.getLeads();
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    editingLeadId = id;
    modalTitle.textContent = 'Edit Lead';
    CRMValidator.clearFormErrors(leadForm);

    document.getElementById('lead-name').value = lead.name;
    document.getElementById('lead-company').value = lead.company;
    document.getElementById('lead-contact').value = lead.contact;
    document.getElementById('lead-status').value = lead.status;
    document.getElementById('lead-date').value = lead.followUpDate || '';

    leadModal.classList.add('open');
  }

  function deleteLead(id, name) {
    let leads = CRMData.getLeads();
    leads = leads.filter(l => l.id !== id);
    CRMData.saveLeads(leads);

    CRMData.addActivity(`Lead "${name}" was deleted`, 'lead');
    showToast(`Lead "${name}" deleted successfully!`, 'info');
    renderLeads();
  }

  function convertLead(id, name) {
    const leads = CRMData.getLeads();
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    // 1. Mark lead as Converted
    lead.status = 'Converted';
    CRMData.saveLeads(leads);

    // 2. Add to Customers list if not already there
    const customers = CRMData.getCustomers();
    const exists = customers.some(c => c.name.toLowerCase() === lead.name.toLowerCase());
    if (!exists) {
      customers.unshift({
        id: CRMData.generateId('cust'),
        name: lead.name,
        company: lead.company,
        phone: lead.contact,
        email: `${lead.name.toLowerCase().replace(/\s+/g, '.')}@${lead.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0]
      });
      CRMData.saveCustomers(customers);
    }

    CRMData.addActivity(`Lead converted to customer: ${name} (${lead.company})`, 'deal');
    showToast(`Lead "${name}" successfully converted to Active Customer!`, 'success');
    renderLeads();
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
