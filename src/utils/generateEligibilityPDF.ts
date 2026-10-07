/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { DonorEligibilityScreeningResult } from '../types';

/**
 * Builds a clean, professional A4 PDF for AI-assisted donor eligibility screening.
 */
export function createEligibilityPDF(
  result: DonorEligibilityScreeningResult,
  candidateName: string,
  bloodGroup: string
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  // --- Header Accent Bar ---
  doc.setFillColor(13, 148, 136); // #0d9488 (Teal-600)
  doc.rect(margin, y, contentWidth, 3, 'F');
  y += 9;

  // --- Brand & Title ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // #0f172a (Slate-900)
  doc.text('DOFI', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('Blood Donation Coordination Platform', margin + 22, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(13, 148, 136);
  doc.text('AI-ASSISTED DONOR ELIGIBILITY SCREENING REPORT', margin, y);

  y += 7;

  // --- Meta Information Grid (Card Box) ---
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  const metaColWidth = contentWidth / 4;
  const metaY = y + 6;

  // Candidate
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CANDIDATE', margin + 4, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(candidateName || 'Anonymous Candidate', margin + 4, metaY + 7);

  // Blood Group
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('BLOOD GROUP', margin + metaColWidth + 4, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(bloodGroup || 'Not Specified', margin + metaColWidth + 4, metaY + 7);

  // Report ID
  const reportId = result.reportId || `DF-SCR-${Date.now().toString().slice(-6)}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('REPORT ID', margin + metaColWidth * 2 + 4, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(reportId, margin + metaColWidth * 2 + 4, metaY + 7);

  // Date Generated
  const dateStr = result.generatedAt || new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('GENERATED', margin + metaColWidth * 3 + 4, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(dateStr, margin + metaColWidth * 3 + 4, metaY + 7);

  y += 28;

  // --- Overall Status Badge Box ---
  let statusBg = [236, 253, 245]; // Emerald-50
  let statusBorder = [167, 243, 208]; // Emerald-200
  let statusText = [6, 95, 70]; // Emerald-800
  let statusTitle = 'ELIGIBLE FOR CLINICAL REVIEW';

  if (result.status === 'temporarily_deferred') {
    statusBg = [254, 243, 199]; // Amber-50
    statusBorder = [253, 230, 138]; // Amber-200
    statusText = [146, 64, 14]; // Amber-800
    statusTitle = 'TEMPORARILY DEFERRED (INTERVAL / SYMPTOM RECOVERY)';
  } else if (result.status === 'needs_manual_review') {
    statusBg = [238, 242, 255]; // Indigo-50
    statusBorder = [199, 210, 254]; // Indigo-200
    statusText = [55, 48, 163]; // Indigo-800
    statusTitle = 'MANUAL CLINICAL REVIEW REQUIRED';
  }

  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.setDrawColor(statusBorder[0], statusBorder[1], statusBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(statusText[0], statusText[1], statusText[2]);
  doc.text('PRELIMINARY TRIAGE STATUS', margin + 4, y + 5);

  doc.setFontSize(11);
  doc.text(statusTitle, margin + 4, y + 10.5);

  y += 20;

  // --- Screening Parameters Table ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('SCREENING PARAMETERS EVALUATED', margin, y);
  y += 5;

  // Table Header Row
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('PARAMETER', margin + 3, y + 4.8);
  doc.text('ENTERED VALUE', margin + 48, y + 4.8);
  doc.text('STATUS', margin + 86, y + 4.8);
  doc.text('CLINICAL ASSESSMENT & RATIONALE', margin + 112, y + 4.8);
  y += 7;

  // Table Body Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  (result.parameters || []).forEach((param, idx) => {
    const isEven = idx % 2 === 0;
    const rowHeight = 11;

    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, y, contentWidth, rowHeight, 'F');

    // Horizontal divider
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    // Param name
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(param.name, margin + 3, y + 6);

    // Value
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(String(param.value), margin + 48, y + 6);

    // Status pill text
    const statusUpper = (param.status || 'review').toUpperCase();
    if (param.status === 'pass') {
      doc.setTextColor(5, 150, 105); // Emerald-600
    } else if (param.status === 'flag') {
      doc.setTextColor(225, 29, 72); // Rose-600
    } else {
      doc.setTextColor(217, 119, 6); // Amber-600
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`[ ${statusUpper} ]`, margin + 86, y + 6);

    // Reason
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const splitReason = doc.splitTextToSize(param.reason, contentWidth - 116);
    doc.text(splitReason, margin + 112, y + 5);

    y += rowHeight;
  });

  y += 6;

  // --- AI Screening Summary & Recommendations ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('AI SCREENING ASSESSMENT & NEXT STEPS', margin, y);
  y += 5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const splitSummary = doc.splitTextToSize(result.summary || 'Preliminary parameters analyzed successfully.', contentWidth - 8);
  doc.text(splitSummary, margin + 4, y + 6);

  if (result.recommendation) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 148, 136);
    doc.text('Recommendation:', margin + 4, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitRec = doc.splitTextToSize(result.recommendation, contentWidth - 36);
    doc.text(splitRec, margin + 34, y + 16);
  }

  y += 33;

  // --- Medical Safety Disclaimer (Notice Box) ---
  doc.setFillColor(254, 242, 242); // Rose-50
  doc.setDrawColor(254, 202, 202); // Rose-200
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(159, 18, 57); // Rose-900
  doc.text('MANDATORY CLINICAL SAFETY NOTICE', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(159, 18, 57);
  const noticeLines = [
    '• This document is an AI-assisted preliminary screening assessment only. It is NOT medical clearance or a guarantee of eligibility.',
    '• Final donor eligibility must be verified on-site by the hospital transfusion service or qualified blood-bank professional.',
    '• Certified physical serology, hemoglobin verification, and confidential medical history taking are legally required before collection.'
  ];
  noticeLines.forEach((line, idx) => {
    doc.text(line, margin + 4, y + 9.5 + idx * 4);
  });

  // --- Document Footer ---
  const footerY = 285;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('Dofi — Blood Donation Coordination Platform | Generated from authenticated donor session', margin, footerY);
  doc.text(`Page 1 of 1  •  Ref: ${reportId}`, pageWidth - margin - 35, footerY);

  return doc;
}

/**
 * Generates and triggers browser download of the PDF report.
 */
export function downloadEligibilityPDF(
  result: DonorEligibilityScreeningResult,
  candidateName: string,
  bloodGroup: string
): void {
  const doc = createEligibilityPDF(result, candidateName, bloodGroup);
  const safeName = (candidateName || 'Donor').replace(/[^a-zA-Z0-9_-]/g, '_');
  const reportId = result.reportId || Date.now().toString();
  doc.save(`Dofi_Eligibility_Report_${safeName}_${reportId.slice(-6)}.pdf`);
}
