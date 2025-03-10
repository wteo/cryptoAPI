// Top fiat currencies that will be available for comparison
const fiatCurrencies = [
    { symbol: "USD", description: "United States Dollar" },
    { symbol: "EUR", description: "Euro" },
    { symbol: "JPY", description: "Japanese Yen" },
    { symbol: "GBP", description: "British Pound Sterling" },
    { symbol: "AUD", description: "Australian Dollar" },
    { symbol: "CAD", description: "Canadian Dollar" },
    { symbol: "CHF", description: "Swiss Franc" },
    { symbol: "CNY", description: "Chinese Yuan" },
    { symbol: "INR", description: "Indian Rupee" },
    { symbol: "SGD", description: "Singapore Dollar" }
  ];
  
  // Chart colors for different currencies
  const chartColors = [
    '#4f46e5', // Primary color
    '#ef4444', // Error/Red
    '#10b981', // Success/Green
    '#f59e0b', // Warning/Yellow
    '#6b7280', // Gray
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#14b8a6'  // Teal
  ];
  
  // Chart instance
  let priceChart = null;
  
  // Populate the currency selection checkboxes
  function populateCurrencyOptions() {
    const currencySelection = document.getElementById("currencySelection");
    currencySelection.innerHTML = "";
    
    fiatCurrencies.forEach((currency, index) => {
      const checkbox = document.createElement("div");
      checkbox.className = "currency-checkbox";
      checkbox.innerHTML = `
        <input type="checkbox" id="currency-${currency.symbol}" 
               name="currencies" value="${currency.symbol}"
               ${index < 2 ? "checked" : ""}>
        <label for="currency-${currency.symbol}">${currency.symbol} - ${currency.description}</label>
      `;
      currencySelection.appendChild(checkbox);
    });
    
    // Add event listeners to enforce 2-3 currency selection
    const checkboxes = document.querySelectorAll('input[name="currencies"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', validateCurrencySelection);
    });
  }
  
  // Validate that 2-3 currencies are selected
  function validateCurrencySelection() {
    const checkboxes = document.querySelectorAll('input[name="currencies"]:checked');
    const errorElement = document.getElementById('currencyError');
    
    if (checkboxes.length < 2 || checkboxes.length > 3) {
      errorElement.style.display = 'block';
      return false;
    } else {
      errorElement.style.display = 'none';
      return true;
    }
  }
  
  // Format date for chart labels
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Create and render the chart
  function createChart(data) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (priceChart) {
      priceChart.destroy();
    }
    
    // Prepare datasets
    const datasets = [];
    const currencies = Object.keys(data.datasets);
    
    currencies.forEach((currency, index) => {
      datasets.push({
        label: `${data.symbol} in ${currency}`,
        data: data.datasets[currency],
        borderColor: chartColors[index],
        backgroundColor: chartColors[index] + '20',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 1,
        pointHoverRadius: 5,
      });
    });
    
    // Create chart
    priceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.timestamps.map(timestamp => formatDate(timestamp)),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: context.dataset.label.split(' in ')[1],
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6
                  }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: false,
            grid: {
              color: '#e5e7eb'
            },
            ticks: {
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }
  
  // Fetch historical data and generate chart
  async function fetchChartData(event) {
    event.preventDefault();
    
    if (!validateCurrencySelection()) {
      return;
    }
    
    const cryptoSymbol = document.getElementById('cryptoSymbol').value;
    const timeframe = document.getElementById('timeframe').value;
    
    // Get selected currencies
    const currencyCheckboxes = document.querySelectorAll('input[name="currencies"]:checked');
    const selectedCurrencies = Array.from(currencyCheckboxes).map(cb => cb.value);
    
    // Show loading state
    const chartCanvas = document.getElementById('priceChart');
    chartCanvas.style.opacity = '0.5';
    
    try {
      const response = await fetch(`/chart?symbol=${cryptoSymbol}&convert=${selectedCurrencies.join(',')}&timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Create the chart with the data
      createChart(data);
      
    } catch (error) {
      console.error('Error fetching chart data:', error);
      alert('Failed to fetch chart data. Please try again later.');
    } finally {
      // Reset loading state
      chartCanvas.style.opacity = '1';
    }
  }
  
  // Initialize the page
  document.addEventListener('DOMContentLoaded', () => {
    populateCurrencyOptions();
    
    const chartForm = document.getElementById('chartForm');
    chartForm.addEventListener('submit', fetchChartData);
    
    // Initialize with default empty chart
    const ctx = document.getElementById('priceChart').getContext('2d');
    priceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        }
      }
    });
  });