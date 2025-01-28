const Order=require("../../models/orderSchema"); // Replace with the actual path to your Order model
//const Order = require("../../models/orderSchema"); // Replace with the actual path to your Order model
const excelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const generateSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, filter } = req.query;

    // Determine the date range
    let start = new Date(startDate || new Date());
    let end = new Date(endDate || new Date());
    if (filter) {
      const now = new Date();
      if (filter === 'daily') {
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
      } else if (filter === 'weekly') {
        const firstDay = now.getDate() - now.getDay();
        start = new Date(now.setDate(firstDay));
        end = new Date(now.setDate(firstDay + 6));
      } else if (filter === 'monthly') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (filter === 'yearly') {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
      }
    }

    // Query the database
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    });
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the given date range' });
    }

    // Aggregate the data
    const totalSalesCount = orders.length;
    const totalOrderAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalDiscounts = orders.reduce((sum, order) => sum + order.discount, 0);
    const totalCouponDiscounts = orders.reduce((sum, order) => sum + order.couponDiscount, 0);
    const netSales = totalOrderAmount - totalDiscounts - totalCouponDiscounts;

    const report = {
      totalSalesCount,
      totalOrderAmount,
      totalDiscounts,
      totalCouponDiscounts,
      netSales,
      orders,
    };

    // Respond with JSON or download options
    if (req.query.download === 'excel') {
      return generateExcelReport(report, res);
    } else if (req.query.download === 'pdf') {
      return generatePDFReport(report, res);
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ message: 'Error generating sales report', error });
  }
};

// Generate Excel Report
const generateExcelReport = async (report, res) => {
  const workbook = new excelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales Report');

  // Add headers
  worksheet.columns = [
    { header: 'Order ID', key: 'orderId', width: 25 },
    { header: 'Total Amount', key: 'totalAmount', width: 15 },
    { header: 'Discount', key: 'discount', width: 15 },
    { header: 'Coupon Discount', key: 'couponDiscount', width: 15 },
    { header: 'Net Amount', key: 'finalAmount', width: 15 },
    { header: 'Date', key: 'createdAt', width: 20 },
  ];

  // Add data
  report.orders.forEach(order => {
    worksheet.addRow({
      orderId: order.orderId,
      totalAmount: order.totalAmount,
      discount: order.discount,
      couponDiscount: order.couponDiscount,
      finalAmount: order.FinalPrice,
      createdAt: new Date(order.createdAt).toLocaleDateString(),
    });
  });

  // Send as attachment
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

  await workbook.xlsx.write(res);
  res.end();
};

// Generate PDF Report
const generatePDFReport = async (report, res) => {
  const doc = new PDFDocument();
  const filename = 'sales_report.pdf';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  // Add report content
  doc.fontSize(18).text('Sales Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Total Sales Count: ${report.totalSalesCount}`);
  doc.text(`Total Order Amount: ₹${report.totalOrderAmount}`);
  doc.text(`Total Discounts: ₹${report.totalDiscounts}`);
  doc.text(`Total Coupon Discounts: ₹${report.totalCouponDiscounts}`);
  doc.text(`Net Sales: ₹${report.netSales}`);
  doc.moveDown();

  report.orders.forEach(order => {
    doc.text(`Order ID: ${order.orderId}`);
    doc.text(`Total Amount: ₹${order.totalAmount}`);
    doc.text(`Discount: ₹${order.discount}`);
    doc.text(`Coupon Discount: ₹${order.couponDiscount}`);
    doc.text(`Net Amount: ₹${order.FinalPrice}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.moveDown();
  });

  doc.end();
};

module.exports = { generateSalesReport };
