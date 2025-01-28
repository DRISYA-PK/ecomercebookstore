//const { default: Swal } = require("sweetalert2");



function editAddress() {
    // Show the address form when the "Edit" button is clicked
    document.getElementById('addressForm').style.display = 'block';
}

function showAddressForm() {
    // Display the "Add Address" form
    document.getElementById('addressForm').style.display = 'block';
}




const addAddressBtn = document.getElementById('add-address-btn');
const formContainer = document.getElementById('form-containers');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');

let action = "add";
let addressId = "";
let couponselectedId = "no";


function editAddress(name, phone, address, pincode, post, city, state, addressid) {
    formContainer.style.display = 'block';
    addressId = addressid;
    addAddressBtn.style.visibility = "hidden";

    action = "update";
    document.getElementById("name").value = name;
    document.getElementById("phone").value = phone;
    document.getElementById("address").value = address;
    document.getElementById("pincode").value = pincode;


    document.getElementById("post").value = post;

    document.getElementById("city").value = city;

    document.getElementById("state").value = state.trim();
    saveBtn.textContent = "Update";
    addressId = addressid;



}


addAddressBtn.addEventListener('click', () => {
    formContainer.style.display = 'block';

    addAddressBtn.style.visibility = "hidden";
    saveBtn.textContent = "Save"
    action = "add";
    addressId = "no";


});

cancelBtn.addEventListener('click', () => {
    formContainer.style.display = 'none';
    addAddressBtn.style.visibility = "visible";
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("address").value = "";
    document.getElementById("pincode").value = "";


    document.getElementById("post").value = "";

    document.getElementById("city").value = "";

    document.getElementById("state").value = "";
});



document.getElementById("save-btn").addEventListener("click", function () {
    validation();
});

function validation() {
    // Clear all previous errors

    document.querySelectorAll(".error").forEach(error => error.textContent = "");

    let isValid = true;

    // Validate Name
    const name = document.getElementById("name").value.trim();
    if (!name) {
        document.getElementById("nameError").textContent = "Name is required.";
        isValid = false;
    }

    // Validate Phone
    const phone = document.getElementById("phone").value.trim();
    if (!/^\d{10}$/.test(phone)) {
        document.getElementById("phoneError").textContent = "Phone must be 10 digits.";
        isValid = false;
    }

    // Validate Address
    const address = document.getElementById("address").value.trim();
    if (address.length < 5) {
        document.getElementById("addressError").textContent = "Address must be at least 5 characters.";
        isValid = false;
    }

    // Validate Pincode
    const pincode = document.getElementById("pincode").value.trim();
    if (!/^\d{6}$/.test(pincode)) {
        document.getElementById("pincodeError").textContent = "Pincode must be 6 digits.";
        isValid = false;
    }

    // Validate Post
    const post = document.getElementById("post").value.trim();
    if (!post) {
        document.getElementById("postError").textContent = "Post is required.";
        isValid = false;
    }

    // Validate City
    const city = document.getElementById("city").value.trim();
    if (!city) {
        document.getElementById("cityError").textContent = "City is required.";
        isValid = false;
    }

    // Validate State
    const state = document.getElementById("state").value.trim();
    if (!state) {
        document.getElementById("stateError").textContent = "Please select a state.";
        isValid = false;
    }

    if (isValid) {
        // alert("Form submitted successfully!");
        // Perform form submission here (e.g., send data to the server)
        // alert(name,phone,address,pincode,post,city,state);
        // const addressId=0;

        submit(name, phone, address, pincode, post, city, state);
    }
}

const totalPrice = document.getElementById("totalPrices").textContent.trim();
const totalDiscount = document.getElementById("totalDiscount").textContent.trim();
let couponDiscount = document.getElementById("couponDiscount").textContent.trim();

const deliveryCharge = document.getElementById("deliveryCharge").textContent.trim();

