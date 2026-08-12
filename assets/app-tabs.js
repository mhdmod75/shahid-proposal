document.addEventListener('DOMContentLoaded', () => {
  const shell = document.querySelector('.app-shell[data-tabbar]');
  if (!shell) return;

  const active = shell.dataset.tabbar;
  const session = typeof getSession === 'function' ? getSession() : null;
  const unreadCount = session?.phone && typeof getUnreadCount === 'function'
    ? getUnreadCount(session.phone)
    : 0;

  const icons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.5 12 3l8.5 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-6h4v6"/></svg>',
    notifications: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10a5 5 0 0 1 10 0v4.5l1.8 2.5H5.2L7 14.5V10Z"/><path d="M9.5 18a2.5 2.5 0 0 0 5 0"/></svg>',
    complaint: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-5 4v-13.5Z"/><path d="M8 9h8M8 12h6"/></svg>'
  };

  const tabs = [
    { id: 'home', href: 'home.html', label: 'الرئيسية', icon: icons.home },
    { id: 'notifications', href: 'notifications.html', label: 'الإشعارات', icon: icons.notifications, badge: unreadCount },
    { id: 'complaint', href: 'complaint.html', label: 'الشكاوى', icon: icons.complaint },
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
