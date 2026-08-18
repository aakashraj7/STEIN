import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVendors()
      .then((res) => setVendors(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stein-text">Tracked Vendor Identities</h1>
          <p className="text-stein-text-dim text-sm mt-1">
            Aggregated seller profiles, alias clusters, and stylometric fingerprints
          </p>
        </div>
        <Link to="/stylometry" className="stein-btn-primary text-sm">
          ✍ Stylometry Comparison
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center text-stein-text-dim py-8">Loading vendors...</div>
        ) : vendors.length === 0 ? (
          <div className="col-span-3 text-center text-stein-text-dim py-8">No vendors found. Please seed data first.</div>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor._id} className="stein-card space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold text-stein-accent-bright">{vendor.name}</h2>
                  <span className={`stein-badge ${
                    vendor.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    vendor.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {vendor.riskLevel} RISK
                  </span>
                </div>

                <div className="text-xs text-stein-text-dim mt-2 space-y-1">
                  <div><strong className="text-stein-text">Telegram Username:</strong> @{vendor.telegramUsername || 'N/A'}</div>
                  <div><strong className="text-stein-text">Known Aliases:</strong> {(vendor.aliases || []).join(', ') || 'None recorded'}</div>
                  <div><strong className="text-stein-text">Messages Analyzed:</strong> {vendor.messageCount || 0}</div>
                  <div><strong className="text-stein-text">Wallets Linked:</strong> {(vendor.walletAddresses || []).length}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-stein-border flex justify-between items-center">
                <span className="text-[10px] text-stein-text-dim">
                  First Seen: {new Date(vendor.firstSeen).toLocaleDateString()}
                </span>
                <Link
                  to={`/vendors/${vendor._id}`}
                  className="text-xs text-stein-accent hover:underline font-medium"
                >
                  View Profile →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