const totalAmount = document.getElementById("totalAmount").textContent.trim();
let FinalAmount = document.getElementById("FinalAmount").textContent.trim();

async function submit(name = "", phone = "", address = "", pincode = "", post = "", city = "", state = "") {
    // alert("Form submitted successfully!,,,,,,,,,,,,,");
    try {
        // Swal.fire("correct");
        // alert(action, addressId)
        const response = await fetch(`/add-update-delete-addressdetails/${action}/${addressId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, phone: phone, address: address, pincode: pincode, post: post, city: city, state })
        });

        const result = await response.json();

        if (response.ok) {
            if (action === "add") {

                Swal.fire({
                    icon: "success", // Corrected spelling
                    title: "Adress Added",
                    showConfirmButton: false,
                    timer: 1500,
                }).then(() => {
                    redirectToPost('confirmaddress'); // Redirect to login page
                });


            }

            else {
                Swal.fire({
                    icon: "success", // Corrected spelling
                    title: "Adress Updated",
                    showConfirmButton: false,
                    timer: 1500,
                }).then(() => {
                    window.location.href = "/viewadddresdetails"; // Redirect to login page
                });
            }
        } else {
            Swal.fire(' fail');
        }
    } catch (error) {
        console.error('Upload failed', error);
        // Swal.fire('try again');
    }
}


function redirectToPost(url) {
    // Create a form element
    try {
        console.log('URL:', url);
        //  console.log('Params:', params);

        const params = {
            totalPrice: totalPrice,
            totalDiscount: totalDiscount,
            couponDiscount: couponDiscount,
            deliveryCharge: deliveryCharge,
            totalAmount: totalAmount,
        }
        const form1 = document.createElement('form');
        form1.method = 'POST';
        form1.action = `/${url}`;

        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = params[key];
                form1.appendChild(input);
            }
        }

        document.body.appendChild(form1);
        alert(params);
        form1.submit();

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

//-----------------------------------------------confirm payment-----------------------------------------------------------------------------------
function confirmPayment() {
    //checking the address selected
    const selectedAddress = document.querySelector('input[name="address"]:checked');

    if (selectedAddress) {

        const selectedPaymentOptions = document.querySelector('input[name="payment"]:checked');
        if (selectedPaymentOptions) {

            let value = selectedPaymentOptions.value;
            addressId = selectedAddress.value;
            FinalAmount = document.getElementById("FinalAmount").textContent.trim();
            if (value === 'online') {
                confirmPaymentAlert('online', addressId)
                //onlinePayment('online',addressId);
                //confirmPaymentAlert('online',selectedAddress.value.trim());
            }
            else if (value === "cod") {
                if(FinalAmount>1000)
                {
                    swal.fire("Cod not available for above 1000");
                    return
                }
                else
                {
                submitPayment('cod', addressId, "cod");
                }
            }
            else if (value === "wallets") {
                checkingWalletBalance('wallets', addressId);
            }


        }

        else {
            Swal.fire('No PAYMENT Option selected');
        }
    } else {
        Swal.fire('No address selected');
    }

}
async function checkingWalletBalance(type, addressId) {
    FinalAmount = document.getElementById("FinalAmount").textContent.trim();
    const response = await fetch(`/checkingwallet?amount=${FinalAmount}`, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json({});

    if (response.ok) {
        if (result.success) {
            submitPayment('wallets', addressId, 'wallets');
        } else {
            swal.fire(`wallet only have ${result.walletamt}`)
        }

    } else {
        Swal.fire(' fail');
    }

}



async function onlinePayment(method, addressId) {
    FinalAmount = document.getElementById("FinalAmount").textContent.trim();
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
                            // submitPayment(method,addressId)

                            //    swal.fire(data.paymentId);
                            //Swal.fire("oooooooooooooooooooooooook")
                            submitPayment(method, addressId, 'success');
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
                        onlinePayment('online', addressId);
                        //alert("ook")

                    }
                    else {
                        submitPayment(method, addressId, 'fail');
                        //window.location.href =
                    }
                });


                //window.location.reload(); // Reload on modal dismissal
            },
        },
    };

    const rzp = new Razorpay(options);
    rzp.open();

}



async function confirmPaymentAlert(method, addressId) {
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

            onlinePayment(method, addressId);
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve(), 5000);  // Simulate a delay (you can remove this)
            });
        },
    }).then((result) => {
        if (result.isConfirmed) {
            // Payment confirmed, proceed with payment logic
            //  console.log("Payment Confirmed");
            onlinePayment('online', addressId);

        } else {
            // Payment canceled
            console.log("Payment Canceled");
        }
    });


}

async function submitPayment(method, addressId, isPaymentSuccess) {

    try {
        // Swal.fire("correct");
        // alert(action, addressId)
        const response = await fetch(`/confirmPayment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                {
                    addressId: addressId,
                    totalPrice: totalPrice,
                    totalDiscount: totalDiscount,
                    couponDiscount: couponDiscount,
                    deliveryCharge: deliveryCharge,
                    totalAmount: totalAmount,
                    finalAmount: FinalAmount,
                    paymentType: method,
                    couponselectedId: couponselectedId,
                    isPaymentSuccess: isPaymentSuccess
                })
        });

        const result = await response.json({});

        if (response.ok) {
            const paymentId = result.paymentId;
            const amount = result.amount;
            const type = result.type;
            //paymentSuccessPage
            if (isPaymentSuccess === 'fail') {
                    window.location.href =  "/showhistory"
            }
            else if (paymentId) {
                window.location.href = `/paymentSuccessPage/paymentId/${amount}`;
            } else {
                let message = `successfully order placed amount:${amount}`
                if (type == "wallets") {
                    message = `successfully order placed from wallet amount:${amount}`
                }
                Swal.fire({
                    icon: "success", // Corrected spelling

                    title: message,
                    showConfirmButton: true,
                    timer: 5000,
                }).then(() => {
                    window.location.href = "/"

                })
            }

        } else {
            Swal.fire(' fail');
        }
    } catch (error) {
        console.error('Upload failed', error);
        // Swal.fire('try again');
    }

}

