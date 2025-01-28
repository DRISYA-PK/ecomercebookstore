document.getElementById('bannerImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" class="image-preview" alt="Banner Preview">
            `;
        };
        
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
});