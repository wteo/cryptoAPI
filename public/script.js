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


// Check URL for shared result parameters
function checkForSharedResult() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('amount') && urlParams.has('crypto') && urlParams.has('fiat') && urlParams.has('price')) {
    const amount = urlParams.get('amount');
    const cryptoSymbol = urlParams.get('crypto');
    const fiatCurrency = urlParams.get('fiat');
    const price = urlParams.get('price');
    
    // Display the shared result
    displaySharedResult(amount, cryptoSymbol, fiatCurrency, price);

    // Highlight the shared result
    setTimeout(() => {
      const sharedResult = document.querySelector('.shared-result');
      if (sharedResult) {
        sharedResult.classList.add('highlight');
        setTimeout(() => {
          sharedResult.classList.remove('highlight');
        }, 2000);
      }
    }, 500);
  }
}

function clearAllResults() {
  const resultContainer = document.getElementById("result");
  
  // Clear all result containers except the heading
  const heading = resultContainer.querySelector("h2");
  resultContainer.innerHTML = "";
  resultContainer.appendChild(heading);
  
  // Clear the results array
  results.length = 0;
}


// Display shared result
function displaySharedResult(amount, cryptoSymbol, fiatCurrency, price) {
  const navLinks = document.getElementById("shared-result-container");
  
  // Create "Shared with you" banner
  const sharedBanner = document.createElement("div");
  sharedBanner.classList.add("shared-banner");
  
  // Add a button to try your own conversion
  sharedBanner.innerHTML = `
    <span>👋 Someone shared this conversion with you</span>
    <button id="tryYourOwn" class="try-your-own-btn">Try Your Own Conversion</button>
  `;
  
  // Create result div
  const resultDiv = document.createElement("div");
  resultDiv.classList.add("result__container", "shared-result");
  
  const formattedPrice = formatNumberToPrice(price);
  resultDiv.innerHTML = `
    <p>${amount} ${cryptoSymbol} = ${fiatCurrency} ${formattedPrice}</p>
  `;
  
  // Insert at the top
  navLinks.insertBefore(sharedBanner, navLinks.firstChild);
  navLinks.insertBefore(resultDiv, navLinks.childNodes[1]);
  
  
  // Add event listener to the "Try Your Own" button
  document.getElementById("tryYourOwn").addEventListener("click", () => {
    // Set form fields to match the shared values (gives user a starting point)
    document.getElementById("amount").value = amount;
    
    // Find and select the matching crypto option
    const cryptoSelect = document.getElementById("cryptoSymbol");
    for (let i = 0; i < cryptoSelect.options.length; i++) {
      if (cryptoSelect.options[i].value === cryptoSymbol) {
        cryptoSelect.selectedIndex = i;
        break;
      }
    }
    
    // Find and select the matching fiat option
    const fiatSelect = document.getElementById("fiatCurrency");
    for (let i = 0; i < fiatSelect.options.length; i++) {
      if (fiatSelect.options[i].value === fiatCurrency) {
        fiatSelect.selectedIndex = i;
        break;
      }
    }
    
    // Remove shared result elements
    sharedBanner.remove();
    resultDiv.remove();

    // clear all existing results
    clearAllResults();
    
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Focus on the amount input
    document.getElementById("amount").focus();
    results = [];
  });
}

// Generate shareable URL
function generateShareableUrl(amount, cryptoSymbol, fiatCurrency, price) {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?amount=${amount}&crypto=${cryptoSymbol}&fiat=${fiatCurrency}&price=${price}`;
}

// Copy URL to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}

// Show copy confirmation
function showCopyConfirmation(button) {
  const originalText = button.textContent;
  button.textContent = "Copied!";
  button.classList.add("copied");
  
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("copied");
  }, 2000);
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

      // Generate shareable URL
      const shareableUrl = generateShareableUrl(amount, cryptoSymbol, fiatCurrency, price);

      resultDiv.innerHTML = `
        <p>${amount} ${cryptoSymbol} = ${fiatCurrency} $${formattedPrice}</p>
        <div class="result__actions">
          <button class="result__share-button" title="Share this result">Share</button>
          <button class="result__delete-button" title="Delete this result">Delete</button>
        </div>
      `;

      results.push(resultDiv);
      resultContainer.appendChild(resultDiv);

      // Add click event for the share button
      const shareButton = resultDiv.querySelector(".result__share-button");
      shareButton.addEventListener("click", async () => {
        const success = await copyToClipboard(shareableUrl);
        if (success) {
          showCopyConfirmation(shareButton);
        }
      });
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


// Initialize
document.addEventListener('DOMContentLoaded', () => {
  populateFiatOptions();

  const cryptoForm = document.getElementById("cryptoForm");
  cryptoForm.addEventListener("submit", submitQuery);
  
  // Check for shared result in URL
  checkForSharedResult();
});