/**
 * Append-only audit trail helpers (stored on each reservation).
 */
(function (global) {
    'use strict';

    const MAX_ENTRIES = 50;

    function appendAudit(reservation, action, details) {
        if (!reservation || typeof reservation !== 'object') return reservation;
        if (!Array.isArray(reservation.auditTrail)) reservation.auditTrail = [];
        const by = (global.AntesalaUtils && global.AntesalaUtils.staffEmail)
            ? global.AntesalaUtils.staffEmail()
            : 'unknown';
        reservation.auditTrail.push({
            at: new Date().toISOString(),
            by,
            action: String(action || 'update'),
            details: details ? String(details) : ''
        });
        if (reservation.auditTrail.length > MAX_ENTRIES) {
            reservation.auditTrail = reservation.auditTrail.slice(-MAX_ENTRIES);
        }
        return reservation;
    }

    function formatAuditTime(iso) {
        if (!iso) return '';
        try {
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return String(iso);
            return d.toLocaleString('es-PR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (_) {
            return String(iso);
        }
    }

    const ACTION_LABELS = {
        created: 'Creada',
        updated: 'Actualizada',
        deleted: 'Eliminada (papelera)',
        restored: 'Restaurada',
        payment: 'Pago registrado',
        payment_deleted: 'Pago eliminado',
        deposit: 'Depósito actualizado',
        invoice: 'Factura numerada'
    };

    function actionLabel(action) {
        return ACTION_LABELS[action] || action || 'Cambio';
    }

    global.AntesalaAudit = {
        appendAudit,
        formatAuditTime,
        actionLabel,
        MAX_ENTRIES
    };
})(window);
