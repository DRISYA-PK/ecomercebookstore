        // JavaScript to handle the combobox selection
        document.getElementById('selection').addEventListener('change', function () {
            const value = this.value;

            // Hide all sections
            document.querySelectorAll('.section').forEach(section => {
                section.style.display = 'none';
            });

            // Show the selected section
            document.getElementById(`${value}-section`).style.display = 'block';
        });