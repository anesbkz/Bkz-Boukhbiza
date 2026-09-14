import React, { useState, useEffect } from 'react';
import { ProductCode, ProductCodeStatus, ProductBatch } from '@/types/models';
import { getProductCodes, getBatches } from '@/services/productCodeService';
import { CANONICAL_CATALOG_SKUS } from '@/lib/codes/productCodeGenerator';
import { CodeStatusBadge } from '@/components/admin/manufacturing/CodeStatusBadge';
import { GenerateCodesModal } from '@/components/admin/manufacturing/GenerateCodesModal';
import { ExportCodesModal } from '@/components/admin/manufacturing/ExportCodesModal';
import { Button } from '@/components/design-system/Button';
import { useI18n } from '@/context/I18nContext';
import {
  QrCode,
  Sparkles,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  CheckSquare,
  Square,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminCodesPage: React.FC = () => {
  const { navigate, dir } = useI18n();

  const [codes, setCodes] = useState<ProductCode[]>([]);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [skuFilter, setSkuFilter] = useState<string>('ALL');

  // Pagination states
  const [cursorHistory, setCursorHistory] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  // Selection & Copy state
  const [selectedCodeIds, setSelectedCodeIds] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedBulk, setCopiedBulk] = useState(false);

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [exportBatch, setExportBatch] = useState<ProductBatch | null>(null);

  const pageSize = 25;

  // Load available batches for the batch selector filter
  useEffect(() => {
    const fetchBatchList = async () => {
      try {
        const result = await getBatches({ limit: 100 });
        setBatches(result.batches);
      } catch (err) {
        console.error('Failed to load batch list for codes filter:', err);
      }
    };
    fetchBatchList();
  }, []);

  const loadCodes = async (cursor: any = null, isPrev = false) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const filters: any = {
        limit: pageSize,
        cursor,
      };

      if (selectedBatchId !== 'ALL') {
        filters.batchId = selectedBatchId;
      }
      if (statusFilter !== 'ALL') {
        filters.status = statusFilter as ProductCodeStatus;
      }
      if (skuFilter !== 'ALL') {
        filters.productSku = skuFilter;
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
      console.error('Failed to query product codes:', err);
      setErrorMsg(err?.message || 'Error querying serialization records from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCursorHistory([]);
    setNextCursor(null);
    setPageIndex(0);
    setSelectedCodeIds(new Set());
    loadCodes(null);
  }, [selectedBatchId, statusFilter, skuFilter, searchTerm]);

  const handleNextPage = () => {
    if (!nextCursor || !hasMore) return;
    setCursorHistory((prev) => [...prev, nextCursor]);
    setPageIndex((prev) => prev + 1);
    loadCodes(nextCursor);
  };

  const handlePrevPage = () => {
    if (pageIndex === 0) return;
    const newHistory = [...cursorHistory];
    newHistory.pop();
    const prevCursor = newHistory[newHistory.length - 1] || null;
    setCursorHistory(newHistory);
    loadCodes(prevCursor, true);
  };

  const handleCopySingle = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedCodeIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const handleSelectAllOnPage = () => {
    if (selectedCodeIds.size === codes.length) {
      setSelectedCodeIds(new Set());
    } else {
      setSelectedCodeIds(new Set(codes.map((c) => c.id)));
    }
  };

  const handleCopySelected = async () => {
    const selectedCodes = codes
      .filter((c) => selectedCodeIds.has(c.id))
      .map((c) => c.code);

    if (selectedCodes.length === 0) return;

    try {
      await navigator.clipboard.writeText(selectedCodes.join('\n'));
      setCopiedBulk(true);
      setTimeout(() => setCopiedBulk(false), 2500);
    } catch (err) {
      console.error('Bulk copy failed:', err);
    }
  };

  const activeSelectedBatch =
    selectedBatchId !== 'ALL'
      ? batches.find((b) => b.id === selectedBatchId) || null
      : batches[0] || null;

  return (
    <div className="space-y-6 text-start" dir={dir}>
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider mb-2 border border-blue-100">
            <QrCode className="w-3.5 h-3.5" />
            VIREXON BIOSCIENCES • SERIALIZATION & AUTHENTICITY REGISTRY
          </div>
          <h1 className="text-2xl font-black text-[#0B2346] tracking-tight">
            Product Codes & Serialization
          </h1>
          <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Search, verify authenticity, inspect cryptographic container serials, and export packaging data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('admin/products')}
            className="font-mono text-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Manufacturing Batches</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (activeSelectedBatch) {
                setExportBatch(activeSelectedBatch);
              }
            }}
            disabled={codes.length === 0 || !activeSelectedBatch}
            className="font-mono text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Codes</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowGenerateModal(true)}
            className="font-mono text-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Codes</span>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
          {/* Serial Code Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search serial or normalized code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F5F7FA] border border-[#E2E8F0] text-xs text-[#0B2346] font-mono focus:outline-none focus:bg-white"
            />
          </div>

          {/* Batch Selector */}
          <div>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F5F7FA] border border-[#E2E8F0] text-xs text-[#0B2346] font-mono focus:outline-none focus:bg-white"
            >
              <option value="ALL">All Manufacturing Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchNumber} ({b.productSku})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F5F7FA] border border-[#E2E8F0] text-xs text-[#0B2346] font-mono focus:outline-none focus:bg-white"
            >
              <option value="ALL">All Code Statuses</option>
              <option value="UNUSED">UNUSED (Available)</option>
              <option value="ACTIVATED">ACTIVATED (Patient Verified)</option>
              <option value="DISABLED">DISABLED (Deactivated)</option>
              <option value="REVOKED">REVOKED (Recall/Tamper)</option>
            </select>
          </div>

          {/* Product SKU Filter */}
          <div>
            <select
              value={skuFilter}
              onChange={(e) => setSkuFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F5F7FA] border border-[#E2E8F0] text-xs text-[#0B2346] font-mono focus:outline-none focus:bg-white"
            >
              <option value="ALL">All Formulations</option>
              {Object.entries(CANONICAL_CATALOG_SKUS).map(([sku, info]) => (
                <option key={sku} value={sku}>
                  {sku} ({info.phasePrefix})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          {(searchTerm || selectedBatchId !== 'ALL' || statusFilter !== 'ALL' || skuFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBatchId('ALL');
                setStatusFilter('ALL');
                setSkuFilter('ALL');
              }}
              className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-[#0B2346] underline cursor-pointer"
            >
              Clear Filters
            </button>
          )}

          <button
            onClick={() => loadCodes(null)}
            className="p-1.5 text-gray-600 hover:text-[#0B2346] bg-[#F5F7FA] border border-[#E2E8F0] cursor-pointer"
            title="Refresh code registry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Action Banner */}
      {selectedCodeIds.size > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-[#0B2346]">
            {selectedCodeIds.size} codes selected on this page
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySelected}
              className="px-3 py-1 bg-white border border-blue-300 text-[#0B2346] hover:bg-blue-100 flex items-center gap-1.5 font-bold cursor-pointer"
            >
              {copiedBulk ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Codes copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy {selectedCodeIds.size} Codes</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSelectedCodeIds(new Set())}
              className="px-2 py-1 text-gray-600 hover:text-[#0B2346] cursor-pointer"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Code Table */}
      <div className="bg-white border border-[#E2E8F0] overflow-hidden">
        {errorMsg && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-xs text-[#D62828] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="p-16 text-center text-xs text-gray-500 font-mono">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#0B2346]" />
            FETCHING CRYPTOGRAPHIC SERIAL REGISTRY...
          </div>
        ) : codes.length === 0 ? (
          <div className="p-16 text-center bg-[#F5F7FA]">
            <QrCode className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-[#0B2346]">No Product Codes Found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No serial codes match your filter criteria or search query. Generate codes for an active batch to populate the registry.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowGenerateModal(true)}
              className="mt-4 font-mono text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Generate Codes
            </Button>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5F7FA] border-b border-[#E2E8F0] text-gray-600 font-mono text-[11px]">
                    <th className="py-3 px-3 text-center w-10">
                      <button
                        onClick={handleSelectAllOnPage}
                        className="cursor-pointer text-gray-500 hover:text-[#0B2346]"
                        title="Select/Deselect All on Page"
                      >
                        {selectedCodeIds.size === codes.length ? (
                          <CheckSquare className="w-4 h-4 text-[#0B2346]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3 text-start font-bold">#</th>
                    <th className="py-3 px-4 text-start font-bold">SERIAL CODE</th>
                    <th className="py-3 px-4 text-start font-bold">BATCH LOT</th>
                    <th className="py-3 px-4 text-start font-bold">PRODUCT SKU</th>
                    <th className="py-3 px-4 text-start font-bold">STATUS</th>
                    <th className="py-3 px-4 text-start font-bold">ACTIVATION</th>
                    <th className="py-3 px-4 text-start font-bold">CREATED</th>
                    <th className="py-3 px-4 text-end font-bold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {codes.map((codeObj, idx) => {
                    const seqNum = pageIndex * pageSize + idx + 1;
                    const isSelected = selectedCodeIds.has(codeObj.id);

                    return (
                      <tr
                        key={codeObj.id}
                        className={`hover:bg-gray-50/70 transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleSelect(codeObj.id)}
                            className="cursor-pointer text-gray-400 hover:text-[#0B2346]"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#0B2346]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-gray-400">{seqNum}</td>

                        <td className="py-3 px-4 font-bold text-[#0B2346]">
                          {codeObj.code}
                        </td>

                        <td className="py-3 px-4 text-gray-700">
                          {codeObj.batchNumber || codeObj.batchId?.slice(0, 12) || '—'}
                        </td>

                        <td className="py-3 px-4 text-gray-700">
                          <span className="font-semibold">{codeObj.productSku}</span>
                        </td>

                        <td className="py-3 px-4">
                          <CodeStatusBadge
                            status={codeObj.status}
                            isActivated={codeObj.isActivated}
                          />
                        </td>

                        <td className="py-3 px-4 text-gray-600 font-sans text-xs">
                          {codeObj.activatedAt ? (
                            <div>
                              <span className="font-mono text-[11px] block text-emerald-800 font-semibold">
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

                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {codeObj.createdAt
                            ? new Date(codeObj.createdAt).toLocaleDateString()
                            : '—'}
                        </td>

                        <td className="py-3 px-4 text-end">
                          <button
                            onClick={() => handleCopySingle(codeObj.code)}
                            className="px-2 py-1 text-gray-600 hover:text-[#0B2346] hover:bg-gray-100 border border-[#E2E8F0] inline-flex items-center gap-1 text-[10px] font-mono cursor-pointer"
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

            {/* Pagination */}
            <div className="p-3 bg-[#F5F7FA] border-t border-[#E2E8F0] flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500">
                Page {pageIndex + 1} • {codes.length} codes listed
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
        )}
      </div>

      {/* Modal: Generate Codes */}
      <GenerateCodesModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        batch={activeSelectedBatch}
        batches={batches}
        onSuccess={() => {
          loadCodes(null);
        }}
        onOpenExport={(b) => setExportBatch(b)}
      />

      {/* Modal: Export Codes */}
      <ExportCodesModal
        isOpen={Boolean(exportBatch)}
        onClose={() => setExportBatch(null)}
        batch={exportBatch}
        currentPageCodes={codes}
      />
    </div>
  );
};
