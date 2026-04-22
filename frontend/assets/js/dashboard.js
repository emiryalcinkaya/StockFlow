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
    const summaryRes = await apiFetch("/dashboard/summary");
    const summary = await summaryRes.json();

    if (!summaryRes.ok) {
      showToast(summary.detail || "Failed to load dashboard", "error");
      return;
    }

    totalProductsEl.textContent = summary.total_products;
    lowStockCountEl.textContent = summary.low_stock;
    totalSalesEl.textContent = summary.total_sales;
    totalRevenueEl.textContent = formatCurrency(Number(summary.revenue));

    const salesRes = await apiFetch("/sales/");
    const sales = await salesRes.json();

    if (!salesRes.ok) {
      showToast(sales.detail || "Failed to load sales", "error");
      return;
    }

    renderRecentSales(sales.slice(0, 5));

  } catch (error) {
    console.error(error);
    showToast("Failed to load dashboard", "error");
  }
}

function renderRecentSales(sales) {
  if (!sales.length) {
    renderEmptyState(
      recentSalesTable.closest(".card-body"),
      "No sales found yet."
    );
    return;
  }

  recentSalesTable.innerHTML = sales
    .map(
      (sale) => `
        <tr>
          <td>#${sale.id}</td>
          <td>${formatCurrency(Number(sale.total_price))}</td>
          <td>${formatDate(sale.created_at)}</td>
        </tr>
      `
    )
    .join("");
}

loadDashboard();