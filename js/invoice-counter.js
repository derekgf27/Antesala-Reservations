/**
 * Atomic invoice number allocation via Firestore transaction.
 * Fallback: local max+1 when offline / Firebase unavailable.
 */
(function (global) {
    'use strict';

    function localNextInvoiceNumber(reservations) {
        const year = new Date().getFullYear();
        const prefix = `${year}-`;
        let maxSeq = 0;
        (reservations || []).forEach((r) => {
            const n = r && r.invoiceNumber;
            if (typeof n !== 'string' || !n.startsWith(prefix)) return;
            const seq = parseInt(n.slice(prefix.length), 10);
            if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq;
        });
        return `${year}-${String(maxSeq + 1).padStart(3, '0')}`;
    }

    /**
     * @param {object[]} reservations local list (used for offline fallback)
     * @returns {Promise<string>} YYYY-NNN
     */
    async function allocateInvoiceNumber(reservations) {
        const year = new Date().getFullYear();
        if (!global.FIREBASE_LOADED || !global.firestore) {
            return localNextInvoiceNumber(reservations);
        }

        try {
            const ref = global.firestore.collection('counters').doc(`invoices-${year}`);
            const nextNumber = await global.firestore.runTransaction(async (tx) => {
                const snap = await tx.get(ref);
                let seq = 1;
                if (snap.exists) {
                    const data = snap.data() || {};
                    seq = (parseInt(data.seq, 10) || 0) + 1;
                }
                // Seed from local max if counter doc is behind (first deploy / migration)
                const localFallback = localNextInvoiceNumber(reservations);
                const localSeq = parseInt(localFallback.slice(`${year}-`.length), 10) || 1;
                if (localSeq > seq) seq = localSeq;

                tx.set(ref, { seq, year, updatedAt: new Date().toISOString() }, { merge: true });
                return `${year}-${String(seq).padStart(3, '0')}`;
            });
            return nextNumber;
        } catch (err) {
            console.warn('Invoice counter transaction failed; using local fallback', err);
            return localNextInvoiceNumber(reservations);
        }
    }

    global.AntesalaInvoice = {
        allocateInvoiceNumber,
        localNextInvoiceNumber
    };
})(window);
