const BaseService = require('./base.service');

class InvoiceService extends BaseService {
  constructor() {
    super('Invoices', 'invoices');
  }

  async getById(id) {
    return await super.getById(id, 'invoiceId');
  }

  async update(id, data) {
    return await super.update(id, data, 'invoiceId');
  }

  async delete(id) {
    return await super.delete(id, 'invoiceId');
  }

  async getNextInvoiceNumber() {
    const invoices = await this.getAll();
    if (invoices.length === 0) return 'INV-0001';
    
    const numbers = invoices
      .map(inv => parseInt(inv.invoiceNumber?.split('-')[1] || '0'))
      .filter(num => !isNaN(num));
    
    const maxNumber = Math.max(0, ...numbers);
    return `INV-${String(maxNumber + 1).padStart(4, '0')}`;
  }
}

module.exports = new InvoiceService();
