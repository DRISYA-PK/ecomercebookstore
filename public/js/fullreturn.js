

// fullreturn.js
document.addEventListener("DOMContentLoaded", () => {
    const checkboxes = document.querySelectorAll('.product-checkbox');
    const totalAmountElement = document.getElementById('total-amount');
  const coupondiscount=document.getElementById('coupon-discount').textContent;
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', updateTotalAmount);
    });
  
    function updateTotalAmount() {
      let totalAmount = 0;
      checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
          totalAmount += parseFloat(checkbox.getAttribute('data-price'));
        }
      });
      totalAmount=totalAmount-parseFloat(coupondiscount);
      totalAmountElement.textContent = totalAmount.toFixed(2);
    }
  });
  



// Get form and checkboxes
const form = document.querySelector('form');
const productCheckboxes = document.querySelectorAll('.product-checkbox');

// Function to collect selected product IDs
function getSelectedProductIds() {
  const selectedProductIds = [];
  productCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      selectedProductIds.push(checkbox.value); // Add the selected product ID to the array
    }
  });
  return selectedProductIds;
}

async function submitReturn() {


    const orderId = document.getElementById('orderId').value;
    const customerId = document.getElementById('customerId').value;
    const reason = document.getElementById('reason').value;

  const productId=getSelectedProductIds();
  const refundamount = document.getElementById('total-amount').textContent;
  const coupondiscount=document.getElementById('coupon-discount').textContent;
    const response = await fetch('/returnsubmit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, reason,productId,refundamount,coupondiscount ,customerId}),
    });
  
    const result = await response.json();
  if(result.success)
  {
    Swal.fire("returned successfully")
  }
  }
  