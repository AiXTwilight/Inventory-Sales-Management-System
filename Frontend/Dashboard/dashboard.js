// frontend/Dashboard/dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
  const API_BASE = "http://127.0.0.1:8000/api";
  const primaryPurple = "#8e7cc3";
  const lightPurple = "#a18fcf";
  const veryLightPurple = "rgba(177, 162, 219, 0.2)";
  let activeChart = "sales";

  async function fetchDashboardData() {
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return await res.json();
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      return null;
    }
  }

  async function updateDashboard() {
    const data = await fetchDashboardData();
    if (!data) return;

    // === METRICS ===
    const m = data.metrics;
    document.getElementById("total-products-sold").textContent = m.total_products_sold.toLocaleString("en-IN");
    document.getElementById("total-sales").textContent = "₹" + m.total_sales.toLocaleString("en-IN");
    document.getElementById("todays-revenue").textContent = "₹" + m.total_sales.toLocaleString("en-IN");
    document.getElementById("todays-sale").textContent = "₹" + m.todays_sales_total.toLocaleString("en-IN");
    document.getElementById("products-sold-today").textContent = m.todays_sales_count.toLocaleString("en-IN");

    // === RECENT PURCHASES ===
    const purchaseList = document.getElementById("recent-purchases");
    purchaseList.innerHTML = "";
    data.recent_purchases.forEach((r) => {
      const item = document.createElement("div");
      item.classList.add("purchase-item");
      item.innerHTML = `
        <span class="purchase-username">@${r.user_id}</span>
        <span class="purchase-name">${r.product_name}</span>
        <span class="purchase-date">${new Date(r.date_time).toLocaleString()}</span>
        <span class="purchase-amount">₹${r.product_price.toLocaleString("en-IN")}</span>`;
      purchaseList.appendChild(item);
    });

    // === TOP SELLING PRODUCTS ===
    const topList = document.getElementById("top-products");
    topList.innerHTML = "";
    data.top_selling.forEach((p, idx) => {
      const item = document.createElement("div");
      item.classList.add("product-item");
      item.innerHTML = `
        <span class="product-rank">${idx + 1}</span>
        <span class="product-name">${p.product_name}</span>
        <span class="product-sales">${p.units_sold} units</span>`;
      topList.appendChild(item);
    });

    // === STOCK ALERTS ===
    const alertList = document.getElementById("stock-alerts");
    alertList.innerHTML = "";
    data.stock_alerts.forEach((p) => {
      const level = p.stock === 0 ? "critical" : p.stock < 10 ? "warning" : "info";
      const alert = document.createElement("div");
      alert.classList.add("alert-item", level);
      alert.innerHTML = `
        <span class="alert-icon">${
          level === "critical" ? "🔴" : level === "warning" ? "🟡" : "🟢"
        }</span>
        <span class="alert-text">${p.product_name}: Only ${p.stock} left in stock</span>`;
      alertList.appendChild(alert);
    });

    // === CHARTS ===
    updateCharts(data.monthly_sales);
  }

  function updateCharts(monthlySales) {
    const salesCtx = document.getElementById("salesChart").getContext("2d");
    const productCtx = document.getElementById("productChart").getContext("2d");

    // Destroy existing charts if any (to prevent overlap)
    if (window.salesChartInstance) window.salesChartInstance.destroy();
    if (window.productChartInstance) window.productChartInstance.destroy();

    // --- Sales Trend ---
    window.salesChartInstance = new Chart(salesCtx, {
      type: "line",
      data: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        datasets: [{
          label: "Sales (₹)",
          data: monthlySales,
          borderColor: primaryPurple,
          backgroundColor: veryLightPurple,
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });

    // --- Product Performance ---
    window.productChartInstance = new Chart(productCtx, {
      type: "bar",
      data: {
        labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
        datasets: [{
          label: "Units Sold",
          data: monthlySales.slice(0, 5),
          backgroundColor: [primaryPurple, lightPurple, primaryPurple, lightPurple, primaryPurple],
          borderWidth: 1
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // === CHART TOGGLE HANDLERS ===
  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      activeChart = e.target.getAttribute("data-chart");
      document.getElementById("salesChart").style.display = activeChart === "sales" ? "block" : "none";
      document.getElementById("productChart").style.display = activeChart === "products" ? "block" : "none";
    });
  });

  // Initial load + auto refresh
  await updateDashboard();
  setInterval(updateDashboard, 30000);
});