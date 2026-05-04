// LOGIN FUNCTIONS
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  
  if (!email || !password) {
    alert('Email dan password harus diisi!');
    return;
  }
  
  const user = dataPengguna.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Simpan user ke session storage
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'dashboard.html';
  } else {
    alert('Email atau password yang anda masukkan salah!');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
  }
}

// MODAL FUNCTIONS
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
  }
}

// Close modal when clicking outside content
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('show');
  }
});

function handleForgotPassword(event) {
  event.preventDefault();
  const email = document.getElementById('forgotEmail').value.trim();
  
  if (!email) {
    alert('Masukkan email Anda!');
    return;
  }
  
  const user = dataPengguna.find(u => u.email === email);
  if (user) {
    alert(`Password untuk ${email} adalah: ${user.password}`);
    closeModal('forgotPasswordModal');
  } else {
    alert('Email tidak ditemukan dalam sistem!');
  }
}

function handleRegister(event) {
  event.preventDefault();
  const regNama = document.getElementById('regNama').value.trim();
  const regEmail = document.getElementById('regEmail').value.trim();
  const regPassword = document.getElementById('regPassword').value.trim();
  const regRole = document.getElementById('regRole').value;
  
  if (!regNama || !regEmail || !regPassword || !regRole) {
    alert('Semua field harus diisi!');
    return;
  }
  
  const existingUser = dataPengguna.find(u => u.email === regEmail);
  if (existingUser) {
    alert('Email sudah terdaftar!');
    return;
  }
  
  const newUser = {
    id: dataPengguna.length + 1,
    nama: regNama,
    email: regEmail,
    password: regPassword,
    role: regRole,
    lokasi: 'Lokasi Baru'
  };
  
  dataPengguna.push(newUser);
  alert('Pendaftaran berhasil! Silakan login dengan akun baru Anda.');
  closeModal('registerModal');
  document.getElementById('registerForm').reset();
}

// DASHBOARD FUNCTIONS
function initDashboard() {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }
  
  displayGreeting(currentUser);
  setupNavigation(currentUser);
  loadInformasiBahanAjar();
}

function displayGreeting(user) {
  const hours = new Date().getHours();
  let greeting = '';
  
  if (hours < 12) {
    greeting = 'Selamat Pagi';
  } else if (hours < 17) {
    greeting = 'Selamat Siang';
  } else {
    greeting = 'Selamat Sore';
  }
  
  const greetingElement = document.querySelector('.greeting');
  if (greetingElement) {
    greetingElement.textContent = `${greeting}, ${user.nama}!`;
  }
  
  const userNameElement = document.querySelector('.user-name');
  if (userNameElement) {
    userNameElement.textContent = user.nama;
  }
  
  const userRoleElement = document.querySelector('.user-role');
  if (userRoleElement) {
    userRoleElement.textContent = user.role;
  }
  
  const userLokasiElement = document.querySelector('.user-lokasi');
  if (userLokasiElement) {
    userLokasiElement.textContent = user.lokasi;
  }
}

function setupNavigation(user) {
  // Only attach click handlers to links that are intended to switch sections (have data-section)
  const menuItems = document.querySelectorAll('.sidebar nav a[data-section], .sidebar .submenu a[data-section]');

  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      const section = this.getAttribute('data-section');
      if (!section) return; // leave normal links (href) to behave normally
      e.preventDefault();
      showSection(section);
      menuItems.forEach(m => m.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Handle Laporan dropdown
  const laporanMenu = document.querySelector('[data-section="laporan"]');
  if (laporanMenu) {
    laporanMenu.addEventListener('click', function(e) {
      e.preventDefault();
      const submenu = this.nextElementSibling;
      if (submenu && submenu.classList.contains('submenu')) {
        submenu.classList.toggle('show');
      }
    });
  }
}

function showSection(sectionName) {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.classList.remove('active');
  });
  
  const activeSection = document.getElementById(sectionName);
  if (activeSection) {
    activeSection.classList.add('active');
    
    if (sectionName === 'informasiBahanAjar') {
      loadInformasiBahanAjar();
    } else if (sectionName === 'historiTransaksi') {
      loadHistoriTransaksi();
    } else if (sectionName === 'monitoringProgress') {
      loadMonitoringProgress();
    } else if (sectionName === 'rekapBahanAjar') {
      loadRekapBahanAjar();
    } else if (sectionName === 'stok') {
      loadStockData();
    } else if (sectionName === 'tracking') {
      // Ensure tracking listeners are active and clear previous results
      if (typeof initTracking === 'function') initTracking();
      const resultDiv = document.getElementById('trackingResult');
      if (resultDiv) resultDiv.innerHTML = '';
    }
  }
}

