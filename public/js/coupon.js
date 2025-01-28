


let formData={};
function validateForm() {
    document.querySelectorAll(".error-message").forEach((element) => (element.innerHTML = ""));
    const sDate = document.getElementsByName("startDate")[0].value;
    const eDate = document.getElementsByName("endDate")[0].value;
    const sDateObj = new Date(sDate);
    const eDateObj = new Date(eDate);
    const todayDateObj = new Date();
    todayDateObj.setHours(0, 0, 0, 0);
 
 
    if (sDateObj > eDateObj) {
      document.getElementById("error-end-date").innerHTML ="End date should be after the start date";
      return false;
    }
 
 
    if (sDateObj <= todayDateObj) {
      document.getElementById("error-start-date").innerHTML ="Starting date should be greater than or equal to today's date";
      return false;
    }
 
 
    let name = document.getElementsByName("couponName")[0].value;
    const nameRegex = /^[A-Za-z0-9]{1,50}$/;
 
 
    if (!nameRegex.test(name)) {
      document.getElementById("error-coupon-name").innerHTML =
        "Coupon Name error";
      return false;
    }
 
 
    const offerPriceInput = document.getElementsByName("offerPrice")[0];
    const minimumPriceInput = document.getElementsByName("minimumPrice")[0];
 
 
    const offerPrice = offerPriceInput.value.trim() !== ""? parseInt(offerPriceInput.value): NaN;
    const minimumPrice = minimumPriceInput.value.trim() !== ""? parseInt(minimumPriceInput.value): NaN;
    


    const dropdown = document.getElementById('offer-type');
    const selectedOfferType = dropdown.value;
    if (!selectedOfferType) {
        document.getElementById("error-offer-type").innerHTML = "please select offer type";
        return false;
      } 


 
    if (isNaN(offerPrice) || isNaN(minimumPrice) || offerPrice >= minimumPrice) {
      document.getElementById("error-offer-price").innerHTML = "Offer Price must be greater than Minimum Price";
      return false;
    }
 
 
    if (isNaN(offerPrice) || isNaN(minimumPrice)) {
      document.getElementById("error-offer-price").innerHTML ="Please enter numeric values for Offer Price and Minimum Price";
      return false;
    }
 
 
         formData = {
        couponName: name,
        startDate: sDateObj,
        endDate: eDateObj,
        offerType:selectedOfferType,
        offerPrice:offerPrice ,
        minimumPrice: minimumPrice
    };
    return true;
  }

//------------add coupon
async function addCoupon() {
    if(validateForm())
    {
       // Swal.fire("true");
     addNewCoupon();
    }
    else
    {
       // Swal.fire("false");
    }
    
}

async function addNewCoupon() {
    try {
        // Swal.fire("correct");

        const response = await fetch(`/admin/addcoupon`, {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (result) {
            if (response.redirected) {
                // Redirect the user to the provided URL
                window.location.href = "/admin/coupon";
            } else {
                if (response.ok) {
                  Swal.fire({
                    icon: "success",
                    title: "added!",
                    text: "The coupon has been Added",
                    confirmButtonText: "OK",
                  }).then(() => {
                    window.location.href = "/admin/coupon";
                  });

                } else {
                  Swal.fire(result.message);
                   // window.location.href = "/admin/login";
                }

            }
        }
    } catch (error) {
      Swal.fire("mm2");
        console.error('Upload failed', error);
       // Swal.fire('try again');
    }

    
}








 
 
 function confirmDelete(couponId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCoupon(couponId);
      }
    });
  }
 
 
  function deleteCoupon(couponId) {
    $.ajax({
      url: `/admin/deletecoupon?id=${couponId}`,
      method: "POST",
      success: function () {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The coupon has been deleted.",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.reload();
        });
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete the coupon. Please try again.",
        });
      },
    });
  }