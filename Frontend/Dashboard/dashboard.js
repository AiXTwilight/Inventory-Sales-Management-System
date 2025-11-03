document.addEventListener('DOMContentLoaded', async () => {
  const API_BASE = "http://127.0.0.1:8000/api";
  const primaryPurple = "#8e7cc3";
  const lightPurple = "#a18fcf";
  const veryLightPurple = "rgba(177, 162, 219, 0.2)";
  let activeChart = "sales";

  async function fetchAPI(endpoint) {
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`);
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    } catch (err) {
      console.error("Error fetching", endpoint, err);
      return [];
    }
  }

  async function updateDashboard() {
    const [products, sales] = await Promise.all([
      fetchAPI("product_info"),
      fetchAPI("sales_data"),
    ]);

    if (!products.length && !sales.length) return;

    // === METRICS ===
    const totalProductsSold = sales.length;
    const totalSalesAmount = sales.reduce((sum, s) => sum + (s.product_price || 0), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todaysSales = sales.filter(s => s.date_time?.startsWith(today));
    const todaysTotal = todaysSales.reduce((sum, s) => sum + (s.product_price || 0), 0);

    document.getElementById("total-products-sold").textContent = totalProductsSold.toLocaleString("en-IN");
    document.getElementById("total-sales").textContent = "₹" + totalSalesAmount.toLocaleString("en-IN");
    document.getElementById("todays-revenue").textContent = "₹" + totalSalesAmount.toLocaleString("en-IN");
    document.getElementById("todays-sale").textContent = todaysTotal ? "₹" + todaysTotal.toLocaleString("en-IN") : "--";
    document.getElementById("products-sold-today").textContent = todaysSales.length || "--";

    // === RECENT PURCHASES ===
    const recent = sales.sort((a, b) => new Date(b.date_time) - new Date(a.date_time)).slice(0, 5);
    const purchaseList = document.getElementById("recent-purchases");
    purchaseList.innerHTML = "";
    recent.forEach((r) => {
      const item = document.createElement("div");
      item.classList.add("purchase-item");
      item.innerHTML = `
        <span class="purchase-username">@${r.user_id}</span>
        <span class="purchase-name">${r.product_name}</span>
        <span class="purchase-date">${new Date(r.date_time).toLocaleString()}</span>
        <span class="purchase-amount">₹${(r.product_price || 0).toLocaleString("en-IN")}</span>`;
      purchaseList.appendChild(item);
    });

    // === TOP PRODUCTS ===
    const topMap = {};
    sales.forEach((s) => {
      topMap[s.product_name] = (topMap[s.product_name] || 0) + 1;
    });
    const topProducts = Object.entries(topMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topList = document.getElementById("top-products");
    topList.innerHTML = "";
    topProducts.forEach(([name, units], idx) => {
      const product = products.find((p) => p.product_name === name);
      const rating = product?.reviews || "4.5";
      const item = document.createElement("div");
      item.classList.add("product-item");
      item.innerHTML = `
        <span class="product-rank">${idx + 1}</span>
        <span class="product-name">${name}</span>
        <span class="product-sales">${units} units</span>
        <span class="product-rating">⭐️ ${rating}</span>`;
      topList.appendChild(item);
    });

    // === STOCK ALERTS ===
    const alerts = products.filter((p) => p.stock < 20).sort((a, b) => a.stock - b.stock);
    const alertList = document.getElementById("stock-alerts");
    alertList.innerHTML = "";
    alerts.forEach((p) => {
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
    updateCharts(sales, products);
  }

  function updateCharts(sales, products) {
    const salesCanvas = document.getElementById("salesChart");
    const productCanvas = document.getElementById("productChart");
    const salesCtx = salesCanvas.getContext("2d");
    const productCtx = productCanvas.getContext("2d");

    // Sales Trend - Monthly Revenue
    const monthlySales = Array(12).fill(0);
    sales.forEach((s) => {
      const d = new Date(s.date_time);
      monthlySales[d.getMonth()] += s.product_price || 0;
    });
    new Chart(salesCtx, {
      type: "line",
      data: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        datasets: [
          {
            label: "Sales (₹)",
            data: monthlySales,
            borderColor: primaryPurple,
            backgroundColor: veryLightPurple,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });

    // Product Performance - Top 5 Products
    const topMap = {};
    sales.forEach((s) => {
      topMap[s.product_name] = (topMap[s.product_name] || 0) + 1;
    });
    const topProducts = Object.entries(topMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const labels = topProducts.map(([name]) => name);
    const values = topProducts.map(([_, count]) => count);

    new Chart(productCtx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Units Sold",
            data: values,
            backgroundColor: [primaryPurple, lightPurple, primaryPurple, lightPurple, primaryPurple],
            borderColor: [primaryPurple, lightPurple, primaryPurple, lightPurple, primaryPurple],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.1)" } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  // Chart toggle buttons
  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      activeChart = e.target.getAttribute("data-chart");
      document.getElementById("salesChart").style.display = activeChart === "sales" ? "block" : "none";
      document.getElementById("productChart").style.display = activeChart === "products" ? "block" : "none";
    });
  });

  await updateDashboard();
  setInterval(updateDashboard, 30000);
});