document.addEventListener('DOMContentLoaded', (event) => {
    // Modal open/close
    const modal = document.getElementById("productModal");
    const openModalBtn = document.querySelector(".add-product-btn"); 
    const closeModalBtn = document.querySelector(".close-btn"); 

    // Open modal
    openModalBtn.addEventListener('click', () => {
        modal.style.display = "block";
    });

    // Close modal when 'x' is clicked
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = "none";
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Handle form submission
    document.getElementById("productForm").addEventListener("submit", function(e) {
        e.preventDefault();

        // Get input values from the form
        const name = document.getElementById("productName").value;
        const category = document.getElementById("category").value;
        const price = document.getElementById("price").value;
        const stock = parseInt(document.getElementById("stock").value);
        const minStock = parseInt(document.getElementById("minStock").value);

        // Get the table body
        const table = document.querySelector(".inventory-table tbody");
        const row = document.createElement("tr");

        // Status calculation
        let statusText = "";
        let statusClass = "";
        if (stock <= 0) {
            statusText = "Out of Stock";
            statusClass = "out-stock";
        } else if (stock < minStock) {
            statusText = "Low Stock";
            statusClass = "low-stock";
        } else {
            statusText = "In Stock";
            statusClass = "in-stock";
        }

        // Generate a simple, unique ID for the new product
        const newProductId = `#${Math.floor(Math.random() * 1000) + 100}`;

        // Create the new table row's content
        row.innerHTML = `
            <td>${newProductId}</td>
            <td>${name}</td>
            <td>${category}</td>
            <td>${stock}</td>
            <td>₹${price}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
        `;

        // Add the new row to the table
        table.appendChild(row);

        // Reset the form and close the modal
        this.reset();
        modal.style.display = "none";
    });
});