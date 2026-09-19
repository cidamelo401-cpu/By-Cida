'use client'
import { Modal } from './Modal'
import { Button } from './Button'

type ConfirmDialogProps = {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  onClose?: () => void
}

export function ConfirmDialog({
  open,
  title = 'Tem certeza?',
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger,
  loading,
  onConfirm,
  onCancel,
  onClose,
}: ConfirmDialogProps) {
  const handleCancel = onCancel || onClose || (() => {})
  return (
    <Modal
      open={open}
      onClose={handleCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </Modal>
  )
}
