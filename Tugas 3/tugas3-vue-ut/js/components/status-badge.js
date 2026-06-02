Vue.component('ba-status-badge', {
  template: '#tpl-status-badge',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    statusMeta() {
      const qty = Number(this.item.qty || 0);
      const safety = Number(this.item.safety || 0);

      if (qty === 0) {
        return { label: 'Kosong', className: 'danger' };
      }
      if (qty < safety) {
        return { label: 'Menipis', className: 'warning' };
      }
      return { label: 'Aman', className: 'success' };
    }
  }
});
