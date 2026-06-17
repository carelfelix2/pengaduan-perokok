// KawasanSehat — Admin Dashboard JS
// =========================================

// ---- DUMMY DATA ----
const locations = [
  'Ruang kerja / Open office', 'Toilet / Kamar mandi', 'Tangga darurat',
  'Lift / Koridor', 'Area parkir', 'Kafetaria / Kantin',
  'Lobby / Resepsionis', 'Ruang rapat', 'Rooftop / Teras gedung',
  'Mushola / Area ibadah',
];

const severityLevels = ['ringan', 'sedang', 'berat'];
const deptNames = ['HRD', 'Operasional', 'Keuangan', 'IT', 'Marketing', 'Legal', 'Procurement', 'CS', 'Manajemen'];
const firstNames = ['Andi','Budi','Citra','Dewi','Eko','Fitri','Gilang','Hana','Irfan','Joko',
  'Kartika','Lukman','Maya','Nanda','Oscar','Putri','Rizky','Sari','Teguh','Umi',
  'Vina','Wahyu','Xena','Yoga','Zara'];
const lastNames = ['Pratama','Wijaya','Kusuma','Santoso','Hartono','Gunawan','Saputra','Lestari',
  'Ramadhani','Hidayat','Nugroho','Utami','Wibowo','Anggraini','Firmansyah'];

function randomDate(start, end) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}
function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateDummyData(count) {
  const data = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  for (let i = 0; i < count; i++) {
    const isAnon = Math.random() > 0.5;
    const name = isAnon ? null : randomItem(firstNames) + ' ' + randomItem(lastNames);
    const dept = isAnon ? null : randomItem(deptNames);
    const date = randomDate(sixMonthsAgo, now);
    const severity = randomItem(severityLevels);
    const daysAgo = (now - new Date(date)) / (1000 * 60 * 60 * 24);
    let status;
    if (daysAgo < 14) status = Math.random() > 0.5 ? 'pending' : 'diproses';
    else if (daysAgo < 60) status = randomItem(['pending','diproses','selesai']);
    else status = randomItem(['selesai','ditolak','selesai','selesai']);

    const impacts = [];
    if (Math.random() > 0.3) impacts.push('Sesak napas atau batuk');
    if (Math.random() > 0.2) impacts.push('Bau asap yang mengganggu');
    if (Math.random() > 0.5) impacts.push('Terganggu konsentrasi kerja');
    if (Math.random() > 0.7) impacts.push('Memicu alergi atau iritasi mata');
    if (Math.random() > 0.8) impacts.push('Mual atau pusing');
    if (Math.random() > 0.6) impacts.push('Rekan kerja lain juga terganggu');

    const descriptions = [
      'Terlihat beberapa orang merokok di area toilet lantai 3. Asap masuk ke ruang kerja melalui ventilasi.',
      'Seorang karyawan merokok di dekat pintu masuk gedung, asap terbawa angin ke area lobby.',
      'Rutin melihat puntung rokok di area parkir basement. Terindikasi ada yang merokok di area terlarang.',
      'Kelompok karyawan merokok di tangga darurat, asap naik ke lantai atas dan mengganggu ruang kerja.',
      'Melihat rekan kerja merokok di dalam ruang meeting meskipun ada tanda dilarang merokok.',
      'Bau asap rokok sangat menyengat di area pantry setiap jam istirahat siang.',
      'Seseorang merokok di balkon lantai 8, asap masuk ke jendela ruang kerja yang terbuka.',
      'Terjadi perokok di area lift, asap terperangkap dan mengganggu penumpang lift lainnya.',
      'Beberapa kali melihat karyawan merokok di mushola sebelum jam pulang.',
      'Asap rokok dari area parkir masuk ke ruang server melalui jalur AC.',
    ];

    data.push({
      id: i + 1,
      ref: 'RPK-' + String(2025000 + i).padStart(6, '0'),
      date: date,
      location: randomItem(locations),
      floor: String(Math.floor(Math.random() * 15) + 1),
      detailLoc: ['dekat pantry','pojok kiri','samping lift','belakang pintu','dekat jendela'][Math.floor(Math.random() * 5)],
      time: String(Math.floor(Math.random() * 12) + 7).padStart(2,'0') + ':' + String(Math.floor(Math.random() * 60)).padStart(2,'0'),
      severity: severity,
      status: status,
      isAnon: isAnon,
      name: name,
      email: isAnon ? null : (name ? name.toLowerCase().replace(' ','.') + '@perusahaan.com' : null),
      phone: isAnon ? null : '08' + Math.floor(100000000 + Math.random() * 900000000),
      dept: dept,
      position: isAnon ? null : randomItem(['Staff','Senior Staff','Supervisor','Manager','Associate']),
      frequency: randomItem(['pertama','beberapa','rutin']),
      peopleCount: randomItem(['1 orang','2\u20133 orang','4\u20135 orang','Lebih dari 5 orang']),
      description: randomItem(descriptions),
      impacts: impacts,
      pelanggar: Math.random() > 0.6 ? randomItem(firstNames) + ' ' + randomItem(lastNames) : null,
      suggestion: Math.random() > 0.5 ? 'Mohon dipasang tanda larangan merokok yang lebih jelas dan dilakukan patroli rutin.' : null,
      prevReported: Math.random() > 0.7,
      notes: '',
      createdAt: new Date(date + 'T' + String(Math.floor(Math.random() * 12) + 7).padStart(2,'0') + ':' + String(Math.floor(Math.random() * 60)).padStart(2,'0') + ':00').toISOString(),
    });
  }
  data.sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); });
  return data;
}

