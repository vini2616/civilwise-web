export const generateHistoryCSV = (historyData) => {
    try {
        // Define CSV Headers - Specific Columns for EVERYTHING
        const headers = [
            // Common Info
            'DPR No', 'Date', 'Report Type', 'Project', 'Location', 'Weather', 'Temp',

            // Manpower Columns
            'MP Trade', 'MP Skilled', 'MP Unskilled', 'MP Total', 'MP Note',

            // Work Started (Morning)
            'Morning Work Desc', 'Morning Work Loc', 'Morning Work Note',

            // Work Progress (Evening)
            'Evening Work Desc', 'Evening Work Grid', 'Evening Work Qty', 'Evening Work Unit', 'Evening Work Status',

            // Materials Columns
            'Mat Type', 'Mat Name', 'Mat Unit', 'Mat Qty', 'Mat Supplier',

            // Equipment Columns
            'Eq Name', 'Eq Qty', 'Eq Hrs', 'Eq Status',

            // Reconciliation Columns
            'Rec Item', 'Rec Unit', 'Rec Theory', 'Rec Actual', 'Rec Diff', 'Rec Note',

            // Remarks & Signatures
            'Hindrances', 'Safety Issues', 'Plan Tomorrow',
            'Prepared By', 'Reviewed By', 'Approved By'
        ];

        let csvRows = [];

        historyData.forEach(item => {
            const data = item.data || {};

            // Safety checks for arrays
            const manpower = Array.isArray(data.manpower) ? data.manpower : [];
            const workStarted = Array.isArray(data.workStarted) ? data.workStarted : [];
            const work = Array.isArray(data.work) ? data.work : [];
            const materials = Array.isArray(data.materials) ? data.materials : [];
            const equipment = Array.isArray(data.equipment) ? data.equipment : [];
            const reconciliation = Array.isArray(data.reconciliation) ? data.reconciliation : [];

            // Get lengths
            const mpLen = manpower.length;
            const wsLen = workStarted.length;
            const wkLen = work.length;
            const mtLen = materials.length;
            const eqLen = equipment.length;
            const rcLen = reconciliation.length;

            // The number of rows for this DPR is the maximum length of its sub-lists
            const maxRows = Math.max(mpLen, wsLen, wkLen, mtLen, eqLen, rcLen, 1);

            for (let i = 0; i < maxRows; i++) {
                const row = [];

                // --- Common Info ---
                row.push(item.dprNo || '');
                row.push(item.date || '');
                row.push(item.type || 'DPR'); // Report Type
                row.push(item.project || '');
                row.push(data.projectInfo?.location || '');
                row.push(data.projectInfo?.weather || '');
                row.push(data.projectInfo?.temp || '');

                // --- Manpower ---
                if (i < mpLen) {
                    const m = manpower[i];
                    row.push(m.trade, m.skilled, m.unskilled, m.total, m.note);
                } else {
                    row.push('', '', '', '', '');
                }

                // --- Work Started (Morning) ---
                if (i < wsLen) {
                    const w = workStarted[i];
                    row.push(w.description, w.location, w.note);
                } else {
                    row.push('', '', '');
                }

                // --- Work Progress (Evening) ---
                if (i < wkLen) {
                    const w = work[i];
                    row.push(w.desc, w.grid, w.qty, w.unit, w.status);
                } else {
                    row.push('', '', '', '', '');
                }

                // --- Materials ---
                if (i < mtLen) {
                    const m = materials[i];
                    row.push(m.type, m.name, m.unit, m.qty, m.supplier);
                } else {
                    row.push('', '', '', '', '');
                }

                // --- Equipment ---
                if (i < eqLen) {
                    const e = equipment[i];
                    row.push(e.name, e.qty, e.hrs, e.status);
                } else {
                    row.push('', '', '', '');
                }

                // --- Reconciliation ---
                if (i < rcLen) {
                    const r = reconciliation[i];
                    row.push(r.item, r.unit, r.theory, r.actual, r.diff, r.note);
                } else {
                    row.push('', '', '', '', '', '');
                }

                // --- Remarks & Signatures ---
                row.push(data.remarks?.hindrances || '');
                row.push(data.remarks?.safety || '');
                row.push(data.planTomorrow || '');
                row.push(data.signatures?.prepared || '');
                row.push(data.signatures?.reviewed || '');
                row.push(data.signatures?.approved || '');

                csvRows.push(row);
            }
        });

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.map(cell => {
                const cellStr = String(cell || '').replace(/"/g, '""');
                return `"${cellStr}"`;
            }).join(','))
        ].join('\n');

        downloadCSV(csvContent, 'DPR_History_Detailed.csv');
        return true;
    } catch (err) {
        console.error("CSV Export Error:", err);
        alert("Error exporting to CSV: " + err.message);
        return false;
    }
};

