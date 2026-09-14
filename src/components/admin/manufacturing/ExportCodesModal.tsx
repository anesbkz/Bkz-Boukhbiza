import React, { useState } from 'react';
import { Modal } from '@/components/design-system/Modal';
import { Button } from '@/components/design-system/Button';
import { ProductBatch, ProductCode } from '@/types/models';
import {
  generateCodesCsv,
  generateCodesJson,
  triggerFileDownload,
  ExportValidationError,
} from '@/lib/export/codeExport';
import { getProductCodes } from '@/services/productCodeService';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Layers,
} from 'lucide-react';

interface ExportCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: ProductBatch | null;
  currentPageCodes?: ProductCode[];
}

export const ExportCodesModal: React.FC<ExportCodesModalProps> = ({
  isOpen,
  onClose,
  batch,
  currentPageCodes = [],
}) => {
  const [exportScope, setExportScope] = useState<'page' | 'batch'>(
    batch && (batch.totalCodes || 0) > currentPageCodes.length ? 'batch' : 'page'
  );
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ filename: string; count: number } | null>(null);

  if (!batch) return null;

  const handleClose = () => {
    setLoading(false);
    setProgressMsg('');
    setErrorMsg(null);
    setSuccessInfo(null);
    onClose();
  };

  /**
   * Safely collects all codes for a batch using sequential paginated queries
   * to avoid unbounded memory spikes or query timeouts.
   */
  const fetchAllBatchCodes = async (targetBatch: ProductBatch): Promise<ProductCode[]> => {
    const allCodes: ProductCode[] = [];
    let cursor = null;
    let hasMore = true;
    let pageNum = 1;
    const maxSafetyLimit = 5000; // Safeguard against runaway loops

    while (hasMore && allCodes.length < maxSafetyLimit) {
      setProgressMsg(`Retrieving batch codes chunk ${pageNum} (${allCodes.length} codes retrieved)...`);
      const res = await getProductCodes({
        batchId: targetBatch.id,
        limit: 100,
        cursor,
      });

      if (!res.codes || res.codes.length === 0) {
        break;
      }

      allCodes.push(...res.codes);
      cursor = res.nextCursor;
      hasMore = res.hasMore && Boolean(cursor);
      pageNum++;
    }

    return allCodes;
  };

  const handleExport = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessInfo(null);

    try {
      let codesToExport: ProductCode[] = [];

      if (exportScope === 'page') {
        if (!currentPageCodes || currentPageCodes.length === 0) {
          throw new Error('No codes currently available on the active view to export.');
        }
        codesToExport = [...currentPageCodes];
      } else {
        // Safe paginated fetch
        setProgressMsg('Preparing batch serialization manifest...');
        codesToExport = await fetchAllBatchCodes(batch);

        if (codesToExport.length === 0) {
          throw new Error(`Batch "${batch.batchNumber}" has no generated product codes to export.`);
        }
      }

      setProgressMsg('Encoding export file with verification URLs and RFC 4180 compliance...');

      if (exportFormat === 'csv') {
        const csvResult = generateCodesCsv(batch, codesToExport, {
          includeManifestHeader: true,
        });
        triggerFileDownload(csvResult.blob, csvResult.filename);
        setSuccessInfo({
          filename: csvResult.filename,
          count: csvResult.rowCount,
        });
      } else {
        const jsonResult = generateCodesJson(batch, codesToExport);
        triggerFileDownload(jsonResult.blob, jsonResult.filename);
        setSuccessInfo({
          filename: jsonResult.filename,
          count: jsonResult.data.codes.length,
        });
      }
    } catch (err: any) {
      console.error('Export error:', err);
      if (err instanceof ExportValidationError) {
        setErrorMsg(`Data Validation Failure: ${err.message}. ${err.validationErrors.join(', ')}`);
      } else {
        setErrorMsg(err?.message || 'Failed to export serialization data. Please try again.');
      }
    } finally {
      setLoading(false);
      setProgressMsg('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Export Packaging & Serialization Codes"
      subtitle="Commercial printing artifacts with verification URLs & security metadata"
      maxWidth="md"
    >
      <div className="space-y-4 py-2 text-start">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#D62828] flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successInfo && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Export Download Triggered</span>
            </div>
            <p className="leading-relaxed">
              Exported <span className="font-bold">{successInfo.count} codes</span> into{' '}
              <span className="font-mono font-semibold">{successInfo.filename}</span>.
            </p>
          </div>
        )}

        {/* Batch Summary */}
        <div className="bg-[#F5F7FA] p-3 border border-[#E2E8F0] text-xs font-mono">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500">Batch Lot:</span>
            <span className="font-bold text-[#0B2346]">{batch.batchNumber}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500">Product SKU:</span>
            <span className="text-gray-700">{batch.productSku}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Registered Batch Codes:</span>
            <span className="font-bold text-[#0B2346]">{batch.totalCodes || 0} codes</span>
          </div>
        </div>

        {/* Export Scope Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#0B2346] mb-1.5">
            Export Scope
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`p-3 border flex flex-col gap-1 cursor-pointer transition-colors ${
                exportScope === 'batch'
                  ? 'bg-blue-50/50 border-[#0B2346] text-[#0B2346]'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="exportScope"
                  checked={exportScope === 'batch'}
                  onChange={() => setExportScope('batch')}
                  disabled={loading}
                />
                <span className="font-bold text-xs">Complete Batch</span>
              </div>
              <span className="text-[11px] text-gray-500">
                Paginates and exports all {batch.totalCodes || 0} codes in batch
              </span>
            </label>

            <label
              className={`p-3 border flex flex-col gap-1 cursor-pointer transition-colors ${
                exportScope === 'page'
                  ? 'bg-blue-50/50 border-[#0B2346] text-[#0B2346]'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="exportScope"
                  checked={exportScope === 'page'}
                  onChange={() => setExportScope('page')}
                  disabled={loading}
                />
                <span className="font-bold text-xs">Current View</span>
              </div>
              <span className="text-[11px] text-gray-500">
                Exports current page ({currentPageCodes.length} codes)
              </span>
            </label>
          </div>
        </div>

        {/* Export Format Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#0B2346] mb-1.5">
            Export Format Specification
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`p-3 border flex flex-col gap-1 cursor-pointer transition-colors ${
                exportFormat === 'csv'
                  ? 'bg-blue-50/50 border-[#0B2346] text-[#0B2346]'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="exportFormat"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  disabled={loading}
                />
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs">Packaging CSV</span>
              </div>
              <span className="text-[11px] text-gray-500">
                RFC 4180 + UTF-8 BOM for RIP printers & packaging machinery
              </span>
            </label>

            <label
              className={`p-3 border flex flex-col gap-1 cursor-pointer transition-colors ${
                exportFormat === 'json'
                  ? 'bg-blue-50/50 border-[#0B2346] text-[#0B2346]'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="exportFormat"
                  checked={exportFormat === 'json'}
                  onChange={() => setExportFormat('json')}
                  disabled={loading}
                />
                <FileCode className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-xs">Operational JSON</span>
              </div>
              <span className="text-[11px] text-gray-500">
                Machine-parseable manifest for enterprise serialization
              </span>
            </label>
          </div>
        </div>

        {/* Loading / Progress State */}
        {loading && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-[#0B2346] flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0B2346] shrink-0" />
            <span className="font-mono">{progressMsg || 'Processing export...'}</span>
          </div>
        )}

        <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleExport}
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Exporting...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                Download {exportFormat.toUpperCase()}
              </span>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
