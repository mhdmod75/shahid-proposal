const syriaLocations = [
  { label: 'دمشق - الميدان' }, { label: 'دمشق - باب توما' }, { label: 'دمشق - القنوات' },
  { label: 'دمشق - المزة' }, { label: 'دمشق - برزة' }, { label: 'ريف دمشق - دوما' },
  { label: 'ريف دمشق - الغوطة الشرقية' }, { label: 'حلب - حلب المدينة' },
  { label: 'حلب - الباب' }, { label: 'حلب - منبج' }, { label: 'حماة - حماة' },
  { label: 'حمص - حمص' }, { label: 'اللاذقية - اللاذقية' }, { label: 'إدلب - إدلب' },
  { label: 'درعا - درعا' }, { label: 'السويداء - السويداء' }, { label: 'دير الزور - دير الزور' },
  { label: 'الرقة - الرقة' }, { label: 'الحسكة - الحسكة' }, { label: 'طرطوس - طرطوس' },
  { label: 'سوريا - دمشق' }, { label: 'سوريا - حلب' }, { label: 'سوريا - حمص' },
];

function initSyriaSearch() {
  document.querySelectorAll('input[data-syria-search]').forEach(input => {
    input.addEventListener('input', () => updateSyriaSuggestions(input));
  });
}

function updateSyriaSuggestions(input) {
  const list = document.getElementById(input.getAttribute('list'));
  if (!list) return;
  const query = input.value.trim().toLowerCase();
  list.innerHTML = '';
  if (!query) return;
  syriaLocations
    .filter(item => item.label.toLowerCase().includes(query))
    .slice(0, 25)
    .forEach(item => {
      const option = document.createElement('option');
      option.value = item.label;
      list.appendChild(option);
    });
}

function populateDateSelects() {
  const pairs = [
    ['birthDay', 'birthMonth', 'birthYear'],
    ['deathDay', 'deathMonth', 'deathYear'],
  ];
  const currentYear = new Date().getFullYear();

  pairs.forEach(([dayId, monthId, yearId]) => {
    const dayEl = document.getElementById(dayId);
    const monthEl = document.getElementById(monthId);
    const yearEl = document.getElementById(yearId);
    if (!dayEl || !monthEl || !yearEl) return;

    for (let day = 1; day <= 31; day += 1) {
      const opt = document.createElement('option');
      opt.value = day;
      opt.textContent = day;
      dayEl.appendChild(opt);
    }
    for (let month = 1; month <= 12; month += 1) {
      const opt = document.createElement('option');
      opt.value = month;
      opt.textContent = month;
      monthEl.appendChild(opt);
    }
    for (let year = currentYear; year >= 1900; year -= 1) {
      const opt = document.createElement('option');
      opt.value = year;
      opt.textContent = year;
      yearEl.appendChild(opt);
    }
  });
}
