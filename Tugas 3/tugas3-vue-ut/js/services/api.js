window.dataService = {
  fetchData() {
    return fetch('data/dataBahanAjar.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Gagal memuat data sumber. Pastikan server dijalankan.');
        }
        return response.json();
      });
  }
};
