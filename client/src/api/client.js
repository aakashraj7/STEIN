const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  // Health
  health: () => request('/health'),

  // Messages
  getMessages: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/messages${qs ? `?${qs}` : ''}`);
  },
  getMessage: (id) => request(`/messages/${id}`),
  classifyMessage: (id) => request(`/messages/${id}/classify`, { method: 'POST' }),

  // Vendors
  getVendors: () => request('/vendors'),
  getVendor: (id) => request(`/vendors/${id}`),

  // Stylometry
  compareStylometry: (vendorAId, vendorBId) =>
    request('/stylometry/compare', { method: 'POST', body: JSON.stringify({ vendorAId, vendorBId }) }),

  // Wallets
  getWallets: () => request('/wallets'),
  getWallet: (address) => request(`/wallets/${address}`),
  createWallet: (address, vendorId) => request('/wallets', { method: 'POST', body: JSON.stringify({ address, vendorId }) }),
  getWalletTransactions: (address) => request(`/wallets/${address}/transactions`),
  analyzeWallet: (address) => request(`/wallets/${address}/analyze`, { method: 'POST' }),

  // Graph
  getGraph: () => request('/graph'),

  // Cases & Leads
  getCases: () => request('/cases'),
  getCase: (id) => request(`/cases/${id}`),
  createCase: (data) => request('/cases', { method: 'POST', body: JSON.stringify(data) }),
  getLeads: (status) => request(`/cases/leads/all${status ? `?status=${status}` : ''}`),
  acceptLead: (id) => request(`/cases/leads/${id}/accept`, { method: 'POST', body: JSON.stringify({}) }),
  rejectLead: (id, rejectionReason) =>
    request(`/cases/leads/${id}/reject`, { method: 'POST', body: JSON.stringify({ rejectionReason }) }),

  // Reports
  getReports: () => request('/reports'),
  getReport: (id) => request(`/reports/${id}`),
  generateReport: (caseId) => request('/reports/generate', { method: 'POST', body: JSON.stringify({ caseId }) }),
  verifyReport: (id) => request(`/reports/${id}/verify`, { method: 'POST' }),

  // Audit
  getAuditLog: (caseId) => request(`/audit${caseId ? `?caseId=${caseId}` : ''}`),
  verifyAuditChain: () => request('/audit/verify', { method: 'POST' }),
  tamperDemo: (eventId) => request('/audit/tamper-demo', { method: 'POST', body: JSON.stringify({ eventId }) }),

  // Correlation
  correlationScore: (signals) => request('/correlation/score', { method: 'POST', body: JSON.stringify(signals) }),

  // Telegram
  telegramStatus: () => request('/telegram/status'),
  telegramTest: () => request('/telegram/test', { method: 'POST' }),

  // Seed
  seed: () => request('/seed', { method: 'POST' }),
};
