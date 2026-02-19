import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const { purchaseId } = await request.json()

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID is required' }, { status: 400 })
    }

    // Fetch purchase with supplier and items
    const purchase = await db.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        supplier: true,
        purchaseItems: {
          include: {
            tyre: true
          }
        }
      }
    })

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    // Generate PDF
    const pdf = new jsPDF()
    
    // Set font
    pdf.setFont('helvetica')
    
    // Company Header
    pdf.setFontSize(20)
    pdf.text('Tyre Hi Tyre', 20, 20)
    pdf.setFontSize(10)
    pdf.text('Complete Tyre Sales & Purchase Management', 20, 27)
    pdf.text('123, Main Street, City - 600001', 20, 34)
    pdf.text('Phone: +91-9876543210 | Email: info@tyrehityre.com', 20, 41)
    pdf.text('GSTIN: 33AAAPL1234C1ZV', 20, 48)
    
    // Bill Title
    pdf.setFontSize(16)
    pdf.text('PURCHASE BILL', 140, 20)
    
    // Bill Details
    pdf.setFontSize(10)
    pdf.text(`Bill Number: BILL-${purchase.purchaseNumber}`, 140, 30)
    pdf.text(`Date: ${new Date(purchase.createdAt).toLocaleDateString()}`, 140, 37)
    pdf.text(`Status: ${purchase.status.toUpperCase()}`, 140, 44)
    
    // Supplier Address
    pdf.setFontSize(12)
    pdf.text('Supplier:', 20, 65)
    pdf.setFontSize(10)
    pdf.text(purchase.supplier.name, 20, 72)
    if (purchase.supplier.address) {
      pdf.text(purchase.supplier.address, 20, 79)
    }
    pdf.text(`Phone: ${purchase.supplier.phone}`, 20, 86)
    if (purchase.supplier.email) {
      pdf.text(`Email: ${purchase.supplier.email}`, 20, 93)
    }
    
    // Table Header
    const tableTop = 117
    pdf.setFillColor(240, 240, 240)
    pdf.rect(20, tableTop - 10, 170, 10, 'F')
    
    pdf.setFontSize(10)
    pdf.text('S.No', 25, tableTop - 3)
    pdf.text('Product Description', 45, tableTop - 3)
    pdf.text('Qty', 120, tableTop - 3)
    pdf.text('Rate', 135, tableTop - 3)
    pdf.text('Amount', 160, tableTop - 3)
    
    // Table Items
    let currentY = tableTop + 10
    purchase.purchaseItems.forEach((item, index) => {
      const tyre = item.tyre
      const description = `${tyre.brand} ${tyre.model}\nSize: ${tyre.size}\nType: ${tyre.type}`
      
      pdf.text(`${index + 1}`, 25, currentY)
      
      // Split description into multiple lines if needed
      const lines = pdf.splitTextToSize(description, 60)
      lines.forEach((line: string, lineIndex: number) => {
        pdf.text(line, 45, currentY + (lineIndex * 5))
      })
      
      pdf.text(`${item.quantity}`, 120, currentY)
      pdf.text(`₹${item.price.toFixed(2)}`, 135, currentY)
      pdf.text(`₹${item.total.toFixed(2)}`, 160, currentY)
      
      currentY += Math.max(lines.length * 5, 15)
      
      // Add line after each item
      pdf.line(20, currentY - 2, 190, currentY - 2)
    })
    
    // Totals
    const totalsY = currentY + 10
    pdf.line(20, totalsY - 5, 190, totalsY - 5)
    
    pdf.text('Subtotal:', 140, totalsY + 5)
    pdf.text(`₹${purchase.totalAmount.toFixed(2)}`, 160, totalsY + 5)
    
    pdf.text('CGST (9%):', 140, totalsY + 12)
    pdf.text(`₹${(purchase.gstAmount / 2).toFixed(2)}`, 160, totalsY + 12)
    
    pdf.text('SGST (9%):', 140, totalsY + 19)
    pdf.text(`₹${(purchase.gstAmount / 2).toFixed(2)}`, 160, totalsY + 19)
    
    pdf.setFontSize(12)
    pdf.text('Grand Total:', 140, totalsY + 28)
    pdf.text(`₹${purchase.grandTotal.toFixed(2)}`, 160, totalsY + 28)
    
    // Terms and Conditions
    pdf.setFontSize(10)
    const termsY = totalsY + 45
    pdf.text('Terms and Conditions:', 20, termsY)
    pdf.text('1. Payment due within 30 days from bill date.', 20, termsY + 7)
    pdf.text('2. Goods received in good condition.', 20, termsY + 14)
    pdf.text('3. Subject to Chennai jurisdiction.', 20, termsY + 21)
    
    // Footer
    pdf.setFontSize(8)
    pdf.text('This is a computer generated bill and does not require signature.', 20, 280)
    
    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
    
    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Bill-${purchase.purchaseNumber}.pdf"`
      }
    })
    
  } catch (error) {
    console.error('Error generating purchase bill:', error)
    return NextResponse.json({ error: 'Failed to generate bill' }, { status: 500 })
  }
}