function loadInformasiBahanAjar() {
  const container = document.getElementById('informasiBahanAjar');
  if (!container) return;
  
  const bookGrid = container.querySelector('.book-grid');
  if (!bookGrid) return;
  
  bookGrid.innerHTML = '';
  
  dataBahanAjar.forEach(bahan => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <div class="book-image">
        <img src="${bahan.cover}" alt="${bahan.namaBarang}" onerror="this.onerror=null; this.src='img/default_cover.jpg'">
      </div>
      <div class="book-info">
        <h3>${bahan.namaBarang}</h3>
        <p><strong>Kode Lokasi:</strong> ${bahan.kodeLokasi}</p>
        <p><strong>Kode Barang:</strong> ${bahan.kodeBarang}</p>
        <p><strong>Jenis:</strong> ${bahan.jenisBarang}</p>
        <p><strong>Edisi:</strong> ${bahan.edisi}</p>
        <div class="book-code"><strong>Stok: ${bahan.stok}</strong></div>
      </div>
    `;
    bookGrid.appendChild(card);
  });
}

function loadHistoriTransaksi() {
  const container = document.getElementById('historiTransaksi');
  if (!container) return;
  
  const historyContent = container.querySelector('.history-content');
  if (!historyContent) return;
  
  historyContent.innerHTML = '';
  
  // Membuat contoh history data
  const historyData = [
    {
      tanggal: '2025-08-26',
      no: '2023005678',
      nama: 'Agus Pranoto',
      paket: '0UPBJJBDG - Perkembangan Anak Usia Dini',
      status: 'Selesai Antar'
    },
    {
      tanggal: '2025-08-25',
      no: '2023001234',
      nama: 'Rina Wulandari',
      paket: '0JKT01 - Manajemen Keuangan',
      status: 'Dalam Perjalanan'
    }
  ];
  
  historyData.forEach(history => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <h4>No. Pengiriman: ${history.no}</h4>
      <p><strong>Nama:</strong> ${history.nama}</p>
      <p><strong>Paket:</strong> ${history.paket}</p>
      <p><strong>Status:</strong> ${history.status}</p>
      <p class="history-date">Tanggal: ${history.tanggal}</p>
    `;
    historyContent.appendChild(item);
  });
}

function loadMonitoringProgress() {
  const container = document.getElementById('monitoringProgress');
  if (!container) return;
  
  const tableBody = container.querySelector('tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  let progress = 0;
  dataBahanAjar.forEach((bahan, index) => {
    progress = ((index + 1) / dataBahanAjar.length) * 100;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${bahan.namaBarang}</td>
      <td>${bahan.kodeBarang}</td>
      <td>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%">${Math.round(progress)}%</div>
        </div>
      </td>
      <td>${bahan.stok}</td>
    `;
    tableBody.appendChild(row);
  });
}

function loadRekapBahanAjar() {
  const container = document.getElementById('rekapBahanAjar');
  if (!container) return;
  
  const tableBody = container.querySelector('tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  dataBahanAjar.forEach((bahan, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${bahan.kodeLokasi}</td>
      <td>${bahan.kodeBarang}</td>
      <td>${bahan.namaBarang}</td>
      <td>${bahan.jenisBarang}</td>
      <td>${bahan.edisi}</td>
      <td>${bahan.stok}</td>
    `;
    tableBody.appendChild(row);
  });
}

function logout() {
  sessionStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// TRACKING PAGE FUNCTIONS
function initTracking() {
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', handleTrackingSearch);
  }
  
  const searchInput = document.getElementById('nomorDO');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleTrackingSearch();
      }
    });
  }
}

function handleTrackingSearch() {
  const nomorDO = document.getElementById('nomorDO').value.trim();
  
  if (!nomorDO) {
    alert('Masukkan nomor Delivery Order!');
    return;
  }
  
  const tracking = dataTracking[nomorDO];
  
  if (!tracking) {
    alert('Nomor Delivery Order tidak ditemukan!');
    document.getElementById('nomorDO').value = '';
    return;
  }
  
  displayTrackingResult(tracking);
}

