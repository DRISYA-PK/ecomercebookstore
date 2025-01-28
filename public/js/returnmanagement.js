function approveReturn(returnId,orderId,userId,amt) {

    //fetch(`/admin/returnapproved?id=${returnId}&orderId=${orderId}&userId=${userId}&amt=${amt}`, {
        fetch(`/admin/returnapproved?id=${encodeURIComponent(returnId)}&orderId=${encodeURIComponent(orderId)}&userId=${encodeURIComponent(userId)}&amt=${encodeURIComponent(amt)}`, { 
    method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => response.json())
      .then(data => {
        if (data.success) {
          Swal.fire({
              icon: "Success",
              title: "success!",
              text:data.message,
              confirmButtonText: "OK",
            }).then(() => {
              window.location.reload();
            }); // Show success message
  //location.reload(); // Reload the page to reflect changes
        } else {
          alert('Error processing your request');
        }
      })
      .catch(error => console.error('Error:', error));
  }

  function rejectReturn(returnId,orderId) {
    fetch(`/admin/returnrejected?id=${returnId}&orderId=${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => response.json())
    .then(data => {
      if (data.success) {
        Swal.fire({
            icon: "Rejected",
            title: "Rejected!",
            text:data.message,
            confirmButtonText: "OK",
          }).then(() => {
            window.location.reload();
          }); // Show success message
//location.reload(); // Reload the page to reflect changes
      } else {
        alert('Error processing your request');
      }
    })
    .catch(error => console.error('Error:', error));
}