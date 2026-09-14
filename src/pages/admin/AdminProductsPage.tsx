import React, { useState, useEffect, useMemo } from 'react';
import { ProductBatch, BatchStatus } from '@/types/models';
import { getBatches } from '@/services/productCodeService';
import { CANONICAL_CATALOG_SKUS } from '@/lib/codes/productCodeGenerator';
import { BatchStatusBadge } from '@/components/admin/manufacturing/BatchStatusBadge';
import { CreateBatchModal } from '@/components/admin/manufacturing/CreateBatchModal';
import { GenerateCodesModal } from '@/components/admin/manufacturing/GenerateCodesModal';
import { BatchStatusModal } from '@/components/admin/manufacturing/BatchStatusModal';
import { ExportCodesModal } from '@/components/admin/manufacturing/ExportCodesModal';
import { BatchDetailsDrawer } from '@/components/admin/manufacturing/BatchDetailsDrawer';
import { Button } from '@/components/design-system/Button';
import { useI18n } from '@/context/I18nContext';
import {
  Factory,
  Plus,
  Sparkles,
  Download,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Ban,
  Archive,
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const { navigate, dir } = useI18n();

  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter States
  const [skuFilter, setSkuFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [batchSearch, setBatchSearch] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>(''); // YYYY-MM

  // Pagination states
  const [cursorHistory, setCursorHistory] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generateTargetBatch, setGenerateTargetBatch] = useState<ProductBatch | null>(null);
  const [exportTargetBatch, setExportTargetBatch] = useState<ProductBatch | null>(null);
  const [statusTargetBatch, setStatusTargetBatch] = useState<{
    batch: ProductBatch;
    status: BatchStatus;
  } | null>(null);
  const [inspectedBatch, setInspectedBatch] = useState<ProductBatch | null>(null);

  const pageSize = 20;

  const loadBatches = async (cursor: any = null, isPrev = false) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const filters: any = {
        limit: pageSize,
        cursor,
      };

      if (skuFilter !== 'ALL') {
        filters.productSku = skuFilter;
      }
      if (statusFilter !== 'ALL') {
        filters.status = statusFilter as BatchStatus;
      }
      if (batchSearch.trim()) {
        filters.batchNumber = batchSearch.trim();
      }

      const result = await getBatches(filters);

      // In-memory date filtering if specified (YYYY-MM)
      let list = result.batches;
      if (dateFilter) {
        list = list.filter(
          (b) =>
            (b.manufactureDate && b.manufactureDate.startsWith(dateFilter)) ||
            (b.createdAt && b.createdAt.startsWith(dateFilter))
        );
      }

      setBatches(list);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);

      if (isPrev) {
        setPageIndex((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Failed to load manufacturing batches:', err);
      setErrorMsg(err?.message || 'Error querying manufacturing batch records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCursorHistory([]);
    setNextCursor(null);
    setPageIndex(0);
    loadBatches(null);
  }, [skuFilter, statusFilter, batchSearch, dateFilter]);

  // Operational Statistics derived from loaded batches
  const stats = useMemo(() => {
    const totalBatches = batches.length;
    const activeBatches = batches.filter((b) => b.status === 'ACTIVE').length;
    const totalCodes = batches.reduce((sum, b) => sum + (b.totalCodes || 0), 0);
    const activatedCodes = batches.reduce((sum, b) => sum + (b.activatedCodes || 0), 0);
    const unusedCodes = Math.max(0, totalCodes - activatedCodes);

    return {
      totalBatches,
      activeBatches,
      totalCodes,
      activatedCodes,
      unusedCodes,
    };
  }, [batches]);

  const handleNextPage = () => {
    if (!nextCursor || !hasMore) return;
    setCursorHistory((prev) => [...prev, nextCursor]);
    setPageIndex((prev) => prev + 1);
    loadBatches(nextCursor);
  };

  const handlePrevPage = () => {
    if (pageIndex === 0) return;
    const newHistory = [...cursorHistory];
    newHistory.pop();
    const prevCursor = newHistory[newHistory.length - 1] || null;
    setCursorHistory(newHistory);
    loadBatches(prevCursor, true);
  };

  const handleRefresh = () => {
    loadBatches(null);
  };

  return (
    <div className="space-y-6 text-start" dir={dir}>
      {/* Header Section */}
      <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider mb-2 border border-blue-100">
            <Factory className="w-3.5 h-3.5" />
            VIREXON BIOSCIENCES • MANUFACTURING & SERIALIZATION
          </div>
          <h1 className="text-2xl font-black text-[#0B2346] tracking-tight">
            Product Manufacturing
          </h1>
          <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Manage production batches, serialization, packaging codes and manufacturing status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('admin/codes')}
            className="font-mono text-xs flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Search Codes Registry</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="font-mono text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Batch</span>
          </Button>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-[#E2E8F0] p-4">
          <span className="text-[10px] uppercase font-mono text-gray-500 font-bold block mb-1">
            Total Batches
          </span>
          <div className="text-2xl font-mono font-black text-[#0B2346]">
            {stats.totalBatches}
          </div>
          <span className="text-[10px] text-gray-400 font-sans">Registered lots</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4">
          <span className="text-[10px] uppercase font-mono text-emerald-700 font-bold block mb-1">
            Active Batches
          </span>
          <div className="text-2xl font-mono font-black text-emerald-700">
            {stats.activeBatches}
          </div>
          <span className="text-[10px] text-gray-400 font-sans">Accepting activations</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4">
          <span className="text-[10px] uppercase font-mono text-[#0B2346] font-bold block mb-1">
            Total Generated Codes
          </span>
          <div className="text-2xl font-mono font-black text-[#0B2346]">
            {stats.totalCodes.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 font-sans">Cryptographic serials</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4">
          <span className="text-[10px] uppercase font-mono text-emerald-700 font-bold block mb-1">
            Activated Codes
          </span>
          <div className="text-2xl font-mono font-black text-emerald-700">
            {stats.activatedCodes.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 font-sans">Patient verified</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-mono text-blue-700 font-bold block mb-1">
            Unused Codes
          </span>
          <div className="text-2xl font-mono font-black text-blue-700">
            {stats.unusedCodes.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 font-sans">Available for activation</span>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
          {/* Batch Number Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search batch number..."
              value={batchSearch}
              onChange={(e) => setBatchSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F5F7FA] border border-[#E2E8F0] text-xs text-[#0B2346] uppercase font-mono placeholder:normal-case focus:outline-none focus:bg-white"
            />
          </div>

          {/* Product SKU Filter */}
          <div>
            <select
              value={skuFilter}
              onChange={(e) => setSkuFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F5F7FA] border border-[#E2E8F0] text-xs text-[#0B2346] font-mono focus:outline-none focus:bg-white"
            >
              <option value="ALL">All Product Formulations</option>
              {Object.entries(CANONICAL_CATALOG_SKUS).map(([sku, info]) => (
                <option key={sku} value={sku}>
                  {sku} ({info.phasePrefix})
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
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DISABLED">DISABLED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {/* Date Filter (Month) */}
          <div>
            <input
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Filter by manufacturing month"
              className="w-full px-2 py-1.5 bg-[#F5F7FA] border border-[#E2E8F0] text-xs text-[#0B2346] font-mono focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          {(skuFilter !== 'ALL' || statusFilter !== 'ALL' || batchSearch || dateFilter) && (
            <button
              onClick={() => {
                setSkuFilter('ALL');
                setStatusFilter('ALL');
                setBatchSearch('');
                setDateFilter('');
              }}
              className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-[#0B2346] underline cursor-pointer"
            >
              Clear Filters
            </button>
          )}

          <button
            onClick={handleRefresh}
            className="p-1.5 text-gray-600 hover:text-[#0B2346] bg-[#F5F7FA] border border-[#E2E8F0] cursor-pointer"
            title="Refresh Batch List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Batch Table Container */}
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
            LOADING AUTHORITATIVE MANUFACTURING LOTS...
          </div>
        ) : batches.length === 0 ? (
          <div className="p-16 text-center bg-[#F5F7FA]">
            <Factory className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-[#0B2346]">No Manufacturing Batches Found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No production lots match your criteria. Register a new batch to initiate serialization.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="mt-4 font-mono text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Register New Batch
            </Button>
          </div>
        ) : (
          <div>
            {/* Desktop & Tablet Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5F7FA] border-b border-[#E2E8F0] text-gray-600 font-mono text-[11px]">
                    <th className="py-3 px-4 text-start font-bold">BATCH NUMBER</th>
                    <th className="py-3 px-4 text-start font-bold">PRODUCT / SKU</th>
                    <th className="py-3 px-4 text-start font-bold">MFG DATE</th>
                    <th className="py-3 px-4 text-start font-bold">EXP DATE</th>
                    <th className="py-3 px-4 text-start font-bold">STATUS</th>
                    <th className="py-3 px-4 text-end font-bold">TOTAL</th>
                    <th className="py-3 px-4 text-end font-bold">ACTIVATED</th>
                    <th className="py-3 px-4 text-end font-bold">UNUSED</th>
                    <th className="py-3 px-4 text-start font-bold">CREATED</th>
                    <th className="py-3 px-4 text-end font-bold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {batches.map((batch) => {
                    const productName =
                      CANONICAL_CATALOG_SKUS[batch.productSku]?.name || batch.productSku;
                    const unusedCount = Math.max(
                      0,
                      (batch.totalCodes || 0) - (batch.activatedCodes || 0)
                    );

                    return (
                      <tr
                        key={batch.id}
                        className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                        onClick={() => setInspectedBatch(batch)}
                      >
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#0B2346] text-xs block">
                            {batch.batchNumber}
                          </span>
                          <span className="text-[10px] text-gray-400">ID: {batch.id.slice(0, 10)}...</span>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-gray-900 text-xs">
                            {productName}
                          </div>
                          <span className="font-mono text-[10px] text-gray-500">
                            {batch.productSku}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                          {batch.manufactureDate || '—'}
                        </td>

                        <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                          {batch.expiryDate || '—'}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <BatchStatusBadge status={batch.status} />
                        </td>

                        <td className="py-3 px-4 text-end font-bold text-[#0B2346]">
                          {batch.totalCodes || 0}
                        </td>

                        <td className="py-3 px-4 text-end font-semibold text-emerald-700">
                          {batch.activatedCodes || 0}
                        </td>

                        <td className="py-3 px-4 text-end font-semibold text-blue-700">
                          {unusedCount}
                        </td>

                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {batch.createdAt
                            ? new Date(batch.createdAt).toLocaleDateString()
                            : '—'}
                        </td>

                        <td
                          className="py-3 px-4 text-end whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectedBatch(batch)}
                              className="px-2 py-1 bg-white border border-[#E2E8F0] hover:bg-gray-100 text-gray-700 text-[10px] font-mono font-semibold cursor-pointer"
                              title="Inspect batch codes"
                            >
                              Details
                            </button>

                            {batch.status === 'ACTIVE' && (
                              <button
                                onClick={() => setGenerateTargetBatch(batch)}
                                className="px-2 py-1 bg-[#0B2346] text-white hover:bg-[#12366b] text-[10px] font-mono font-semibold cursor-pointer flex items-center gap-1"
                                title="Generate serial codes"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Generate</span>
                              </button>
                            )}

                            <button
                              onClick={() => setExportTargetBatch(batch)}
                              className="px-2 py-1 bg-[#F5F7FA] border border-[#E2E8F0] hover:bg-gray-100 text-gray-700 text-[10px] font-mono cursor-pointer"
                              title="Export CSV / JSON"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 bg-[#F5F7FA] border-t border-[#E2E8F0] flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500">
                Page {pageIndex + 1} • {batches.length} batches loaded
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

      {/* Modal: Create Batch */}
      <CreateBatchModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadBatches(null);
        }}
      />

      {/* Modal: Generate Codes */}
      <GenerateCodesModal
        isOpen={Boolean(generateTargetBatch)}
        onClose={() => setGenerateTargetBatch(null)}
        batch={generateTargetBatch}
        batches={batches}
        onSuccess={() => {
          loadBatches(null);
        }}
        onOpenExport={(b) => setExportTargetBatch(b)}
      />

      {/* Modal: Export Batch Codes */}
      <ExportCodesModal
        isOpen={Boolean(exportTargetBatch)}
        onClose={() => setExportTargetBatch(null)}
        batch={exportTargetBatch}
      />

      {/* Modal: Batch Status Lifecycle Transition */}
      {statusTargetBatch && (
        <BatchStatusModal
          isOpen={Boolean(statusTargetBatch)}
          onClose={() => setStatusTargetBatch(null)}
          batch={statusTargetBatch.batch}
          targetStatus={statusTargetBatch.status}
          onSuccess={() => {
            loadBatches(null);
            if (inspectedBatch && inspectedBatch.id === statusTargetBatch.batch.id) {
              setInspectedBatch((prev) =>
                prev ? { ...prev, status: statusTargetBatch.status } : null
              );
            }
          }}
        />
      )}

      {/* Drawer: Detailed Batch Inspection */}
      {inspectedBatch && (
        <BatchDetailsDrawer
          batch={inspectedBatch}
          onClose={() => setInspectedBatch(null)}
          onOpenGenerate={(b) => {
            setGenerateTargetBatch(b);
          }}
          onOpenExport={(b, codes) => {
            setExportTargetBatch(b);
          }}
          onOpenStatusChange={(b, status) => {
            setStatusTargetBatch({ batch: b, status });
          }}
        />
      )}
    </div>
  );
};
