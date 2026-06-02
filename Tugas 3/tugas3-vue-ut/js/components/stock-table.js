Vue.component('ba-stock-table', {
  template: '#tpl-stock-table',
  props: {
    stockItems: {
      type: Array,
      default: () => []
    },
    upbjjList: {
      type: Array,
      default: () => []
    },
    kategoriList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      filterMode: 'all',
      selectedUpbjj: '',
      selectedKategori: '',
      statusFilter: 'all',
      searchQuery: '',
      sortKey: 'judul',
      sortDirection: 'asc',
      stockModalOpen: false,
      stockFormMode: 'add',
      editingIndex: -1,
      stockForm: {
        kode: '',
        judul: '',
        kategori: '',
        upbjj: '',
        lokasiRak: '',
        harga: '',
        qty: '',
        safety: '',
        catatanHTML: ''
      },
      formErrors: {},
      formMessage: ''
    };
  },
  computed: {
    totalItems() {
      return this.stockItems.length;
    },
    totalQty() {
      return this.stockItems.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    },
    reorderCount() {
      return this.stockItems.filter((item) => Number(item.qty) < Number(item.safety)).length;
    },
    emptyCount() {
      return this.stockItems.filter((item) => Number(item.qty) === 0).length;
    },
    categoryFilterOptions() {
      if (!this.selectedUpbjj) {
        return [];
      }
      return [...new Set(this.stockItems
        .filter((item) => item.upbjj === this.selectedUpbjj)
        .map((item) => item.kategori))].sort();
    },
    filteredStock() {
      let result = [...this.stockItems];

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter((item) => [item.kode, item.judul, item.lokasiRak]
          .some((field) => String(field).toLowerCase().includes(query)));
      }

      if (this.filterMode === 'upbjj') {
        if (this.selectedUpbjj) {
          result = result.filter((item) => item.upbjj === this.selectedUpbjj);
        }
        if (this.selectedUpbjj && this.selectedKategori) {
          result = result.filter((item) => item.kategori === this.selectedKategori);
        }
      }

      if (this.statusFilter === 'reorder') {
        result = result.filter((item) => Number(item.qty) < Number(item.safety));
      } else if (this.statusFilter === 'empty') {
        result = result.filter((item) => Number(item.qty) === 0);
      }

      result.sort((a, b) => {
        let left;
        let right;

        if (this.sortKey === 'qty' || this.sortKey === 'harga') {
          left = Number(a[this.sortKey] || 0);
          right = Number(b[this.sortKey] || 0);
        } else {
          left = String(a[this.sortKey] || '').toLowerCase();
          right = String(b[this.sortKey] || '').toLowerCase();
        }

        if (left < right) {
          return this.sortDirection === 'asc' ? -1 : 1;
        }
        if (left > right) {
          return this.sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });

      return result;
    },
    activeFilterSummary() {
      const summary = [];
      if (this.filterMode === 'upbjj') {
        summary.push(this.selectedUpbjj || 'semua UT-daerah');
        if (this.selectedKategori) {
          summary.push(this.selectedKategori);
        }
      } else {
        summary.push('semua stok');
      }
      if (this.statusFilter === 'reorder') {
        summary.push('perlu reorder');
      } else if (this.statusFilter === 'empty') {
        summary.push('stok kosong');
      }
      if (this.searchQuery) {
        summary.push(`cari: ${this.searchQuery}`);
      }
      return summary.join(' | ');
    },
    hasFormErrors() {
      return Object.keys(this.formErrors).length > 0;
    }
  },
  watch: {
    filterMode(newValue) {
      if (newValue !== 'upbjj') {
        this.selectedUpbjj = '';
        this.selectedKategori = '';
      }
    },
    selectedUpbjj(newValue) {
      if (!newValue) {
        this.selectedKategori = '';
        return;
      }
      if (this.selectedKategori && !this.categoryFilterOptions.includes(this.selectedKategori)) {
        this.selectedKategori = '';
      }
    },
    'stockForm.kode'(newValue) {
      const normalized = String(newValue || '').toUpperCase().replace(/\s+/g, '');
      if (newValue !== normalized) {
        this.stockForm.kode = normalized;
      }
    }
  },
  methods: {
    openStockModal(mode = 'add', index = -1) {
      this.formMessage = '';
      if (mode === 'edit') {
        const item = this.filteredStock[index];
        if (!item) {
          return;
        }
        const sourceIndex = this.stockItems.findIndex((row) => row.kode === item.kode);
        if (sourceIndex === -1) {
          return;
        }
        this.stockFormMode = 'edit';
        this.editingIndex = sourceIndex;
        this.stockForm = {
          kode: item.kode,
          judul: item.judul,
          kategori: item.kategori,
          upbjj: item.upbjj,
          lokasiRak: item.lokasiRak,
          harga: Number(item.harga),
          qty: Number(item.qty),
          safety: Number(item.safety),
          catatanHTML: item.catatanHTML
        };
        this.formErrors = {};
        this.stockModalOpen = true;
        return;
      }
      this.resetStockForm();
      this.stockModalOpen = true;
    },
    closeStockModal() {
      this.stockModalOpen = false;
      this.resetStockForm();
    },
    resetFilters() {
      this.filterMode = 'all';
      this.selectedUpbjj = '';
      this.selectedKategori = '';
      this.statusFilter = 'all';
      this.searchQuery = '';
      this.sortKey = 'judul';
      this.sortDirection = 'asc';
    },
    resetStockForm() {
      this.stockFormMode = 'add';
      this.editingIndex = -1;
      this.stockForm = {
        kode: '',
        judul: '',
        kategori: '',
        upbjj: '',
        lokasiRak: '',
        harga: '',
        qty: '',
        safety: '',
        catatanHTML: ''
      };
      this.formErrors = {};
    },
    editStock(index) {
      this.openStockModal('edit', index);
    },
    deleteStock(index) {
      const item = this.filteredStock[index];
      if (!item) {
        return;
      }
      const confirmed = window.confirm(`Hapus stok ${item.kode} - ${item.judul}?`);
      if (!confirmed) {
        return;
      }
      const sourceIndex = this.stockItems.findIndex((row) => row.kode === item.kode);
      if (sourceIndex > -1) {
        this.stockItems.splice(sourceIndex, 1);
      }
    },
    formatCurrency(value) {
      return this.$root.$options.filters.currency(value);
    },
    formatQuantity(value) {
      return this.$root.$options.filters.quantity(value);
    },
    saveStock() {
      this.formErrors = {};
      this.formMessage = '';

      const payload = {
        kode: String(this.stockForm.kode || '').trim(),
        judul: String(this.stockForm.judul || '').trim(),
        kategori: String(this.stockForm.kategori || '').trim(),
        upbjj: String(this.stockForm.upbjj || '').trim(),
        lokasiRak: String(this.stockForm.lokasiRak || '').trim(),
        harga: Number(this.stockForm.harga),
        qty: Number(this.stockForm.qty),
        safety: Number(this.stockForm.safety),
        catatanHTML: String(this.stockForm.catatanHTML || '').trim()
      };

      if (!payload.kode) {
        this.formErrors.kode = 'Kode wajib diisi.';
      } else {
        const duplicateIndex = this.stockItems.findIndex((item, index) => item.kode === payload.kode && index !== this.editingIndex);
        if (duplicateIndex !== -1) {
          this.formErrors.kode = 'Kode sudah dipakai item lain.';
        }
      }

      if (!payload.judul) {
        this.formErrors.judul = 'Judul wajib diisi.';
      }
      if (!payload.kategori) {
        this.formErrors.kategori = 'Kategori wajib dipilih.';
      }
      if (!payload.upbjj) {
        this.formErrors.upbjj = 'UT-Daerah wajib dipilih.';
      }
      if (!payload.lokasiRak) {
        this.formErrors.lokasiRak = 'Lokasi rak wajib diisi.';
      }
      if (!Number.isFinite(payload.harga) || payload.harga < 0) {
        this.formErrors.harga = 'Harga harus berupa angka valid.';
      }
      if (!Number.isFinite(payload.qty) || payload.qty < 0) {
        this.formErrors.qty = 'Qty harus berupa angka valid.';
      }
      if (!Number.isFinite(payload.safety) || payload.safety < 0) {
        this.formErrors.safety = 'Safety stock harus berupa angka valid.';
      }
      if (Object.keys(this.formErrors).length) {
        return;
      }

      const wasEditing = this.stockFormMode === 'edit';
      if (wasEditing && this.editingIndex > -1) {
        this.$set(this.stockItems, this.editingIndex, payload);
      } else {
        this.stockItems.push(payload);
      }

      this.stockModalOpen = false;
      this.resetStockForm();
      this.formMessage = wasEditing
        ? 'Data bahan ajar berhasil diperbarui.'
        : 'Data bahan ajar baru berhasil ditambahkan.';
    }
  }
});