// ---- STATE ----
var complaints = [];
var currentPage = 1;
var pageSize = 10;
var filterStatus = 'all';
var filterSeverity = 'all';
var filterMonth = 'all';
var searchQuery = '';
var selectedComplaint = null;
var currentSection = 'dashboard';

// ---- UTILITY ----
function formatDate(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusBadge(status) {
  var labels = { pending:'Pending', diproses:'Diproses', selesai:'Selesai', ditolak:'Ditolak' };
  return '<span class="status-badge ' + status + '">' + (labels[status]||status) + '</span>';
}

function statusLabel(status) {
  var labels = { pending:'Pending', diproses:'Diproses', selesai:'Selesai', ditolak:'Ditolak' };
  return labels[status]||status;
}

function severityBadge(sev) {
  var labels = { ringan:'Ringan', sedang:'Sedang', berat:'Berat' };
  return '<span class="severity-badge ' + sev + '"><span class="sev-dot"></span> ' + (labels[sev]||sev) + '</span>';
}

function severityLabel(sev) {
  var labels = { ringan:'Ringan', sedang:'Sedang', berat:'Berat' };
  return labels[sev]||sev;
}

function frequencyLabel(freq) {
  var labels = { pertama:'Pertama kali', beberapa:'Beberapa kali', rutin:'Hampir setiap hari' };
  return labels[freq]||freq;
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function() {
  var stored = localStorage.getItem('kawasansehat_complaints');
  if (stored) {
    try { complaints = JSON.parse(stored); }
    catch(e) { complaints = generateDummyData(18); localStorage.setItem('kawasansehat_complaints', JSON.stringify(complaints)); }
  } else {
    complaints = generateDummyData(18);
    localStorage.setItem('kawasansehat_complaints', JSON.stringify(complaints));
  }

  var dateEl = document.getElementById('topbar-date');
  if (dateEl) {
    var now = new Date();
    dateEl.textContent = now.toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }

  // Set username in settings
  var usernameEl = document.getElementById('settings-username');
  if (usernameEl) {
    var session = Auth.getSession();
    if (session) {
      usernameEl.value = session.username;
    }
  }

  populateMonthFilter();

  function initCharts() {
    if (typeof Chart !== 'undefined') {
      renderDashboard();
      renderComplaintsTable();
      renderStatistics();
    } else {
      setTimeout(initCharts, 100);
    }
  }
  initCharts();

  document.getElementById('filter-status')?.addEventListener('change', function() {
    filterStatus = this.value; currentPage = 1; renderComplaintsTable();
  });
  document.getElementById('filter-severity')?.addEventListener('change', function() {
    filterSeverity = this.value; currentPage = 1; renderComplaintsTable();
  });
  document.getElementById('filter-month')?.addEventListener('change', function() {
    filterMonth = this.value; currentPage = 1; renderComplaintsTable();
  });
  var searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      searchQuery = this.value.toLowerCase(); currentPage = 1; renderComplaintsTable();
    });
  }
  document.getElementById('btn-export')?.addEventListener('click', exportLaporan);
});

