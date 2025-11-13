const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
  strawberry: { name: "Strawberry", emoji: "🍓" },
};

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return [];
    const parsed = JSON.parse(basket);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

function addToBasket(product) {
  const basket = getBasket();
  
  // Check for incompatibility: strawberries and bananas cannot be combined
  const hasBanana = basket.includes("banana");
  const hasStrawberry = basket.includes("strawberry");
  
  if (product === "strawberry" && hasBanana) {
    showErrorMessage("Strawberries and bananas cannot be combined.");
    return false;
  }
  
  if (product === "banana" && hasStrawberry) {
    showErrorMessage("Strawberries and bananas cannot be combined.");
    return false;
  }
  
  basket.push(product);
  localStorage.setItem("basket", JSON.stringify(basket));
  return true;
}

function showErrorMessage(message) {
  // Remove any existing error messages
  const existingError = document.getElementById("errorMessage");
  if (existingError) {
    existingError.remove();
  }
  
  // Create error message element
  const errorDiv = document.createElement("div");
  errorDiv.id = "errorMessage";
  errorDiv.style.cssText = `
    background: #ffebee;
    color: #c62828;
    border: 2px solid #c62828;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    font-size: 1.1rem;
    font-weight: 500;
    text-align: center;
    box-shadow: 0 2px 8px rgba(198, 40, 40, 0.15);
  `;
  errorDiv.textContent = message;
  
  // Find the button container or content box to insert the error message
  const buttonContainer = document.querySelector(".button-container");
  const contentBox = document.querySelector(".content-box");
  
  if (buttonContainer) {
    buttonContainer.parentNode.insertBefore(errorDiv, buttonContainer.nextSibling);
  } else if (contentBox) {
    contentBox.appendChild(errorDiv);
  } else {
    // Fallback: insert at the beginning of main
    const main = document.querySelector("main");
    if (main) {
      main.insertBefore(errorDiv, main.firstChild);
    }
  }
  
  // Auto-remove error message after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }
  
  // Group identical products and count quantities
  const productCounts = {};
  basket.forEach((product) => {
    if (PRODUCTS[product]) {
      productCounts[product] = (productCounts[product] || 0) + 1;
    }
  });
  
  // Display grouped products with quantities
  Object.keys(productCounts).forEach((product) => {
    const item = PRODUCTS[product];
    const quantity = productCounts[product];
    const li = document.createElement("li");
    li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${quantity}x ${item.name}</span>`;
    basketList.appendChild(li);
  });
  
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  if (basket.length > 0) {
    indicator.textContent = basket.length;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  const success = origAddToBasket(product);
  if (success) {
    renderBasketIndicator();
  }
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};
