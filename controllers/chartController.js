import fetch from "node-fetch";

// Function to fetch historical price data for a cryptocurrency in multiple currencies
export async function fetchHistoricalData(req, res) {
  try {
    const { symbol, convert, timeframe } = req.query;
    
    // Parse the currencies from the convert parameter (comma-separated list)
    const currencies = convert.split(',');
    
    if (!symbol || !convert || !timeframe) {
      return res.status(400).json({ 
        error: "Missing required parameters: symbol, convert, or timeframe" 
      });
    }
    
    // Determine the time parameters based on the selected timeframe
    const { start, end, interval } = getTimeParameters(timeframe);
    
    // The CoinMarketCap historical data endpoint
    // Note: This is using the v2 cryptocurrency/quotes/historical endpoint
    const apiUrl = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/historical`;
    
    // Build the query parameters
    const params = new URLSearchParams({
      symbol: symbol,
      convert: convert, // CoinMarketCap API accepts comma-separated currency codes
      time_start: start,
      time_end: end,
      interval: interval,
      count: 500  // Maximum allowed by the API
    });
    
    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_KEY_API,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Format the historical data for chart consumption
    const chartData = formatHistoricalData(data, currencies, symbol);
    
    res.json(chartData);
    
  } catch (error) {
    console.error("Error fetching historical crypto data:", error);
    res.status(500).json({ 
      error: "Failed to fetch historical cryptocurrency data",
      message: error.message 
    });
  }
}

// Helper function to determine time parameters based on timeframe
function getTimeParameters(timeframe) {
  const now = new Date();
  let start = new Date();
  let interval = '1d'; // Default interval
  
  switch (timeframe) {
    case '1d':
      start.setDate(now.getDate() - 1);
      interval = '5m';
      break;
    case '7d':
      start.setDate(now.getDate() - 7);
      interval = '1h';
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      interval = '1d';
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      interval = '1d';
      break;
    case '1y':
      start.setFullYear(now.getFullYear() - 1);
      interval = '1d';
      break;
    default:
      start.setDate(now.getDate() - 7); // Default to 7 days
      interval = '1h';
  }
  
  return {
    start: start.toISOString(),
    end: now.toISOString(),
    interval
  };
}

// Helper function to format the historical data for the chart
function formatHistoricalData(apiData, currencies, symbol) {
  try {
    const quotesData = apiData.data[symbol];
    
    if (!quotesData || !quotesData.quotes) {
      throw new Error(`No data available for ${symbol}`);
    }
    
    // Initialize the result object
    const result = {
      symbol,
      timestamps: [],
      datasets: {}
    };
    
    // Initialize datasets for each currency
    currencies.forEach(currency => {
      result.datasets[currency] = [];
    });
    
    // Extract and format the data points
    quotesData.quotes.forEach(quote => {
      const timestamp = new Date(quote.timestamp).getTime();
      result.timestamps.push(timestamp);
      
      currencies.forEach(currency => {
        const price = quote.quote[currency]?.price || null;
        result.datasets[currency].push(price);
      });
    });
    
    return result;
  } catch (error) {
    console.error("Error formatting historical data:", error);
    throw error;
  }
}