function populateMonthFilter() {
  var select = document.getElementById('filter-month');
  if (!select) return;
  var now = new Date();
  for (var i = 5; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var val = d.getFullYear() + '-' + d.getMonth();
    var label = d.toLocaleDateString('id-ID', { month:'long', year:'numeric' });
    var opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    select.appendChild(opt);
  }
}

// ---- NAVIGATION ----
function navigateTo(section) {
  currentSection = section;
  document.querySelectorAll('.sidebar-link[data-section]').forEach(function(link) {
    link.classList.toggle('active', link.dataset.section === section);
  });
  document.querySelectorAll('.page-section').forEach(function(el) {
    el.classList.toggle('active', el.id === 'section-' + section);
  });
  var titles = { dashboard:'Dashboard', complaints:'Daftar Pengaduan', statistics:'Statistik & Laporan', settings:'Pengaturan' };
  var titleEl = document.getElementById('topbar-title');
  if (titleEl) titleEl.textContent = titles[section] || 'Dashboard';
  if (section === 'dashboard') renderDashboard();
  if (section === 'complaints') renderComplaintsTable();
  if (section === 'statistics') renderStatistics();
}

// ---- DASHBOARD ----
function renderDashboard() {
  renderMetricCards();
  renderBarChart();
  renderPieChart();
  renderRecentTable();
}

function renderMetricCards() {
  var total = complaints.length;
  var now = new Date();
  var thisMonth = complaints.filter(function(c) {
    var d = new Date(c.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  var selesai = complaints.filter(function(c){ return c.status === 'selesai'; }).length;
  var pending = complaints.filter(function(c){ return c.status === 'pending' || c.status === 'diproses'; }).length;

  document.getElementById('metric-total').textContent = total;
  document.getElementById('metric-month').textContent = thisMonth;
  document.getElementById('metric-selesai').textContent = selesai;
  document.getElementById('metric-pending').textContent = pending;
}

function renderBarChart() {
  var ctx = document.getElementById('chart-bar');
  if (!ctx) return;
  var months = [], counts = [], now = new Date();
  for (var i = 11; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString('id-ID', { month:'short', year:'numeric' }));
    counts.push(complaints.filter(function(c) {
      var cd = new Date(c.date);
      return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
    }).length);
  }
  if (window._barChart) window._barChart.destroy();
  window._barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{ label:'Pengaduan', data:counts, backgroundColor:'rgba(45,90,61,0.7)', borderColor:'rgba(45,90,61,1)', borderWidth:1, borderRadius:4, barPercentage:0.6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display:false } },
      scales: {
        y: { beginAtZero:true, ticks:{ stepSize:1, font:{ size:11, family:'Inter' }, color:'#9CA3AF' }, grid:{ color:'rgba(0,0,0,0.05)' } },
        x: { ticks:{ font:{ size:10, family:'Inter' }, color:'#9CA3AF' }, grid:{ display:false } }
      }
    }
  });
}

function renderPieChart() {
  var ctx = document.getElementById('chart-pie');
  if (!ctx) return;
  var locCounts = {};
  complaints.forEach(function(c){ locCounts[c.location] = (locCounts[c.location]||0)+1; });
  var sorted = Object.entries(locCounts).sort(function(a,b){ return b[1]-a[1]; });
  var labels = sorted.slice(0,6).map(function(s){ return s[0]; });
  var data = sorted.slice(0,6).map(function(s){ return s[1]; });
  var otherCount = sorted.slice(6).reduce(function(sum,s){ return sum+s[1]; }, 0);
  if (otherCount > 0) { labels.push('Lainnya'); data.push(otherCount); }
  var colors = ['#1B3A2A','#2D5A3D','#81C784','#FFB74D','#EF9A9A','#42A5F5','#BDBDBD'];
  if (window._pieChart) window._pieChart.destroy();
  window._pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels:labels, datasets:[{ data:data, backgroundColor:colors.slice(0,labels.length), borderWidth:0, hoverOffset:6 }] },
    options: {
      responsive: true, maintainAspectRatio: true, cutout:'65%',
      plugins: {
        legend: { position:'bottom', labels:{ padding:12, usePointStyle:true, pointStyle:'circle', font:{ size:11, family:'Inter' }, color:'#6B7280' } }
      }
    }
  });
}

