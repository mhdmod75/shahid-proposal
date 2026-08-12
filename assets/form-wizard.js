function initFormWizard(options = {}) {
  const {
    formSelector = '.request-form',
    onSubmit,
    getStepCompletion,
  } = options;

  const form = document.querySelector(formSelector);
  if (!form) return;

  const sections = Array.from(form.querySelectorAll('.form-section'));
  const stepDots = Array.from(form.querySelectorAll('[data-step-dot]'));
  const prevButton = form.querySelector('#prevStep');
  const nextButton = form.querySelector('#nextStep');
  const saveButton = form.querySelector('#saveDraftStep');
  const submitButton = form.querySelector('#submitStep');
  let currentStep = 1;

  function isSectionComplete(step) {
    if (getStepCompletion) return getStepCompletion(step, form);
    const section = sections.find(s => Number(s.dataset.step) === step);
    if (!section) return false;
    const required = section.querySelectorAll('[required]');
    return Array.from(required).every(el => el.value.trim() !== '');
  }

  function updateIndicators() {
    stepDots.forEach(dot => {
      const step = Number(dot.dataset.stepDot);
      dot.classList.remove('active', 'completed', 'incomplete');
      if (step === currentStep) {
        dot.classList.add('active');
      } else if (isSectionComplete(step)) {
        dot.classList.add('completed');
      } else {
        dot.classList.add('incomplete');
      }
    });

    form.querySelectorAll('[data-step-arrow]').forEach(arrow => {
      const step = Number(arrow.dataset.stepArrow);
      arrow.classList.toggle('completed', isSectionComplete(step));
    });
  }

  function updateStep() {
    sections.forEach(section => {
      section.classList.toggle('active', Number(section.dataset.step) === currentStep);
    });

    if (prevButton) prevButton.disabled = currentStep === 1;
    if (nextButton) nextButton.classList.toggle('hidden', currentStep === sections.length);
    if (saveButton) saveButton.classList.toggle('hidden', currentStep !== sections.length);
    if (submitButton) submitButton.classList.toggle('hidden', currentStep !== sections.length);

    updateIndicators();
  }

  prevButton?.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep -= 1;
      updateStep();
    }
  });

  nextButton?.addEventListener('click', () => {
    if (currentStep < sections.length) {
      currentStep += 1;
      updateStep();
    }
  });

  stepDots.forEach(dot => {
    dot.addEventListener('click', () => {
      currentStep = Number(dot.dataset.stepDot);
      updateStep();
    });
  });

  form.addEventListener('input', updateIndicators);
  form.addEventListener('change', updateIndicators);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  });

  saveButton?.addEventListener('click', (e) => {
    e.preventDefault();
    if (options.onSave) options.onSave(form);
  });

  submitButton?.addEventListener('click', (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  });

  updateStep();
  return { getCurrentStep: () => currentStep, updateIndicators };
}

function collectFormData(form) {
  const data = {};
  form.querySelectorAll('[name]').forEach(el => {
    if (el.type === 'file') return;
    data[el.name] = el.value;
  });
  return data;
}

function fillFormData(form, data) {
  if (!data) return;
  form.querySelectorAll('[name]').forEach(el => {
    if (data[el.name] !== undefined) el.value = data[el.name];
  });
}
