// utils/testDataHelper.ts

export class TestDataGenerator {
  private static getTimestamp(): number {
    return Date.now();
  }

  // 10-15 digit rule ke liye valid 10 digits number
  static getRandomPhone(prefix: string = '50'): string {
    const ts = this.getTimestamp().toString();
    return `${prefix}${ts.slice(-8)}`; // 2 + 8 = 10 digits
  }

  // YEH METHOD MISSING YA NON-STATIC THA:
  static getMerchantRegisterData(overrides: Record<string, any> = {}) {
    const ts = this.getTimestamp();
    return {
      merchantName: `PayCaps_${ts.toString().slice(-5)}`,
      businessEmail: `merchant_${ts}@yopmail.com`,
      contactNumber: this.getRandomPhone('50'),
      industry: 'Ecommerce',
      password: 'Password@1234',
      ...overrides,
    };
  }

  static getPayByLinkData(overrides: Record<string, any> = {}) {
    const ts = this.getTimestamp();
    return {
      merchantSearch: 'super',
      amount: '10',
      customerEmail: `cust_${ts}@yopmail.com`,
      customerName: `Customer ${ts.toString().slice(-4)}`,
      phoneNumber: this.getRandomPhone('50'),
      purpose: `Order Ref ${ts.toString().slice(-5)}`,
      cardNumber: '4111 1100 0000 0211',
      expiryDate: '01/32',
      cvv: '111',
      cardHolderName: 'Test User',
      otp: '111111',
      expectedStatus: 'Captured',
      ...overrides,
    };
  }

  static getInvoiceData(overrides: Record<string, any> = {}) {
    const ts = this.getTimestamp();
    return {
      merchantSearch: 'super',
      merchantName: 'Super Merchant',
      currency: 'AED',
      frequency: 'One Time',
      invoiceNumber: `INV-${ts.toString().slice(-6)}`,
      customerEmail: `inv_${ts}@yopmail.com`,
      customerName: `Invoice User ${ts.toString().slice(-4)}`,
      phoneNumber: this.getRandomPhone('50'),
      productName: 'Consulting Fee',
      quantity: '1',
      unitPrice: '100',
      cardNumber: '4111 1100 0000 0211',
      expiryDate: '01/32',
      cvv: '111',
      cardHolderName: 'Test User',
      expectedStatus: 'Captured',
      ...overrides,
    };
  }

  static getAcquirerRoutingData(overrides: Record<string, any> = {}) {
    const ts = this.getTimestamp();
    return {
      merchant: 'super',
      acquirer: 'SANDBOXSIMULATOR',
      paymentMethod: 'Credit Card',
      transactionType: 'Authorized',
      currency: 'AED',
      apiKey: `key_${ts.toString().slice(-6)}`,
      txnKey: `txn_${ts.toString().slice(-6)}`,
      password: 'RoutePassword@123',
      ...overrides,
    };
  }
}