function renderRecentTable() {
  var tbody = document.getElementById('recent-table-body');
  if (!tbody) return;
  var recent = complaints.slice(0,5);
  tbody.innerHTML = recent.map(function(c) {
    return '<tr><td><span class="ref-cell">#' + c.ref + '</span></td>' +
      '<td><span class="date-cell">' + formatDate(c.date) + '</span></td>' +
      '<td><span class="location-cell">' + c.location + '</span></td>' +
      '<td>' + severityBadge(c.severity) + '</td>' +
      '<td>' + statusBadge(c.status) + '</td>' +
      '<td><span class="reporter-cell">' + (c.isAnon ? 'Anonim' : c.name) + '</span></td></tr>';
  }).join('');
}

// ---- COMPLAINTS TABLE ----
function renderComplaintsTable() {
  var tbody = document.getElementById('complaints-table-body');
  if (!tbody) return;
  var filtered = complaints.slice();

  if (filterStatus !== 'all') filtered = filtered.filter(function(c){ return c.status === filterStatus; });
  if (filterSeverity !== 'all') filtered = filtered.filter(function(c){ return c.severity === filterSeverity; });
  if (filterMonth !== 'all') {
    var parts = filterMonth.split('-');
    var year = parseInt(parts[0]), month = parseInt(parts[1]);
    filtered = filtered.filter(function(c) {
      var d = new Date(c.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }
  if (searchQuery) {
    filtered = filtered.filter(function(c) {
      return c.ref.toLowerCase().indexOf(searchQuery) !== -1 ||
        c.location.toLowerCase().indexOf(searchQuery) !== -1 ||
        (c.name && c.name.toLowerCase().indexOf(searchQuery) !== -1);
    });
  }

  var totalPages = Math.ceil(filtered.length / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  var start = (currentPage - 1) * pageSize;
  var pageData = filtered.slice(start, start + pageSize);

  tbody.innerHTML = pageData.map(function(c) {
    return '<tr>' +
      '<td><span class="ref-cell">#' + c.ref + '</span></td>' +
      '<td><span class="date-cell">' + formatDate(c.date) + '</span></td>' +
      '<td><span class="location-cell">' + c.location + '</span></td>' +
      '<td>' + severityBadge(c.severity) + '</td>' +
      '<td>' + statusBadge(c.status) + '</td>' +
      '<td><span class="reporter-cell">' + (c.isAnon ? 'Anonim' : c.name) + '</span></td>' +
      '<td><div style="display:flex;gap:4px;flex-wrap:nowrap;">' +
        '<button class="btn-action" onclick="openModal(' + c.id + ')" title="Lihat Detail"><i class="ti ti-eye"></i> Detail</button>' +
        '<button class="btn-action warning" onclick="openModal(' + c.id + ')" title="Ubah Status"><i class="ti ti-edit"></i></button>' +
      '</div></td></tr>';
  }).join('');

  renderPagination(totalPages, filtered.length);
}

function renderPagination(totalPages, totalItems) {
  var container = document.getElementById('pagination');
  if (!container) return;
  var start = (currentPage - 1) * pageSize + 1;
  var end = Math.min(currentPage * pageSize, totalItems);
  var html = '<span class="page-info">' + start + '\u2013' + end + ' dari ' + totalItems + '</span>';
  html += '<button class="page-btn" onclick="goPage(' + (currentPage-1) + ')" ' + (currentPage<=1?'disabled':'') + '><i class="ti ti-chevron-left"></i></button>';

  var maxVisible = 5;
  var pageStart = Math.max(1, currentPage - Math.floor(maxVisible/2));
  var pageEnd = Math.min(totalPages, pageStart + maxVisible - 1);
  if (pageEnd - pageStart < maxVisible - 1) pageStart = Math.max(1, pageEnd - maxVisible + 1);

  if (pageStart > 1) {
    html += '<button class="page-btn" onclick="goPage(1)">1</button>';
    if (pageStart > 2) html += '<span class="page-info">...</span>';
  }
  for (var i = pageStart; i <= pageEnd; i++) {
    html += '<button class="page-btn' + (i===currentPage?' active':'') + '" onclick="goPage(' + i + ')">' + i + '</button>';
  }
  if (pageEnd < totalPages) {
    if (pageEnd < totalPages - 1) html += '<span class="page-info">...</span>';
    html += '<button class="page-btn" onclick="goPage(' + totalPages + ')">' + totalPages + '</button>';
  }
  html += '<button class="page-btn" onclick="goPage(' + (currentPage+1) + ')" ' + (currentPage>=totalPages?'disabled':'') + '><i class="ti ti-chevron-right"></i></button>';
  container.innerHTML = html;
}

function goPage(page) { currentPage = page; renderComplaintsTable(); }

// ---- MODAL ----
function openModal(id) {
  var c = null;
  for (var i = 0; i < complaints.length; i++) {
    if (complaints[i].id === id) { c = complaints[i]; break; }
  }
  if (!c) return;
  selectedComplaint = c;
  var overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  document.getElementById('modal-ref').textContent = '#' + c.ref;
  document.getElementById('modal-date').textContent = formatDate(c.date) + ' ' + c.time;
  document.getElementById('modal-location').textContent = c.location + ' \u2014 Lantai ' + c.floor;
  document.getElementById('modal-detail-loc').textContent = c.detailLoc || '-';
  document.getElementById('modal-severity').innerHTML = severityBadge(c.severity);
  document.getElementById('modal-status').innerHTML = statusBadge(c.status);
  document.getElementById('modal-reporter').textContent = c.isAnon ? 'Anonim' : c.name;
  document.getElementById('modal-email').textContent = c.email || '-';
  document.getElementById('modal-phone').textContent = c.phone || '-';
  document.getElementById('modal-dept').textContent = c.dept || '-';
  document.getElementById('modal-position').textContent = c.position || '-';
  document.getElementById('modal-frequency').textContent = frequencyLabel(c.frequency);
  document.getElementById('modal-people').textContent = c.peopleCount;
  document.getElementById('modal-description').textContent = c.description;
  document.getElementById('modal-impacts').textContent = c.impacts.length > 0 ? c.impacts.join(', ') : '-';
  document.getElementById('modal-pelanggar').textContent = c.pelanggar || '-';
  document.getElementById('modal-suggestion').textContent = c.suggestion || '-';
  document.getElementById('modal-prev-reported').textContent = c.prevReported ? 'Ya, sudah pernah dilaporkan' : 'Belum pernah';

  document.querySelectorAll('.status-option').forEach(function(btn) {
    btn.classList.toggle('selected', btn.dataset.status === c.status);
  });
  document.getElementById('modal-notes').value = c.notes || '';
  overlay.classList.add('open');
}

function closeModal() {
  var overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
  selectedComplaint = null;
}

function selectStatus(el, status) {
  document.querySelectorAll('.status-option').forEach(function(btn) { btn.classList.remove('selected'); });
  el.classList.add('selected');
}

function saveStatusChange() {
  if (!selectedComplaint) return;
  var selected = document.querySelector('.status-option.selected');
  if (!selected) return;
  var newStatus = selected.dataset.status;
  var notes = document.getElementById('modal-notes').value;
  selectedComplaint.status = newStatus;
  selectedComplaint.notes = notes;
  localStorage.setItem('kawasansehat_complaints', JSON.stringify(complaints));
  document.getElementById('modal-status').innerHTML = statusBadge(newStatus);
  renderDashboard();
  renderComplaintsTable();
  renderStatistics();
  showToast('Status berhasil diperbarui menjadi ' + statusLabel(newStatus), 'success');
}

// ---- STATISTICS ----
function renderStatistics() {
  renderLineChart();
  renderLocationBarChart();
  renderSeverityDonut();
  renderDeptSummary();
}

function renderLineChart() {
  var ctx = document.getElementById('chart-line');
  if (!ctx) return;
  var months = [], counts = [], now = new Date();
  for (var i = 5; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString('id-ID', { month:'short', year:'numeric' }));
    counts.push(complaints.filter(function(c) {
      var cd = new Date(c.date);
      return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
    }).length);
  }
  if (window._lineChart) window._lineChart.destroy();
  window._lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{ label:'Tren Pengaduan', data:counts, borderColor:'#1B3A2A', backgroundColor:'rgba(27,58,42,0.08)', fill:true, tension:0.4, pointBackgroundColor:'#1B3A2A', pointBorderColor:'#fff', pointBorderWidth:2, pointRadius:4, pointHoverRadius:6, borderWidth:2 }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display:false } },
      scales: {
        y: { beginAtZero:true, ticks:{ stepSize:1, font:{ size:11, family:'Inter' }, color:'#9CA3AF' }, grid:{ color:'rgba(0,0,0,0.05)' } },
        x: { ticks:{ font:{ size:11, family:'Inter' }, color:'#9CA3AF' }, grid:{ display:false } }
      }
    }
  });
}