function displayTrackingResult(tracking) {
  const resultDiv = document.getElementById('trackingResult');
  const progressPercentage = (tracking.perjalanan.length / 6) * 100;
  
  let statusClass = 'status-' + tracking.status.toLowerCase().replace(' ', '-');
  
  const html = `
    <div class="tracking-header">
      <h3>Pelacakan Pengiriman</h3>
      <p><strong>No. Pengiriman:</strong> ${tracking.nomorDO}</p>
      <p><strong>Nama Penerima:</strong> ${tracking.nama}</p>
      <span class="status-badge ${statusClass}">${tracking.status}</span>
    </div>
    
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${progressPercentage}%">${Math.round(progressPercentage)}%</div>
    </div>
    
    <div class="tracking-details">
      <p><strong>Ekspedisi:</strong> ${tracking.ekspedisi}</p>
      <p><strong>Tanggal Kirim:</strong> ${formatDate(tracking.tanggalKirim)}</p>
      <p><strong>Kode Paket:</strong> ${tracking.paket}</p>
      <p><strong>Total Pembayaran:</strong> ${tracking.total}</p>
    </div>
    
    <div class="tracking-timeline">
      <h4>Riwayat Perjalanan</h4>
      ${tracking.perjalanan.map(p => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-time">${p.waktu}</div>
            <div class="timeline-text">${p.keterangan}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  resultDiv.innerHTML = html;
  resultDiv.classList.add('show');
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString + 'T00:00:00').toLocaleDateString('id-ID', options);
}

// STOCK PAGE FUNCTIONS
function initStock() {
  const addBtn = document.getElementById('addStockBtn');
  if (addBtn) {
    addBtn.addEventListener('click', showAddStockForm);
  }
  
  loadStockData();
}

function loadStockData() {
  const tableBody = document.getElementById('stockTableBody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  dataBahanAjar.forEach((bahan, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${bahan.kodeLokasi}</td>
      <td>${bahan.kodeBarang}</td>
      <td>${bahan.namaBarang}</td>
      <td>${bahan.jenisBarang}</td>
      <td>${bahan.edisi}</td>
      <td>${bahan.stok}</td>
      <td>
        <button class="btn-delete" onclick="deleteStock(${index})">Hapus</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function showAddStockForm() {
  const form = document.getElementById('newStockForm');
  if (form) {
    // ensure form becomes visible regardless of inline styles
    form.classList.add('show');
    form.style.display = getComputedStyle(form).display === 'none' ? 'grid' : getComputedStyle(form).display;
    const addBtn = document.getElementById('addStockBtn');
    if (addBtn) addBtn.style.display = 'none';
  }
}

function cancelAddStock() {
  const form = document.getElementById('newStockForm');
  if (form) {
    form.classList.remove('show');
    // If element is a real <form> use reset(), otherwise clear child inputs/selects
    if (typeof form.reset === 'function') {
      form.reset();
    } else {
      const fields = form.querySelectorAll('input, select, textarea');
      fields.forEach(f => {
        if (f.type === 'checkbox' || f.type === 'radio') f.checked = false;
        else f.value = '';
      });
    }
    // hide form explicitly
    form.style.display = 'none';
    const addBtn = document.getElementById('addStockBtn');
    if (addBtn) addBtn.style.display = 'block';
  }
}

function saveNewStock(event) {
  event.preventDefault();
  
  const kodeLokasi = document.getElementById('kodeLokasi').value.trim();
  const kodeBarang = document.getElementById('kodeBarang').value.trim();
  const namaBarang = document.getElementById('namaBarang').value.trim();
  const jenisBarang = document.getElementById('jenisBarang').value;
  const edisi = document.getElementById('edisi').value.trim();
  const stok = parseInt(document.getElementById('stok').value);
  
  if (!kodeLokasi || !kodeBarang || !namaBarang || !jenisBarang || !edisi || !stok) {
    alert('Semua field harus diisi!');
    return;
  }
  
  const newBahan = {
    kodeLokasi,
    kodeBarang,
    namaBarang,
    jenisBarang,
    edisi,
    stok,
    cover: ''
  };
  
  dataBahanAjar.push(newBahan);
  
  alert('Bahan ajar berhasil ditambahkan!');
  cancelAddStock();
  loadStockData();
}

function deleteStock(index) {
  if (confirm('Apakah Anda yakin ingin menghapus bahan ajar ini?')) {
    dataBahanAjar.splice(index, 1);
    alert('Bahan ajar berhasil dihapus!');
    loadStockData();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', handleForgotPassword);
  }
  
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Check if current page is dashboard
  if (document.body.contains(document.querySelector('.dashboard-container'))) {
    initDashboard();
    // initialize tracking and stock features if their elements exist inside dashboard
    if (document.getElementById('searchBtn') || document.querySelector('#tracking .search-form')) {
      initTracking();
    }
    if (document.getElementById('addStockBtn') || document.getElementById('stockTableBody')) {
      initStock();
    }
  }
  
  // Check if we are on standalone tracking page
  if (document.getElementById('trackingPage')) {
    initTracking();
  }
  
  // Check if we are on standalone stock page
  if (document.getElementById('stockPage')) {
    initStock();
  }
  
});
