import { renderNavbar } from './components/navbar.js';
import { authService } from './services/auth.service.js';
import { todoService } from './services/todo.service.js';

const user = authService.getCurrentUser();
if (!user) location.href = 'login.html';

renderNavbar('create');

const form = document.getElementById('createTodoForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button');
  const originalText = btn.innerText;
  btn.innerText = 'Creating...';
  btn.disabled = true;

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;

  try {
    await todoService.createTodo(user.id, user.username, title, description);
    window.location.href = 'todo.html';
  } catch (err) {
    alert(err.message);
    btn.innerText = originalText;
    btn.disabled = false;
  }
});
