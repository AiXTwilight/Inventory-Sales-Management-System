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
    
    // Define your primary purple color
    const primaryPurple = '#8e7cc3'; // From your sidebar gradient start
    const lightPurple = '#a18fcf'; // From your sidebar gradient end
    const veryLightPurple = 'rgba(177, 162, 219, 0.2)'; // A very light, transparent purple for fill

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
                    borderColor: primaryPurple, // Changed to primary purple
                    backgroundColor: veryLightPurple, // Light, transparent purple for fill
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
                        primaryPurple, // All bars will be this primary purple
                        lightPurple,
                        primaryPurple,
                        lightPurple,
                        primaryPurple
                    ],
                    borderColor: [
                        primaryPurple, // Borders match the fill color
                        lightPurple,
                        primaryPurple,
                        lightPurple,
                        primaryPurple
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
        
        // Update Products Sold Today (example, assuming this is metrics[4])
        const productsSoldToday = Math.floor(Math.random() * 10) + 8; // Random between 8 and 17
        metrics[4].textContent = productsSoldToday;


        // Update change indicators for Sales and Revenue
        // Assuming metrics[1] is Total Sales and metrics[2] is Total Revenue
        const salesChange = changes[0]; // For Total Sales
        const revenueChange = changes[1]; // For Total Revenue

        function updateChange(changeElement) {
            const isPositive = Math.random() > 0.3; // 70% chance of positive
            const value = (Math.random() * 5 + 1).toFixed(0); // 1-5%
            
            changeElement.textContent = (isPositive ? '+' : '-') + value + '%';
            changeElement.className = 'metric-change ' + (isPositive ? 'positive' : 'negative');
        }

        updateChange(salesChange);
        updateChange(revenueChange);
    }
    
    // Call updateMetrics immediately and then every 30 seconds
    updateMetrics(); 
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
    // There is no 'recordSaleBtn' in your HTML. Assuming this functionality
    // might be triggered by a metric card or an external button.
    // For now, I'm commenting out the recordSaleBtn event listener
    // or you can add a button with id="recordSaleBtn" in your HTML.
    // const recordSaleBtn = document.getElementById('recordSaleBtn'); 
    const saleModal = document.getElementById('saleModal');
    const closeBtn = document.querySelector('.close-btn');
    const saleForm = document.getElementById('saleForm');
    const formView = document.getElementById('formView');
    const confirmationView = document.getElementById('confirmationView');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantityInput');

    // If you add a button with id="recordSaleBtn", uncomment this:
    // recordSaleBtn.addEventListener('click', function() {
    //     saleModal.style.display = 'flex';
    //     formView.classList.remove('hidden');
    //     confirmationView.classList.add('hidden');
    // });

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
        const quantity = parseInt(quantityInput.value); // Parse to integer

        if (selectedProduct && quantity > 0) {
            const message = `Sold ${quantity} x ${selectedProduct}.`;
            confirmationMessage.textContent = message;
            formView.classList.add('hidden');
            confirmationView.classList.remove('hidden');

            // --- Add logic here to update your dashboard metrics ---
            // Example: Update "Products Sold Today"
            const productsSoldTodayMetric = document.querySelectorAll('.metric-value')[4]; // Assuming it's the 5th metric
            let currentProductsSold = parseInt(productsSoldTodayMetric.textContent);
            productsSoldTodayMetric.textContent = (currentProductsSold + quantity).toLocaleString('en-IN');

            // Example: Update "Today's Sale" (assuming a dummy price)
            const todaySaleMetric = document.querySelectorAll('.metric-value')[3]; // Assuming it's the 4th metric
            const dummyPriceMap = { // You'll need actual prices from your inventory
                "Wireless Earbuds": 7499,
                "Smartphone": 16499,
                "Fitness Tracker": 3699,
                "Tablet": 12000, // Dummy
                "Bluetooth Speaker": 2500 // Dummy
            };
            const itemPrice = dummyPriceMap[selectedProduct] || 0;
            const saleAmount = quantity * itemPrice;
            let currentTodaySale = parseInt(todaySaleMetric.textContent.replace('₹', '').replace(/,/g, ''));
            todaySaleMetric.textContent = '₹' + (currentTodaySale + saleAmount).toLocaleString('en-IN');


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