//confirm address
function applyCoupon() {
    const couponDropdown = document.getElementById("couponDropdown");
    const selectedValue = couponDropdown.value;
    const selectedOption = couponDropdown.options[couponDropdown.selectedIndex];

    couponselectedId = selectedOption.className;

    if (selectedValue && selectedValue != "NoAvailable") {

        Swal.fire({
            icon: "success",
            title: "Added!",
            text: `The coupon has been Added. ${selectedValue} Rupees`,
            confirmButtonText: "OK",
        }).then(() => {





            let total = document.getElementById("totalAmount").textContent;
            document.getElementById("couponDiscount").textContent = selectedValue;
            finalAmt = total - selectedValue;
            document.getElementById("FinalAmount").textContent = finalAmt;
            FinalAmount = document.getElementById("FinalAmount").textContent.trim();
            couponDiscount = document.getElementById("couponDiscount").textContent.trim();
        });



    } else {
        Swal.fire("please select an coupon")
    }
}

function clearCoupon() {
    Swal.fire({
        icon: "success",
        title: "Clear!",
        text: `The coupon has been cleared`,
        confirmButtonText: "OK",
    }).then(() => {


        const dropdown = document.getElementById("couponDropdown");
        dropdown.value = "NoAvailable";


        let total = document.getElementById("totalAmount").textContent;
        document.getElementById("couponDiscount").textContent = 0.00;
        finalAmt = total - 0;
        document.getElementById("FinalAmount").textContent = finalAmt;
        FinalAmount = document.getElementById("FinalAmount").textContent.trim();
        couponDiscount = document.getElementById("couponDiscount").textContent.trim();
        couponselectedId = 'no';
    });
}