/**
 * storage.adapter.js – FINAL VERSION (MockAPI 404-safe)
 */
class ApiAdapter {
  constructor(resource) {
    this.baseUrl = 'https://666c3b7e49dbc5d7145d3ce0.mockapi.io';
    this.resource = resource;
  }

  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}/${endpoint}`;
    const res = await fetch(url, options);

    // THIS IS THE ONLY LINE THAT MATTERS
    // MockAPI returns 404 when a filtered GET (?key=value) has zero results
    // → we convert it to an empty array instead of throwing
    if (res.status === 404 && endpoint.includes('?')) {
      return [];
    }

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }

  async getAll() {
    return this._fetch(this.resource);
  }

  async getById(id) {
    return this._fetch(`${this.resource}/${id}`);
  }

  async create(data) {
    return this._fetch(this.resource, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async update(id, updates) {
    return this._fetch(`${this.resource}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }

  async delete(id) {
    return this._fetch(`${this.resource}/${id}`, { method: 'DELETE' });
  }

  async query(params = {}) {
    const sp = new URLSearchParams(params);
    return this._fetch(`${this.resource}?${sp.toString()}`);
  }
}

export default ApiAdapter;
