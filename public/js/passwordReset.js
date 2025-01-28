

function reset()
{
    if(validatePasswords())
        {
            resetOk()
        }

}

async function resetOk()
{
    try {
        // Swal.fire("correct");
        const newPassword = document.getElementById("newPassword").value;
        const userId= document.getElementById("userId").value;
        Swal.fire({
            title: 'Processing...',
            text: 'Please wait while we complete your request.',
            allowOutsideClick: false, // Prevent user interaction outside the alert
            didOpen: () => {
                Swal.showLoading(); // Show loading spinner
            }
        });
        const response = await fetch('/resetpassword', {

            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword: newPassword,userId:userId })
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
                            title: " Password Updated",
                            text: result.message,
                            showConfirmButton: true,
                        }).then(() => {
                            // Redirect to the login page after the alert is closed
                            window.location.href = "/login";
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

function validatePasswords() {
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorMessage = document.getElementById("errorMessage");

   

    // Check password strength
    const passwordStrength = checkPasswordStrength(newPassword);
    if (!passwordStrength.isValid) {
        errorMessage.textContent = passwordStrength.message;
        Swal.fire({
            icon: "warning",
            title: "Weak Password",
            text: passwordStrength.message,
        });
        return false;
    }
     // Check if passwords match
     if (newPassword !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match.";
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Passwords do not match.",
        });
        return false;
    }

    // Clear error message and allow form submission
    errorMessage.textContent = "";
    return true;
}

function checkPasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { isValid: false, message: "Password must be at least 8 characters long." };
    }
    if (!hasUpperCase) {
        return { isValid: false, message: "Password must include at least one uppercase letter." };
    }
    if (!hasLowerCase) {
        return { isValid: false, message: "Password must include at least one lowercase letter." };
    }
    if (!hasNumber) {
        return { isValid: false, message: "Password must include at least one number." };
    }
    if (!hasSpecialChar) {
        return { isValid: false, message: "Password must include at least one special character." };
    }

    return { isValid: true, message: "Strong password." };
}
