const fiatCurrencies = [
  { symbol: "AUD", description: "Australian Dollar" },
  { symbol: "BRL", description: "Brazilian Real" },
  { symbol: "CAD", description: "Canadian Dollar" },
  { symbol: "CHF", description: "Swiss Franc" },
  { symbol: "CNY", description: "Chinese Yuan" },
  { symbol: "EUR", description: "Euro" },
  { symbol: "GBP", description: "British Pound Sterling" },
  { symbol: "HKD", description: "Hong Kong Dollar" },
  { symbol: "IDR", description: "Indonesian Rupiah" },
  { symbol: "INR", description: "Indian Rupee" },
  { symbol: "JPY", description: "Japanese Yen" },
  { symbol: "KRW", description: "South Korean Won" },
  { symbol: "MXN", description: "Mexican Peso" },
  { symbol: "MYR", description: "Malaysian Ringgit" },
  { symbol: "NOK", description: "Norwegian Krone" },
  { symbol: "NZD", description: "New Zealand Dollar" },
  { symbol: "PHP", description: "Philippine Peso" },
  { symbol: "RUB", description: "Russian Ruble" },
  { symbol: "SEK", description: "Swedish Krona" },
  { symbol: "SGD", description: "Singapore Dollar" },
  { symbol: "THB", description: "Thai Baht" },
  { symbol: "TRY", description: "Turkish Lira" },
  { symbol: "USD", description: "United States Dollar" },
  { symbol: "ZAR", description: "South African Rand" }
];


function populateFiatOptions() {
  const selectElement = document.getElementById("fiatCurrency");
    selectElement.innerHTML = "";
  
  fiatCurrencies.forEach(currency => {
    const option = document.createElement("option");
    option.value = currency.symbol;
    option.textContent = `${currency.symbol} - ${currency.description}`;
    selectElement.appendChild(option);
  });
}


async function fetchData() {

  const amount = document.getElementById("amount").value; 
  const cryptoSymbol = document.getElementById("cryptoSymbol").value;
  const fiatCurrency = document.getElementById("fiatCurrency").value;

  const response = await fetch(`/convert?amount=${amount}&symbol=${cryptoSymbol}&convert=${fiatCurrency}`);
  const data = await response.json();
  const price = data[0].fiat;

  return { 
    response, 
    data: {
      amount, 
      cryptoSymbol, 
      fiatCurrency, 
      price
    }
  };
}


function formatNumberToPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}


const results = [];

async function submitQuery(event) {
  event.preventDefault();
  const resultContainer = document.getElementById("result");

  try {
    const { response, data } = await fetchData();
    const { cryptoSymbol, fiatCurrency, amount, price } = data;
    const formattedPrice = formatNumberToPrice(price);

    if (response.ok) {
      const resultIndex = results.length;

      const resultDiv = document.createElement("div");
      resultDiv.classList.add("result__container");
      resultDiv.setAttribute("data-index", resultIndex);

      resultDiv.innerHTML = `
        <p>${amount} ${cryptoSymbol} = ${fiatCurrency} $${formattedPrice}</p>
        <button class="result__delete-button">Delete</button>
      `;

      results.push(resultDiv);
      resultContainer.appendChild(resultDiv);
    } else {
      resultContainer.innerHTML = `<p>Error: ${data.error || "Unable to fetch data"}</p>`;
    }
  } catch (error) {
    console.error("Error:", error);
    resultContainer.innerHTML = "<p>Failed to fetch conversion data. Please try again later.</p>";
  }
}


document.getElementById("result").addEventListener("click", function (event) {
  if (event.target.classList.contains("result__delete-button")) {
    const resultDiv = event.target.closest(".result__container"); // Get the closest parent container
    if (resultDiv) {
      const index = results.indexOf(resultDiv); // Find its position in the array
      if (index !== -1) {
        results.splice(index, 1); // Remove from the results array
      }
      resultDiv.remove(); // Remove from the DOM
    }
  }
});


populateFiatOptions();

const cryptoForm = document.getElementById("cryptoForm");
cryptoForm.addEventListener("submit", submitQuery);

