
//  let skip = 4;  // Start from the next 4 products
const viewMoreButton = document.getElementById('view-more-btn');

viewMoreButton.addEventListener('click', function () {
    fetch(`/loadMoreNewArrival?limit=8`)
        .then(response => response.json())
        .then(data => {
            const products = data.products;
            const productList = document.getElementById('product-list');

            // Append new products to the existing list
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.classList.add('col-md-2');
                productDiv.innerHTML = `
                    <div class="product-item">
                        <figure class="product-style">
                            <a href="/productDetails?id=${product._id}">
                                <img src="uploads/re-image/${product.coverImage[0]}" alt="${product.name}" class="product-img">
                            </a>
                            ${
                              product.stock > 0
                                ? `<button type="button" class="add-to-cart" onclick="addToCart('${product._id}')">Add to Cart</button>`
                                : `<button type="button" class="add-to-wishlist" onclick="addToWishList('${product._id}')">Add to Wishlist <p>Not Available</p></button>`
                            }
                        </figure>
                        <figcaption>
                            <img src="uploads/re-image/wishlist.jpg" alt="${product.name}" class="wishlist-icon" style="width: 15px; height: 15px;" onclick="addToWishList('${product._id}')">
                            <h3>${product.name}</h3>
                            <span>${product.author || ''}</span>
                            <div class="item-price">₹${product.salePrice}</div>
                        </figcaption>
                    </div>
                `;
                productList.appendChild(productDiv);
            });
            
            viewMoreButton.style.visibility = "hidden"
            // Update skip value for next request.visi
            // skip += 4;
        })
        .catch(error => console.error('Error fetching more products:', error));
});


//-----------------Addede to cart------------------------------------------------------------------------
async function addToCart(productId) {
    try {
        // Swal.fire("correct");

        const response = await fetch(`/addedetocart/${productId}`, {

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
//------------------------------------add to wish list-------------------------------------------------------------------
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

                  //  Swal.fire(result.message);
                    window.location.href = "/shopePageView";
                } else {
                    window.location.href = "/login";
                }

            }
        }
    } catch (error) {
        console.error('Upload failed', error);
       
    }


}


