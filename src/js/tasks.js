/**
 * CRM - Tasks & Follow-ups JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Enforce authentication
  Auth.checkAuth(false);

  // State
  let editingTaskId = null;
  let searchTerm = '';
  let priorityFilter = 'All';
  let statusFilter = 'All';

  // DOM Elements
  const tasksTableBody = document.getElementById('tasks-table-body');
  const searchInput = document.getElementById('search-tasks-input');
  const prioritySelect = document.getElementById('filter-tasks-priority');
  const statusSelect = document.getElementById('filter-tasks-status');
  const addTaskBtn = document.getElementById('open-add-task-btn');
  const taskModal = document.getElementById('task-modal');
  const modalTitle = document.getElementById('task-modal-title');
  const taskForm = document.getElementById('task-form');
  const closeModalBtn = document.getElementById('close-task-modal');
  const cancelModalBtn = document.getElementById('cancel-task-modal');

  // Mini summary elements
  const totalCountEl = document.getElementById('tasks-count-total');
  const pendingCountEl = document.getElementById('tasks-count-pending');
  const inProgressCountEl = document.getElementById('tasks-count-progress');
  const completedCountEl = document.getElementById('tasks-count-completed');

  // Initial Render
  renderTasks();

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      renderTasks();
    });
  }

  // Priority Filter
  if (prioritySelect) {
    prioritySelect.addEventListener('change', (e) => {
      priorityFilter = e.target.value;
      renderTasks();
    });
  }

  // Status Filter
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      renderTasks();
    });
  }

  // Open Add Modal
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      editingTaskId = null;
      modalTitle.textContent = 'Create New Task';
      taskForm.reset();
      document.getElementById('task-priority').value = 'Medium';
      document.getElementById('task-status').value = 'Pending';
      document.getElementById('task-date').value = new Date().toISOString().split('T')[0];
      taskModal.classList.add('open');
    });
  }

  // Close Modal
  [closeModalBtn, cancelModalBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => taskModal.classList.remove('open'));
    }
  });

  taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) taskModal.classList.remove('open');
  });

  // Submit Task Form (Add or Edit)
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const taskText = document.getElementById('task-desc').value.trim();
    const date = document.getElementById('task-date').value;
    const priority = document.getElementById('task-priority').value;
    const status = document.getElementById('task-status').value;

    if (!taskText || !date) {
      showToast('Please provide a task description and due date.', 'error');
      return;
    }

    const tasks = CRMData.getTasks();

    if (editingTaskId) {
      // Edit
      const index = tasks.findIndex(t => t.id === editingTaskId);
      if (index !== -1) {
        tasks[index] = {
          ...tasks[index],
          task: taskText,
          date,
          priority,
          status
        };
        CRMData.saveTasks(tasks);
        CRMData.addActivity(`Task updated: ${taskText}`, 'task');
        showToast('Task updated successfully!', 'success');
      }
    } else {
      // Add
      const newTask = {
        id: CRMData.generateId('task'),
        task: taskText,
        date,
        priority,
        status
      };
      tasks.unshift(newTask);
      CRMData.saveTasks(tasks);
      CRMData.addActivity(`New task created: ${taskText}`, 'task');
      showToast('Task created successfully!', 'success');
    }

    taskModal.classList.remove('open');
    renderTasks();
  });

  /**
   * Render Tasks Table
   */
  function renderTasks() {
    const tasks = CRMData.getTasks();

    // Summary counters
    if (totalCountEl) totalCountEl.textContent = tasks.length;
    if (pendingCountEl) pendingCountEl.textContent = tasks.filter(t => t.status === 'Pending').length;
    if (inProgressCountEl) inProgressCountEl.textContent = tasks.filter(t => t.status === 'In Progress').length;
    if (completedCountEl) completedCountEl.textContent = tasks.filter(t => t.status === 'Completed').length;

    // Filter
    const filtered = tasks.filter(t => {
      const matchesSearch = !searchTerm || t.task.toLowerCase().includes(searchTerm);
      const matchesPriority = priorityFilter === 'All' || t.priority.toLowerCase() === priorityFilter.toLowerCase();
      const matchesStatus = statusFilter === 'All' || t.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesPriority && matchesStatus;
    });

    if (filtered.length === 0) {
      tasksTableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state">
              <div class="empty-state-icon">
                <i class="fa-solid fa-list-check"></i>
              </div>
              <h3>No tasks found</h3>
              <p>No tasks match your current filters or query.</p>
              <button type="button" class="btn-secondary" id="reset-task-filter-btn">
                <i class="fa-solid fa-rotate-left"></i> Reset Filters
              </button>
            </div>
          </td>
        </tr>
      `;

      const resetBtn = document.getElementById('reset-task-filter-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          searchTerm = '';
          priorityFilter = 'All';
          statusFilter = 'All';
          if (searchInput) searchInput.value = '';
          if (prioritySelect) prioritySelect.value = 'All';
          if (statusSelect) statusSelect.value = 'All';
          renderTasks();
        });
      }
      return;
    }

    tasksTableBody.innerHTML = filtered.map(t => {
      const isCompleted = t.status === 'Completed';

      // Priority classes
      let priorityClass = 'priority-medium';
      if (t.priority === 'High') priorityClass = 'priority-high';
      if (t.priority === 'Low') priorityClass = 'priority-low';

      // Status badges
      let statusClass = 'badge-warning';
      if (t.status === 'In Progress') statusClass = 'badge-info';
      if (t.status === 'Completed') statusClass = 'badge-success';

      return `
        <tr class="${isCompleted ? 'task-completed-row' : ''}">
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <input 
                type="checkbox" 
                class="task-toggle-checkbox" 
                data-id="${t.id}" 
                ${isCompleted ? 'checked' : ''} 
                style="width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer;"
                aria-label="Mark task completed"
              >
              <span class="${isCompleted ? 'task-completed-text' : ''}" style="font-weight: 500;">
                ${escapeHtml(t.task)}
              </span>
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
              <i class="fa-regular fa-calendar" style="color: var(--text-subtle);"></i>
              <span>${CRMData.formatDate(t.date)}</span>
            </div>
          </td>
          <td>
            <span class="priority-pill ${priorityClass}">
              <i class="fa-solid fa-flag" style="font-size: 10px;"></i>
              ${escapeHtml(t.priority)}
            </span>
          </td>
          <td>
            <span class="badge-status ${statusClass}">
              ${escapeHtml(t.status)}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button 
                type="button" 
                class="btn-icon ${isCompleted ? 'btn-icon-warning' : 'btn-icon-success'} toggle-status-btn" 
                data-id="${t.id}" 
                title="${isCompleted ? 'Mark Pending' : 'Mark Completed'}"
              >
                <i class="fa-solid ${isCompleted ? 'fa-arrow-rotate-left' : 'fa-check'}"></i>
              </button>
              <button type="button" class="btn-icon edit-task-btn" data-id="${t.id}" title="Edit Task">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button type="button" class="btn-icon btn-icon-danger delete-task-btn" data-id="${t.id}" data-task="${escapeHtml(t.task)}" title="Delete Task">
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
    // Checkbox toggle
    document.querySelectorAll('.task-toggle-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = cb.getAttribute('data-id');
        toggleTaskCompletion(id);
      });
    });

    // Button toggle
    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        toggleTaskCompletion(id);
      });
    });

    // Edit
    document.querySelectorAll('.edit-task-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    // Delete
    document.querySelectorAll('.delete-task-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const taskName = btn.getAttribute('data-task');
        confirmAction({
          title: 'Delete Task',
          message: `Are you sure you want to delete task "${taskName}"?`,
          confirmText: 'Delete Task',
          onConfirm: () => {
            deleteTask(id, taskName);
          }
        });
      });
    });
  }

  function toggleTaskCompletion(id) {
    const tasks = CRMData.getTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.status === 'Completed') {
      task.status = 'Pending';
      showToast('Task marked as Pending.', 'info');
      CRMData.addActivity(`Task reopened: ${task.task}`, 'task');
    } else {
      task.status = 'Completed';
      showToast('Task marked as completed.', 'success');
      CRMData.addActivity(`Follow-up task completed: ${task.task}`, 'task');
    }

    CRMData.saveTasks(tasks);
    renderTasks();
  }

  function openEditModal(id) {
    const tasks = CRMData.getTasks();
    const t = tasks.find(item => item.id === id);
    if (!t) return;

    editingTaskId = id;
    modalTitle.textContent = 'Edit Task';

    document.getElementById('task-desc').value = t.task;
    document.getElementById('task-date').value = t.date;
    document.getElementById('task-priority').value = t.priority;
    document.getElementById('task-status').value = t.status;

    taskModal.classList.add('open');
  }

  function deleteTask(id, taskName) {
    let tasks = CRMData.getTasks();
    tasks = tasks.filter(t => t.id !== id);
    CRMData.saveTasks(tasks);

    CRMData.addActivity(`Task deleted: ${taskName}`, 'task');
    showToast('Task deleted successfully.', 'info');
    renderTasks();
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
