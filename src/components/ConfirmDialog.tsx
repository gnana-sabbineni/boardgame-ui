import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  isSubmitting = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="mb-5 text-sm text-text/70">{message}</p>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" className="w-auto px-4" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="rounded-lg border border-danger bg-transparent px-4 py-2.5 text-sm font-semibold text-danger transition-colors duration-150 hover:bg-danger hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Removing…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}