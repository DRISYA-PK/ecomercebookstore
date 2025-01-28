

function viewOrderDetails(orderId) {
    // Navigate to order details page
    window.location.href = `/order-details/${orderId}`;
}

function cancelOrder(orderId)
{
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
      }).then((result) => {
        if (result.isConfirmed) {
            cancelOrderConfirmed(orderId);
          
        } else {
          // Optional action for when the user cancels
          Swal.fire(
            'Cancelled',
            'Your file is safe :)',
            'error'
          );
        }
      });
}

function returnAllOrder(orderId)
{
    
            window.location = `/returnView?orderId=${orderId}`;
     
}

function cancelOrderConfirmed(orderId) {
  
        fetch(`/cancelorder/${orderId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                Swal.fire({
                    title: 'Order Cancelled',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'ok'
                  }).then((result) => {
                 
                    location.reload();
                    
                  });
               
            } else {
                alert('Failed to cancel order');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while cancelling the order');
        });
    
}





function showOrderDetails(name) {
    // Alert for debugging
    alert(order);//JSON.stringify(order, null, 2));
//order=JSON.stringify(order);
console.log(order)
order=null;
//order = JSON.parse(order);

    const details = document.getElementById('orderDetails');

    // Construct the items table rows
    let itemsHTML = '';
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            itemsHTML += `
                <tr>
               
                    <td>${item.product.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
            `;
        });
    } else {
        itemsHTML = `
            <tr>
                <td colspan="4">No items found</td>
            </tr>
        `;
    }

    // Construct the order details HTML
    details.innerHTML = `
        <h2>Order Details - ${order.id}</h2>
        <p>Order Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p>Status: <span class="order-status status-${order.statuss}">${order.statuss}</span></p>
        
        <h3>Items</h3>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>

      
<div class="shipping-info">
    <h3>Shipping Information</h3>
    <p>${name || 'N/A'}</p>
    <p>${order.shippingAddress?.address || 'N/A'}</p>
    <p>${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.pinCode || 'N/A'}</p>
</div>

</div>

        </div>

        <h3>Order Summary</h3>
        <p>Total: ₹${order.FinalPrice}</p>
    `;

    // Display the modal
    document.getElementById('detailsModal').style.display = 'block';
}



function filterOrdersByStatus() {
    // Get the selected filter value
    const selectedValue = document.getElementById('orderFilter').value.toLowerCase();
    // Get all order cards
    const orderCards = document.querySelectorAll('.order-card');

    // Loop through each order card
    orderCards.forEach(orderCard => {
        // Extract the order status and order date from the card
        const orderStatus = orderCard.querySelector('.order-status').textContent.toLowerCase();
        const orderDateText = orderCard.querySelector('.order-date').textContent.replace('Ordered on ', '');
        const orderDate = new Date(orderDateText);
        const currentDate = new Date();

        // Determine visibility of the order based on the selected filter
        let shouldDisplay = false;

        if (selectedValue === 'all') {
            shouldDisplay = true; // Show all orders
        } else if (selectedValue === 'last30') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(currentDate.getDate() - 30);
            shouldDisplay = orderDate >= thirtyDaysAgo;
        } else if (selectedValue === 'last6months') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
            shouldDisplay = orderDate >= sixMonthsAgo;
        } else {
            shouldDisplay = orderStatus === selectedValue; // Match status
        }

        // Show or hide the order card
        orderCard.style.display = shouldDisplay ? '' : 'none';
    });
}


async function confirmPaymentAlert(method,FinalAmount,orderId) {
    Swal.fire({
        icon: 'warning',  // You can use 'warning' or another icon type if you want
        title: 'Confirm Order',
        text: 'Are you sure you want to proceed with the payment?',
        showCancelButton: true,  // This adds the cancel button
        confirmButtonText: 'Yes, Proceed',
        cancelButtonText: 'Cancel',
        showConfirmButton: true,
        showLoaderOnConfirm: true,  // Optional: shows a loading animation when confirming
        preConfirm: () => {

            onlinePayment(method,FinalAmount,orderId);
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve(), 5000);  // Simulate a delay (you can remove this)
            });
        },
    }).then((result) => {
        if (result.isConfirmed) {
            // Payment confirmed, proceed with payment logic
            //  console.log("Payment Confirmed");
            onlinePayment('online',FinalAmount,orderId);

        } else {
            // Payment canceled
            console.log("Payment Canceled");
        }
    });
}



async function onlinePayment(method,FinalAmount,orderId) {
   // FinalAmount = document.getElementById("FinalAmount").textContent.trim();
    const response = await fetch(`/requestonlinepayment?amount=${FinalAmount}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });

    const order = await response.json();
    const options = {
        key: 'rzp_test_bk0BpBsnY0BDih', // Replace with your Razorpay Key ID
        amount: order.amount,
        currency: order.currency,
        name: "Bstore",
        description: "Test Transaction",
        order_id: order.id,
        handler: function (response) {
            //   alert(`Payment ID: ${response.razorpay_payment_id}`);
            // alert(`Order ID: ${response.razorpay_order_id}`);
            // alert(`Signature: ${response.razorpay_signature}`);

            // Send the response to the backend for signature verification
            fetch('/verifyPayment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response),
            }).then((res) => res.json(),)
                .then((data) => {
                    // alert("bbbbbbbbbbbbbbbbbbbbbbbbbbb")
                    if (data.status === "success") {
                        {
                           
                            updatePaymentSuccess(orderId,FinalAmount);
                            //submitPayment(method, addressId, 'success');
                        }
                    } else {
                        alert("bbbbbbbbbbbbbbbbbbbbbbsdasdbbbbb")

                        swal.fire("Payment Verification Failed");
                        window.location.reload = "/showhistory"
                    }
                });
        },
        prefill: {
            name: "Your Name",
            email: "youremail@example.com",
            contact: "9999999999",
        },
        theme: {
            color: "#3399cc",
        },
        modal: {
            ondismiss: function () {
                swal.fire("Payment was cancelled by the user.");
                Swal.fire({
                    icon: 'warning',  // You can use 'warning' or another icon type if you want
                    title: 'Payment Cancelled',
                    text: 'Are you sure you want to proceed with the payment? again',
                    showCancelButton: true,  // This adds the cancel button
                    confirmButtonText: 'ok'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Payment confirmed, proceed with payment logic
                        //  console.log("Payment Confirmed");
                        onlinePayment('online',FinalAmount,orderId);
                        //alert("ook")

                    }
                
                });


                //window.location.reload(); // Reload on modal dismissal
            },
        },
    };

    const rzp = new Razorpay(options);
    rzp.open();

}

async function updatePaymentSuccess(orderId, amount) {
    try {
      const response = await fetch(`/updatePaymentSuccess?orderId=${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const data = await response.json();
     // 
      if (data.status === "success") {
        // Redirect to payment success page with the payment amount
        window.location.href = `/paymentSuccessPage/paymentId/${amount}`;
      } else {
        // Display a user-friendly error message if the update fails
        swal.fire("Payment update failed. Please try again.");
      }
    } catch (error) {
      console.error("Error updating payment success:", error);
      swal.fire("An unexpected error occurred. Please try again later.");
    }
  }


  async function downloadInvoice(orderId) {
    try {
        fetch(`/api/orders/${orderId}/invoice`)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${orderId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    } catch (error) {
        
    }
  }
  


