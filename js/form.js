// KawasanSehat — Form Page JS

let currentStep = 0;
let isAnon = true;
let selectedSeverity = '';
const totalSteps = 3;

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function () {
  // Set today as default date
  const dateInput = document.getElementById('inp-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
    dateInput.max = new Date().toISOString().split('T')[0];
  }

  // Char counter for description
  const desc = document.getElementById('inp-desc');
  const counter = document.getElementById('char-count');
  if (desc && counter) {
    desc.addEventListener('input', () => {
      const len = desc.value.length;
      counter.textContent = len;
      counter.style.color = len > 900 ? '#E24B4A' : '';
      if (desc.value.length > 1000) {
        desc.value = desc.value.slice(0, 1000);
      }
    });
  }

  // Upload zone drag & drop
  const zone = document.getElementById('upload-zone');
  if (zone) {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.style.borderColor = 'var(--green-mid)';
      zone.style.background = 'var(--green-light)';
    });
    zone.addEventListener('dragleave', () => {
      zone.style.borderColor = '';
      zone.style.background = '';
    });
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.style.borderColor = '';
      zone.style.background = '';
      const input = document.getElementById('file-input');
      const dt = new DataTransfer();
      [...e.dataTransfer.files].slice(0, 5).forEach(f => dt.items.add(f));
      input.files = dt.files;
      renderPreviews(dt.files);
    });
  }
});

// ---- ANON TOGGLE ----
function setAnon(anon) {
  isAnon = anon;
  document.getElementById('btn-anon').classList.toggle('active', anon);
  document.getElementById('btn-named').classList.toggle('active', !anon);
  const namedFields = document.getElementById('named-fields');
  const anonNote = document.getElementById('anon-note');
  if (namedFields) namedFields.style.display = anon ? 'none' : 'block';
  if (anonNote) anonNote.style.display = anon ? 'flex' : 'none';
}

// ---- SEVERITY ----
function setSeverity(level) {
  selectedSeverity = level;
  ['low', 'med', 'high'].forEach(l => {
    const btn = document.getElementById('sev-' + l);
    if (btn) {
      btn.className = 'sev-card';
      if (l === level) btn.classList.add('active-' + level);
    }
  });
}

// ---- STEP NAVIGATION ----
function goStep(n) {
  // Validation before advancing
  if (n > currentStep) {
    if (!validateStep(currentStep)) return;
  }

  // Update step indicators
  const inds = document.querySelectorAll('.step-ind');
  const lines = document.querySelectorAll('.si-line');

  inds.forEach((ind, i) => {
    ind.classList.remove('active', 'done');
    if (i < n) ind.classList.add('done');
    if (i === n) ind.classList.add('active');
  });

  lines.forEach((line, i) => {
    line.classList.toggle('done', i < n);
  });

  // Animate steps
  const currentEl = document.getElementById('step-' + currentStep);
  const nextEl = document.getElementById('step-' + n);

  if (currentEl) {
    currentEl.style.opacity = '0';
    currentEl.style.transform = n > currentStep ? 'translateX(-20px)' : 'translateX(20px)';
    setTimeout(() => {
      currentEl.classList.remove('active');
      currentEl.style.opacity = '';
      currentEl.style.transform = '';
    }, 200);
  }

  setTimeout(() => {
    if (nextEl) {
      nextEl.classList.add('active');
      nextEl.style.opacity = '0';
      nextEl.style.transform = n > currentStep ? 'translateX(20px)' : 'translateX(-20px)';
      setTimeout(() => {
        nextEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        nextEl.style.opacity = '1';
        nextEl.style.transform = 'translateX(0)';
        setTimeout(() => {
          nextEl.style.transition = '';
        }, 300);
      }, 20);
    }
  }, 210);

  currentStep = n;

  // Update progress bar
  const pct = ((n + 1) / totalSteps) * 100;
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = pct + '%';

  // Update step label
  const label = document.getElementById('step-label');
  if (label) label.textContent = `Langkah ${n + 1} dari ${totalSteps}`;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- VALIDATION ----
function validateStep(step) {
  if (step === 0) {
    if (!isAnon) {
      const name = document.getElementById('inp-name');
      if (name && !name.value.trim()) {
        showError(name, 'Nama tidak boleh kosong jika tidak anonim.');
        return false;
      }
    }
    return true;
  }

  if (step === 1) {
    const loc = document.getElementById('inp-location');
    if (loc && !loc.value) {
      showError(loc, 'Pilih lokasi kejadian.');
      return false;
    }
    const date = document.getElementById('inp-date');
    if (date && !date.value) {
      showError(date, 'Tanggal kejadian harus diisi.');
      return false;
    }
    if (!selectedSeverity) {
      const sevGroup = document.querySelector('.severity-group');
      if (sevGroup) {
        sevGroup.style.outline = '2px solid #E24B4A';
        sevGroup.style.outlineOffset = '4px';
        sevGroup.style.borderRadius = '8px';
        setTimeout(() => {
          sevGroup.style.outline = '';
          sevGroup.style.outlineOffset = '';
        }, 2000);
      }
      showToast('Pilih tingkat keparahan kejadian.', 'error');
      return false;
    }
    return true;
  }

  if (step === 2) {
    const desc = document.getElementById('inp-desc');
    if (desc && !desc.value.trim()) {
      showError(desc, 'Deskripsi kejadian harus diisi.');
      return false;
    }
    const agree = document.getElementById('chk-agree');
    if (agree && !agree.checked) {
      showToast('Setujui kebijakan privasi untuk melanjutkan.', 'error');
      return false;
    }
    return true;
  }

  return true;
}

function showError(el, msg) {
  el.style.borderColor = '#E24B4A';
  el.style.boxShadow = '0 0 0 3px rgba(226,75,74,0.15)';
  showToast(msg, 'error');
  el.focus();
  el.addEventListener('input', () => {
    el.style.borderColor = '';
    el.style.boxShadow = '';
  }, { once: true });
}

// ---- FILE UPLOAD ----
function handleFiles(input) {
  const files = Array.from(input.files).slice(0, 5);
  renderPreviews(files);
}

function renderPreviews(files) {
  const grid = document.getElementById('preview-grid');
  if (!grid) return;
  grid.innerHTML = '';

  Array.from(files).slice(0, 5).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview-thumb';
        img.alt = file.name;
        grid.appendChild(img);
      };
      reader.readAsDataURL(file);
    } else {
      const div = document.createElement('div');
      div.className = 'preview-video-thumb';
      div.innerHTML = `<i class="ti ti-video"></i><span>${truncate(file.name, 10)}</span>`;
      grid.appendChild(div);
    }
  });
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

