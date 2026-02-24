import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Repair, Customer } from '../types';
import { BUSINESS_INFO } from '../src/constants';

export const generateQuotationPDF = (repair: Repair, customer: Customer, storeInfo: any) => {
  const doc = new jsPDF();
  const brandRed = [239, 68, 68]; // #EF4444

  // --- Header Section ---
  try {
    doc.addImage(BUSINESS_INFO.logo, 'PNG', 10, 10, 40, 15);
  } catch (e) {
    doc.setFillColor(brandRed[0], brandRed[1], brandRed[2]);
    doc.roundedRect(10, 10, 25, 25, 3, 3, 'F');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('iB', 22.5, 27, { align: 'center' });
  }

  doc.setFontSize(24);
  doc.setTextColor(brandRed[0], brandRed[1], brandRed[2]);
  doc.text('iBERRY SOLUTIONS', 55, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text(storeInfo.address, 55, 28);
  doc.text(`Phone: ${storeInfo.phone} | Email: ${storeInfo.email}`, 55, 33);

  doc.setDrawColor(230);
  doc.line(10, 40, 200, 40);

  // --- Title Section ---
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', 105, 50, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`REFERENCE NO. ${repair.id.toUpperCase()}`, 105, 56, { align: 'center' });

  // --- Customer & Device Details ---
  doc.setFontSize(11);
  doc.setTextColor(brandRed[0], brandRed[1], brandRed[2]);
  doc.text('CUSTOMER DETAILS:', 10, 65);
  
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');
  doc.text(`NAME: ${customer.name}`, 10, 72);
  doc.text(`CONTACT NO: ${customer.phone}`, 10, 78);
  doc.text(`EMAIL: ${customer.email || 'N/A'}`, 10, 84);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandRed[0], brandRed[1], brandRed[2]);
  doc.text('DEVICE DETAILS:', 110, 65);
  
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');
  doc.text(`MODEL: ${repair.model}`, 110, 72);
  doc.text(`IMEI/SN: ${repair.imei}`, 110, 78);

  // --- Fault & Report ---
  doc.setFont('helvetica', 'bold');
  doc.text('FAULT DESCRIPTION:', 10, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(repair.fault, 10, 111, { maxWidth: 190 });

  // --- Price ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`QUOTED PRICE: ZAR ${repair.price.toFixed(2)}`, 110, 150);

  // --- Banking Details ---
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandRed[0], brandRed[1], brandRed[2]);
  doc.text('BANKING DETAILS:', 10, 175);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');
  doc.text(`Email: ${storeInfo.email}`, 10, 181);
  doc.text(`Contact No: ${storeInfo.phone}`, 10, 187);
  // Add actual banking details if available in storeInfo, else placeholders
  doc.text('Bank: FNB | Acc: 1234567890 | Branch: 250655', 10, 193);

  // --- Disclaimer ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DISCLAIMER:', 10, 205);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const disclaimer = [
    "* All devices are booked at the clients own risk, iBERRY is not liable for ANY data loss or damage sustained during software or hardware repairs. Data back up is the clients responsibility.",
    "* All parts and repairs are guaranteed for 90 days from and including date of purchase.",
    "* On liquid damaged phones only parts fitted are guaranteed provided no further liquid damage occurs. Due to the nature of liquid damage, these devices may experience further hardware failure over time, which is not covered by the guarantee.",
    "* Warrantee/guarantee is void if unit is worked on or opened by anyone except iBERRY.",
    "* iBERRY is not responsible for keeping of memory cards, batteries, back covers and sim cards; it is the owner's responsibility.",
    "* All devices not collected within 31 days of notification may be sold to cover costs.",
    "* iBERRY is strictly an out of warranty repair centre. If any repairs done to handsets are under warranty by the supplier, and warranty is voided due to us working on it, no claims against iBERRY Solutions will be entertained."
  ];
  
  let currentY = 210;
  disclaimer.forEach(line => {
    const splitLine = doc.splitTextToSize(line, 190);
    doc.text(splitLine, 10, currentY);
    currentY += (splitLine.length * 3.5);
  });

  // --- Signatures ---
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.line(10, 260, 80, 260);
  doc.text('CLIENT SIGNATURE', 10, 265);

  doc.line(120, 260, 190, 260);
  doc.text('CUSTOMER SIGNATURE', 120, 265);

  doc.save(`Quotation_${repair.id}.pdf`);
};
