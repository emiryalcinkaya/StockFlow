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

const productsTable = document.getElementById("productsTable");
const productForm = document.getElementById("productForm");
const addProductButton = document.getElementById("addProductButton");

const stockModalOverlay = document.getElementById("stockModalOverlay");
const stockModalTitle = document.getElementById("stockModalTitle");
const stockModalQuantity = document.getElementById("stockModalQuantity");
const closeStockModalBtn = document.getElementById("closeStockModalBtn");
const cancelStockModalBtn = document.getElementById("cancelStockModalBtn");
const confirmStockModalBtn = document.getElementById("confirmStockModalBtn");

const editModalOverlay = document.getElementById("editModalOverlay");
const editName = document.getElementById("editName");
const editBarcode = document.getElementById("editBarcode");
const editPrice = document.getElementById("editPrice");
const editStock = document.getElementById("editStock");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");
const cancelEditModalBtn = document.getElementById("cancelEditModalBtn");
const saveEditModalBtn = document.getElementById("saveEditModalBtn");

const deleteModalOverlay = document.getElementById("deleteModalOverlay");
const closeDeleteModalBtn = document.getElementById("closeDeleteModalBtn");
const cancelDeleteModalBtn = document.getElementById("cancelDeleteModalBtn");
const confirmDeleteModalBtn = document.getElementById("confirmDeleteModalBtn");
const deleteModalText = document.getElementById("deleteModalText");

let currentStockProductId = null;
let currentStockAction = null;
let currentEditProductId = null;
let currentDeleteProductId = null;

async function loadProducts() {
  try {
    const response = await apiFetch("/products/");
    const products = await response.json();

    if (!response.ok) {
      showToast(products.detail || "Failed to load products", "error");
      return;
    }

    if (!products.length) {
      productsTable.innerHTML = "";
      renderEmptyState(productsTable.closest(".card-body"), "No active products found.");
      return;
    }

    const oldEmptyState = productsTable.closest(".card-body").querySelector(".empty-state");
    if (oldEmptyState) oldEmptyState.remove();

    productsTable.innerHTML = products
      .map(
        (product) => `
          <tr>
            <td>${product.id}</td>
            <td><strong>${product.name}</strong></td>
            <td>${product.barcode}</td>
            <td>${formatCurrency(product.price)}</td>
            <td class="${Number(product.stock_quantity) < 5 ? "stock-low" : "stock-good"}">
              ${product.stock_quantity}
            </td>
            <td>
              <div class="row-actions">
                <button
                  class="btn btn-secondary icon-btn"
                  onclick="openEditModal(${product.id}, '${escapeQuotes(product.name)}', '${escapeQuotes(product.barcode)}', ${Number(product.price)}, ${Number(product.stock_quantity)})"
                >
                  <i data-lucide="square-pen"></i>
                  <span>Edit</span>
                </button>

                <button
                  class="btn btn-secondary icon-btn"
                  onclick="openStockModal(${product.id}, 'increase')"
                >
                  <i data-lucide="package-plus"></i>
                  <span>Stock In</span>
                </button>

                <button
                  class="btn btn-secondary icon-btn"
                  onclick="openStockModal(${product.id}, 'decrease')"
                >
                  <i data-lucide="package-minus"></i>
                  <span>Stock Out</span>
                </button>

                <button
                  class="btn btn-danger icon-btn"
                  onclick="openDeleteModal(${product.id}, '${escapeQuotes(product.name)}')"
                >
                  <i data-lucide="archive"></i>
                  <span>Archive</span>
                </button>
              </div>
            </td>
          </tr>
        `
      )
      .join("");

    if (window.lucide) {
      lucide.createIcons();
    }
  } catch (error) {
    console.error(error);
    showToast("Request failed", "error");
  }
}