function renderLocationBarChart() {
  var ctx = document.getElementById('chart-location-bar');
  if (!ctx) return;
  var locCounts = {};
  complaints.forEach(function(c){ locCounts[c.location] = (locCounts[c.location]||0)+1; });
  var sorted = Object.entries(locCounts).sort(function(a,b){ return b[1]-a[1]; });
  var labels = sorted.map(function(s){ return s[0]; });
  var data = sorted.map(function(s){ return s[1]; });
  if (window._locBarChart) window._locBarChart.destroy();
  window._locBarChart = new Chart(ctx, {
    type: 'bar',
    data: { labels:labels, datasets:[{ label:'Jumlah Laporan', data:data, backgroundColor:'rgba(45,90,61,0.7)', borderColor:'rgba(45,90,61,1)', borderWidth:1, borderRadius:4, barPercentage:0.5 }] },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display:false } },
      scales: {
        x: { beginAtZero:true, ticks:{ stepSize:1, font:{ size:11, family:'Inter' }, color:'#9CA3AF' }, grid:{ color:'rgba(0,0,0,0.05)' } },
        y: { ticks:{ font:{ size:10, family:'Inter' }, color:'#6B7280' }, grid:{ display:false } }
      }
    }
  });
}

function renderSeverityDonut() {
  var ctx = document.getElementById('chart-severity-donut');
  if (!ctx) return;
  var counts = { ringan:0, sedang:0, berat:0 };
  complaints.forEach(function(c) { if (counts[c.severity] !== undefined) counts[c.severity]++; });
  if (window._sevDonut) window._sevDonut.destroy();
  window._sevDonut = new Chart(ctx, {
    type: 'doughnut',
    data: { labels:['Ringan','Sedang','Berat'], datasets:[{ data:[counts.ringan, counts.sedang, counts.berat], backgroundColor:['#81C784','#FFB74D','#EF9A9A'], borderWidth:0, hoverOffset:6 }] },
    options: {
      responsive: true, maintainAspectRatio: true, cutout:'65%',
      plugins: { legend: { position:'bottom', labels:{ padding:12, usePointStyle:true, pointStyle:'circle', font:{ size:11, family:'Inter' }, color:'#6B7280' } } }
    }
  });
}

