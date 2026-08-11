const DEMO_MODE = true;
const DEMO_PHONE = '0999999999';

const STORAGE_KEYS = {
  session: 'shahid_session',
  users: 'shahid_users',
  complaints: 'shahid_complaints',
};

const COMPLAINT_STATUS = {
  OPEN: 'open',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

function seedDemoUser(phone) {
  if (getUser(phone)?.applicant?.firstName) return;

  saveUser(phone, {
    applicant: {
      firstName: 'أحمد',
      fatherName: 'محمد',
      familyName: 'العلي',
      nationalId: '12345678901',
      mobile: phone,
      whatsapp: phone,
      residence: 'دمشق',
    },
    martyrs: [{
      id: 'M-demo-1',
      firstName: 'خالد',
      fatherName: 'أحمد',
      familyName: 'العلي',
      relationship: 'الابن',
      status: 'submitted',
    }],
  });
}

function seedDemoNotifications(phone) {
  if (getNotifications(phone).length) return;

  saveUser(phone, {
    notifications: [
      {
        id: 'N-1',
        type: 'admin',
        title: 'إشعار عام من الإدارة',
        body: 'يرجى التأكد من إرفاق جميع الوثائق المطلوبة عند تقديم استمارة الشهيد.',
        createdAt: Date.now() - 86400000 * 2,
        read: false,
      },
      {
        id: 'N-2',
        type: 'request',
        title: 'تحديث على طلب التسجيل',
        body: 'تم استلام استمارة الشهيد خالد العلي وهي الآن قيد الدراسة الإدارية.',
        createdAt: Date.now() - 86400000,
        read: false,
        link: 'status.html?id=M-demo-1',
      },
      {
        id: 'N-3',
        type: 'interview',
        title: 'دعوة للمقابلة',
        body: 'تم تحديد موعد مقابلة يوم الأحد 18 آب 2026 الساعة 10:00 صباحاً. يرجى الحضور مع الوثائق الأصلية.',
        createdAt: Date.now() - 3600000 * 5,
        read: true,
      },
      {
        id: 'N-4',
        type: 'complaint',
        title: 'متابعة شكوى',
        body: 'تم استلام شكواك وجاري مراجعتها من قبل المختصين.',
        createdAt: Date.now() - 3600000,
        read: false,
        link: 'complaint-detail.html?id=C-demo-1',
      },
    ],
  });
}

function ensureDemoSession() {
  if (!getSession()?.phone) {
    setSession(DEMO_PHONE);
  }
  seedDemoUser(getSession().phone);
  seedDemoNotifications(getSession().phone);
  seedDemoComplaints(getSession().phone);
  return getSession();
}

function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(phone) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ phone, loggedInAt: Date.now() }));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function getUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.users);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getUser(phone) {
  return getUsers()[phone] || null;
}

function saveUser(phone, data) {
  const users = getUsers();
  users[phone] = { ...users[phone], ...data, phone };
  saveUsers(users);
}

function hasApplicantProfile(phone) {
  const user = getUser(phone);
  return Boolean(user?.applicant?.firstName);
}

function getMartyrs(phone) {
  return getUser(phone)?.martyrs || [];
}

function saveMartyr(phone, martyr) {
  const user = getUser(phone) || { phone, martyrs: [] };
  const martyrs = user.martyrs || [];
  const index = martyrs.findIndex(m => m.id === martyr.id);

  if (index >= 0) {
    martyrs[index] = martyr;
  } else {
    martyrs.push(martyr);
  }

  saveUser(phone, { ...user, martyrs });
  return martyr;
}

function getMartyr(phone, martyrId) {
  return getMartyrs(phone).find(m => m.id === martyrId) || null;
}

function getNotifications(phone) {
  return (getUser(phone)?.notifications || [])
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt);
}

function markNotificationRead(phone, notificationId) {
  const notifications = getNotifications(phone).map(notification =>
    notification.id === notificationId ? { ...notification, read: true } : notification
  );
  saveUser(phone, { notifications });
}

