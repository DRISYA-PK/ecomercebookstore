const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Order=require("../../models/orderSchema");


class OrderInvoiceGenerator {
    static async generateInvoice(order) {
        try {
            // Ensure order is populated with references
            await order.populate([
                { path: 'userId', select: 'name email' },
                { path: 'shippingAddress' },
                { path: 'items.product', select: 'name author language' }
            ]);
           // console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
            const pdfBuffer = await this.createPDF(order);
            const fileName = `invoice-${order.orderId}.pdf`;
            
            // Save PDF to disk (optional)
            const uploadDir = path.join(__dirname, '../public/invoices');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, pdfBuffer);
          
            return {
               
      
                success: true,
                fileName,
                filePath,
                pdfBuffer
            };
        } catch (error) {
            console.log(error);
            throw new Error(`Invoice generation failed: ${error.message}`);
        }
    }

    static async createPDF(order) {
        return new Promise((resolve) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            doc.fontSize(20)
            .text('Bstore :books for you.....', { align: 'center'})
            .moveDown();

           

            // Header
            doc.fontSize(15)
               .text('INVOICE', { align: 'center' })
               .moveDown();

            // Invoice & Order Details
            if(order.paymentSuccess==='fail')
            {
                doc.fontSize(12)
                .text(`Invoice Date: ${order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString()}`)
                .text(`Order ID: ${order.orderId}`)
                .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`)
                .text(`Payment : ${order.paymentSuccess.toUpperCase()}`)
                .moveDown();
            }else
            {

            doc.fontSize(12)
               .text(`Invoice Date: ${order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString()}`)
               .text(`Order ID: ${order.orderId}`)
               .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`)
               .text(`Payment Method: ${order.paymentType.toUpperCase()}`)
               .text(`Order Status:  ${order.statuss.toUpperCase()}`)
               .moveDown();
            }
            // Customer Details
            doc.fontSize(14)
               .text('Customer Details', { underline: true })
               .fontSize(12)
               .text(`Name: ${order.userId.name}`)
               .text(`Email: ${order.userId.email}`)
               .moveDown();

            // Shipping Address
            doc.fontSize(14)
               .text('Shipping Address', { underline: true })
               .fontSize(12)
               .text(`${order.shippingAddress.name}`)
               .text(`${order.shippingAddress.address}`)
               .text(`${order.shippingAddress.city}`)
               .text(`${order.shippingAddress.state} - ${order.shippingAddress.pinCode}`)
               .text(`${order.shippingAddress.phone}`)
               .moveDown();

            // Items Table
            doc.fontSize(14)
               .text('Order Items', { underline: true })
               .moveDown();

            // Table headers
            const tableTop = doc.y;
            const itemX = 50;
            const quantityX = 280;
            const priceX = 350;
            const discountX = 420;
            const totalX = 490;

            doc.fontSize(12)
               .text('Item', itemX, tableTop)
               .text('Qty', quantityX, tableTop)
               .text('Price', priceX, tableTop)
               .text('Disc%', discountX, tableTop)
               .text('Total', totalX, tableTop);

            doc.moveTo(itemX, tableTop + 20)
               .lineTo(550, tableTop + 20)
               .stroke();

            // Table rows  
            let yPosition = tableTop + 30;
            order.items.forEach(item => {
                doc.text(item.product.name, itemX, yPosition)
                   .text(item.quantity.toString(), quantityX, yPosition)
                   .text(`₹${((item.price * 100) / (100- item.discount)).toFixed(2)}`, priceX, yPosition)
                   .text(`${item.discount}%`, discountX, yPosition)
                   .text(`₹${(item.price*item.quantity).toFixed(2)}`, totalX, yPosition);

                yPosition += 20;
            });

            // Totals
            yPosition += 20;
            doc.moveTo(itemX, yPosition)
               .lineTo(550, yPosition)
               .stroke();

            yPosition += 10;
            doc.text('Subtotal:', 350, yPosition)
               .text(`₹${(order.totalPrice-order.discount).toFixed(2)}`, totalX, yPosition);

            yPosition += 20;
          /*  if (order.discount > 0) {
                doc.text('coupon Discount:', 350, yPosition)
                   .text(`-₹${order.couponDiscount.toFixed(2)}`, totalX, yPosition);
                yPosition += 20;
            }*/

            if (order.couponDiscount > 0) {
                doc.text('Coupon Discount:', 350, yPosition)
                   .text(`-₹${order.couponDiscount.toFixed(2)}`, totalX, yPosition);
                yPosition += 20;
            }

            if (order.deliveryCharge > 0) {
                doc.text('Delivery Charge:', 350, yPosition)
                   .text(`₹${order.deliveryCharge.toFixed(2)}`, totalX, yPosition);
                yPosition += 20;
            }

            // Final Amount
            doc.moveTo(350, yPosition)
               .lineTo(550, yPosition)
               .stroke();

            yPosition += 10;
            doc.fontSize(14)
               .text('Final Amount:', 350, yPosition)
               .text(`₹${order.FinalPrice.toFixed(2)}`, totalX, yPosition);

            // Footer
            doc.fontSize(10)
               .text('Thank you for your purchase!', 50, doc.page.height - 100, { align: 'center' })
               .text('This is a computer-generated invoice and does not require a signature.', 50, doc.page.height - 80, { align: 'center' });

            doc.end();
        });
    }
}

// Express route handler for downloading invoice
const downloadInvoice = async (req, res) => {
    try {

        const orderId = req.params.orderId;
        console.log(orderId)
      //  console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
        const order = await Order.findOne({ _id:orderId });
      //  console.log("dssssssssssssssssssssssssw"+order)
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        const result = await OrderInvoiceGenerator.generateInvoice(order);

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
        
        // Send PDF buffer
//console.log(result.pdfBuffer);

        res.send(result.pdfBuffer);
    } catch (error) {

        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    OrderInvoiceGenerator,
    downloadInvoice,
   
};