function renderDeptSummary() {
  var tbody = document.getElementById('dept-summary-body');
  if (!tbody) return;
  var deptData = {};
  complaints.forEach(function(c) {
    var dept = c.dept || 'Tidak diketahui';
    if (!deptData[dept]) deptData[dept] = { total:0, pending:0, diproses:0, selesai:0, ditolak:0 };
    deptData[dept].total++;
    deptData[dept][c.status]++;
  });
  tbody.innerHTML = Object.entries(deptData).map(function(e) {
    var dept = e[0], d = e[1];
    return '<tr><td><strong>' + dept + '</strong></td><td>' + d.total + '</td><td>' + d.pending + '</td><td>' + d.diproses + '</td><td>' + d.selesai + '</td><td>' + d.ditolak + '</td></tr>';
  }).join('');
}

// ---- EXPORT LAPORAN ----
function exportLaporan() {
  var now = new Date();
  var monthName = now.toLocaleDateString('id-ID', { month:'long', year:'numeric' });
  var dateStr = now.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  var total = complaints.length;
  var pending = complaints.filter(function(c){ return c.status === 'pending'; }).length;
  var diproses = complaints.filter(function(c){ return c.status === 'diproses'; }).length;
  var selesai = complaints.filter(function(c){ return c.status === 'selesai'; }).length;
  var ditolak = complaints.filter(function(c){ return c.status === 'ditolak'; }).length;

  var locCounts = {};
  complaints.forEach(function(c){ locCounts[c.location] = (locCounts[c.location]||0)+1; });
  var locRows = Object.entries(locCounts).sort(function(a,b){ return b[1]-a[1]; }).map(function(e) {
    return '<tr><td>' + e[0] + '</td><td style="text-align:center">' + e[1] + '</td></tr>';
  }).join('');

  var detailRows = complaints.slice(0,20).map(function(c) {
    return '<tr><td>#' + c.ref + '</td><td>' + formatDate(c.date) + '</td><td>' + c.location + '</td><td>' + severityLabel(c.severity) + '</td><td>' + statusLabel(c.status) + '</td><td>' + (c.isAnon?'Anonim':c.name) + '</td></tr>';
  }).join('');

  var win = window.open('', '_blank');
  if (!win) { showToast('Izinkan pop-up untuk membuka laporan.', 'error'); return; }

  var html = '<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Laporan Bulanan — KawasanSehat</title>';
  html += '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=DM+Serif+Display&display=swap" rel="stylesheet">';
  html += '<style>';
  html += '@page { margin:20mm 15mm; }';
  html += '* { box-sizing:border-box; margin:0; padding:0; }';
  html += 'body { font-family:"Inter","Segoe UI",Arial,sans-serif; font-size:12px; line-height:1.6; color:#1A1A1A; padding:40px; background:#fff; }';
  html += '.report-header { text-align:center; padding-bottom:24px; border-bottom:2px solid #1B3A2A; margin-bottom:28px; }';
  html += '.report-header h1 { font-family:"DM Serif Display",Georgia,serif; font-size:28px; color:#1B3A2A; font-weight:400; margin-bottom:4px; }';
  html += '.report-header .sub { font-size:14px; color:#6B7280; }';
  html += '.report-header .periode { font-size:13px; color:#2D5A3D; font-weight:500; margin-top:8px; }';
  html += '.section-title { font-size:16px; font-weight:600; color:#1B3A2A; margin:24px 0 12px; padding-bottom:6px; border-bottom:1px solid rgba(0,0,0,0.1); }';
  html += '.summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }';
  html += '.summary-item { background:#F9F8F5; border:1px solid rgba(0,0,0,0.1); border-radius:8px; padding:16px; text-align:center; }';
  html += '.summary-item .num { font-size:28px; font-weight:600; color:#1B3A2A; font-family:"DM Serif Display",Georgia,serif; }';
  html += '.summary-item .lbl { font-size:11px; color:#6B7280; margin-top:4px; }';
  html += 'table { width:100%; border-collapse:collapse; margin-bottom:20px; font-size:11px; }';
  html += 'th { background:#1B3A2A; color:#fff; padding:8px 10px; text-align:left; font-weight:500; font-size:10px; text-transform:uppercase; letter-spacing:0.05em; }';
  html += 'td { padding:7px 10px; border-bottom:1px solid rgba(0,0,0,0.08); }';
  html += 'tr:nth-child(even) td { background:#F9F8F5; }';
  html += '.footer-note { margin-top:32px; padding-top:16px; border-top:1px solid rgba(0,0,0,0.1); font-size:11px; color:#9CA3AF; text-align:center; }';
  html += '</style></head><body>';
  html += '<div class="report-header">';
  html += '<h1>KawasanSehat</h1>';
  html += '<div class="sub">Program Lingkungan Kerja Bebas Asap Rokok</div>';
  html += '<div class="periode">Laporan Bulanan: ' + monthName + '</div>';
  html += '<div style="font-size:11px;color:#9CA3AF;margin-top:4px;">Dicetak: ' + dateStr + '</div>';
  html += '</div>';

  html += '<div class="section-title">Ringkasan Eksekutif</div>';
  html += '<div class="summary-grid">';
  html += '<div class="summary-item"><div class="num">' + total + '</div><div class="lbl">Total Pengaduan</div></div>';
  html += '<div class="summary-item"><div class="num">' + selesai + '</div><div class="lbl">Selesai</div></div>';
  html += '<div class="summary-item"><div class="num">' + diproses + '</div><div class="lbl">Diproses</div></div>';
  html += '<div class="summary-item"><div class="num">' + (pending + ditolak) + '</div><div class="lbl">Pending / Ditolak</div></div>';
  html += '</div>';

  html += '<div class="section-title">Breakdown Status</div>';
  html += '<table><tr><th>Status</th><th style="text-align:center">Jumlah</th></tr>';
  html += '<tr><td>Pending</td><td style="text-align:center">' + pending + '</td></tr>';
  html += '<tr><td>Diproses</td><td style="text-align:center">' + diproses + '</td></tr>';
  html += '<tr><td>Selesai</td><td style="text-align:center">' + selesai + '</td></tr>';
  html += '<tr><td>Ditolak</td><td style="text-align:center">' + ditolak + '</td></tr>';
  html += '</table>';

  html += '<div class="section-title">Breakdown Lokasi</div>';
  html += '<table><tr><th>Lokasi</th><th style="text-align:center">Jumlah Laporan</th></tr>';
  html += locRows;
  html += '</table>';

  html += '<div class="section-title">Detail Pengaduan (20 Terbaru)</div>';
  html += '<table><tr><th>No. Referensi</th><th>Tanggal</th><th>Lokasi</th><th>Keparahan</th><th>Status</th><th>Pelapor</th></tr>';
  html += detailRows;
  html += '</table>';

  html += '<div class="section-title">Catatan & Rekomendasi</div>';
  html += '<p style="font-size:12px;color:#6B7280;line-height:1.7;">';
  html += 'Berdasarkan data pengaduan yang masuk selama periode ' + monthName + ', terdapat <strong>' + total + ' laporan</strong> yang telah diterima. ';
  html += 'Dari jumlah tersebut, <strong>' + selesai + ' laporan (' + Math.round(selesai/total*100) + '%)</strong> telah selesai ditindaklanjuti. ';
  html += 'Lokasi dengan laporan terbanyak perlu mendapatkan perhatian khusus untuk patroli rutin dan pemasangan tanda larangan merokok yang lebih jelas. ';
  html += 'Disarankan untuk melakukan sosialisasi ulang mengenai kebijakan kawasan bebas asap rokok kepada seluruh karyawan.';
  html += '</p>';

  html += '<div class="footer-note">';
  html += 'Laporan ini digenerate secara otomatis oleh Sistem Pengaduan KawasanSehat &copy; ' + now.getFullYear();
  html += '</div>';
  html += '</body></html>';

  win.document.write(html);
  win.document.close();
  win.focus();
  showToast('Laporan berhasil dibuka di tab baru. Gunakan Ctrl+P untuk mencetak / menyimpan sebagai PDF.', 'success');
}

