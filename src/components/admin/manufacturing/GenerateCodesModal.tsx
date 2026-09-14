import React, { useState } from 'react';
import { Modal } from '@/components/design-system/Modal';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { ProductBatch, GenerationResult } from '@/types/models';
import { generateProductCodes } from '@/services/productCodeService';
import { CANONICAL_CATALOG_SKUS } from '@/lib/codes/productCodeGenerator';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';

interface GenerateCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: ProductBatch | null;
  batches?: ProductBatch[];
  onSuccess: (result: GenerationResult) => void;
  onOpenExport?: (batch: ProductBatch, initialCodes?: string[]) => void;
}

export const GenerateCodesModal: React.FC<GenerateCodesModalProps> = ({
  isOpen,
  onClose,
  batch,
  batches = [],
  onSuccess,
  onOpenExport,
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batch?.id || '');
  const [quantity, setQuantity] = useState<number | string>(50);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Sync selectedBatchId when batch changes
  React.useEffect(() => {
    if (batch?.id) {
      setSelectedBatchId(batch.id);
    } else if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(batches[0].id);
    }
  }, [batch, batches, selectedBatchId]);

  const activeBatch = batch || batches.find((b) => b.id === selectedBatchId) || null;

  const handleClose = () => {
    setQuantity(50);
    setValidationError(null);
    setServerError(null);
    setResult(null);
    setCopiedAll(false);
    onClose();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);

    if (!activeBatch) {
      setValidationError('Please select an active manufacturing batch.');
      return;
    }

    if (activeBatch.status !== 'ACTIVE') {
      setValidationError(`Batch is currently ${activeBatch.status}. Only ACTIVE batches can accept code generation.`);
      return;
    }

    const qtyNum = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;

    if (isNaN(qtyNum) || qtyNum < 1) {
      setValidationError('Quantity must be at least 1.');
      return;
    }

    if (qtyNum > 500) {
      setValidationError('Maximum quantity allowed per batch is 500 codes (server enforcement).');
      return;
    }

    setLoading(true);

    try {
      const res = await generateProductCodes({
        batchId: activeBatch.id,
        productSku: activeBatch.productSku,
        quantity: qtyNum,
      });

      if (res && res.success) {
        setResult(res);
        onSuccess(res);
      } else {
        setServerError('Code generation did not succeed.');
      }
    } catch (err: any) {
      console.error('Code generation error:', err);
      const msg = err?.message || 'Failed to generate codes. Verify administrative permissions.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = async () => {
    if (!result || !result.codes) return;
    try {
      await navigator.clipboard.writeText(result.codes.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate Product Codes"
      subtitle="Authoritative cryptographic serial generation via Cloud Function"
      maxWidth="lg"
    >
      {result ? (
        <div className="space-y-4 py-2 text-start">
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs">
            <div className="flex items-center gap-2 font-bold mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{result.quantity} Cryptographic Serials Generated</span>
            </div>
            <p className="text-emerald-800 leading-relaxed mb-3">
              Codes generated for batch <span className="font-mono font-bold">{result.batchNumber}</span> ({result.productSku}). Stored securely in Firestore with status <span className="font-mono font-bold">UNUSED</span>.
            </p>

            <div className="grid grid-cols-2 gap-3 bg-white/80 p-3 border border-emerald-200/80 font-mono text-[11px]">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">First Code:</span>
                <span className="font-bold text-[#0B2346]">{result.codes[0] || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">Last Code:</span>
                <span className="font-bold text-[#0B2346]">
                  {result.codes[result.codes.length - 1] || '—'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">Batch ID:</span>
                <span className="text-gray-700 truncate block">{result.batchId}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">Timestamp:</span>
                <span className="text-gray-700">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyAll}
                className="font-mono text-xs flex items-center gap-1.5"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Code copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All {result.quantity} Codes</span>
                  </>
                )}
              </Button>

              {onOpenExport && activeBatch && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleClose();
                    onOpenExport(activeBatch, result.codes);
                  }}
                  className="font-mono text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Batch</span>
                </Button>
              )}
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-4 text-start">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#D62828] flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {serverError && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Target Batch Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0B2346] mb-1.5">
              Target Manufacturing Batch *
            </label>
            {batch ? (
              <div className="p-3 bg-[#F5F7FA] border border-[#E2E8F0] text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#0B2346] text-sm">
                    {batch.batchNumber}
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {batch.status}
                  </span>
                </div>
                <div className="text-gray-600 text-[11px] mt-1">
                  SKU: <span className="font-mono font-semibold">{batch.productSku}</span> (
                  {CANONICAL_CATALOG_SKUS[batch.productSku]?.name || batch.productSku})
                </div>
              </div>
            ) : (
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 bg-white border border-[#E2E8F0] text-[#0B2346] text-xs focus:outline-none focus:ring-1 focus:ring-[#0B2346] focus:border-[#0B2346] rounded-none font-medium"
              >
                {batches.length === 0 && <option value="">No batches available</option>}
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} — {b.productSku} ({b.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quantity Input */}
          <div>
            <Input
              type="number"
              min={1}
              max={500}
              label="Quantity to Generate (1 – 500) *"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading}
              helperText="Authoritative server generation produces collision-free Crockford Base32 serials."
              className="font-mono font-bold text-sm"
              required
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-gray-500">Presets:</span>
            {[25, 50, 100, 250, 500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQuantity(preset)}
                disabled={loading}
                className={`px-2.5 py-1 text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                  quantity === preset
                    ? 'bg-[#0B2346] text-white border-[#0B2346]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 text-[11px] text-[#0B2346] leading-relaxed">
            <strong>Authoritative Execution:</strong> Codes are generated using cryptographically secure Crockford Base32 serials via the <code className="font-mono text-[10px] bg-blue-100/70 px-1 py-0.5">generateProductCodes</code> Cloud Function. Browser-side generation is prohibited.
          </div>

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
              type="submit"
              variant="primary"
              disabled={loading || !activeBatch}
              size="sm"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating Serials...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate {quantity} Codes
                </span>
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
