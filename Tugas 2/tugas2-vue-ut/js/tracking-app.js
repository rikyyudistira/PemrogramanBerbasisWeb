(function () {
  const seed = typeof createBahanAjarSeed === 'function'
    ? createBahanAjarSeed()
    : (window.bahanAjarSeed ? JSON.parse(JSON.stringify(window.bahanAjarSeed)) : {});

  const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  });

  const currentYear = new Date().getFullYear();

  function parseDoNumber(number) {
    const match = String(number || '').match(/^DO(\d{4})-(\d+)$/);
    if (!match) {
      return null;
    }

    return {
      year: Number(match[1]),
      sequence: Number(match[2])
    };
  }

  new Vue({
    el: '#app',
    data: {
      pengirimanList: seed.pengirimanList || [],
      paketList: seed.paket || [],
      trackingRecords: Object.entries(seed.tracking || {}).map(([nomor, value]) => ({
        nomor,
        nim: value.nim,
        nama: value.nama,
        status: value.status,
        ekspedisiLabel: value.ekspedisi,
        tanggalKirim: value.tanggalKirim,
        paketKode: value.paket,
        totalHarga: value.total,
        perjalanan: value.perjalanan || []
      })),
      trackingForm: {
        nim: '',
        nama: '',
        ekspedisiKode: '',
        paketKode: '',
        tanggalKirim: new Date().toISOString().slice(0, 10),
        totalHarga: 0
      },
      trackingSearch: '',
      formErrors: {},
      formMessage: ''
    },
    computed: {
      currentYear() {
        return currentYear;
      },
      selectedPaket() {
        return this.paketList.find((item) => item.kode === this.trackingForm.paketKode) || null;
      },
      selectedPengiriman() {
        return this.pengirimanList.find((item) => item.kode === this.trackingForm.ekspedisiKode) || null;
      },
      nextDoNumber() {
        const usedSequences = this.trackingRecords
          .map((entry) => parseDoNumber(entry.nomor))
          .filter(Boolean)
          .filter((entry) => entry.year === this.currentYear)
          .map((entry) => entry.sequence);

        const nextSequence = usedSequences.length ? Math.max(...usedSequences) + 1 : 1;
        return `DO${this.currentYear}-${String(nextSequence).padStart(4, '0')}`;
      },
      latestDoNumber() {
        if (!this.trackingRecords.length) {
          return '-';
        }

        return this.trackingRecords[0].nomor;
      },
      filteredTrackingRecords() {
        if (!this.trackingSearch) {
          return this.trackingRecords;
        }

        const query = this.trackingSearch.toLowerCase();
        return this.trackingRecords.filter((entry) => [
          entry.nomor,
          entry.nim,
          entry.nama,
          entry.ekspedisiLabel,
          entry.paketKode
        ].some((field) => String(field).toLowerCase().includes(query)));
      },
      hasFormErrors() {
        return Object.keys(this.formErrors).length > 0;
      }
    },
    watch: {
      'trackingForm.paketKode': {
        immediate: true,
        handler(newValue) {
          const paket = this.paketList.find((item) => item.kode === newValue) || null;
          this.trackingForm.totalHarga = paket ? Number(paket.harga) : 0;
        }
      },
      'trackingForm.nim'(newValue) {
        const normalized = String(newValue || '').replace(/\D+/g, '').slice(0, 12);
        if (newValue !== normalized) {
          this.trackingForm.nim = normalized;
        }
      }
    },
    methods: {
      formatCurrency(value) {
        return currencyFormatter.format(Number(value || 0));
      },
      getPackageName(code) {
        const paket = this.paketList.find((item) => item.kode === code);
        return paket ? paket.nama : '-';
      },
      resetTrackingForm() {
        this.trackingForm = {
          nim: '',
          nama: '',
          ekspedisiKode: '',
          paketKode: '',
          tanggalKirim: new Date().toISOString().slice(0, 10),
          totalHarga: 0
        };
        this.formErrors = {};
        this.formMessage = '';
      },
      saveTrackingOrder() {
        this.formErrors = {};
        this.formMessage = '';

        const payload = {
          nim: String(this.trackingForm.nim || '').trim(),
          nama: String(this.trackingForm.nama || '').trim(),
          ekspedisiKode: String(this.trackingForm.ekspedisiKode || '').trim(),
          paketKode: String(this.trackingForm.paketKode || '').trim(),
          tanggalKirim: String(this.trackingForm.tanggalKirim || '').trim(),
          totalHarga: Number(this.trackingForm.totalHarga || 0)
        };

        if (!payload.nim) {
          this.formErrors.nim = 'NIM wajib diisi.';
        }

        if (!payload.nama) {
          this.formErrors.nama = 'Nama wajib diisi.';
        }

        if (!payload.ekspedisiKode) {
          this.formErrors.ekspedisiKode = 'Ekspedisi wajib dipilih.';
        }

        if (!payload.paketKode) {
          this.formErrors.paketKode = 'Paket wajib dipilih.';
        }

        if (!payload.tanggalKirim) {
          this.formErrors.tanggalKirim = 'Tanggal kirim wajib diisi.';
        }

        const paket = this.paketList.find((item) => item.kode === payload.paketKode);
        const ekspedisi = this.pengirimanList.find((item) => item.kode === payload.ekspedisiKode);

        if (paket && payload.totalHarga !== Number(paket.harga)) {
          payload.totalHarga = Number(paket.harga);
        }

        if (!paket) {
          this.formErrors.paketKode = 'Paket yang dipilih tidak valid.';
        }

        if (!ekspedisi) {
          this.formErrors.ekspedisiKode = 'Ekspedisi yang dipilih tidak valid.';
        }

        if (Object.keys(this.formErrors).length) {
          return;
        }

        const newRecord = {
          nomor: this.nextDoNumber,
          nim: payload.nim,
          nama: payload.nama,
          status: 'Baru Dibuat',
          ekspedisiLabel: ekspedisi.nama,
          tanggalKirim: payload.tanggalKirim,
          paketKode: payload.paketKode,
          totalHarga: Number(paket.harga),
          perjalanan: [
            {
              waktu: `${payload.tanggalKirim} 09:00:00`,
              keterangan: 'DO dibuat dan menunggu proses pengemasan.'
            }
          ]
        };

        this.trackingRecords.unshift(newRecord);
        this.resetTrackingForm();
        this.formMessage = `DO ${newRecord.nomor} berhasil ditambahkan.`;
      }
    }
  });
})();
