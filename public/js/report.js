document.getElementById('generateReport').addEventListener('click', async () => {
    let filter = document.getElementById('filter').value;
    let startDate = document.getElementById('startDate').value;
    let endDate = document.getElementById('endDate').value;
  
    if (!filter && (!startDate || !endDate)) {
      alert('Please select a filter or date range.');
      return;
    }
  
    try {
      const response = await fetch(`/admin/sales-report?filter=${filter}&startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
     // alert(data.report);
    /*  if (data && data.report) {
      
        document.getElementById('reportSection').classList.remove('hidden');
        const reportBody = document.getElementById('reportBody');
        reportBody.innerHTML = '';
  
        data.report.forEach(row => {
            
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${row.date}</td>
            <td>${row.totalSales}</td>
            <td>${row.totalOrders}</td>
            <td>${row.totalDiscount}</td>
            <td>${row.netSales}</td>
          `;
          reportBody.appendChild(tr);
        });
      }*/



        if (data) {
            const { orders, totalSalesCount, totalOrderAmount, totalDiscounts,totalCouponDiscounts, netSales } = data;
          
            document.getElementById('reportSection').classList.remove('hidden');
            const reportBody = document.getElementById('reportBody');
            reportBody.innerHTML = '';
          
            orders.forEach(order => {
              const tr = document.createElement('tr');
              tr.innerHTML = `
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>${order.orderId}</td>
                <td>₹${order.totalAmount}</td>
                <td>₹${order.discount}</td>
                    <td>₹${order.couponDiscount}</td>
                <td>₹${order.FinalPrice}</td>
              `;
              reportBody.appendChild(tr);
            });
          

            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>Total</td>
              <td>Amount</td>
              <td>₹${totalOrderAmount}</td>
              <td>₹${totalDiscounts}</td>
                  <td>₹${totalCouponDiscounts}</td>
              <td>₹${netSales}</td>
            `;
            reportBody.appendChild(tr);

            // Display totals if needed
         /*   const tr1 = document.createElement('tr');
          <td> totalSalesCount;</td> 
           tr.innerHTML = `
          <td>  ₹${totalOrderAmount}</td> 
          <td>  ₹${totalDiscounts}</td> 
          <td> ₹${totalCouponDiscounts}</td> 
          <td>₹${netSales}</td>`;
          reportBody.appendChild(tr1);*/
          
           
          }



    } catch (error) {
      console.error('Error fetching report:', error);
    }
  });
  
  document.getElementById('downloadPdf').addEventListener('click', () => {
    let filter = document.getElementById('filter').value;
    let startDate = document.getElementById('startDate').value;
    let endDate = document.getElementById('endDate').value;
    window.open(`/admin/sales-report?download=pdf&filter=${filter}&startDate=${startDate}&endDate=${endDate}`, '_blank');
  });
  
  document.getElementById('downloadExcel').addEventListener('click', () => {
    let filter = document.getElementById('filter').value;
    let startDate = document.getElementById('startDate').value;
    let endDate = document.getElementById('endDate').value;
    window.open(`/admin/sales-report?download=excel&filter=${filter}&startDate=${startDate}&endDate=${endDate}`, '_blank');
  });
  
  