export const generateAccountCSV = (transactions) => {
    try {
        const headers = ['Date', 'Type', 'Category', 'Party Name', 'Description / Note', 'Payment Mode', 'Bill No', 'Base Amount', 'GST Rate', 'GST Amount', 'Total Amount', 'Bill Image', 'Payment Proof', 'Status'];

        const rows = transactions.map(t => [
            new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            ['income', 'credit'].includes(t.type) ? 'Credit' : 'Debit',
            t.category || '-',
            t.partyName || '-',
            t.note || t.description || '-',
            t.mode || '-',
            t.billNo || '-',
            t.baseAmount || 0,
            (t.gstRate || 0) + '%',
            t.gstAmount || Math.round((Number(t.baseAmount || 0) * (Number(t.gstRate || 0)) / 100)),
            t.amount,
            t.billImage ? 'Yes' : 'No',
            t.paymentProof ? 'Yes' : 'No',
            'Completed'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'Account_Statement.csv');
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return true;
    } catch (err) {
        console.error("Account Export Error:", err);
        alert("Error exporting Account CSV");
        return false;
    }
};

// --- Manpower Exports ---

export const generateManpowerAttendanceCSV = (manpowerList, manpowerAttendance, date) => {
    try {
        const headers = ['Name', 'Trade', 'Date', 'Status', 'Overtime (Hrs)'];

        // Find the attendance document for this date
        const dailyDoc = manpowerAttendance.find(d => d.date === date);
        const dailyRecords = dailyDoc ? dailyDoc.records : [];

        const rows = manpowerList.map(item => {
            const id = item.id || item._id;
            const record = dailyRecords.find(r => (r.manpowerId === id || (r.manpowerId && r.manpowerId._id === id)));
            return [
                item.name,
                item.trade,
                date,
                record ? record.status : '-',
                record ? record.overtime : '0'
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        downloadCSV(csvContent, `Attendance_${date}.csv`);
        return true;
    } catch (err) {
        console.error("Attendance Export Error:", err);
        alert("Error exporting Attendance CSV");
        return false;
    }
};

export const generateManpowerPaymentsCSV = (manpowerList, paymentData) => {
    try {
        const headers = ['Date', 'Name', 'Trade', 'Amount', 'Note'];

        const rows = paymentData.sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => {
            const person = manpowerList.find(m => (m.id || m._id) == p.manpowerId);
            return [
                p.date,
                person ? person.name : 'Unknown',
                person ? person.trade : '-',
                p.amount,
                p.note
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        downloadCSV(csvContent, 'Manpower_Payments.csv');
        return true;
    } catch (err) {
        console.error("Payment Export Error:", err);
        alert("Error exporting Payment CSV");
        return false;
    }
};

export const generateManpowerSummaryCSV = (manpowerList, manpowerAttendance, paymentData) => {
    try {
        const headers = ['Name', 'Trade', 'Rate', 'Days Worked', 'Total OT (Hrs)', 'Total Earnings', 'Total Paid', 'Remaining Balance'];

        // Flatten attendance
        let allAttendanceRecords = [];
        manpowerAttendance.forEach(doc => {
            if (Array.isArray(doc.records)) {
                allAttendanceRecords.push(...doc.records);
            }
        });

        const rows = manpowerList.map(item => {
            const id = item.id || item._id;
            const rate = Number(item.rate) || 0;

            // Filter using robust ID check
            const myAttendance = allAttendanceRecords.filter(r => (r.manpowerId === id || (r.manpowerId && r.manpowerId._id === id)));

            const daysWorked = myAttendance.reduce((sum, a) => {
                if (a.status === 'P') return sum + 1;
                if (a.status === 'HD') return sum + 0.5;
                return sum;
            }, 0);

            const totalOT = myAttendance.reduce((sum, a) => sum + (Number(a.overtime) || 0), 0);
            const hourlyRate = rate / 8;
            const otAmount = totalOT * hourlyRate;
            const totalEarnings = (daysWorked * rate) + otAmount;

            const myPayments = paymentData.filter(p => p.manpowerId == id);
            const totalPaid = myPayments.reduce((sum, p) => sum + Number(p.amount), 0);
            const balance = totalEarnings - totalPaid;

            return [
                item.name,
                item.trade,
                rate,
                daysWorked,
                totalOT,
                totalEarnings.toFixed(2),
                totalPaid,
                balance.toFixed(2)
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        downloadCSV(csvContent, 'Manpower_Summary.csv');
        return true;
    } catch (err) {
        console.error("Summary Export Error:", err);
        alert("Error exporting Summary CSV");
        return false;
    }
};

export const generateMaterialsCSV = (transactions) => {
    try {
        const headers = ['Date', 'Type', 'Material', 'Quantity', 'Unit', 'Supplier / Used For', 'Challan'];

        const rows = transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => [
            t.date,
            t.type.toUpperCase(),
            t.materialName,
            t.quantity,
            t.unit,
            t.type === 'inward' ? (t.supplier || '-') : (t.usedFor || '-'),
            t.challanImage ? 'Yes' : 'No'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        downloadCSV(csvContent, 'Materials_History.csv');
        return true;
    } catch (err) {
        console.error("Materials Export Error:", err);
        alert("Error exporting Materials CSV");
        return false;
    }
};

// Helper for downloading
const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