function getUnreadCount(phone) {
  return getNotifications(phone).filter(notification => !notification.read).length;
}

function generateMartyrId() {
  return `M-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getAllComplaints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.complaints);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAllComplaints(complaints) {
  localStorage.setItem(STORAGE_KEYS.complaints, JSON.stringify(complaints));
}

function generateComplaintId() {
  return `C-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function generateReplyId() {
  return `R-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getComplaints(phone) {
  return getAllComplaints()
    .filter(complaint => complaint.phone === phone)
    .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
}

function getComplaint(complaintId) {
  return getAllComplaints().find(complaint => complaint.id === complaintId) || null;
}

function saveComplaint(complaint) {
  const complaints = getAllComplaints();
  const index = complaints.findIndex(item => item.id === complaint.id);

  if (index >= 0) {
    complaints[index] = complaint;
  } else {
    complaints.push(complaint);
  }

  saveAllComplaints(complaints);
  return complaint;
}

function createComplaint(phone, body, attachmentName = null) {
  const now = Date.now();
  const complaint = {
    id: generateComplaintId(),
    phone,
    status: COMPLAINT_STATUS.OPEN,
    createdAt: now,
    updatedAt: now,
    closedAt: null,
    replies: [{
      id: generateReplyId(),
      author: 'applicant',
      body,
      attachmentName,
      createdAt: now,
    }],
  };

  return saveComplaint(complaint);
}

function addComplaintReply(complaintId, { author, body, attachmentName = null }) {
  const complaint = getComplaint(complaintId);
  if (!complaint) return null;
  if (complaint.status !== COMPLAINT_STATUS.OPEN) return null;

  const now = Date.now();
  complaint.replies.push({
    id: generateReplyId(),
    author,
    body,
    attachmentName,
    createdAt: now,
  });
  complaint.updatedAt = now;

  return saveComplaint(complaint);
}

function closeComplaint(complaintId, status) {
  if (![COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.REJECTED].includes(status)) {
    return null;
  }

  const complaint = getComplaint(complaintId);
  if (!complaint || complaint.status !== COMPLAINT_STATUS.OPEN) return null;

  complaint.status = status;
  complaint.closedAt = Date.now();
  complaint.updatedAt = complaint.closedAt;

  return saveComplaint(complaint);
}

function seedDemoComplaints(phone) {
  if (getComplaints(phone).some(complaint => complaint.id === 'C-demo-1')) return;

  const createdAt = Date.now() - 86400000;
  saveComplaint({
    id: 'C-demo-1',
    phone,
    status: COMPLAINT_STATUS.OPEN,
    createdAt,
    updatedAt: Date.now() - 3600000 * 2,
    closedAt: null,
    replies: [
      {
        id: 'R-demo-1',
        author: 'applicant',
        body: 'أواجه تأخيراً في متابعة طلبي ولم يتم الرد على استفساراتي السابقة.',
        attachmentName: 'طلب-متابعة.pdf',
        createdAt,
      },
      {
        id: 'R-demo-2',
        author: 'admin',
        body: 'تم استلام شكواك وجاري مراجعتها من قبل المختصين. يرجى إرسال أي مستندات إضافية إن وُجدت.',
        attachmentName: null,
        createdAt: Date.now() - 3600000 * 5,
      },
    ],
  });
}

function requireAuth(redirectTo = 'login.html') {
  if (DEMO_MODE) return ensureDemoSession();

  const session = getSession();
  if (!session?.phone) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

function redirectAfterLogin() {
  if (DEMO_MODE) {
    const session = ensureDemoSession();
    if (!hasApplicantProfile(session.phone)) {
      window.location.href = 'applicant.html';
    } else {
      window.location.href = 'home.html';
    }
    return;
  }

  const session = getSession();
  if (!session?.phone) {
    window.location.href = 'login.html';
    return;
  }

  if (!hasApplicantProfile(session.phone)) {
    window.location.href = 'applicant.html';
  } else {
    window.location.href = 'home.html';
  }
}
