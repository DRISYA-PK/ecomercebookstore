
const getChartBtn = document.getElementById('getChartBtn');
const chartsContainer = document.getElementById('chartsContainer');
let initialData;
let charts;

function getChart(initialData1) {
    alert("Function called successfully!"); // Debug alert
    
    // Parse initial data if it is passed as a JSON string
    try {
       initialData = (initialData1);
    } catch (error) {
        console.error("Invalid chart data passed to getChart:", error);
        return;
    }

    // Show the charts container
    chartsContainer.style.display = 'block';

    // Initialize charts
    charts = initCharts();
}
function initCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    const revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: initialData.revenueTrend.labels,
            datasets: [{
                label: 'Revenue',
                data: initialData.revenueTrend.data,
                borderColor: '#4c51bf',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Payment Methods Chart
    const paymentCtx = document.getElementById('paymentChart').getContext('2d');
    const paymentChart = new Chart(paymentCtx, {
        type: 'bar',
        data: {
            labels: ['COD', 'Online', 'Wallet'],
            datasets: [{
                label: 'Payment Methods',
                data: initialData.paymentMethods,
                backgroundColor: [
                    '#4c51bf',
                    '#48bb78',
                    '#ecc94b'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    return { revenueChart, paymentChart };
}



// Handle filter changes
async function updateDashboard() {
    const timeFilter = document.getElementById('timeFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;

    try {
        const response = await fetch(`/admin/api/dashboard-data?timeFilter=${timeFilter}&year=${yearFilter}`);
        const data = await response.json();

        // Update stats
        document.getElementById('totalOrders').textContent = data.totalOrders;
        document.getElementById('totalRevenue').textContent = `₹${data.totalRevenue.toFixed(2)}`;
        document.getElementById('avgOrderValue').textContent = `₹${data.avgOrderValue.toFixed(2)}`;
        document.getElementById('returnRate').textContent = `${data.returnRate.toFixed(1)}%`;

        // Update charts
        charts.revenueChart.data.labels = data.revenueTrend.labels;
        charts.revenueChart.data.datasets[0].data = data.revenueTrend.data;
        charts.revenueChart.update();

        charts.paymentChart.data.datasets[0].data = data.paymentMethods;
        charts.paymentChart.update();

    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

document.getElementById('timeFilter').addEventListener('change', updateDashboard);
document.getElementById('yearFilter').addEventListener('change', updateDashboard);