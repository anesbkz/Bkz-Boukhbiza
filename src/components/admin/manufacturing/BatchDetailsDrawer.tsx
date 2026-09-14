import React, { useState, useEffect } from 'react';
import { ProductBatch, ProductCode, ProductCodeStatus } from '@/types/models';
import { getProductCodes } from '@/services/productCodeService';
import { CANONICAL_CATALOG_SKUS } from '@/lib/codes/productCodeGenerator';
import { BatchStatusBadge } from './BatchStatusBadge';
import { CodeStatusBadge } from './CodeStatusBadge';
import { Button } from '@/components/design-system/Button';
import {
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  Loader2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  Ban,
  Archive,
  RefreshCw,
} from 'lucide-react';

interface BatchDetailsDrawerProps {
  batch: ProductBatch | null;
  onClose: () => void;
  onOpenGenerate: (batch: ProductBatch) => void;
  onOpenExport: (batch: ProductBatch, codes?: ProductCode[]) => void;
  onOpenStatusChange: (batch: ProductBatch, status: 'ACTIVE' | 'DISABLED' | 'ARCHIVED') => void;
}

export const BatchDetailsDrawer: React.FC<BatchDetailsDrawerProps> = ({
  batch,
  onClose,
  onOpenGenerate,
  onOpenExport,
  onOpenStatusChange,
}) => {
  const [codes, setCodes] = useState<ProductCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination states
  const [cursorHistory, setCursorHistory] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  // Copy feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const pageSize = 20;

  const loadCodes = async (cursor: any = null, isPrev = false) => {
    if (!batch) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const filters: any = {
        batchId: batch.id,
        limit: pageSize,
        cursor: cursor,
      };

      if (statusFilter !== 'ALL') {
        filters.status = statusFilter as ProductCodeStatus;
      }
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      const result = await getProductCodes(filters);
      setCodes(result.codes);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);

      if (isPrev) {
        setPageIndex((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Failed to load batch codes:', err);
      setErrorMsg(err?.message || 'Error querying batch serialization records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batch) {
      setCursorHistory([]);
      setNextCursor(null);
      setPageIndex(0);
      loadCodes(null);
    }
  }, [batch?.id, statusFilter, searchTerm]);

  if (!batch) return null;

  const productName = CANONICAL_CATALOG_SKUS[batch.productSku]?.name || batch.productSku;
  const unusedCodesCount = Math.max(0, (batch.totalCodes || 0) - (batch.activatedCodes || 0));

  const handleNextPage = () => {
    if (!nextCursor || !hasMore) return;
    setCursorHistory((prev) => [...prev, nextCursor]);
    setPageIndex((prev) => prev + 1);
    loadCodes(nextCursor);
  };

  const handlePrevPage = () => {
    if (pageIndex === 0) return;
    const newHistory = [...cursorHistory];
    newHistory.pop(); // pop current
    const prevCursor = newHistory[newHistory.length - 1] || null;
    setCursorHistory(newHistory);
    loadCodes(prevCursor, true);
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0B2346]/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col border-l border-[#E2E8F0] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 bg-[#0B2346] text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-lg font-black tracking-tight">
                {batch.batchNumber}
              </span>
              <BatchStatusBadge status={batch.status} />
            </div>
            <p className="text-xs text-blue-200 font-medium">
              {productName} • <span className="font-mono">{batch.productSku}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Batch Details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 bg-[#F5F7FA] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {batch.status === 'ACTIVE' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenGenerate(batch)}
                className="font-mono text-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Codes</span>
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenExport(batch, codes)}
              className="font-mono text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Batch</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {batch.status === 'ACTIVE' && (
              <button
                onClick={() => onOpenStatusChange(batch, 'DISABLED')}
                className="px-2.5 py-1 text-xs font-mono font-semibold text-amber-800 bg-amber-50 border border-amber-300 hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                Disable Batch
              </button>
            )}

            {batch.status === 'DISABLED' && (
              <button
                onClick={() => onOpenStatusChange(batch, 'ACTIVE')}
                className="px-2.5 py-1 text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
              >
                Reactivate Batch
              </button>
            )}

            {batch.status !== 'ARCHIVED' && (
              <button
                onClick={() => onOpenStatusChange(batch, 'ARCHIVED')}
                className="px-2.5 py-1 text-xs font-mono font-semibold text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 flex items-center gap-1 cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" />
                Archive
              </button>
            )}
          </div>
        </div>

        {/* Specifications Bento Grid */}
        <div className="p-4 border-b border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white text-xs">
          <div className="p-2.5 bg-[#F5F7FA] border border-[#E2E8F0]">
            <span className="text-[10px] uppercase font-mono text-gray-500 block">Total Codes</span>
            <span className="text-sm font-mono font-black text-[#0B2346]">{batch.totalCodes || 0}</span>
          </div>

          <div className="p-2.5 bg-[#F5F7FA] border border-[#E2E8F0]">
            <span className="text-[10px] uppercase font-mono text-gray-500 block">Activated Codes</span>
            <span className="text-sm font-mono font-black text-emerald-700">{batch.activatedCodes || 0}</span>
          </div>

          <div className="p-2.5 bg-[#F5F7FA] border border-[#E2E8F0]">
            <span className="text-[10px] uppercase font-mono text-gray-500 block">Unused Codes</span>
            <span className="text-sm font-mono font-black text-blue-700">{unusedCodesCount}</span>
          </div>

          <div className="p-2.5 bg-[#F5F7FA] border border-[#E2E8F0]">
            <span className="text-[10px] uppercase font-mono text-gray-500 block">Manufacturing Date</span>
            <span className="text-xs font-mono font-bold text-gray-800">{batch.manufactureDate || '—'}</span>
          </div>

          <div className="p-2.5 bg-[#F5F7FA] border border-[#E2E8F0]">
            <span className="text-[10px] uppercase font-mono text-gray-500 block">Expiry Date</span>
            <span className="text-xs font-mono font-bold text-gray-800">{batch.expiryDate || '—'}</span>
          </div>

          <div className="p-2.5 bg-[#F5F7FA] border border-[#E2E8F0]">
            <span className="text-[10px] uppercase font-mono text-gray-500 block">Created At</span>
            <span className="text-xs font-mono text-gray-700">
              {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : '—'}
            </span>
          </div>

          <div className="p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] col-span-2">
            <span className="text-[10px] uppercase font-mono text-gray-500 block">Registered By</span>
            <span className="text-xs font-mono text-gray-700 truncate block">
              {batch.createdBy || 'System Administrator'}
            </span>
          </div>
        </div>

        {/* Codes Table Controls */}
        <div className="p-3 bg-[#F5F7FA] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-2 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search serial code or substring..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E2E8F0] text-xs text-[#0B2346] focus:outline-none focus:ring-1 focus:ring-[#0B2346]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1.5 bg-white border border-[#E2E8F0] text-xs text-[#0B2346] font-mono focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNUSED">UNUSED</option>
              <option value="ACTIVATED">ACTIVATED</option>
              <option value="DISABLED">DISABLED</option>
              <option value="REVOKED">REVOKED</option>
            </select>
          </div>

          <button
            onClick={() => loadCodes(null)}
            className="p-1.5 text-gray-500 hover:text-[#0B2346] bg-white border border-[#E2E8F0] cursor-pointer"
            title="Refresh code registry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Codes Table View */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#D62828] mb-3 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500 font-mono">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
              QUERYING BATCH SERIALIZATION REGISTRY...
            </div>
          ) : codes.length === 0 ? (
            <div className="p-12 text-center bg-[#F5F7FA] border border-dashed border-[#E2E8F0]">
              <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-700">No Product Codes Found</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {batch.totalCodes === 0
                  ? 'No serial codes have been generated for this manufacturing lot yet. Click "Generate Codes" to create serialized containers.'
                  : 'No codes match your active search or status filter.'}
              </p>
              {batch.totalCodes === 0 && batch.status === 'ACTIVE' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenGenerate(batch)}
                  className="mt-4 font-mono text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Generate Initial 50 Codes
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#E2E8F0]">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5F7FA] border-b border-[#E2E8F0] text-gray-600 font-mono text-[11px]">
                    <th className="py-2.5 px-3 text-start font-bold">#</th>
                    <th className="py-2.5 px-3 text-start font-bold">SERIAL CODE</th>
                    <th className="py-2.5 px-3 text-start font-bold">STATUS</th>
                    <th className="py-2.5 px-3 text-start font-bold">ACTIVATION</th>
                    <th className="py-2.5 px-3 text-start font-bold">CREATED</th>
                    <th className="py-2.5 px-3 text-end font-bold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {codes.map((codeObj, idx) => {
                    const seqNum = pageIndex * pageSize + idx + 1;
                    return (
                      <tr key={codeObj.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-2.5 px-3 text-gray-400">{seqNum}</td>
                        <td className="py-2.5 px-3 font-bold text-[#0B2346]">
                          {codeObj.code}
                        </td>
                        <td className="py-2.5 px-3">
                          <CodeStatusBadge
                            status={codeObj.status}
                            isActivated={codeObj.isActivated}
                          />
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 font-sans text-xs">
                          {codeObj.activatedAt ? (
                            <div>
                              <span className="font-mono text-[11px] block">
                                {new Date(codeObj.activatedAt).toLocaleDateString()}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {codeObj.activatedByUserId ? `User: ${codeObj.activatedByUserId.slice(0, 8)}...` : 'Activated'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 font-mono text-[10px]">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                          {codeObj.createdAt ? new Date(codeObj.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-end">
                          <button
                            onClick={() => handleCopy(codeObj.code)}
                            className="p-1 text-gray-500 hover:text-[#0B2346] hover:bg-gray-100 inline-flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                            title="Copy Serial Code"
                          >
                            {copiedCode === codeObj.code ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Code copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Drawer Footer & Pagination */}
        <div className="p-3 bg-[#F5F7FA] border-t border-[#E2E8F0] flex items-center justify-between text-xs font-mono">
          <span className="text-gray-500">
            Page {pageIndex + 1} • {codes.length} codes displayed
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={pageIndex === 0 || loading}
              className="px-3 py-1 bg-white border border-[#E2E8F0] text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!hasMore || loading}
              className="px-3 py-1 bg-white border border-[#E2E8F0] text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
