import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  FolderKanban,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  FileText,
  RefreshCw,
  X,
  Target,
  Briefcase,
  Info,
} from 'lucide-react';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-cyan-400" />
            <span>Human Investigator Review &amp; Cases</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Review investigative leads (Accept / Reject) &amp; construct official evidence cases
          </p>
        </div>
        <button
          onClick={() => setCreatingCase(true)}
          className="stein-btn-cyan text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Case from Evidence</span>
        </button>
      </div>

      {/* Create Case Modal Overlay */}
      {creatingCase && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="stein-card max-w-md w-full border-slate-700 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setCreatingCase(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Create Official Case Dossier</h2>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  placeholder="e.g. Vendor Alpha / Shadow Trader Network"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Description &amp; Overview</label>
                <textarea
                  rows={3}
                  value={newCaseDesc}
                  onChange={(e) => setNewCaseDesc(e.target.value)}
                  placeholder="Summary of findings and rationale for case creation..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>All accepted investigative leads will automatically attach to this new case dossier.</span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreatingCase(false)}
                  className="stein-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="stein-btn-cyan text-xs">
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingLeadId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="stein-card max-w-md w-full border-red-500/40 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>Reject Investigative Lead</span>
            </h2>
            <p className="text-xs text-slate-400">Please provide a mandatory rationale for rejecting this lead.</p>
            <form onSubmit={handleRejectLead} className="space-y-3 text-xs">
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection (e.g. Insufficient corroborating evidence)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingLeadId(null)}
                  className="stein-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="stein-btn-danger text-xs">
                  Reject Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Investigative Leads Review Section */}
      <div className="stein-card border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Target className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100">
            Pending &amp; Reviewed Investigative Leads ({leads.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-slate-400 text-xs py-6 text-center flex justify-center items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Loading investigative leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-slate-500 text-xs py-6 text-center">No investigative leads recorded.</div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead._id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3 hover:border-slate-700 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{lead.title}</h3>
                      <span className={`stein-badge ${
                        lead.status === 'ACCEPTED' ? 'stein-badge-live' :
                        lead.status === 'REJECTED' ? 'stein-badge-suspicious' :
                        'stein-badge-review'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{lead.description}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[9px] uppercase font-bold text-slate-500">Correlation Score</div>
                      <div className="text-base font-black text-cyan-400 font-mono">
                        {Math.round((lead.correlationScore || 0) * 100)}%
                      </div>
                    </div>

                    {lead.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptLead(lead._id)}
                          className="stein-btn-success text-xs py-1.5 px-3"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => setRejectingLeadId(lead._id)}
                          className="stein-btn-danger text-xs py-1.5 px-3"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {lead.signals?.length > 0 && (
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Corroborating Signals:</span>
                    {lead.signals.map((sig, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300 text-[11px]">
                        <span>• <strong>{sig.type}:</strong> {sig.detail}</span>
                        <span className="text-cyan-400 font-bold">{Math.round((sig.score || 0) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {lead.status === 'REJECTED' && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-2.5 rounded-lg">
                    <strong>Rejection Rationale:</strong> {lead.rejectionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Cases Section */}
      <div className="stein-card border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Briefcase className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100">
            Active Investigation Cases ({cases.length})
          </h2>
        </div>

        {cases.length === 0 ? (
          <div className="text-slate-500 text-xs py-6 text-center">No active cases. Accept a lead and create a case above.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.map((c) => (
              <div key={c._id} className="stein-card-hover border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">{c.caseNumber}</span>
                    <h3 className="font-bold text-white text-sm mt-1.5">{c.title}</h3>
                  </div>
                  <span className="stein-badge-live text-[10px]">
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{c.description}</p>
                <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800 flex justify-between">
                  <span>Leads Attached: <strong className="text-slate-300">{c.leadIds?.length || 0}</strong></span>
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