function escapeQuotes(value) {
  return String(value).replace(/'/g, "\\'");
}

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById("name").value.trim(),
    barcode: document.getElementById("barcode").value.trim(),
    price: Number(document.getElementById("price").value),
    stock_quantity: Number(document.getElementById("stock_quantity").value)
  };

  setButtonLoading(addProductButton, true, "Adding...");

  try {
    const response = await apiFetch("/products/", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.detail || "Failed to add product", "error");
      return;
    }

    showToast("Product added", "success");
    productForm.reset();
    loadProducts();
  } catch (error) {
    console.error(error);
    showToast("Request failed", "error");
  } finally {
    setButtonLoading(addProductButton, false);
  }
});

window.openStockModal = function (productId, action) {
  currentStockProductId = productId;
  currentStockAction = action;
  stockModalQuantity.value = "";
  stockModalTitle.textContent =
    action === "increase" ? "Increase Stock" : "Decrease Stock";
  stockModalOverlay.classList.add("show");
};

function closeStockModal() {
  stockModalOverlay.classList.remove("show");
  currentStockProductId = null;
  currentStockAction = null;
}

confirmStockModalBtn.addEventListener("click", async () => {
  const quantity = Number(stockModalQuantity.value);

  if (!quantity || quantity <= 0) {
    showToast("Enter a valid quantity", "error");
    return;
  }

  const endpoint =
    currentStockAction === "increase"
      ? `/products/${currentStockProductId}/increase-stock`
      : `/products/${currentStockProductId}/decrease-stock`;

  try {
    const response = await apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ quantity })
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.detail || "Stock update failed", "error");
      return;
    }

    showToast("Stock updated", "success");
    closeStockModal();
    loadProducts();
  } catch (error) {
    console.error(error);
    showToast("Request failed", "error");
  }
});

window.openEditModal = function (id, name, barcode, price, stock) {
  currentEditProductId = id;
  editName.value = name;
  editBarcode.value = barcode;
  editPrice.value = price;
  editStock.value = stock;
  editModalOverlay.classList.add("show");
};

function closeEditModal() {
  editModalOverlay.classList.remove("show");
  currentEditProductId = null;
}

saveEditModalBtn.addEventListener("click", async () => {
  const payload = {
    name: editName.value.trim(),
    barcode: editBarcode.value.trim(),
    price: Number(editPrice.value),
    stock_quantity: Number(editStock.value)
  };

  try {
    const response = await apiFetch(`/products/${currentEditProductId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.detail || "Update failed", "error");
      return;
    }

    showToast("Product updated", "success");
    closeEditModal();
    loadProducts();
  } catch (error) {
    console.error(error);
    showToast("Request failed", "error");
  }
});

window.openDeleteModal = function (id, name) {
  currentDeleteProductId = id;
  deleteModalText.textContent = `Are you sure you want to archive "${name}"?`;
  deleteModalOverlay.classList.add("show");
};

function closeDeleteModal() {
  deleteModalOverlay.classList.remove("show");
  currentDeleteProductId = null;
}

confirmDeleteModalBtn.addEventListener("click", async () => {
  try {
    const response = await apiFetch(`/products/${currentDeleteProductId}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.detail || "Archive failed", "error");
      return;
    }

    showToast("Product archived", "success");
    closeDeleteModal();
    loadProducts();
  } catch (error) {
    console.error(error);
    showToast("Request failed", "error");
  }
});

closeStockModalBtn.addEventListener("click", closeStockModal);
cancelStockModalBtn.addEventListener("click", closeStockModal);

closeEditModalBtn.addEventListener("click", closeEditModal);
cancelEditModalBtn.addEventListener("click", closeEditModal);

closeDeleteModalBtn.addEventListener("click", closeDeleteModal);
cancelDeleteModalBtn.addEventListener("click", closeDeleteModal);

stockModalOverlay.addEventListener("click", (e) => {
  if (e.target === stockModalOverlay) closeStockModal();
});

editModalOverlay.addEventListener("click", (e) => {
  if (e.target === editModalOverlay) closeEditModal();
});

deleteModalOverlay.addEventListener("click", (e) => {
  if (e.target === deleteModalOverlay) closeDeleteModal();
});

loadProducts();
