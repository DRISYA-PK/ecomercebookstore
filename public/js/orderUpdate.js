function updateStatus(button) {
    const orderCard = button.closest('.order-card');
    const orderId = orderCard.querySelector('#orderId').textContent;
    const select = orderCard.querySelector('.status-select');
    const newStatus = select.value;
    const statusBadge = orderCard.querySelector('#statusBadge');

    // Update the status badge immediately for user feedback
    statusBadge.className = `status-badge status-${newStatus}`;
    statusBadge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

    // Send update to server
    fetch('/admin/updatestatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            orderId: orderId,
            status: newStatus
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            // Revert the status if update failed
            alert('Failed to update status. Please try again.');
           location.reload();
          // window.location.href = `/vieworder`;
        }
        else
        {
          
            Swal.fire({
                title: 'updated?',
               
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'ok',
              }).then((result) => {
                location.reload();
              });
             
          
          
          
            
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to update status. Please try again.');
        location.reload();
    });
}

// Function to add event listeners after content is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set initial status in select elements
    document.querySelectorAll('.order-card').forEach(card => {
        const currentStatus = card.querySelector('#statusBadge').textContent.toLowerCase();
        card.querySelector('.status-select').value = currentStatus;
    });
});