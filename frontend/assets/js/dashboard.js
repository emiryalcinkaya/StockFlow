import { apiFetch } from "./config.js";
import { requireAuth, initSidebarLogout } from "./auth.js";
import { formatCurrency, formatDate, renderEmptyState, showToast } from "./ui.js";

requireAuth();
initSidebarLogout();

const totalProductsEl = document.getElementById("totalProducts");
const lowStockCountEl = document.getElementById("lowStockCount");
const totalSalesEl = document.getElementById("totalSales");
const totalRevenueEl = document.getElementById("totalRevenue");
const recentSalesTable = document.getElementById("recentSalesTable");

async function loadDashboard() {
  try {
    const [productsRes, salesRes] = await Promise.all([
      apiFetch("/products/"),
      apiFetch("/sales/")
    ]);

    const products = await productsRes.json();
    const sales = await salesRes.json();

    if (!productsRes.ok) {
      showToast(products.detail || "Failed to load products", "error");
      return;
    }

    if (!salesRes.ok) {
      showToast(sales.detail || "Failed to load sales", "error");
      return;
    }

    const lowStockCount = products.filter(
      (product) => Number(product.stock_quantity) < 5
    ).length;

    const revenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total_price || 0),
      0
    );

    totalProductsEl.textContent = products.length;
    lowStockCountEl.textContent = lowStockCount;
    totalSalesEl.textContent = sales.length;
    totalRevenueEl.textContent = formatCurrency(revenue);

    renderRecentSales(sales.slice(0, 5));
  } catch (error) {
    console.error(error);
    showToast("Failed to load dashboard", "error");
  }
}

function renderRecentSales(sales) {
  if (!sales.length) {
    renderEmptyState(recentSalesTable.closest(".card-body"), "No sales found yet.");
    return;
  }

  recentSalesTable.innerHTML = sales
    .map(
      (sale) => `
        <tr>
          <td>#${sale.id}</td>
          <td>${formatCurrency(sale.total_price)}</td>
          <td>${formatDate(sale.created_at)}</td>
        </tr>
      `
    )
    .join("");
}

loadDashboard();