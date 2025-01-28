
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


  // Function to change the main image when a small image is clicked
  function changeMainImage(imagePath) {
    document.getElementById("main-product-image").src = '/uploads/re-image/' + imagePath;
  }




  const zoomContainer = document.querySelector('.zoom-container');
const mainImage = document.querySelector('#main-product-image');

let isDragging = false;
let startX, startY, currentX = 0, currentY = 0, scale = 1;

// Mouse events
zoomContainer.addEventListener('mousedown', (e) => {
isDragging = true;
startX = e.pageX - currentX;
startY = e.pageY - currentY;
zoomContainer.style.cursor = "grabbing";
});

zoomContainer.addEventListener('mousemove', (e) => {
if (isDragging) {
  currentX = e.pageX - startX;
  currentY = e.pageY - startY;
  mainImage.style.transform = `scale(${scale}) translate(${currentX}px, ${currentY}px)`;
}
});

zoomContainer.addEventListener('mouseup', () => {
isDragging = false;
zoomContainer.style.cursor = "grab";
});

// Zoom functionality
zoomContainer.addEventListener('wheel', (e) => {
e.preventDefault();
const zoomStep = 0.1; // Adjust zoom speed
if (e.deltaY < 0) {
  scale = Math.min(scale + zoomStep, 3); // Maximum zoom level
} else {
  scale = Math.max(scale - zoomStep, 1); // Minimum zoom level
}
mainImage.style.transform = `scale(${scale}) translate(${currentX}px, ${currentY}px)`;
});





/*import Panzoom from "@panzoom/panzoom";

const zoomContainer = document.querySelector('.zoom-container');
const panzoom = Panzoom(zoomContainer, { maxScale: 3, minScale: 1 });

zoomContainer.addEventListener('wheel', panzoom.zoomWithWheel);*/




