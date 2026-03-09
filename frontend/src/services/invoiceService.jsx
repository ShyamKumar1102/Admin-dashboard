import apiService from './apiService';

class InvoiceService {
  async getAll() {
    return await apiService.get('/invoices');
  }

  async getById(id) {
    return await apiService.get(`/invoices/${id}`);
  }

  async create(invoiceData) {
    return await apiService.post('/invoices', invoiceData);
  }

  async updateStatus(id, status) {
    return await apiService.put(`/invoices/${id}/status`, { status });
  }

  async delete(id) {
    return await apiService.delete(`/invoices/${id}`);
  }
}

export default new InvoiceService();
