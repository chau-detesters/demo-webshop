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
    
    // Handle backward compatibility: migrate old string array to new object structure
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
      // Old format: array of strings, migrate to new format
      const migrated = [];
      let currentItem = null;
      
      parsed.forEach((item) => {
        if (PRODUCTS[item]) {
          // It's a product, create new basket item
          if (currentItem) {
            migrated.push(currentItem);
          }
          currentItem = { product: item, addons: [] };
        } else if (ADDONS[item]) {
          // It's an addon, add to current item or create standalone
          if (currentItem) {
            currentItem.addons.push(item);
          } else {
            // No product yet, create item with just addon (edge case)
            currentItem = { product: null, addons: [item] };
          }
        }
      });
      
      if (currentItem) {
        migrated.push(currentItem);
      }
      
      // Save migrated format
      localStorage.setItem("basket", JSON.stringify(migrated));
      return migrated;
    }
    
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

function addToBasket(product, targetProduct) {
  const basket = getBasket();
  
  // Check if it's a product or an addon
  const isProduct = PRODUCTS[product] !== undefined;
  const isAddon = ADDONS[product] !== undefined;
  
  if (!isProduct && !isAddon) {
    return false; // Unknown item
  }
  
  // Special handling for vanilla ice cream - Ghislain has taken it!
  if (product === "vanilla-ice-cream") {
    showGhislainNotification();
    return false; // Don't add to basket, Ghislain took it
  }
  
  if (isProduct) {
    // Check for incompatibility: strawberries and bananas cannot be combined
    const hasBanana = basket.some(item => item.product === "banana");
    const hasStrawberry = basket.some(item => item.product === "strawberry");
    
    if (product === "strawberry" && hasBanana) {
      showErrorMessage("Strawberries and bananas cannot be combined.");
      return false;
    }
    
    if (product === "banana" && hasStrawberry) {
      showErrorMessage("Strawberries and bananas cannot be combined.");
      return false;
    }
    
    // Add new product with empty addons array
    basket.push({ product: product, addons: [] });
  } else if (isAddon) {
    // If targetProduct is specified, ensure that product is in basket first
    if (targetProduct) {
      // Find or create the target product in basket
      let targetItem = basket.find(item => item.product === targetProduct);
      
      if (!targetItem) {
        // Check for incompatibility before adding
        const hasBanana = basket.some(item => item.product === "banana");
        const hasStrawberry = basket.some(item => item.product === "strawberry");
        
        if (targetProduct === "strawberry" && hasBanana) {
          showErrorMessage("Strawberries and bananas cannot be combined.");
          return false;
        }
        
        if (targetProduct === "banana" && hasStrawberry) {
          showErrorMessage("Strawberries and bananas cannot be combined.");
          return false;
        }
        
        // Add the product first
        targetItem = { product: targetProduct, addons: [] };
        basket.push(targetItem);
      }
      
      // Add addon to the target product
      targetItem.addons.push(product);
    } else {
      // No target product specified, add to last product in basket
      if (basket.length === 0) {
        showErrorMessage("Please add a product first before adding add-ons.");
        return false;
      }
      
      const lastItem = basket[basket.length - 1];
      if (lastItem.product === null) {
        showErrorMessage("Please add a product first before adding add-ons.");
        return false;
      }
      
      lastItem.addons.push(product);
    }
  }
  
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
  
  // Group identical product+addon combinations
  const itemGroups = {};
  
  basket.forEach((item) => {
    if (!item.product) return; // Skip items without products
    
    // Create a key based on product and sorted addons
    const addonsKey = item.addons && item.addons.length > 0 
      ? item.addons.slice().sort().join(",") 
      : "";
    const key = `${item.product}|${addonsKey}`;
    
    if (!itemGroups[key]) {
      itemGroups[key] = {
        product: item.product,
        addons: item.addons ? item.addons.slice() : [],
        quantity: 0
      };
    }
    itemGroups[key].quantity++;
  });
  
  // Display grouped items
  Object.keys(itemGroups).forEach((key) => {
    const group = itemGroups[key];
    const product = PRODUCTS[group.product];
    if (!product) return;
    
    const li = document.createElement("li");
    
    // Build display text
    let displayText = `${group.quantity}x ${product.name}`;
    
    if (group.addons && group.addons.length > 0) {
      const addonNames = group.addons.map(addon => {
        const addonInfo = ADDONS[addon];
        return addonInfo ? addonInfo.name : addon;
      });
      displayText += ` with ${addonNames.join(", ")}`;
    }
    
    li.innerHTML = `<span class='basket-emoji'>${product.emoji}</span> <span>${displayText}</span>`;
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
  
  // Count total items (products with their addons count as 1 item)
  const itemCount = basket.filter(item => item.product !== null).length;
  
  if (itemCount > 0) {
    indicator.textContent = itemCount;
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
