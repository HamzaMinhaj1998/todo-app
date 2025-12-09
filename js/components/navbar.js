import { authService } from '../services/auth.service.js';

export function renderNavbar(activePage) {
  const user = authService.getCurrentUser();

  // Check auth for protected pages
  if (!user && activePage !== 'login' && activePage !== 'register') {
    window.location.href = 'login.html';
    return;
  }

  const nav = document.createElement('nav');
  nav.className = 'navbar navbar-expand-md navbar-custom';

  const container = document.createElement('div');
  container.className = 'container-custom';
  container.style.display = 'flex';
  container.style.justifyContent = 'space-between';
  container.style.alignItems = 'center';
  container.style.width = '100%';

  // Brand
  const brand = document.createElement('a');
  brand.className = 'navbar-brand';
  brand.href = 'index.html';
  brand.textContent = 'Todo App';

  // Links Container
  const linksDiv = document.createElement('div');
  linksDiv.style.display = 'flex';
  linksDiv.style.alignItems = 'center';

  const links = [
    { name: 'Home', href: 'index.html', id: 'home' },
    { name: 'My Todos', href: 'todo.html', id: 'todo' },
    { name: 'Create', href: 'create.html', id: 'create' },
  ];

  links.forEach((link) => {
    const a = document.createElement('a');
    a.className = `nav-link ${activePage === link.id ? 'active' : ''}`;
    a.href = link.href;
    a.textContent = link.name;
    linksDiv.appendChild(a);
  });

  // Auth Button
  const authDiv = document.createElement('div');

  if (user) {
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn-danger';
    logoutBtn.textContent = 'Logout';
    logoutBtn.onclick = () => authService.logout();

    const userSpan = document.createElement('span');
    userSpan.textContent = `Hi, ${user.username}`;
    userSpan.style.marginRight = '15px';
    userSpan.style.color = 'var(--text-muted)';

    authDiv.appendChild(userSpan);
    authDiv.appendChild(logoutBtn);
  } else {
    const loginBtn = document.createElement('a');
    loginBtn.className = 'btn-primary';
    loginBtn.href = 'login.html';
    loginBtn.textContent = 'Login';
    authDiv.appendChild(loginBtn);
  }

  container.appendChild(brand);
  container.appendChild(linksDiv);
  container.appendChild(authDiv);
  nav.appendChild(container);

  // Inject into header or body
  const header = document.querySelector('header');
  if (header) {
    header.innerHTML = '';
    header.appendChild(nav);
  } else {
    document.body.prepend(nav);
  }
}
