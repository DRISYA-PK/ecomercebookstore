
//---------------------------------item remove------------------------------------------------------------------------------------------
/*document.querySelectorAll('.remove').forEach(button => {
    button.addEventListener('click', function() {
        const cartItem = this.closest('.cart-item');
        cartItem.remove();
      //  updatePriceDetails();
    });
});*/




function removeItem(productId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "delete the item",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes,  it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // document.getElementById(`deleteForm-${categoryId}`).submit();
            deleteItem(productId);
            //
        }
    });
}

async function deleteItem(productId) {
    try {
        const response = await fetch(`/deleteitemfromcart/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify({  })
        });
        if (response.ok) {
            document.getElementById(`div-${productId}`).remove();
        }
        else {

        }
        calculatePriceDetails();

    } catch (error) {

    }
}

//------------------------------------------addqty- sub Qqty-------------------------------------------------------------------------------------
async function changeQty(status, id) {
    quantityDisplay = document.getElementById(id);
    let quantity = parseInt(quantityDisplay.textContent);
    if (status === "add") {
      let stock1= await checkingStock(id)
      if(stock1<(quantity+1))
      {
        Swal.fire(`maximum ${stock1} stock available`)
      }
       else if (quantity < 10) {
            quantity++;
        }
        else{
            Swal.fire(`maximum 10 books in 1 purchase`)
        }
        //alert("maximum qty is 10");
    }
    else {
        if (quantity > 1) {
            quantity--;
        }

    }
    quantityDisplay.textContent = quantity;
    calculatePriceDetails();
}
//-------------------------------------t-----------------------------
document.querySelectorAll('.save-later').forEach(button => {
    button.addEventListener('click', function () {
        alert('Item saved for later.');
    });
});

//-----------------------------------------------------------------------------------

function calculatePriceDetails() {
    let totalRegularPrice = 0;
    let totalSalePrice = 0;
    let totalDiscount = 0;
   // Example coupon discount
    let platformFee = 0; // Example platform fee
    let deliveryCharge = 80; // Example delivery charge

    // Get all cart items from the DOM j                                             
    const cartItems = document.querySelectorAll('.cart-item');

    // Loop through each cart item to calculate prices
    cartItems.forEach(item => {
        const Regularprice = parseFloat(item.querySelector('.regular-price').textContent.replace('$', '').trim());
        const Saleprice = parseFloat(item.querySelector('.sale-price').textContent.replace('$', '').trim());
        const quantity = parseInt(item.querySelector('.quantity span').textContent);
        const discount = parseFloat(item.querySelector('.discount') ? item.querySelector('.discount').textContent.replace('% off', '').trim() : 0);
        if (quantity > 0) {
            // Calculate total price for the item (sale price * quantity)
            let itemTotalRegularPrice = Regularprice * quantity;
            totalRegularPrice += itemTotalRegularPrice;

            let itemTotalSalePrice = Saleprice * quantity;
            totalSalePrice += itemTotalSalePrice;

            // Calculate discount on the item (item price * discount percentage)

        }
    });


    totalDiscount = totalRegularPrice - totalSalePrice;
    deliveryCharge = (totalSalePrice > 500) ? 0 : 100;
    let totalAmount = totalSalePrice + deliveryCharge;// totalPrice - totalDiscount - couponDiscount ;
    let totalSavings = totalDiscount;// totalPrice - (totalAmount-deliveryCharge);


    // Update the price details section in the DOM
    document.querySelector('.price-details .total-price').textContent = `₹${totalRegularPrice.toFixed(2)}`;
    document.querySelector('.price-details .total-discount').textContent = `- ₹${totalDiscount.toFixed(2)}`;
    // document.querySelector('.price-details .platform-fee').textContent = `₹${platformFee.toFixed(2)}`;

    document.querySelector('.price-details .delivery-charge').textContent = `₹${deliveryCharge.toFixed(2)}`;
    document.querySelector('.price-details .total-amount').textContent = `₹${totalAmount.toFixed(2)}`;
    document.querySelector('.price-details .total-savings').textContent = `You will save ₹${totalSavings.toFixed(2)} on this order`;




    //hiden values


    document.getElementById('hiddenPrice').value = totalRegularPrice;
    document.getElementById('hiddenDiscount').value = totalDiscount;
    document.getElementById('hiddenDeliveryCharge').value = deliveryCharge;
    document.getElementById('hiddenTotalAmount').value = totalAmount;
}

// Call this function whenever the cart is updated (product added, removed, or quantity changed)
calculatePriceDetails();
//-----------------------------------------checking cart for order-----------------------------------------
async function checkOrder() {

    let isValid = true;
    const cartItems = document.querySelectorAll('.cart-item');

    for (const item of cartItems) { // Use for...of for async/await
        const itemId = item.querySelector('.item-id').textContent.trim();
        const itemName = item.querySelector('.item-name').textContent.trim();
        const quantity = parseInt(item.querySelector('.quantity span').textContent);

        const itemCurrentStock = await checkingStock(itemId); // Await the stock check

        if (itemCurrentStock < 1) {
            alertmessage(`book : ${itemName}  not available ?? remove `, itemId, "noStock");
            //isValid=false;
            return false;
        }
        else if (itemCurrentStock < quantity) {
            alertmessage(`book : ${itemName} available only ${itemCurrentStock} quantity`, "gtStock")
            return false;
        }
        else {
            //  await updateQtyInOrder();
            isValid = true;
        }

    }
    return isValid;
}
document.getElementById("submitform").addEventListener("submit", async function (e) {
    e.preventDefault();
    const isValid = await checkOrder();
    const isUpdated=await updateQtyInCart(); // Await the result of checkOrder
    if (isValid && isUpdated) {

        this.submit()
    }; // Prevent submission if not valid
});

async function updateQtyInCart() {
    try {
        let stock = 0;
        const cartItems = document.querySelectorAll('.cart-item');
       // const itemsInCart=[{}];
       const itemsInCart = []; // Array to hold the items

for (const item of cartItems) { // Use for...of for iteration
    const itemId = item.querySelector('.item-id').textContent.trim();
    const quantity = parseInt(item.querySelector('.quantity span').textContent);

    // Create an object for each item
    const itemObject = {
        itemId: itemId,
        quantity: quantity,
    };

    // Add the object to the array
    itemsInCart.push(itemObject);
}



        const response = await fetch('/updateQtyInCart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({itemsInCart:itemsInCart})
        });

        if (response.ok) {
            const data = await response.json();
            return true;
                  // Default to 0 if inStock is undefined
        } else {
            console.error('Failed to fetch stock status');
            return false;
        }

        return false;
    } catch (error) {
        console.error('Error checking stock:', error);
        return false; // Default to 0 in case of error
    }
}













function alertmessage(message, productid, status) {
    Swal.fire({
        title: message,
        text: "",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes,  it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            if (status === "noStock") {
                deleteItem(productid);
            }

            calculatePriceDetails();
        }
    });
}


async function checkingStock(itemId) {
    try {
        let stock = 0;
        const response = await fetch(`/checkingstock/${itemId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            const data = await response.json();
            stock = data.inStock || 0; // Default to 0 if inStock is undefined
        } else {
            console.error('Failed to fetch stock status');
        }

        return stock;
    } catch (error) {
        console.error('Error checking stock:', error);
        return 0; // Default to 0 in case of error
    }
}
async function updateQtyInOrder() {
    try {
        //let stock = 0;
        const response = await fetch(`/updaetQtyInCard/${itemId}`, {
            method: 'POST',
            headers: JSON.stringify({ 'Content-Type': 'application/json' }),
        });

        if (response.ok) {
            // const data = await response.json();
            // stock = data.inStock || 0; // Default to 0 if inStock is undefined
        } else {
            console.error('Failed to fetch stock status');
        }

        //return stock;
    } catch (error) {
        console.error('Error checking stock:', error);
        return 0; // Default to 0 in case of error
    }
}




//-----added to cart
async function addToWishList(productId) {
    try {
        // Swal.fire("correct");

        const response = await fetch(`/addedetowishlist/${productId}`, {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: productId })
        });

        const result = await response.json();
        if (result) {
            if (response.redirected) {
                // Redirect the user to the provided URL
                window.location.href = "/login";
            } else {
                if (response.ok) {

                    Swal.fire(' addeded');
                    deleteItem(productId)

                } else {
                    window.location.href = "/login";
                }

            }
        }
    } catch (error) {
        console.error('Upload failed', error);
        Swal.fire('try again');
    }


}
