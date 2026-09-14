import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '@/types/models';
import { listRecentAuditLogs } from '@/services/auditService';
import { ScrollText, Loader2, ShieldCheck } from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await listRecentAuditLogs(50);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] p-6 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-gray-100 text-gray-700 font-mono text-[10px] uppercase font-bold tracking-wider mb-2">
            <ScrollText className="w-3.5 h-3.5" />
            GOVERNANCE INTEGRITY
          </div>
          <h1 className="text-xl font-black text-[#0B2346]">Immutable Audit Trail</h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Cryptographic and timestamped trail of all administrative state mutations and role changes.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3 py-1.5 bg-[#F5F7FA] border border-[#E2E8F0] text-xs font-mono font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
        >
          Refresh Feed
        </button>
      </div>

      <div className="bg-white border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
            FETCHING AUDIT RECORDS FROM FIRESTORE...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center bg-[#F5F7FA]">
            <ShieldCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-700">No audit logs recorded yet</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Any sensitive operation performed by administrators (creating categories, updating user roles, modifying CMS) is automatically recorded here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-[#F5F7FA] border-b border-[#E2E8F0] text-gray-600 font-mono text-[11px]">
                  <th className="py-3 px-4 text-start font-bold">TIMESTAMP</th>
                  <th className="py-3 px-4 text-start font-bold">ACTION</th>
                  <th className="py-3 px-4 text-start font-bold">ACTOR</th>
                  <th className="py-3 px-4 text-start font-bold">RESOURCE</th>
                  <th className="py-3 px-4 text-start font-bold">METADATA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-[#0B2346] font-bold border border-blue-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900 font-semibold">{log.actorEmail}</div>
                      <div className="text-[10px] text-gray-400 font-sans">
                        Roles: {log.actorRoles?.join(', ') || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      <span className="text-gray-500">{log.resourceType}:</span> {log.resourceId}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-sans text-xs">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
