document.addEventListener('DOMContentLoaded', () => {
  const phoneForm = document.querySelector('.phone-form');
  const otpBox = document.querySelector('.otp-box');
  const notice = document.querySelector('.otp-notice');

  if (phoneForm && otpBox && notice) {
    phoneForm.addEventListener('submit', (event) => {
      event.preventDefault();
      notice.textContent = 'تم إرسال رمز التحقق بنجاح إلى الرقم المدخل. يرجى إدخاله أدناه.';
      otpBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    otpBox.querySelector('button').addEventListener('click', () => {
      const otpInput = document.querySelector('#otp');
      if (!otpInput) return;

      if (otpInput.value.trim().length === 6) {
        notice.textContent = 'تم تأكيد الرمز بنجاح. سيتم الانتقال إلى الخطوة التالية لإكمال الملف.';
      } else {
        notice.textContent = 'يرجى إدخال الرمز المكون من 6 أرقام لإكمال التحقق.';
      }
    });
  }

  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const slideCounter = document.getElementById('slideCounter');

  if (!slides.length || !prevBtn || !nextBtn || !slideCounter) return;

  let currentIndex = 0;

  const showSlide = (index) => {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === index);
    });

    currentIndex = index;
    slideCounter.textContent = `${index + 1} / ${slides.length}`;
  };

  prevBtn.addEventListener('click', () => {
    const nextIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(nextIndex);
  });

  nextBtn.addEventListener('click', () => {
    const nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  });

  showSlide(0);
});
