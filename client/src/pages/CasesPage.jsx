import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rejectingLeadId, setRejectingLeadId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [creatingCase, setCreatingCase] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cRes, lRes] = await Promise.all([api.getCases(), api.getLeads()]);
      setCases(cRes.data || []);
      setLeads(lRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAcceptLead = async (id) => {
    try {
      await api.acceptLead(id);
      loadAll();
    } catch (err) {
      alert(`Failed to accept lead: ${err.message}`);
    }
  };

  const handleRejectLead = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    try {
      await api.rejectLead(rejectingLeadId, rejectionReason);
      setRejectingLeadId(null);
      setRejectionReason('');
      loadAll();
    } catch (err) {
      alert(`Failed to reject lead: ${err.message}`);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!newCaseTitle.trim()) return;
    const acceptedLeads = leads.filter(l => l.status === 'ACCEPTED').map(l => l._id);
    try {
      await api.createCase({
        title: newCaseTitle,
        description: newCaseDesc,
        leadIds: acceptedLeads,
        priority: 'HIGH',
      });
      setCreatingCase(false);
      setNewCaseTitle('');
      setNewCaseDesc('');
      loadAll();
    } catch (err) {
      alert(`Failed to create case: ${err.message}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stein-text">Human Investigator Review &amp; Cases</h1>
          <p className="text-stein-text-dim text-sm mt-1">
            Review investigative leads (Accept / Reject) &amp; construct official evidence cases
          </p>
        </div>
        <button
          onClick={() => setCreatingCase(true)}
          className="stein-btn-primary text-sm"
        >
          📁 Create Case from Evidence
        </button>
      </div>

      {/* Create Case Modal */}
      {creatingCase && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="stein-card max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-stein-text">Create Official Investigation Case</h2>
            <form onSubmit={handleCreateCase} className="space-y-3">
              <div>
                <label className="text-xs text-stein-text-dim font-medium">Case Title</label>
                <input
                  type="text"
                  required
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  placeholder="e.g. Vendor Alpha / Shadow Trader Network"
                  className="w-full bg-stein-surface-alt border border-stein-border rounded px-3 py-2 text-sm text-stein-text mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-stein-text-dim font-medium">Description</label>
                <textarea
                  rows={3}
                  value={newCaseDesc}
                  onChange={(e) => setNewCaseDesc(e.target.value)}
                  placeholder="Summary of findings and rationale for case creation..."
                  className="w-full bg-stein-surface-alt border border-stein-border rounded px-3 py-2 text-sm text-stein-text mt-1"
                />
              </div>
              <div className="text-xs text-stein-text-dim">
                Accepted leads will automatically be attached to this case.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreatingCase(false)}
                  className="px-4 py-2 text-sm text-stein-text-dim hover:text-stein-text"
                >
                  Cancel
                </button>
                <button type="submit" className="stein-btn-primary text-sm">
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingLeadId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="stein-card max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-stein-text">Reject Investigative Lead</h2>
            <p className="text-xs text-stein-text-dim">Please provide a mandatory reason for rejecting this lead.</p>
            <form onSubmit={handleRejectLead} className="space-y-3">
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection (e.g. Insufficient corroborating evidence)..."
                className="w-full bg-stein-surface-alt border border-stein-border rounded px-3 py-2 text-sm text-stein-text"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingLeadId(null)}
                  className="px-4 py-2 text-sm text-stein-text-dim hover:text-stein-text"
                >
                  Cancel
                </button>
                <button type="submit" className="stein-btn-danger text-sm">
                  Reject Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Investigative Leads Review Section */}
      <div className="stein-card space-y-4">
        <h2 className="text-lg font-semibold text-stein-text border-b border-stein-border pb-2">
          Pending &amp; Reviewed Investigative Leads ({leads.length})
        </h2>

        {loading ? (
          <div className="text-stein-text-dim text-sm py-4">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="text-stein-text-dim text-sm py-4">No investigative leads recorded.</div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead._id} className="p-4 bg-stein-surface-alt rounded-lg border border-stein-border space-y-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-stein-text text-base">{lead.title}</h3>
                      <span className={`stein-badge ${
                        lead.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        lead.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-xs text-stein-text-dim mt-1">{lead.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-stein-text-dim">Priority Score</div>
                      <div className="text-lg font-bold text-stein-cyan">
                        {Math.round((lead.correlationScore || 0) * 100)}%
                      </div>
                    </div>

                    {lead.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptLead(lead._id)}
                          className="stein-btn-success text-xs"
                        >
                          Accept Lead
                        </button>
                        <button
                          onClick={() => setRejectingLeadId(lead._id)}
                          className="stein-btn-danger text-xs"
                        >
                          Reject Lead
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {lead.signals?.length > 0 && (
                  <div className="bg-stein-bg p-3 rounded border border-stein-border/50 text-xs space-y-1">
                    <span className="font-semibold text-stein-text-dim uppercase text-[10px]">Corroborating Signals:</span>
                    {lead.signals.map((sig, idx) => (
                      <div key={idx} className="flex justify-between text-stein-text">
                        <span>• <strong>{sig.type}:</strong> {sig.detail}</span>
                        <span className="text-stein-cyan font-mono">{Math.round((sig.score || 0) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {lead.status === 'REJECTED' && (
                  <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
                    <strong>Rejection Reason:</strong> {lead.rejectionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Cases Section */}
      <div className="stein-card space-y-4">
        <h2 className="text-lg font-semibold text-stein-text border-b border-stein-border pb-2">
          Active Investigation Cases ({cases.length})
        </h2>

        {cases.length === 0 ? (
          <div className="text-stein-text-dim text-sm py-4">No active cases. Accept a lead and create a case.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.map((c) => (
              <div key={c._id} className="p-4 bg-stein-surface-alt rounded-lg border border-stein-border space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-stein-cyan">{c.caseNumber}</span>
                    <h3 className="font-bold text-stein-text text-base">{c.title}</h3>
                  </div>
                  <span className="stein-badge bg-emerald-500/20 text-emerald-400">
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-stein-text-dim">{c.description}</p>
                <div className="text-[11px] text-stein-text-dim pt-2 border-t border-stein-border/50 flex justify-between">
                  <span>Leads Linked: {c.leadIds?.length || 0}</span>
                  <span>Created: {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
