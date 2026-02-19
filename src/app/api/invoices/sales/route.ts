import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Fetch order with customer and items
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: {
          include: {
            tyre: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
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
    
    // Invoice Title
    pdf.setFontSize(16)
    pdf.text('TAX INVOICE', 140, 20)
    
    // Invoice Details
    pdf.setFontSize(10)
    pdf.text(`Invoice Number: INV-${order.orderNumber}`, 140, 30)
    pdf.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 37)
    pdf.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 140, 44)
    
    // Billing Address
    pdf.setFontSize(12)
    pdf.text('Bill To:', 20, 65)
    pdf.setFontSize(10)
    pdf.text(order.customer.name, 20, 72)
    if (order.customer.address) {
      pdf.text(order.customer.address, 20, 79)
    }
    pdf.text(`Phone: ${order.customer.phone}`, 20, 86)
    if (order.customer.email) {
      pdf.text(`Email: ${order.customer.email}`, 20, 93)
    }
    
    // Table Header
    const tableTop = 110
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
    order.orderItems.forEach((item, index) => {
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
    pdf.text(`₹${order.totalAmount.toFixed(2)}`, 160, totalsY + 5)
    
    pdf.text('CGST (9%):', 140, totalsY + 12)
    pdf.text(`₹${(order.gstAmount / 2).toFixed(2)}`, 160, totalsY + 12)
    
    pdf.text('SGST (9%):', 140, totalsY + 19)
    pdf.text(`₹${(order.gstAmount / 2).toFixed(2)}`, 160, totalsY + 19)
    
    pdf.setFontSize(12)
    pdf.text('Grand Total:', 140, totalsY + 28)
    pdf.text(`₹${order.grandTotal.toFixed(2)}`, 160, totalsY + 28)
    
    // Terms and Conditions
    pdf.setFontSize(10)
    const termsY = totalsY + 45
    pdf.text('Terms and Conditions:', 20, termsY)
    pdf.text('1. Goods once sold will not be taken back.', 20, termsY + 7)
    pdf.text('2. Subject to Chennai jurisdiction.', 20, termsY + 14)
    pdf.text('3. Payment due within 30 days from invoice date.', 20, termsY + 21)
    
    // Footer
    pdf.setFontSize(8)
    pdf.text('This is a computer generated invoice and does not require signature.', 20, 280)
    
    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
    
    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${order.orderNumber}.pdf"`
      }
    })
    
  } catch (error) {
    console.error('Error generating sales invoice:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}