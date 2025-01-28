
document.getElementsByClassName("homePageView")[0].style.color = "gray";
document.getElementsByClassName("shopePageView")[0].style.color = "orange"


//-----------------------category selected-----------------------------

const categoryDropdown = document.getElementById("category");
let categorySelected=categoryDropdown.value;

 categoryDropdown.addEventListener("change", () => {
     categorySelected = categoryDropdown.value; 
  });


  //---------------------sort by selected-----------------------------------------
  const sortDropdown = document.getElementById("sort");
let sortSelected=sortDropdown.value;


sortDropdown.addEventListener("change", () => {
    sortSelected = sortDropdown.value; 
    
 });
 //--------------------------sort by language---------------------------------------------
 const languageDropdown = document.getElementById("language");
 let languageSelected=languageDropdown.value;
 
 
 languageDropdown.addEventListener("change", () => {
    languageSelected = languageDropdown.value; 
 });


//--------------------------enable rating checkbox----------------------------------------


const ratingDropdown = document.getElementById("rating");
let ratingSelected=ratingDropdown.value.trim();


ratingDropdown.addEventListener("change", () => {
    ratingSelected = ratingDropdown.value; 
});
  ///-------------------------------------------------------------------------------------
  async function filterItem() {
    try {
        const response = await fetch(`/filterInShopePage?categorySelected=${categorySelected}&sortSelected=${sortSelected}&languageSelected=${languageSelected}&ratingSelected=${ratingSelected}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();  // Parse the JSON response
            if (data.message === "success") {
                const products = data.products;  // Extract products from the response
                // Remove existing product list and add the filtered products
                const productListContainer = document.getElementById('product-list');
                const row = document.getElementById('remove');  // Find the row to remove

                // Clear the existing products
                row.remove();
                //row.innerHTML = '';

                // Add new items to the product list
                addItem(products);
            }
        } else {
            console.error('Failed to fetch products');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function addItem(products) {
    // Get the container where products will be appended
    const productList = document.getElementById('product-list');
    const rawDiv = document.createElement('div');
    rawDiv.classList.add('row');
    rawDiv.id = "remove";  // Set the row's id to 'remove' to target for future removal

    // Loop through the products array and create HTML elements
    products.forEach(product => {
        // Create a new div for each product
        const productDiv = document.createElement('div');
        productDiv.classList.add('col-md-2');

        // Create the product item container
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        

        // Create the figure for the product image and button
        const figure = document.createElement('figure');
        figure.classList.add('product-style');

        // Create the product link with the image
        const productLink = document.createElement('a');
        productLink.href = `/productDetails?id=${product._id}`;

        const img = document.createElement('img');
        img.src = `uploads/re-image/${product.coverImage[0]}`;
        img.alt = product.name;
        img.classList.add('product-item');
      
        // Append the image to the link and the link to the figure
        productLink.appendChild(img);
        figure.appendChild(productLink);

        // Create and append the "Add to Cart" button
        if(product.stock>0)
        {
        const addToCartButton = document.createElement('button');
        addToCartButton.type = 'button';
        addToCartButton.classList.add('add-to-cart');
        addToCartButton.textContent = 'Add to Cart';
        addToCartButton.onclick = function() {
            addToCart(product._id);  // Call the addToCart function with product ID
        };
        figure.appendChild(addToCartButton);

        // Append the figure to the product item
      
        }
        else
        {
            const addToWishlistButton = document.createElement('button');
        addToWishlistButton.type = 'button';
        addToWishlistButton.classList.add('add-to-Wishlist');
        addToWishlistButton.innerHTML = 'Add to Wishlist <p>Not Available</p>';
        addToWishlistButton.onclick = function () {
            addToWishList(product._id); // Call the addToWishList function with product ID
        };
        figure.appendChild(addToWishlistButton);
    
            // Append the figure to the product item
         
        }
        productItem.appendChild(figure);
        // Create and append the product name, author, prices, etc.
        const figcaption = document.createElement('figcaption');

        const wishlistIcon = document.createElement('img');
    wishlistIcon.src = 'uploads/re-image/wishlist.jpg';
    wishlistIcon.alt = product.name;
    wishlistIcon.classList.add('wishlist-icon');
    wishlistIcon.style.cssText = 'width: 15px; height: 15px;';
    wishlistIcon.onclick = function () {
        addToWishList(product._id); // Call the addToWishList function with product ID
    };
    figcaption.appendChild(wishlistIcon);

    // Add product name
    const productName = document.createElement('h3');
    productName.textContent = product.name;
    figcaption.appendChild(productName);

    // Add product author
    const productAuthor = document.createElement('span');
    productAuthor.textContent = product.author || '';
    figcaption.appendChild(productAuthor);

    // Add sale price
    const salePrice = document.createElement('div');
    salePrice.classList.add('item-price');
    salePrice.textContent = `₹${product.salePrice}`;
    figcaption.appendChild(salePrice);


        // Append these elements to the figcaption
        figcaption.appendChild(productName);
        figcaption.appendChild(productAuthor);
     
        figcaption.appendChild(salePrice);

        // Append figcaption to product item
        productItem.appendChild(figcaption);

        // Append the product item to the product div
        productDiv.appendChild(productItem);

        // Finally, append the product div to the row
        rawDiv.appendChild(productDiv);
    });

    // Append the new row to the product list container
    productList.appendChild(rawDiv);
}



  async function fetchSuggestions(name) {

    try {
      const response = await fetch(`/shopePageView?name=${name}&isRender=${false}`);
    //  const suggestions = await response.json();
  
      if (response.ok) {
        const data = await response.json();  // Parse the JSON response
        if (data.message === "success") {
            const products = data.products;  // Extract products from the response
            // Remove existing product list and add the filtered products
            const productListContainer = document.getElementById('product-list');
            const row = document.getElementById('remove');  // Find the row to remove

            // Clear the existing products
            row.remove();
            //row.innerHTML = '';

            // Add new items to the product list
            addItem(products);
        }
    } else {
        console.error('Failed to fetch products');
    }
     
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }
 
  //document.addEventListener('DOMContentLoaded', function() {
    const searchField = document.getElementById('books-search');
    if (searchField) {
    

        searchField.addEventListener('keyup', (event) => {
            const name = event.target.value;
            fetchSuggestions(name);
          });
        
    } else {
        console.error("Element with ID 'myButton' not found.");
    }

 