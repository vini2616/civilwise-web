import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only ' : 'Only';
    return str;
};

export const generateTransactionBill = (transaction, companyInfo, copyType = 'Original') => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 10;
        const width = pageWidth - 2 * margin;

        // --- DRAW OUTER BORDER ---
        doc.rect(margin, margin, width, pageHeight - 2 * margin);

        // --- COPY TYPE LABEL ---
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`(${copyType} Copy)`, margin + width - 5, margin - 2, { align: "right" });

        // --- HEADER SECTION ---
        // Vertical Divider in Header (Split 60% Company / 40% Invoice Info)
        const headerH = 40;
        const splitX = margin + (width * 0.6);

        doc.rect(margin, margin, width, headerH); // Header Box
        doc.line(splitX, margin, splitX, margin + headerH); // Vertical Split

        // COMPANY DETAILS (Top Left)
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(companyInfo?.name || "CivilWise Construction", margin + 5, margin + 8);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const addressLines = doc.splitTextToSize(companyInfo?.address || "", (width * 0.6) - 10);
        doc.text(addressLines, margin + 5, margin + 14);

        let contactY = margin + 14 + (addressLines.length * 4);
        if (companyInfo?.mobile) { doc.text(`Mobile: ${companyInfo.mobile}`, margin + 5, contactY); contactY += 4; }
        if (companyInfo?.email) { doc.text(`Email: ${companyInfo.email}`, margin + 5, contactY); contactY += 4; }
        if (companyInfo?.gst) { doc.setFont("helvetica", "bold"); doc.text(`GSTIN: ${companyInfo.gst}`, margin + 5, contactY); }

        // INVOICE DETAILS (Top Right)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("INVOICE NO:", splitX + 2, margin + 8);
        doc.setFont("helvetica", "normal");
        doc.text(transaction.invoiceNo || transaction.id?.toString() || "-", splitX + 35, margin + 8);

        doc.line(splitX, margin + 10, margin + width, margin + 10); // H-Line 1

        doc.setFont("helvetica", "bold");
        doc.text("DATE:", splitX + 2, margin + 16);
        doc.setFont("helvetica", "normal");
        const dateObj = new Date(transaction.date);
        const formattedDate = !isNaN(dateObj) ? dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : transaction.date;
        doc.text(formattedDate, splitX + 35, margin + 16);

        doc.line(splitX, margin + 20, margin + width, margin + 20); // H-Line 2

        doc.setFont("helvetica", "bold");
        doc.text("DESTINATION:", splitX + 2, margin + 26);
        doc.setFont("helvetica", "normal");
        doc.text(transaction.destination || "-", splitX + 35, margin + 26);

        // --- TITLE ---
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const title = transaction.type === 'invoice' ? 'TAX INVOICE' : 'PAYMENT VOUCHER';
        const titleWidth = doc.getTextWidth(title);
        // Centered below header
        doc.text(title, margin + (width / 2) - (titleWidth / 2), margin + headerH + 6);

        // --- BUYER DETAILS ---
        const buyerY = margin + headerH + 10;
        const buyerH = 25;
        doc.rect(margin, buyerY, width, buyerH);

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Bill To (Buyer):", margin + 2, buyerY + 5);

        doc.setFontSize(10);
        doc.text(transaction.partyName || "Unknown Party", margin + 5, buyerY + 10);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        if (transaction.partyAddress) doc.text(transaction.partyAddress, margin + 5, buyerY + 15);

        let partyMeta = "";
        if (transaction.partyGst) partyMeta += `GSTIN: ${transaction.partyGst}  `;
        if (transaction.partyMobile) partyMeta += `Mobile: ${transaction.partyMobile}`;
        doc.text(partyMeta, margin + 5, buyerY + 22);

        // --- ITEMS TABLE ---
        const tableY = buyerY + buyerH; // No gap

        let head = [['SI No.', 'Description of Goods', 'HSN/SAC', 'Qty', 'Unit', 'Rate', 'Amount']];
        let body = [];

        if (transaction.items && Array.isArray(transaction.items)) {
            body = transaction.items.map((item, index) => [
                index + 1,
                item.description,
                item.hsn || '-',
                item.quantity,
                item.unit || '-',
                Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
                Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })
            ]);
        }

        // Add Freight if exists
        if (Number(transaction.freight) > 0) {
            body.push(['', 'Freight Outward', '-', '-', '-', '-', Number(transaction.freight).toLocaleString('en-IN', { minimumFractionDigits: 2 })]);
        }

        // Add GST
        if (transaction.gstAmount > 0) {
            body.push(['', `GST (${transaction.gstRate || 0}%)`, '-', '-', '-', '-', Number(transaction.gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })]);
        }

        // Add Grand Total
        const totalAmount = Number(transaction.amount || 0);
        body.push(['', 'Grand Total', '', '', '', '', { content: totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), styles: { fontStyle: 'bold' } }]);

        autoTable(doc, {
            startY: tableY,
            head: head,
            body: body,
            theme: 'grid', // Grid theme matches reference
            styles: { fontSize: 9, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0] },
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' }, // SI No
                1: { cellWidth: 'auto' }, // Desc
                2: { cellWidth: 20, halign: 'center' }, // HSN
                3: { cellWidth: 15, halign: 'center' }, // Qty
                4: { cellWidth: 15, halign: 'center' }, // Unit
                5: { cellWidth: 25, halign: 'right' }, // Rate
                6: { cellWidth: 30, halign: 'right' } // Amount
            },
            margin: { left: margin, right: margin },
            tableWidth: width,
        });

        // --- FOOTER SECTION ---
        const finalY = doc.lastAutoTable.finalY;
        const remainingH = (pageHeight - margin) - finalY;

        // Amount in Words
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Amount Chargeable (in words):", margin + 2, finalY + 6);
        doc.setFont("helvetica", "normal");
        doc.text(`INR ${numberToWords(Math.round(totalAmount))} Only`, margin + 2, finalY + 11);

        const footerBoxY = finalY + 15;
        const footerBoxH = 50; // Fixed height for footer area

        // Check if we have space, else add page
        if (footerBoxY + footerBoxH > pageHeight - margin) {
            doc.addPage();
            // Reset Y for new page
        }

        // Draw Footer Box Grid
        // Split: Left (Terms) 50%, Right (Bank) 50%
        doc.rect(margin, footerBoxY, width, footerBoxH);
        doc.line(margin + (width / 2), footerBoxY, margin + (width / 2), footerBoxY + footerBoxH); // Vertical Split

        // LEFT: Terms & Conditions
        const leftX = margin + 2;
        let leftY = footerBoxY + 5;
        doc.setFont("helvetica", "bold");
        doc.text("Declaration / Terms:", leftX, leftY);
        leftY += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        if (transaction.note) {
            const splitNote = doc.splitTextToSize(transaction.note, (width / 2) - 5);
            doc.text(splitNote, leftX, leftY);
        } else {
            doc.text("Subject to jurisdiction.", leftX, leftY);
        }

        // RIGHT: Bank Details & Signatory
        const rightX = margin + (width / 2) + 2;
        let rightY = footerBoxY + 5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Company's Bank Details:", rightX, rightY);
        rightY += 5;

        if (companyInfo?.bankName) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text(`Bank Name: ${companyInfo.bankName}`, rightX, rightY); rightY += 4;
            doc.text(`A/c No.: ${companyInfo.accountNumber || '-'}`, rightX, rightY); rightY += 4;
            doc.text(`Branch & IFS Code: ${companyInfo.branch || '-'} & ${companyInfo.ifscCode || '-'}`, rightX, rightY); rightY += 4;
            doc.text(`A/c Holder: ${companyInfo.accountHolderName || companyInfo.name}`, rightX, rightY);
        } else {
            doc.text("Bank Details Not Available", rightX, rightY);
        }

        // Signatory
        const sigY = footerBoxY + footerBoxH - 5;
        doc.setFont("helvetica", "bold");
        doc.text("Authorized Signatory", margin + width - 5, sigY, { align: "right" });

        // Save
        const fileName = `Bill_${transaction.invoiceNo || 'Draft'}.pdf`;
        doc.save(fileName);

    } catch (error) {
        console.error("PDF Generation Error:", error);
    }
};

