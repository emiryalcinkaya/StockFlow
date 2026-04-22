import { apiFetch } from "./config.js";
import { requireAuth, initSidebarLogout } from "./auth.js";
import {
  formatCurrency,
  renderEmptyState,
  setButtonLoading,
  showToast
} from "./ui.js";

requireAuth();
initSidebarLogout();

const productSelect = document.getElementById("productSelect");
const cartTable = document.getElementById("cartTable");
const cartTotal = document.getElementById("cartTotal");
const addToCartButton = document.getElementById("addToCartButton");
const submitSaleButton = document.getElementById("submitSaleButton");
const availableProductsList = document.getElementById("availableProductsList");

const saleQtyValue = document.getElementById("saleQtyValue");
const decreaseQtyBtn = document.getElementById("decreaseQtyBtn");
const increaseQtyBtn = document.getElementById("increaseQtyBtn");

let products = [];
let cart = [];
let selectedQuantity = 1;

decreaseQtyBtn.addEventListener("click", () => {
  if (selectedQuantity > 1) {
    selectedQuantity--;
    updateQuantityUI();
  }
});

increaseQtyBtn.addEventListener("click", () => {
  selectedQuantity++;
  updateQuantityUI();
});

function refreshLucideIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

function updateQuantityUI() {
  saleQtyValue.textContent = selectedQuantity;
}

async function loadProducts() {
  try {
    const response = await apiFetch("/products/");
    products = await response.json();

    if (!response.ok) {
      showToast(products.detail || "Failed to load products", "error");
      return;
    }

    const availableProducts = products.filter(
      (product) => Number(product.stock_quantity) > 0
    );

    productSelect.innerHTML = availableProducts
      .map(
        (product) => `
          <option value="${product.id}">
            ${product.name} — ${formatCurrency(product.price)} — Stock: ${product.stock_quantity}
          </option>
        `
      )
      .join("");

    if (!availableProducts.length) {
      productSelect.innerHTML = `<option value="">No products available</option>`;
    }

    renderAvailableProducts(availableProducts);
  } catch (error) {
    console.error(error);
    showToast("Failed to load products", "error");
  }
}

function renderAvailableProducts(productList) {
  if (!productList.length) {
    renderEmptyState(availableProductsList, "No available products.");
    return;
  }

  availableProductsList.innerHTML = productList
    .map(
      (product) => `
        <div class="soft-list-item">
          <div class="soft-list-left">
            <div class="product-icon">
              <i data-lucide="package"></i>
            </div>
            <div class="product-meta">
              <div class="product-name">${product.name}</div>
              <div class="product-price">${formatCurrency(product.price)}</div>
            </div>
          </div>
          <div class="stock-pill">Stock: ${product.stock_quantity}</div>
        </div>
      `
    )
    .join("");

  refreshLucideIcons();
}

addToCartButton.addEventListener("click", () => {
  const productId = Number(productSelect.value);
  const quantity = selectedQuantity;

  if (!productId || quantity <= 0) {
    showToast("Select a valid product and quantity", "error");
    return;
  }

  const product = products.find((p) => p.id === productId);

  if (!product) {
    showToast("Product not found", "error");
    return;
  }

  if (quantity > Number(product.stock_quantity)) {
    showToast("Not enough stock", "error");
    return;
  }

  const existing = cart.find((item) => item.product_id === productId);

  if (existing) {
    if (existing.quantity + quantity > Number(product.stock_quantity)) {
      showToast("Not enough stock for combined quantity", "error");
      return;
    }
    existing.quantity += quantity;
  } else {
    cart.push({
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_price: Number(product.price)
    });
  }

  selectedQuantity = 1;
  updateQuantityUI();
  renderCart();
  showToast("Item added to cart", "success");
});

function renderCart() {
  if (!cart.length) {
    cartTable.innerHTML = "";
    const emptyZone = document.querySelector(".cart-empty-zone");
    emptyZone.innerHTML = `<div class="empty-state">Your cart is empty.</div>`;
    cartTotal.textContent = formatCurrency(0);
    return;
  }

  const emptyZone = document.querySelector(".cart-empty-zone");
  emptyZone.innerHTML = "";

  cartTable.innerHTML = cart
    .map(
      (item, index) => `
        <tr>
          <td>${item.product_name}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.unit_price)}</td>
          <td>${formatCurrency(item.unit_price * item.quantity)}</td>
          <td>
            <button class="btn btn-danger icon-btn" onclick="removeCartItem(${index})">
              <i data-lucide="trash-2"></i>
              <span>Remove</span>
            </button>
          </td>
        </tr>
      `
    )
    .join("");

  const total = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  cartTotal.textContent = formatCurrency(total);

  refreshLucideIcons();
}

window.removeCartItem = function (index) {
  cart.splice(index, 1);
  renderCart();
};

submitSaleButton.addEventListener("click", async () => {
  if (!cart.length) {
    showToast("Cart is empty", "error");
    return;
  }

  setButtonLoading(submitSaleButton, true, "Creating...");

  try {
    const response = await apiFetch("/sales/", {
      method: "POST",
      body: JSON.stringify({
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.detail || "Sale creation failed", "error");
      return;
    }

    showToast(`Sale #${data.id} created`, "success");
    cart = [];
    renderCart();
    loadProducts();
  } catch (error) {
    console.error(error);
    showToast("Request failed", "error");
  } finally {
    setButtonLoading(submitSaleButton, false);
  }
});

loadProducts();
renderCart();
updateQuantityUI();