// ---- TOAST ----
function showToast(msg, type) {
  var toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#1A1A1A;color:#fff;padding:12px 20px;border-radius:50px;font-size:13px;font-weight:500;z-index:999;opacity:0;transition:opacity 0.3s,transform 0.3s;display:flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(0,0,0,0.2);max-width:420px;text-align:center;font-family:Inter,sans-serif;';
    document.body.appendChild(toast);
  }
  var icon = type === 'error' ? 'ti-alert-circle' : type === 'success' ? 'ti-circle-check' : 'ti-info-circle';
  var iconColor = type === 'error' ? '#EF9A9A' : type === 'success' ? '#81C784' : '#81C784';
  toast.innerHTML = '<i class="ti ' + icon + '" style="font-size:16px;color:' + iconColor + '"></i> ' + msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 4000);
}

// ---- LOGOUT ----
function handleLogout() {
  Auth.logout();
  window.location.href = 'admin.html';
}

// ---- CHANGE PASSWORD ----
function handleChangePassword() {
  console.log('handleChangePassword called');
  
  var currentPwEl = document.getElementById('settings-current-pw');
  var newPwEl = document.getElementById('settings-new-pw');
  var confirmPwEl = document.getElementById('settings-confirm-pw');
  
  if (!currentPwEl || !newPwEl || !confirmPwEl) {
    console.error('Password elements not found');
    showToast('Terjadi kesalahan: elemen form tidak ditemukan.', 'error');
    return;
  }
  
  var currentPw = currentPwEl.value.trim();
  var newPw = newPwEl.value.trim();
  var confirmPw = confirmPwEl.value.trim();

  // Validate inputs
  if (!currentPw) {
    showToast('Mohon masukkan password saat ini.', 'error');
    document.getElementById('settings-current-pw').focus();
    return;
  }

  if (!newPw || newPw.length < 4) {
    showToast('Password baru minimal 4 karakter.', 'error');
    document.getElementById('settings-new-pw').focus();
    return;
  }

  if (newPw !== confirmPw) {
    showToast('Konfirmasi password baru tidak cocok.', 'error');
    document.getElementById('settings-confirm-pw').focus();
    return;
  }

  if (newPw === currentPw) {
    showToast('Password baru harus berbeda dari password saat ini.', 'error');
    return;
  }

  var session = Auth.getSession();
  if (!session) {
    showToast('Sesi tidak valid. Silakan login ulang.', 'error');
    return;
  }

  var result = Auth.changePassword(session.username, currentPw, newPw);

  if (result.success) {
    showToast('✓ ' + result.message, 'success');
    // Clear password fields
    document.getElementById('settings-current-pw').value = '';
    document.getElementById('settings-new-pw').value = '';
    document.getElementById('settings-confirm-pw').value = '';
  } else {
    showToast('✗ ' + result.message, 'error');
  }
}
