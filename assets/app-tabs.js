document.addEventListener('DOMContentLoaded', () => {
  const shell = document.querySelector('.app-shell[data-tabbar]');
  if (!shell) return;

  const active = shell.dataset.tabbar;
  const session = typeof getSession === 'function' ? getSession() : null;
  const unreadCount = session?.phone && typeof getUnreadCount === 'function'
    ? getUnreadCount(session.phone)
    : 0;

  const tabs = [
    { id: 'home', href: 'home.html', label: 'الرئيسية', icon: '🏠' },
    { id: 'notifications', href: 'notifications.html', label: 'الإشعارات', icon: '🔔', badge: unreadCount },
    { id: 'complaint', href: 'complaint.html', label: 'الشكاوى', icon: '✉️' },
  ];

  const nav = document.createElement('nav');
  nav.className = 'app-tabbar';
  nav.setAttribute('aria-label', 'التنقل الرئيسي');
  nav.innerHTML = tabs.map(tab => `
    <a href="${tab.href}" class="app-tab${active === tab.id ? ' active' : ''}"${active === tab.id ? ' aria-current="page"' : ''}>
      <span class="app-tab-icon-wrap">
        <span class="app-tab-icon" aria-hidden="true">${tab.icon}</span>
        ${tab.badge ? `<span class="app-tab-badge">${tab.badge > 9 ? '9+' : tab.badge}</span>` : ''}
      </span>
      <span class="app-tab-label">${tab.label}</span>
    </a>
  `).join('');

  shell.appendChild(nav);
  document.body.classList.add('has-tabbar');
});
