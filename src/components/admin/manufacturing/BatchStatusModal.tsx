import React, { useState } from 'react';
import { Modal } from '@/components/design-system/Modal';
import { Button } from '@/components/design-system/Button';
import { ProductBatch, BatchStatus, BatchStatusUpdateResult } from '@/types/models';
import { updateBatchStatus } from '@/services/productCodeService';
import { AlertTriangle, Archive, Ban, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

interface BatchStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: ProductBatch | null;
  targetStatus: BatchStatus;
  onSuccess: (result: BatchStatusUpdateResult) => void;
}

export const BatchStatusModal: React.FC<BatchStatusModalProps> = ({
  isOpen,
  onClose,
  batch,
  targetStatus,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!batch) return null;

  const handleUpdate = async () => {
    setLoading(true);
    setServerError(null);

    try {
      const result = await updateBatchStatus({
        batchId: batch.id,
        status: targetStatus,
      });

      if (result.success) {
        onSuccess(result);
        onClose();
      } else {
        setServerError('Server could not update the batch status.');
      }
    } catch (err: any) {
      console.error('Failed to update batch status:', err);
      const msg = err?.message || 'Server error updating batch status.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getDialogDetails = () => {
    switch (targetStatus) {
      case 'DISABLED':
        return {
          title: `Disable Batch ${batch.batchNumber}?`,
          icon: <Ban className="w-5 h-5 text-amber-600" />,
          bgColor: 'bg-amber-50 border-amber-200 text-amber-900',
          warning:
            'All unused codes in this batch will no longer be valid for activation. Patients scanning these containers will be notified that the batch is deactivated.',
          confirmText: 'Confirm Deactivation',
          buttonVariant: 'phase2' as const,
        };
      case 'ARCHIVED':
        return {
          title: `Archive Batch ${batch.batchNumber}?`,
          icon: <Archive className="w-5 h-5 text-gray-600" />,
          bgColor: 'bg-gray-50 border-gray-200 text-gray-900',
          warning:
            'Archived batches are permanently locked from code generation. Records remain fully queryable for regulatory compliance and audit history.',
          confirmText: 'Confirm Archive',
          buttonVariant: 'outline' as const,
        };
      case 'ACTIVE':
        return {
          title: `Reactivate Batch ${batch.batchNumber}?`,
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          warning:
            'Reactivating this batch will permit remaining unused codes to be verified and activated by patients and customers.',
          confirmText: 'Reactivate Batch',
          buttonVariant: 'primary' as const,
        };
      default:
        return {
          title: `Change Batch Status to ${targetStatus}`,
          icon: <AlertTriangle className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-50 border-blue-200 text-blue-900',
          warning: 'Administrative status transition.',
          confirmText: 'Proceed',
          buttonVariant: 'primary' as const,
        };
    }
  };

  const details = getDialogDetails();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={details.title}
      subtitle="Authoritative lifecycle state transition"
      maxWidth="md"
    >
      <div className="space-y-4 py-2 text-start">
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#D62828] flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className={`p-4 border text-xs ${details.bgColor}`}>
          <div className="flex items-center gap-2 font-bold mb-2">
            {details.icon}
            <span>Status Transition: {batch.status} → {targetStatus}</span>
          </div>
          <p className="leading-relaxed">
            {details.warning}
          </p>
        </div>

        <div className="bg-[#F5F7FA] p-3 border border-[#E2E8F0] font-mono text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Batch Lot:</span>
            <span className="font-bold text-[#0B2346]">{batch.batchNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Product SKU:</span>
            <span className="text-gray-700">{batch.productSku}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Codes:</span>
            <span className="text-gray-700">{batch.totalCodes || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Activated Codes:</span>
            <span className="text-gray-700">{batch.activatedCodes || 0}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={details.buttonVariant}
            onClick={handleUpdate}
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Updating Status...
              </span>
            ) : (
              details.confirmText
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
