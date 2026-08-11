const COMPLAINT_STATUS_LABELS = {
  open: 'قيد المعالجة',
  resolved: 'تمت المعالجة',
  rejected: 'مرفوضة',
};

const COMPLAINT_AUTHOR_LABELS = {
  applicant: 'مقدم الطلب',
  admin: 'الإدارة',
};

function formatComplaintDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('ar-SY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getComplaintStatusLabel(status) {
  return COMPLAINT_STATUS_LABELS[status] || status;
}

function renderComplaintStatusBadge(status) {
  return `<span class="complaint-status status-${status}">${getComplaintStatusLabel(status)}</span>`;
}

function renderReplyThread(replies = []) {
  if (!replies.length) {
    return '<p class="section-desc">لا توجد رسائل بعد.</p>';
  }

  return `
    <div class="reply-thread">
      ${replies.map(reply => `
        <article class="reply-card reply-${reply.author}">
          <div class="reply-card-head">
            <strong>${COMPLAINT_AUTHOR_LABELS[reply.author] || reply.author}</strong>
            <time>${formatComplaintDate(reply.createdAt)}</time>
          </div>
          <p class="reply-body">${escapeHtml(reply.body)}</p>
          ${reply.attachmentName ? `
            <p class="reply-attachment">📎 ${escapeHtml(reply.attachmentName)}</p>
          ` : ''}
        </article>
      `).join('')}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readSingleAttachment(input) {
  const file = input?.files?.[0];
  return file ? file.name : null;
}

function renderComplaintListItem(complaint) {
  const lastReply = complaint.replies?.[complaint.replies.length - 1];
  return `
    <a href="complaint-detail.html?id=${complaint.id}" class="complaint-list-card">
      <div class="complaint-list-head">
        <strong>${complaint.id}</strong>
        ${renderComplaintStatusBadge(complaint.status)}
      </div>
      <p class="complaint-list-preview">${escapeHtml(lastReply?.body?.slice(0, 90) || '—')}${lastReply?.body?.length > 90 ? '...' : ''}</p>
      <time class="complaint-list-time">${formatComplaintDate(complaint.updatedAt || complaint.createdAt)}</time>
    </a>
  `;
}
