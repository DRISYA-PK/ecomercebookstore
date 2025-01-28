
function submit() {
    // Get form values
   
    const email = document.getElementById('email').value;

    // Validation
    if (!validateEmail(email)) {
       Swal.fire('Please enter a valid email address.');
        return;
    }
    else
    {
    getEmail(email)
    }

   

  
}
async function getEmail(email)
{
    try {
        // Swal.fire("correct");
        Swal.fire({
            title: 'Processing...',
            text: 'Please wait while we complete your request.',
            allowOutsideClick: false, // Prevent user interaction outside the alert
            didOpen: () => {
                Swal.showLoading(); // Show loading spinner
            }
        });
        const response = await fetch('/forgotpassword', {

            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const result = await response.json();
        if (result) {
            if (response.redirected) {
                // Redirect the user to the provided URL
                window.location.href = "/login";
            } else {
                if (response.ok) {

                    setTimeout(() => {
                        // Update the alert with the success message
                        Swal.fire({
                            icon: "success",
                            title: " Link Sent!",
                            text: result.message,
                            showConfirmButton: true,
                        });
                    }, 3000); 
                }
                else{
                    Swal.fire(result.message)
                }
               

            }
        }
    } catch (error) {
        console.error('Upload failed', error);
        Swal.fire(error);
    }
}

// Email validation function
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}