// ---- SUBMIT ----
function submitForm() {
  if (!validateStep(2)) return;

  const btn = document.getElementById('btn-submit');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="ti ti-loader-2" style="animation: spin 1s linear infinite;"></i> Mengirim...';
  }

  // Add spin animation
  const style = document.createElement('style');
  style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
  document.head.appendChild(style);

  // Simulate API call
  setTimeout(() => {
    const ref = '#RPK-' + Math.floor(100000 + Math.random() * 900000);
    const refEl = document.getElementById('ref-number');
    if (refEl) refEl.textContent = ref;

    const overlay = document.getElementById('success-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      setTimeout(() => { overlay.style.opacity = '1'; }, 10);
    }

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="ti ti-send"></i> Kirim Pengaduan';
    }
  }, 1800);
}

// ---- RESET ----
function resetAndNew() {
  const overlay = document.getElementById('success-overlay');
  if (overlay) overlay.style.display = 'none';

  currentStep = 0;
  selectedSeverity = '';
  isAnon = true;

  // Reset steps
  document.querySelectorAll('.form-step').forEach((s, i) => {
    s.classList.toggle('active', i === 0);
  });

  // Reset indicators
  document.querySelectorAll('.step-ind').forEach((ind, i) => {
    ind.classList.toggle('active', i === 0);
    ind.classList.remove('done');
  });
  document.querySelectorAll('.si-line').forEach(l => l.classList.remove('done'));

  // Reset progress
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = '33.33%';

  const label = document.getElementById('step-label');
  if (label) label.textContent = 'Langkah 1 dari 3';

  // Reset form fields
  document.querySelectorAll('.field-input, .field-select, .field-textarea').forEach(el => {
    if (el.type !== 'date') el.value = '';
  });
  document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
  document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);

  // Reset anon
  setAnon(true);

  // Reset severity
  ['low', 'med', 'high'].forEach(l => {
    const btn = document.getElementById('sev-' + l);
    if (btn) btn.className = 'sev-card';
  });

  // Reset preview
  const grid = document.getElementById('preview-grid');
  if (grid) grid.innerHTML = '';

  // Reset char counter
  const counter = document.getElementById('char-count');
  if (counter) counter.textContent = '0';

  // Set today's date again
  const dateInput = document.getElementById('inp-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- TOAST ----
function showToast(msg, type = 'info') {
  let toast = document.getElementById('toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-msg';
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: #1A1A1A; color: #fff; padding: 12px 20px; border-radius: 50px;
      font-size: 13px; font-weight: 500; z-index: 999; opacity: 0;
      transition: opacity 0.3s, transform 0.3s; display: flex; align-items: center; gap: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2); max-width: 340px; text-align: center;
      font-family: 'Inter', sans-serif;
    `;
    document.body.appendChild(toast);
  }

  const icon = type === 'error' ? 'ti-alert-circle' : 'ti-info-circle';
  toast.innerHTML = `<i class="ti ${icon}" style="font-size:16px; color: ${type === 'error' ? '#EF9A9A' : '#81C784'}"></i> ${msg}`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3000);
}
