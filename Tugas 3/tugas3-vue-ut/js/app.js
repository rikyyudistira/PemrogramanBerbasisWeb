(function () {
  Vue.filter('currency', function (value) {
    const number = Number(value || 0);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(number);
  });

  Vue.filter('quantity', function (value) {
    return `${Number(value || 0)} buah`;
  });

  function loadTemplate(name) {
    return fetch(`templates/${name}.html`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Gagal memuat template ${name}.`);
        }
        return response.text();
      })
      .then((html) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html.trim();
        document.body.appendChild(wrapper.firstElementChild);
      });
  }

  Promise.all([
    'status-badge',
    'app-modal',
    'stock-table',
    'do-tracking'
  ].map(loadTemplate))
    .then(initApp)
    .catch((error) => {
      const root = document.getElementById('app');
      if (root) {
        root.innerHTML = `<section class="hero hero-large"><div class="hero-copy"><h1>Gagal memuat aplikasi</h1><p>${error.message}</p></div></section>`;
      }
      console.error(error);
    });

  function initApp() {
    new Vue({
      el: '#app',
      data: {
        activeTab: 'stok',
        upbjjList: [],
        kategoriList: [],
        pengirimanList: [],
        paketList: [],
        stockItems: [],
        trackingRecords: [],
        loading: false,
        appMessage: ''
      },
      created() {
        this.loadData();
      },
      computed: {
        activeTitle() {
          return this.activeTab === 'stok' ? 'Stok Bahan Ajar' : 'Tracking DO';
        }
      },
      methods: {
        loadData() {
          this.loading = true;
          window.dataService.fetchData()
            .then((data) => {
              this.upbjjList = data.upbjjList || [];
              this.kategoriList = data.kategoriList || [];
              this.stockItems = data.stok || [];
              this.pengirimanList = data.pengirimanList || [];
              this.paketList = data.paket || [];
              this.trackingRecords = Object.entries(data.tracking || {}).map(([nomor, value]) => ({
                nomor,
                nim: value.nim,
                nama: value.nama,
                status: value.status,
                ekspedisiLabel: value.ekspedisi,
                tanggalKirim: value.tanggalKirim,
                paketKode: value.paket,
                totalHarga: value.total,
                perjalanan: value.perjalanan || [],
                newProgress: ''
              }));
            })
            .catch((error) => {
              this.appMessage = error.message;
            })
            .finally(() => {
              this.loading = false;
            });
        },
        setTab(tab) {
          this.activeTab = tab;
        }
      }
    });
  }
})();
