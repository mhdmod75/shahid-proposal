document.addEventListener('DOMContentLoaded', () => {
  if (!DEMO_MODE && getSession()?.phone && window.location.pathname.includes('login.html')) {
    redirectAfterLogin();
    return;
  }

  const phoneForm = document.querySelector('.phone-form');
  const otpBox = document.querySelector('.otp-box');
  const notice = document.querySelector('.otp-notice');
  const otpConfirmBtn = document.querySelector('#otpConfirm');
  const otpInput = document.querySelector('#otp');

  if (!phoneForm || !otpBox) return;

  otpBox.classList.add('hidden');

  phoneForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const phoneInput = document.querySelector('#phone');
    const phone = phoneInput?.value.trim();

    if (!phone || !/^09\d{8}$/.test(phone)) {
      notice.textContent = 'يرجى إدخال رقم موبايل سوري صحيح (09XXXXXXXXX).';
      return;
    }

    phoneForm.dataset.phone = phone;
    notice.textContent = 'تم إرسال رمز التحقق بنجاح إلى الرقم المدخل. يرجى إدخاله أدناه.';
    otpBox.classList.remove('hidden');
    otpInput?.focus();
  });

  otpConfirmBtn?.addEventListener('click', () => {
    const phone = phoneForm.dataset.phone;
    const otp = otpInput?.value.trim();

    if (!otp || otp.length !== 6) {
      notice.textContent = 'يرجى إدخال الرمز المكون من 6 أرقام لإكمال التحقق.';
      return;
    }

    setSession(phone);

    const users = getUsers();
    if (!users[phone]) {
      saveUser(phone, { martyrs: [] });
    }

    notice.textContent = 'تم تأكيد الرمز بنجاح. جاري الدخول إلى التطبيق...';
    setTimeout(redirectAfterLogin, 600);
  });
});
