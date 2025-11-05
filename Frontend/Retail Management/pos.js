// =============================
// Retail POS Management Script
// =============================

const API_BASE = "http://127.0.0.1:8000/api";
let allProducts = []; // Global for filtering and refresh

// --- Modal Control ---
function openModal(title, contentHTML) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = contentHTML;
    document.getElementById('actionModal').classList.add('active');
}

function closeModal() {
    document.getElementById('actionModal').classList.remove('active');
}

// --- Content Definitions ---
const addProductContent = `
    <p style="color:#7f8c8d; margin-bottom: 20px;">Fill product details below to add to inventory.</p>

    <div class="form-group">
        <label for="addProductId">Product ID (optional)</label>
        <input type="text" id="addProductId" class="modal-input-full" placeholder="Leave blank for auto ID">
    </div>

    <div class="form-group">
        <label for="addProductName">Product Name</label>
        <input type="text" id="addProductName" class="modal-input-full" placeholder="Enter product name" required>
    </div>

    <div class="form-group">
        <label for="addProductCategory">Category</label>
        <input type="text" id="addProductCategory" class="modal-input-full" placeholder="Enter category" required>
    </div>

    <div class="form-group">
        <label for="addProductSupplier">Supplier</label>
        <input type="text" id="addProductSupplier" class="modal-input-full" placeholder="Enter supplier name (optional)">
    </div>

    <div class="input-row">
        <div class="form-group">
            <label for="addProductPrice">Price (₹)</label>
            <input type="number" id="addProductPrice" value="0" min="0" step="0.01">
        </div>

        <div class="form-group">
            <label for="addProductStock">Stock</label>
            <input type="number" id="addProductStock" value="10" min="10">
        </div>
    </div>

    <button class="modal-submit-btn" id="confirmAddProductBtn">Add Product</button>
`;

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

const productHoldContent = `
    <div class="form-group">
        <label for="holdProductId">Product ID</label>
        <input type="text" id="holdProductId" class="modal-input-full" placeholder="Enter product ID">
    </div>
    <div class="form-group">
        <label for="holdQuantity">Quantity to Hold</label>
        <input type="number" id="holdQuantity" value="1" min="1">
    </div>
    <div class="form-group">
        <label for="unholdQuantity">Quantity to Unhold</label>
        <input type="number" id="unholdQuantity" value="1" min="1">
    </div>
    <button class="modal-submit-btn" onclick="alert('Product Hold for ID: ' + document.getElementById('holdProductId').value); closeModal();">Place Hold</button>
`;

// =============================
// GLOBAL TABLE FUNCTIONS
// =============================

async function loadPosProducts() {
    const tableBody = document.getElementById('inventoryTableBody');
    try {
        const response = await fetch(`${API_BASE}/pos_products`);
        if (!response.ok) throw new Error("Failed to fetch product data");

        const data = await response.json();
        allProducts = data.products || [];

        allProducts.sort((a, b) => {
            const idA = parseInt(a.product_id.replace(/\D/g, "")) || 0;
            const idB = parseInt(b.product_id.replace(/\D/g, "")) || 0;
            return idA - idB;
        });

        renderTable(allProducts);
    } catch (err) {
        console.error("❌ Error fetching products:", err);
        if (tableBody)
            tableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">${err.message}</td></tr>`;
    }
}

function renderTable(products) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!products.length) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888;">No products found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = products.map(p => `
        <tr>
            <td>#${p.product_id}</td>
            <td>${p.product_name}</td>
            <td>₹ ${Number(p.price).toLocaleString()}</td>
            <td>${p.stock}</td>
            <td>${p.supplier || "-"}</td>
        </tr>
    `).join('');
}

// =============================
// DOMContentLoaded
// =============================
document.addEventListener('DOMContentLoaded', async function () {
    const searchInput = document.getElementById('productSearch');

    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const q = searchInput.value.trim().toLowerCase();
            if (q === "") {
                renderTable(allProducts);
                return;
            }
            const filtered = allProducts.filter(p =>
                p.product_name.toLowerCase().includes(q) ||
                p.product_id.toLowerCase().includes(q)
            );
            renderTable(filtered);
        });
    }

    document.getElementById('addProductCard').addEventListener('click', () => openModal('Add New Product', addProductContent));
    document.getElementById('removeProductCard').addEventListener('click', () => openModal('Remove Product', removeProductContent));
    document.getElementById('changePriceCard').addEventListener('click', () => openModal('Change Price', changePriceContent));
    document.getElementById('updateStockCard').addEventListener('click', () => openModal('Stock Update', stockUpdateContent));
    document.getElementById('productHoldCard').addEventListener('click', () => openModal('Product Hold / Unhold', productHoldContent));

    document.getElementById('actionModal').addEventListener('click', (e) => {
        if (e.target.id === 'actionModal') closeModal();
    });

    await loadPosProducts();
    setInterval(loadPosProducts, 30000);
});

// =============================
// ADD PRODUCT HANDLER
// =============================
document.addEventListener("click", async function (e) {
    if (e.target && e.target.id === "confirmAddProductBtn") {
        const id = document.getElementById("addProductId").value.trim();
        const name = document.getElementById("addProductName").value.trim();
        const category = document.getElementById("addProductCategory").value.trim();
        const price = parseFloat(document.getElementById("addProductPrice").value);
        const stock = parseInt(document.getElementById("addProductStock").value);
        const supplier = document.getElementById("addProductSupplier").value.trim();

        if (!name || !category) {
            alert("❌ Please fill in Product Name and Category.");
            return;
        }

        if (isNaN(stock) || stock < 10) {
            alert("❌ Stock must be at least 10.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/add_product`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: id || null,
                    product_name: name,
                    category: category,
                    price: price,
                    stock: stock,
                    supplier: supplier || "-"
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Failed to add product.");

            alert(`✅ ${result.message}`);
            closeModal();
            await loadPosProducts();
        } catch (err) {
            console.error("❌ Error adding product:", err);
            alert(`❌ Error: ${err.message}`);
        }
    }
});