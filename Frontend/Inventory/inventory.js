document.addEventListener('DOMContentLoaded', (event) => {
    const statusModal = document.getElementById("statusModal");
    const closeModalBtn = document.querySelector(".close-btn-new"); 
    const inventoryTableBody = document.getElementById("inventoryTableBody");
    let currentRow = null; // To hold the table row being edited

    // --- Utility Function to Determine Status ---
    function getStatusData(currentStock, minStock) {
        if (currentStock <= 0) {
            return { text: "Out of Stock", class: "out-stock" };
        } else if (currentStock < minStock) {
            return { text: "Low Stock", class: "low-stock" };
        } else {
            return { text: "In Stock", class: "in-stock" };
        }
    }

    // --- Modal Open/Close Logic ---
    const closeModal = () => {
        statusModal.style.display = "none";
        document.getElementById("statusForm").reset();
        currentRow = null;
    };

    closeModalBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === statusModal) {
            closeModal();
        }
    });

    // --- Status Button Click Handler (Opens Modal) ---
    inventoryTableBody.addEventListener('click', (e) => {
        const button = e.target.closest('.status-btn');
        if (!button) return;

        const row = button.closest('tr');
        currentRow = row;
        
        const productId = row.querySelector('td:first-child').textContent;
        const currentStock = row.querySelector('td[data-stock]').getAttribute('data-stock');
        const minStock = row.getAttribute('data-min-stock');

        // Set modal data
        document.getElementById('modalProductId').textContent = `Update Stock for ${productId}`;
        document.getElementById('currentProductId').value = productId;
        document.getElementById('currentStockDisplay').value = currentStock;
        document.getElementById('currentMinStock').value = minStock;
        document.getElementById('stockAdjustment').focus();

        statusModal.style.display = "block";
    });


    // --- Form Submission (Stock Update Logic) ---
    document.getElementById("statusForm").addEventListener("submit", function(e) {
        e.preventDefault();

        if (!currentRow) return;

        const productId = document.getElementById('currentProductId').value;
        const currentStock = parseInt(document.getElementById('currentStockDisplay').value);
        const minStock = parseInt(document.getElementById('currentMinStock').value);
        const adjustment = parseInt(document.getElementById('stockAdjustment').value);

        if (isNaN(adjustment)) {
            alert("Please enter a valid number for stock adjustment.");
            return;
        }

        const newStock = currentStock + adjustment;
        const statusButton = currentRow.querySelector('.status-btn');
        const stockCell = currentRow.querySelector('td[data-stock]');
        
        // 1. Update the Stock value in the table
        stockCell.textContent = newStock;
        stockCell.setAttribute('data-stock', newStock);

        // 2. Determine the new status automatically
        const newStatus = getStatusData(newStock, minStock);

        // 3. Update the Status Button's appearance and data
        statusButton.textContent = newStatus.text;
        statusButton.setAttribute('data-status-code', newStatus.class);
        
        // Remove old status classes and add the new one
        statusButton.classList.remove('in-stock', 'low-stock', 'out-stock');
        statusButton.classList.add(newStatus.class);

        closeModal();
        alert(`Stock for ${productId} updated successfully. New Stock: ${newStock}. Status: ${newStatus.text}`);
    });
});