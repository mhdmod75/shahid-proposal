const OTHER_VALUES = new Set(['other', 'غير ذلك', 'أخرى']);

function isOtherSelectValue(select) {
  if (!select) return false;
  if (select.value === 'other') return true;
  const text = select.options[select.selectedIndex]?.text.trim();
  return OTHER_VALUES.has(text);
}

function initRequiredMarks(root = document) {
  root.querySelectorAll('label').forEach(label => {
    const field = label.querySelector('input, select, textarea');
    if (!field?.required || label.querySelector('.req-mark')) return;

    const labelText = label.querySelector(':scope > span');
    if (!labelText) return;

    const mark = document.createElement('span');
    mark.className = 'req-mark';
    mark.textContent = ' *';
    mark.setAttribute('aria-hidden', 'true');
    labelText.appendChild(mark);
  });
}

function initOtherFields(root = document) {
  root.querySelectorAll('select[data-other-trigger]').forEach(select => {
    if (select.dataset.otherReady === 'true') return;

    const otherInput = select.parentElement.querySelector('[data-other-input]');
    if (!otherInput) return;

    const toggle = () => {
      const show = isOtherSelectValue(select);
      otherInput.classList.toggle('hidden', !show);
      otherInput.required = show && select.required;
      if (!show) otherInput.value = '';
    };

    select.addEventListener('change', toggle);
    select.dataset.otherReady = 'true';
    toggle();
  });
}

function initConditionalFields(root = document) {
  root.querySelectorAll('[data-show-when]').forEach(field => {
    if (field.dataset.conditionReady === 'true') return;

    const select = root.querySelector(`[name="${field.dataset.showWhen}"]`);
    if (!select) return;

    const toggle = () => {
      const mode = field.dataset.showMode || 'equals';
      const showValue = field.dataset.showValue;
      const hasValue = select.value !== '';
      const show = mode === 'not-equal'
        ? hasValue && select.value !== showValue
        : select.value === showValue;

      field.classList.toggle('hidden', !show);
      field.querySelectorAll('input, select, textarea').forEach(input => {
        input.required = show && field.dataset.requiredWhen === 'true';
        if (!show) input.value = '';
      });
    };

    select.addEventListener('change', toggle);
    field.dataset.conditionReady = 'true';
    toggle();
  });
}

const DOCUMENT_TITLES = [
  'هوية شخصية أو إخراج قيد',
  'بيان وفاة أو شهادة وفاة',
  'بيان عائلي أو دفتر عائلة',
  'وثيقة أو سجل صادر عن الفصيل',
  'بيان أو نعي استشهاد',
  'صور أو مقاطع أو منشورات',
];

function createDocumentRow(index) {
  const row = document.createElement('div');
  row.className = 'document-row';
  row.dataset.docRow = String(index);
  row.innerHTML = `
    <label>
      <span>عنوان الوثيقة</span>
      <select name="docTitle_${index}" class="doc-title-select" required data-required-track data-other-trigger>
        <option value="">اختر عنوان الوثيقة</option>
        ${DOCUMENT_TITLES.map(title => `<option>${title}</option>`).join('')}
        <option value="other">أخرى</option>
      </select>
      <input type="text" name="docTitleOther_${index}" data-other-input class="other-field hidden" placeholder="اكتب عنوان الوثيقة" />
    </label>
    <label>
      <span>رفع الوثيقة</span>
      <input type="file" name="docFile_${index}" accept="image/*,.pdf" required data-required-track />
    </label>
  `;
  return row;
}

function initDocumentRows(options = {}) {
  const {
    containerId = 'documentsContainer',
    addBtnId = 'addDocumentBtn',
  } = options;

  const container = document.getElementById(containerId);
  const addBtn = document.getElementById(addBtnId);
  if (!container || !addBtn) return { getRowCount: () => 0 };

  let rowCount = container.querySelectorAll('[data-doc-row]').length;

  const attachRow = (row) => {
    initFormEnhancements(row);
  };

  addBtn.addEventListener('click', () => {
    const row = createDocumentRow(rowCount);
    container.appendChild(row);
    attachRow(row);
    rowCount += 1;
  });

  if (rowCount === 0) {
    const row = createDocumentRow(0);
    container.appendChild(row);
    rowCount = 1;
  }

  return {
    addRowFromData(doc = {}, index = rowCount) {
      const row = createDocumentRow(index);
      const titleSelect = row.querySelector('.doc-title-select');
      const titleOther = row.querySelector('[data-other-input]');

      if (doc.title && DOCUMENT_TITLES.includes(doc.title)) {
        titleSelect.value = doc.title;
      } else if (doc.title) {
        titleSelect.value = 'other';
        titleOther.value = doc.title;
      }

      container.appendChild(row);
      attachRow(row);
      rowCount += 1;
    },
  };
}

function collectDocumentRows(form) {
  return Array.from(form.querySelectorAll('[data-doc-row]')).map(row => {
    const titleSelect = row.querySelector('.doc-title-select');
    const titleOther = row.querySelector('[data-other-input]');
    const fileInput = row.querySelector('input[type="file"]');
    const title = isOtherSelectValue(titleSelect) ? titleOther?.value.trim() : titleSelect?.value;

    return {
      title,
      fileName: fileInput?.files[0]?.name || '',
    };
  }).filter(doc => doc.title);
}

function isFieldVisible(field) {
  return !field.closest('.hidden');
}

function isFieldFilled(field) {
  if (!isFieldVisible(field)) return true;
  if (field.type === 'file') return field.files.length > 0;
  return field.value.trim() !== '';
}


function initGenderMaritalFields(root = document) {
  const form = root.closest?.('form') || (root.tagName === 'FORM' ? root : null);
  if (!form) return;

  const genderField = form.querySelector('[name="gender"]');
  const maritalField = form.querySelector('[name="maritalStatus"]');
  const wivesField = form.querySelector('[data-wives-field]');
  const wivesInput = form.querySelector('[name="wivesCount"]');
  if (!genderField || !maritalField || !wivesField || !wivesInput) return;
  if (genderField.dataset.genderMaritalReady === 'true') return;

  const toggle = () => {
    const isMale = genderField.value === 'ذكر';
    const isSingle = maritalField.value === 'أعزب';
    const hasMaritalStatus = maritalField.value !== '';
    const show = isMale && hasMaritalStatus && !isSingle;

    wivesField.classList.toggle('hidden', !show);
    wivesInput.required = show;
    wivesInput.min = maritalField.value === 'متزوج' ? '1' : '0';
    if (!show) wivesInput.value = '';
    wivesField.setAttribute('aria-hidden', show ? 'false' : 'true');
  };

  genderField.addEventListener('change', toggle);
  maritalField.addEventListener('change', toggle);
  genderField.dataset.genderMaritalReady = 'true';
  toggle();
}

function initFormEnhancements(form) {
  if (!form) return;
  initRequiredMarks(form);
  initOtherFields(form);
  initConditionalFields(form);
  initGenderMaritalFields(form);
}
