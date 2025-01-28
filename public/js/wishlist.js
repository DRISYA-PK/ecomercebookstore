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
        const response = await fetch(`/deleteitemfromwishlist/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify({  })
        });
        if (response.ok) {
            document.getElementById(`div-${productId}`).remove();
        }
        else {

        }
        

    } catch (error) {

    }
}


   //change profile----------------------------------------------------------------------------------------------------------
   function triggerFileInput() {
    document.getElementById("fileInput").click();
}

async function changeProfilePhoto() {
    const fileInput = document.getElementById("fileInput");
    const profilePhoto = document.getElementById("profilePhoto");

    // Ensure a file is selected
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            profilePhoto.src = e.target.result;

        };
        const formData = new FormData();
        formData.append('profilePhoto', file);

        try {
            const response = await fetch('/uploadprofilephoto', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                // Read the file as a Data URL


                reader.readAsDataURL(file);
                Swal.fire('updated');
            } else {
                Swal.fire('updated fail');
            }
        } catch (error) {
            console.error('Upload failed', error);
            // Swal.fire('try again');
        }



    }

}
//-----------------------------------------------------------------------------------------------------------------------------------------------------

