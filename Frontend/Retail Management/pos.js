// --- Modal Control Functions ---
function openModal(title, contentHTML) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = contentHTML;
    document.getElementById('actionModal').classList.add('active');
}

function closeModal() {
    document.getElementById('actionModal').classList.remove('active');
}

// --- Content Definitions (HTML templates for each action) ---

// 1. Add New Product (Based on provided screenshot)
const addProductContent = `
    <p style="color:#7f8c8d; margin-bottom: 20px;">Enter product details to add to inventory</p>
    <div class="form-group">
        <label for="addProductName">Product Name</label>
        <input type="text" id="addProductName" class="modal-input-full" placeholder="Enter product name">
    </div>
    <div class="form-group">
        <label for="addProductCategory">Category</label>
        <input type="text" id="addProductCategory" class="modal-input-full" placeholder="Enter product category">
    </div>
    <div class="input-row">
        <div class="form-group">
            <label for="addProductPrice">Price (₹)</label>
            <input type="number" id="addProductPrice" value="0" min="0">
        </div>
        <div class="form-group">
            <label for="addProductStock">Stock</label>
            <input type="number" id="addProductStock" value="0" min="0">
        </div>
        <div class="form-group">
            <label for="addProductMinStock">Min Stock</label>
            <input type="number" id="addProductMinStock" value="5" min="0">
        </div>
    </div>
    <button class="modal-submit-btn" onclick="alert('Adding Product: ' + document.getElementById('addProductName').value); closeModal();">Add Product</button>
`;

// 2. Remove Product
const removeProductContent = `
    <p style="color:#e74c3c; margin-bottom: 20px;">Permanently delete a product entry from the system.</p>
    <div class="form-group">
        <label for="removeProductId">Product ID</label>
        <input type="text" id="removeProductId" class="modal-input-full" placeholder="Enter ID (e.g., 201)">
    </div>
    <div class="form-group">
        <label for="removeProductName">Product Name (Confirmation)</label>
        <input type="text" id="removeProductName" class="modal-input-full" placeholder="Confirm name (optional)">
    </div>
    <button class="modal-submit-btn" style="background-color: #e74c3c;" onclick="alert('Removing Product ID: ' + document.getElementById('removeProductId').value); closeModal();">Confirm Removal</button>
`;

// 3. Change Price
const changePriceContent = `
    <p style="color:#f39c12; margin-bottom: 20px;">Update the retail price for an existing product.</p>
    <div class="form-group">
        <label for="priceChangeId">Product ID</label>
        <input type="text" id="priceChangeId" class="modal-input-full" placeholder="Enter product ID">
    </div>
    <div class="input-row">
        <div class="form-group">
            <label for="oldPrice">Current Price (₹)</label>
            <input type="text" id="oldPrice" value="Fetching..." disabled>
        </div>
        <div class="form-group">
            <label for="newPrice">New Price (₹)</label>
            <input type="number" id="newPrice" value="0" min="0">
        </div>
    </div>
    <button class="modal-submit-btn" onclick="alert('Price Change for ID: ' + document.getElementById('priceChangeId').value + ' to ₹' + document.getElementById('newPrice').value); closeModal();">Update Price</button>
`;

// 4. Stock Update
const stockUpdateContent = `
    <p style="color:#3498db; margin-bottom: 20px;">Record a new stock delivery or adjustment.</p>
    <div class="form-group">
        <label for="stockUpdateId">Product ID</label>
        <input type="text" id="stockUpdateId" class="modal-input-full" placeholder="Enter product ID">
    </div>
    <div class="input-row">
        <div class="form-group">
            <label for="currentStock">Current Stock</label>
            <input type="text" id="currentStock" value="Fetching..." disabled>
        </div>
        <div class="form-group">
            <label for="quantityReceived">Quantity Received</label>
            <input type="number" id="quantityReceived" value="10" min="1">
        </div>
    </div>
    <button class="modal-submit-btn" onclick="alert('Stock Update for ID: ' + document.getElementById('stockUpdateId').value + '. Quantity added: ' + document.getElementById('quantityReceived').value); closeModal();">Apply Stock</button>
`;

// 5. Product Hold
const productHoldContent = `
    <p style="color:#9b59b6; margin-bottom: 20px;">Reserve a product for a specific customer or pending transaction.</p>
    <div class="form-group">
        <label for="holdProductId">Product ID</label>
        <input type="text" id="holdProductId" class="modal-input-full" placeholder="Enter product ID">
    </div>
    <div class="form-group">
        <label for="customerName">Customer Name/Reference</label>
        <input type="text" id="customerName" class="modal-input-full" placeholder="Enter customer name">
    </div>
    <div class="form-group">
        <label for="holdQuantity">Quantity to Hold</label>
        <input type="number" id="holdQuantity" value="1" min="1">
    </div>
    <button class="modal-submit-btn" onclick="alert('Product Hold for ID: ' + document.getElementById('holdProductId').value + '. Customer: ' + document.getElementById('customerName').value); closeModal();">Place Hold</button>
`;


document.addEventListener('DOMContentLoaded', function() {
    
    // Close modal when clicking anywhere on the modal overlay (outside the content)
    document.getElementById('actionModal').addEventListener('click', function(e) {
        if (e.target.id === 'actionModal') {
            closeModal();
        }
    });

    // --- Search Functionality (Minimum 5 characters required) ---
    const searchInput = document.getElementById('productSearch');
    const tableBody = document.getElementById('inventoryTableBody');
    const rows = tableBody ? tableBody.getElementsByTagName('tr') : [];
    
    function filterTable() {
        const filter = searchInput.value.toLowerCase(); 
        
        // If text is too short (1-4 characters) but not empty, show all rows and exit
        if (filter.length < 5 && filter.length !== 0) {
            for (let i = 0; i < rows.length; i++) {
                rows[i].style.display = ""; 
            }
            return; 
        }

        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let cells = row.getElementsByTagName('td');
            let found = false;

            for (let j = 0; j < cells.length; j++) {
                let cell = cells[j];
                if (cell) {
                    if (cell.textContent.toLowerCase().indexOf(filter) > -1) {
                        found = true;
                        break; 
                    }
                }
            }

            if (found) {
                row.style.display = ""; 
            } else {
                row.style.display = "none"; 
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', filterTable);
    }
    
    
    // --- Card Click Functionality (Opens Modals) ---

    document.getElementById('addProductCard').addEventListener('click', function() {
        openModal('Add New Product', addProductContent);
    });

    document.getElementById('removeProductCard').addEventListener('click', function() {
        openModal('Remove Product', removeProductContent);
    });

    document.getElementById('changePriceCard').addEventListener('click', function() {
        openModal('Change Price', changePriceContent);
    });

    document.getElementById('updateStockCard').addEventListener('click', function() {
        openModal('Stock Update', stockUpdateContent);
    });
    
    document.getElementById('productHoldCard').addEventListener('click', function() {
        openModal('Product Hold', productHoldContent);
    });
});