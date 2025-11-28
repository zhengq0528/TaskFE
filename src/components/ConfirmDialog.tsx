import React from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title = 'Confirm',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close" onClick={onCancel} type="button">
                        ×
                    </button>
                </div>
                <p style={{ marginBottom: 16 }}>{message}</p>
                <div className="btn-row">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
