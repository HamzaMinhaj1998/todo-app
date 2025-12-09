import { renderNavbar } from './components/navbar.js';
import { authService } from './services/auth.service.js';
import { todoService } from './services/todo.service.js';

const user = authService.getCurrentUser();
if (!user) location.href = 'login.html';

renderNavbar('todo');
loadTodos();

// --- Main Logic ---

async function loadTodos() {
  const list = document.getElementById('todo-list');
  const emptyState = document.getElementById('empty-state');

  list.innerHTML = '<p>Loading...</p>';

  try {
    const todos = await todoService.getTodos(user.id);
    list.innerHTML = '';

    if (todos.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      // Show new ones first
      todos
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((todo) => {
          const card = createTodoCard(todo);
          list.appendChild(card);
        });
    }
  } catch (err) {
    console.error(err);
    list.innerHTML = '<p class="text-danger">Error loading todos.</p>';
  }
}

function createTodoCard(todo) {
  const div = document.createElement('div');
  div.className = 'todo-card';
  div.innerHTML = `
        <div style="flex-grow: 1;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <h3 style="font-size: 1.25rem;">${escapeHtml(todo.title)}</h3>
                <span class="badge ${
                  todo.isCompleted ? 'badge-complete' : 'badge-pending'
                }">
                    ${todo.isCompleted ? 'Completed' : 'Pending'}
                </span>
            </div>
            <p style="margin-bottom: 20px;">${escapeHtml(todo.description)}</p>
        </div>
        <div style="display: flex; gap: 10px; border-top: 1px solid var(--glass-border); padding-top: 15px; margin-top: 10px;">
            <button class="btn-secondary" style="padding: 8px 16px; flex: 1;" data-action="toggle">
                ${todo.isCompleted ? 'Mark Pending' : 'Mark Complete'}
            </button>
            <button class="btn-secondary" style="padding: 8px 16px;" data-action="edit">Edit</button>
            <button class="btn-danger" style="padding: 8px 16px;" data-action="delete">Delete</button>
        </div>
    `;

  // Event Delegation
  div.querySelector('[data-action="toggle"]').onclick = (e) =>
    toggleTodo(todo, e.target);
  div.querySelector('[data-action="edit"]').onclick = () => openEditModal(todo);
  div.querySelector('[data-action="delete"]').onclick = () =>
    openDeleteModal(todo);

  return div;
}

// --- Actions ---

async function toggleTodo(todo, btn) {
  const originalText = btn.textContent;
  btn.textContent = 'Updating...';
  btn.disabled = true;
  try {
    await todoService.updateTodo(todo.id, { isCompleted: !todo.isCompleted });
    loadTodos();
  } catch (err) {
    alert(err.message);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// --- Modals ---

const modalBackdrop = document.getElementById('modal-backdrop');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

function closeModal() {
  modalBackdrop.style.display = 'none';
}

modalClose.onclick = closeModal;
modalBackdrop.onclick = (e) => {
  if (e.target === modalBackdrop) closeModal();
};

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalBackdrop.style.display === 'flex') {
    closeModal();
  }
});

function openModal(title, contentHtml) {
  modalTitle.textContent = title;
  modalBody.innerHTML = contentHtml;
  modalBackdrop.style.display = 'flex';
}

function openEditModal(todo) {
  openModal(
    'Edit Todo',
    `
        <div style="margin-bottom: 20px;">
            <label class="form-label">Title</label>
            <input id="edit-title" class="form-control" value="${escapeHtml(
              todo.title,
            )}">
        </div>
        <div style="margin-bottom: 20px;">
            <label class="form-label">Description</label>
            <textarea id="edit-desc" class="form-control" rows="4">${escapeHtml(
              todo.description,
            )}</textarea>
        </div>
        <button id="save-edit" class="btn-primary" style="width: 100%;">Save Changes</button>
    `,
  );

  document.getElementById('save-edit').onclick = async () => {
    const title = document.getElementById('edit-title').value;
    const desc = document.getElementById('edit-desc').value;

    if (!title || !desc) return alert('All fields required');

    try {
      await todoService.updateTodo(todo.id, { title, description: desc });
      closeModal();
      loadTodos();
    } catch (err) {
      alert(err.message);
    }
  };
}

function openDeleteModal(todo) {
  openModal(
    'Delete Todo',
    `
        <p style="margin-bottom: 24px;">Are you sure you want to delete "<strong>${escapeHtml(
          todo.title,
        )}</strong>"? This action cannot be undone.</p>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="cancel-delete" class="btn-secondary">Cancel</button>
            <button id="confirm-delete" class="btn-danger">Delete</button>
        </div>
    `,
  );

  document.getElementById('cancel-delete').onclick = closeModal;
  document.getElementById('confirm-delete').onclick = async () => {
    try {
      await todoService.deleteTodo(todo.id);
      closeModal();
      loadTodos();
    } catch (err) {
      alert(err.message);
    }
  };
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}
