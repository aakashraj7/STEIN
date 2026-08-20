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
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-blue-600" />
            <span>Human Investigator Review &amp; Cases</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Review investigative leads (Accept / Reject) &amp; construct official evidence cases
          </p>
        </div>
        <button
          onClick={() => setCreatingCase(true)}
          className="stein-btn-primary text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Investigation Case</span>
        </button>
      </div>

      {/* Modal: Rejection Reason */}
      {rejectingLeadId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Reject Lead Intelligence</span>
              </h3>
              <button onClick={() => setRejectingLeadId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRejectLead} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason for Rejection:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. False positive, unverified seller persona..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingLeadId(null)}
                  className="stein-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="stein-btn-danger text-xs">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Case */}
      {creatingCase && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Construct New Investigation Dossier</span>
              </h3>
              <button onClick={() => setCreatingCase(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Case Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operation Alpha Vendor Network"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Dossier Summary / Description:
                </label>
                <textarea
                  rows={3}
                  placeholder="Summary of targeted vendor personas, crypto wallets & evidence..."
                  value={newCaseDesc}
                  onChange={(e) => setNewCaseDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Automatic Lead Attachment:</span>
                </div>
                <span>All currently ACCEPTED leads ({leads.filter(l => l.status === 'ACCEPTED').length}) will be bound to this case file.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreatingCase(false)}
                  className="stein-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="stein-btn-primary text-xs">
                  Create Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Leads Triage & Active Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Investigative Leads Queue */}
        <div className="stein-card border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Investigative Leads Queue ({leads.length})
              </h2>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Triage Action Required</span>
          </div>

          {loading ? (
            <div className="text-slate-500 text-xs py-8 text-center flex justify-center items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading leads queue...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-slate-500 text-xs py-8 text-center font-medium">
              No leads currently queued for review.
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {leads.map((lead) => (
                <div
                  key={lead._id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Target Identity</span>
                      <h3 className="text-sm font-bold text-slate-900">{lead.vendorId?.name || 'Unassigned Persona'}</h3>
                    </div>

                    <span className={`stein-badge ${
                      lead.status === 'ACCEPTED' ? 'stein-badge-live' :
                      lead.status === 'REJECTED' ? 'stein-badge-suspicious' :
                      'stein-badge-review'
                    }`}>
                      {lead.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 font-medium leading-relaxed">
                    {lead.reason}
                  </div>

                  {lead.rejectionReason && (
                    <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded border border-red-200 font-medium">
                      <strong>Rejection Reason:</strong> {lead.rejectionReason}
                    </div>
                  )}

                  {lead.status === 'NEW' && (
                    <div className="flex justify-end gap-2 pt-1 border-t border-slate-200">
                      <button
                        onClick={() => setRejectingLeadId(lead._id)}
                        className="stein-btn-danger text-[11px] py-1.5 px-3"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleAcceptLead(lead._id)}
                        className="stein-btn-success text-[11px] py-1.5 px-3"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Lead</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Active Investigation Cases */}
        <div className="stein-card border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Active Evidence Cases ({cases.length})
              </h2>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Official Case Dossiers</span>
          </div>

          {loading ? (
            <div className="text-slate-500 text-xs py-8 text-center flex justify-center items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading case files...</span>
            </div>
          ) : cases.length === 0 ? (
            <div className="text-slate-500 text-xs py-8 text-center font-medium">
              No active cases constructed. Click "New Investigation Case" above to initialize.
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {cases.map((cs) => (
                <div
                  key={cs._id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {cs.caseNumber}
                        </span>
                        <span className="stein-badge-live">{cs.status}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5">{cs.title}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(cs.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {cs.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200 text-slate-500 font-mono">
                    <span>Attached Leads: <strong className="text-slate-900">{(cs.leads || []).length}</strong></span>
                    <span>Priority: <strong className="text-red-600">{cs.priority}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
