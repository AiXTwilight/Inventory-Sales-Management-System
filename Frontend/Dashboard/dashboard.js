// Function to update the chart on the canvas
function updateChart(chartType) {
    // Get the chart container and the current active canvas
    const chartContainer = document.querySelector('.chart-container');
    let currentChartCanvas = document.querySelector('.chart.active');

    // Remove the current chart canvas
    if (currentChartCanvas) {
        chartContainer.removeChild(currentChartCanvas);
    }

    // Create a new canvas element
    const newCanvas = document.createElement('canvas');
    newCanvas.className = 'chart active';
    if (chartType === 'sales') {
        newCanvas.id = 'salesChart';
    } else {
        newCanvas.id = 'productChart';
    }
    
    // Add the new canvas to the container
    chartContainer.appendChild(newCanvas);
    
    // Initialize the chart based on the type
    if (chartType === 'sales') {
        const salesCtx = newCanvas.getContext('2d');
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Sales (₹)',
                    data: [950000, 1520000, 1200000, 2000000, 1760000, 2400000, 2240000, 2800000, 2560000, 3200000, 3040000, 3600000],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    } else if (chartType === 'products') {
        const productCtx = newCanvas.getContext('2d');
        new Chart(productCtx, {
            type: 'bar',
            data: {
                labels: ['Wireless Earbuds', 'Smartphone', 'Fitness Tracker', 'Tablet', 'Bluetooth Speaker'],
                datasets: [{
                    label: 'Units Sold',
                    data: [245, 189, 156, 134, 98],
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(155, 89, 182, 0.8)',
                        'rgba(241, 196, 15, 0.8)',
                        'rgba(230, 126, 34, 0.8)'
                    ],
                    borderColor: [
                        '#3498db',
                        '#2ecc71',
                        '#9b59b6',
                        '#f1c40f',
                        '#e67e22'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        // Add these two properties to control the bar width
                        barPercentage: 0.8,
                        categoryPercentage: 0.8
                    }
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Chart toggle functionality
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Call the function to update the chart
            const chartType = this.getAttribute('data-chart');
            updateChart(chartType);
        });
    });
    
    // Initial chart setup on page load
    updateChart('sales');

    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Update metrics with random data (simulate real-time updates, in INR)
    function updateMetrics() {
        const metrics = document.querySelectorAll('.metric-value');
        const changes = document.querySelectorAll('.metric-change');
        
        // Update total products
        const products = Math.floor(Math.random() * 100) + 1200;
        metrics[0].textContent = products.toLocaleString('en-IN');
        
        // Update total sales (INR)
        const sales = Math.floor(Math.random() * 50000) + 375000;
        metrics[1].textContent = '₹' + sales.toLocaleString('en-IN');
        
        // Update total revenue (INR)
        const revenue = Math.floor(Math.random() * 1000000) + 10545000;
        metrics[2].textContent = '₹' + revenue.toLocaleString('en-IN');
        
        // Update low stock alerts
        const alerts = Math.floor(Math.random() * 10) + 20;
        metrics[3].textContent = alerts;
        
        // Update change indicators
        changes.forEach(change => {
            const isPositive = Math.random() > 0.3;
            const value = Math.floor(Math.random() * 10) + 1;
            
            change.textContent = (isPositive ? '+' : '-') + value + '%';
            change.className = 'metric-change ' + (isPositive ? 'positive' : 'negative');
        });
    }
    
    setInterval(updateMetrics, 30000);
    
    // Add some interactive elements
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Modal and Sale Logic
    const recordSaleBtn = document.getElementById('recordSaleBtn');
    const saleModal = document.getElementById('saleModal');
    const closeBtn = document.querySelector('.close-btn');
    const saleForm = document.getElementById('saleForm');
    const formView = document.getElementById('formView');
    const confirmationView = document.getElementById('confirmationView');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantityInput');

    // Show the modal when the "Record Sale" button is clicked
    recordSaleBtn.addEventListener('click', function() {
        saleModal.style.display = 'flex';
        formView.classList.remove('hidden');
        confirmationView.classList.add('hidden');
    });

    // Close the modal when the close button is clicked
    closeBtn.addEventListener('click', function() {
        saleModal.style.display = 'none';
        saleForm.reset();
    });

    // Close the modal when the user clicks outside of it
    window.addEventListener('click', function(event) {
        if (event.target === saleModal) {
            saleModal.style.display = 'none';
            saleForm.reset();
        }
    });

    // Handle form submission
    saleForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const selectedProduct = productSelect.value;
        const quantity = quantityInput.value;

        if (selectedProduct && quantity > 0) {
            const message = `Sold ${quantity} x ${selectedProduct}`;
            confirmationMessage.textContent = message;
            formView.classList.add('hidden');
            confirmationView.classList.remove('hidden');

            // You can add logic here to update your dashboard metrics
            // (e.g., increase total sales, update recent purchases, etc.)

            // Close the modal after a delay
            setTimeout(() => {
                saleModal.style.display = 'none';
                saleForm.reset();
            }, 3000);
        } else {
            alert('Please select a product and enter a valid quantity.');
        }
    });
});