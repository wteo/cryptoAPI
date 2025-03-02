import fetch from "node-fetch";

export async function fetchCryptoData(req, res) {
  try {
    const amount = req.query.amount || 1; // Default to 100 if not provided
    const symbol = req.query.symbol || 'BTC'; // Default to BTC if not provided
    const convert = req.query.convert || 'AUD'; // Default to AUD if not provided

    const apiUrl = `${process.env.COINMARKETCAP_API_DOMAIN}?amount=${amount}&symbol=${symbol}&convert=${convert}`;

    const response = await fetch(apiUrl, {
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
    const prices = data.data;

    const formattedPrices = prices.map((price) => ({
      id: price.id,
      amount: price.amount,
      crypto: price.symbol,
      fiat: price.quote[convert].price,
    }));

    res.json(formattedPrices); 
    
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    res.status(500).json({ error: "Failed to fetch cryptocurrency data" });
  }
}
