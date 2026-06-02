Vue.component('ba-app-modal', {
  template: '#tpl-app-modal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Dialog'
    },
    closeLabel: {
      type: String,
      default: 'Tutup'
    }
  }
});
