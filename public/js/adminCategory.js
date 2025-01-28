function handleFormSubmit(event) {
    //  event.preventDefault();
      if (!validateForm()) {
          return;
      }
      const name=document.getElementsByName("name")[0].value;
      const description=document.getElementById("descriptionId").value;
      
      const categoryOffer=document.getElementById("categoryOffer").value;
      fetch('/admin/addCategory',{
         method: 'POST',
          headers:{
              'content-type':'application/json'
          },
          body:JSON.stringify({ name, description, categoryOffer}) 

      })
      .then(response=>{
          if(!response.ok)
      {
          return response.json().then(err =>{
              throw new Error(err.Error);
          })
      }
      return response.json();
      }).then(data=>{
          location.reload();
      })
      .catch(error=>{
        
              Swal.fire({
                  icon:"error",
                  title:"Oops",
                  text:"Category already exists"
              })
        
      })

  }



  function validateForm() {
      clearErrorMessages();
      const name = document.getElementsByName("name")[0].value.trim();
      const description = document.getElementById("descriptionId").value.trim();
      const categoryOffer=document.getElementById("categoryOffer").value;
     // alert(categoryOffer);
      isValid = true;


      if (name == "") {
          displayErrorMessage("name-error", "please enter a name");
          isValid = false
      } else if (!/^[a-zA-Z\s\$]+$/.test(name)) {
displayErrorMessage("name-error", "Category name should contain only alphabetic characters and spaces");
isValid = false;
}
      else if (name[0] !== name[0].toUpperCase()) {
displayErrorMessage("name-error", "Category name should start with a capital letter");
isValid = false;
}
      else if (description === "") {
          displayErrorMessage("description-error", "Please enter a description")
          isValid = false;
      }
      return isValid;
  }


  function displayErrorMessage(elementId, message) {
      var errorElement = document.getElementById(elementId);
      errorElement.innerText = message;
      errorElement.style.display = "block";
  }
  function clearErrorMessages() {
      const errorElements = document.getElementsByClassName("error-message");
      Array.from(errorElements).forEach((element) => {
          element.innerText = "";
          element.style.display = "none";
      });
  }


  function confirmDelete(categoryId,message) {
Swal.fire({
  title: 'Are you sure?',
  text: `${message}`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes, !',
  cancelButtonText: 'Cancel'
}).then((result) => {
  if (result.isConfirmed) {
      document.getElementById(`deleteForm-${categoryId}`).submit();
  }
});
}