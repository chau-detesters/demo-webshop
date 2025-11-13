const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
  strawberry: { name: "Strawberry", emoji: "🍓" },
};

const ADDONS = {
  "whipped-cream": { name: "Whipped Cream", emoji: "🥛" },
  chocolate: { name: "Chocolate", emoji: "🍫" },
  pancakes: { name: "Pancakes", emoji: "🥞" },
  "vanilla-ice-cream": { name: "Vanilla Ice Cream", emoji: "🍦" },
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
  
  // Special handling for vanilla ice cream - Ghislain has taken it!
  if (product === "vanilla-ice-cream") {
    showGhislainNotification();
    return false; // Don't add to basket, Ghislain took it
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

function showGhislainNotification() {
  // Remove any existing pop-up
  const existingPopup = document.getElementById("ghislainPopup");
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "ghislainPopup";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-in;
  `;
  
  // Create pop-up content
  const popupContent = document.createElement("div");
  popupContent.style.cssText = `
    background: #fff;
    border-radius: 18px;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    position: relative;
    animation: slideUp 0.3s ease-out;
  `;
  
  // Create message
  const message = document.createElement("div");
  message.style.cssText = `
    font-size: 1.3rem;
    font-weight: 600;
    color: #c62828;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  `;
  message.textContent = "Ghislain has taken the last ice cream bowl";
  
  // Create emoji display
  const emojiDisplay = document.createElement("div");
  emojiDisplay.style.cssText = `
    font-size: 4rem;
    margin: 1rem 0;
  `;
  emojiDisplay.innerHTML = "🍦😏";
  
  // Create close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "Acknowledge Disappointment";
  closeButton.style.cssText = `
    background: #e53935;
    color: #fff;
    border: 2.5px solid #111;
    border-radius: 30px;
    padding: 0.8rem 1.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(229, 57, 53, 0.18);
    transition: background 0.2s, transform 0.15s;
    margin-top: 1rem;
  `;
  closeButton.onmouseover = function() {
    this.style.background = "#b71c1c";
    this.style.transform = "scale(1.04)";
  };
  closeButton.onmouseout = function() {
    this.style.background = "#e53935";
    this.style.transform = "scale(1)";
  };
  closeButton.onclick = function() {
    overlay.remove();
  };
  
  // Assemble pop-up
  popupContent.appendChild(emojiDisplay);
  popupContent.appendChild(message);
  popupContent.appendChild(closeButton);
  overlay.appendChild(popupContent);
  
  // Add to page
  document.body.appendChild(overlay);
  
  // Close on overlay click (outside pop-up)
  overlay.onclick = function(e) {
    if (e.target === overlay) {
      overlay.remove();
    }
  };
  
  // Add CSS animations if not already added
  if (!document.getElementById("ghislainAnimations")) {
    const style = document.createElement("style");
    style.id = "ghislainAnimations";
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from {
          transform: translateY(30px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
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
  const addonCounts = {};
  
  basket.forEach((item) => {
    if (PRODUCTS[item]) {
      productCounts[item] = (productCounts[item] || 0) + 1;
    } else if (ADDONS[item]) {
      addonCounts[item] = (addonCounts[item] || 0) + 1;
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
  
  // Display grouped add-ons with quantities
  Object.keys(addonCounts).forEach((addon) => {
    const item = ADDONS[addon];
    const quantity = addonCounts[addon];
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
