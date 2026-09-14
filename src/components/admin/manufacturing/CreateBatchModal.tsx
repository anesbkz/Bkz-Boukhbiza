import React, { useState } from 'react';
import { Modal } from '@/components/design-system/Modal';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { CANONICAL_CATALOG_SKUS } from '@/lib/codes/productCodeGenerator';
import { createProductBatch } from '@/services/productCodeService';
import { BatchCreationResult } from '@/types/models';
import { AlertTriangle, CheckCircle2, Factory, Loader2 } from 'lucide-react';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: BatchCreationResult) => void;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [batchNumber, setBatchNumber] = useState('');
  const [productSku, setProductSku] = useState('ZR-PH01-30C');
  const [manufactureDate, setManufactureDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<BatchCreationResult | null>(null);

  const resetForm = () => {
    setBatchNumber('');
    setProductSku('ZR-PH01-30C');
    setNotes('');
    setValidationError(null);
    setServerError(null);
    setSuccessResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);

    const cleanBatchNumber = batchNumber.trim().toUpperCase();

    // 1. Validation
    if (!cleanBatchNumber) {
      setValidationError('Batch number is required (e.g. LOT-ZR26-01).');
      return;
    }
    if (!productSku || !CANONICAL_CATALOG_SKUS[productSku]) {
      setValidationError('A canonical product SKU must be selected from the catalog.');
      return;
    }
    if (!manufactureDate || isNaN(Date.parse(manufactureDate))) {
      setValidationError('Manufacturing date must be a valid calendar date.');
      return;
    }
    if (!expiryDate || isNaN(Date.parse(expiryDate))) {
      setValidationError('Expiry date must be a valid calendar date.');
      return;
    }
    if (new Date(expiryDate) < new Date(manufactureDate)) {
      setValidationError('Expiry date must not be before the manufacturing date.');
      return;
    }

    setLoading(true);

    try {
      const result = await createProductBatch({
        batchNumber: cleanBatchNumber,
        productSku,
        manufactureDate,
        expiryDate,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        setSuccessResult(result);
        onSuccess(result);
      } else {
        setServerError('Server could not create the manufacturing batch.');
      }
    } catch (err: any) {
      console.error('Batch creation error:', err);
      const msg =
        err?.message ||
        'Failed to create manufacturing batch. Verify your administrative permissions.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Production Batch"
      subtitle="Register a new commercial lot for packaging serialization & verification"
      maxWidth="lg"
    >
      {successResult ? (
        <div className="space-y-4 py-2">
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Batch Created Successfully
            </div>
            <p className="text-emerald-800">
              Batch <span className="font-mono font-bold">{successResult.batchNumber}</span> ({successResult.productSku}) has been registered in the authoritative serialization database.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-start">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Batch / Lot Number *"
                placeholder="e.g. LOT-ZR26-01"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
                disabled={loading}
                helperText="Must be unique across all manufacturing runs"
                className="font-mono font-bold uppercase text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#0B2346] mb-1.5">
                Product Formulation SKU *
              </label>
              <select
                value={productSku}
                onChange={(e) => setProductSku(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 bg-white border border-[#E2E8F0] text-[#0B2346] text-xs focus:outline-none focus:ring-1 focus:ring-[#0B2346] focus:border-[#0B2346] rounded-none font-medium"
              >
                {Object.entries(CANONICAL_CATALOG_SKUS).map(([sku, info]) => (
                  <option key={sku} value={sku}>
                    {sku} — {info.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-gray-500 font-sans">
                Canonical catalogue specification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                type="date"
                label="Manufacture Date *"
                value={manufactureDate}
                onChange={(e) => setManufactureDate(e.target.value)}
                disabled={loading}
                className="font-mono text-xs"
                required
              />
            </div>
            <div>
              <Input
                type="date"
                label="Expiry Date *"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={loading}
                className="font-mono text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0B2346] mb-1.5">
              Production & QA Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              placeholder="Facility QA reference, packaging line, certificate references..."
              className="w-full px-3 py-2 bg-white border border-[#E2E8F0] text-[#0B2346] placeholder:text-gray-400 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B2346] focus:border-[#0B2346] rounded-none"
            />
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
            <div className="text-[11px] text-gray-500 flex items-center gap-1">
              <Factory className="w-3.5 h-3.5" />
              <span>Immutable lot registry in Firestore</span>
            </div>

            <div className="flex gap-2">
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
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Registering Lot...
                  </span>
                ) : (
                  'Create Batch'
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
