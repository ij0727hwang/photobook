/**
 * SweetBook API Client
 * Server-side only — keeps API Key secure
 */

const BASE_URLS = {
  sandbox: 'https://api-sandbox.sweetbook.com/v1',
  live: 'https://api.sweetbook.com/v1',
};

class SweetBookClient {
  constructor() {
    this.apiKey = process.env.SWEETBOOK_API_KEY;
    this.env = process.env.SWEETBOOK_ENV || 'sandbox';
    this.baseUrl = BASE_URLS[this.env] || BASE_URLS.sandbox;
  }

  get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  get jsonHeaders() {
    return {
      ...this.headers,
      'Content-Type': 'application/json',
    };
  }

  async request(method, path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const fetchOptions = {
      method,
      headers: options.headers || this.jsonHeaders,
    };

    if (options.body) {
      fetchOptions.body = options.body;
    }

    if (options.idempotencyKey) {
      fetchOptions.headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || `API Error: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  // --- Book Specs ---
  async getBookSpecs() {
    return this.request('GET', '/book-specs');
  }

  async getBookSpec(bookSpecUid) {
    return this.request('GET', `/book-specs/${bookSpecUid}`);
  }

  // --- Templates ---
  async getTemplates(params = {}) {
    const query = new URLSearchParams();
    if (params.bookSpecUid) query.set('bookSpecUid', params.bookSpecUid);
    if (params.templateKind) query.set('templateKind', params.templateKind);
    if (params.category) query.set('category', params.category);
    if (params.theme) query.set('theme', params.theme);
    if (params.limit) query.set('limit', params.limit);
    if (params.offset) query.set('offset', params.offset);
    const qs = query.toString();
    return this.request('GET', `/templates${qs ? `?${qs}` : ''}`);
  }

  async getTemplate(templateUid) {
    return this.request('GET', `/templates/${templateUid}`);
  }

  // --- Books ---
  async createBook(data, idempotencyKey) {
    return this.request('POST', '/books', {
      body: JSON.stringify(data),
      idempotencyKey,
    });
  }

  async getBooks(params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', params.limit);
    if (params.offset) query.set('offset', params.offset);
    const qs = query.toString();
    return this.request('GET', `/books${qs ? `?${qs}` : ''}`);
  }

  async getBook(bookUid) {
    return this.request('GET', `/books?bookUid=${bookUid}`);
  }

  async deleteBook(bookUid) {
    return this.request('DELETE', `/books/${bookUid}`);
  }

  // --- Photos ---
  async uploadPhoto(bookUid, formData) {
    return this.request('POST', `/books/${bookUid}/photos`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });
  }

  async getPhotos(bookUid) {
    return this.request('GET', `/books/${bookUid}/photos`);
  }

  // --- Cover ---
  async addCover(bookUid, formData) {
    return this.request('POST', `/books/${bookUid}/cover`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });
  }

  // --- Contents ---
  async addContent(bookUid, formData, breakBefore = 'page') {
    return this.request('POST', `/books/${bookUid}/contents?breakBefore=${breakBefore}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });
  }

  async clearContents(bookUid) {
    return this.request('DELETE', `/books/${bookUid}/contents`);
  }

  // --- Finalization ---
  async finalizeBook(bookUid) {
    return this.request('POST', `/books/${bookUid}/finalization`);
  }

  // --- Orders ---
  async estimateOrder(data) {
    return this.request('POST', '/orders/estimate', {
      body: JSON.stringify(data),
    });
  }

  async createOrder(data, idempotencyKey) {
    return this.request('POST', '/orders', {
      body: JSON.stringify(data),
      idempotencyKey,
    });
  }

  async getOrders(params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', params.limit);
    if (params.offset) query.set('offset', params.offset);
    if (params.status) query.set('status', params.status);
    const qs = query.toString();
    return this.request('GET', `/orders${qs ? `?${qs}` : ''}`);
  }

  async getOrder(orderUid) {
    return this.request('GET', `/orders/${orderUid}`);
  }

  async cancelOrder(orderUid, cancelReason) {
    return this.request('POST', `/orders/${orderUid}/cancel`, {
      body: JSON.stringify({ cancelReason }),
    });
  }

  // --- Credits ---
  async getCredits() {
    return this.request('GET', '/credits');
  }
}

// Singleton
let client = null;

export function getSweetBookClient() {
  if (!client) {
    client = new SweetBookClient();
  }
  return client;
}

export default SweetBookClient;
