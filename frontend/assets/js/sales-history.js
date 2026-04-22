import { apiFetch } from "./config.js";
import { requireAuth, initSidebarLogout } from "./auth.js";
import { formatCurrency, formatDate, renderEmptyState, showToast } from "./ui.js";

requireAuth();
initSidebarLogout();

const salesHistoryTable = document.getElementById("salesHistoryTable");
const saleDetailPanel = document.getElementById("saleDetailPanel");

function refreshLucideIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

async function loadSalesHistory() {
  try {
    const response = await apiFetch("/sales/");
    const sales = await response.json();

    if (!response.ok) {
      showToast(sales.detail || "Failed to load sales history", "error");
      return;
    }

    if (!sales.length) {
      renderEmptyState(salesHistoryTable.closest(".card-body"), "No sales found.");
      return;
    }

    salesHistoryTable.innerHTML = sales
      .map(
        (sale) => `
        <tr>
          <td>#${sale.id}</td>
          <td>${formatCurrency(sale.total_price)}</td>
          <td>${formatDate(sale.created_at)}</td>
          <td>
            <button class="btn btn-secondary icon-btn" onclick="viewSaleDetail(${sale.id})">
              <i data-lucide="eye"></i>
              <span>View</span>
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    refreshLucideIcons();
  } catch (error) {
    console.error(error);
    showToast("Request failed", "error");
  }
}

window.viewSaleDetail = async function (saleId) {
  try {
    const response = await apiFetch(`/sales/${saleId}`);
    const sale = await response.json();

    if (!response.ok) {
      showToast(sale.detail || "Failed to load sale detail", "error");
      return;
    }

    saleDetailPanel.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:18px;">
        <div>
          <div class="metric-note">Sale ID</div>
          <div class="stat-value" style="font-size:28px;">#${sale.id}</div>
        </div>

        <div>
          <div class="metric-note">Created At</div>
          <div>${formatDate(sale.created_at)}</div>
        </div>

        <div>
          <div class="metric-note">Total</div>
          <div style="font-size:24px; font-weight:700;">${formatCurrency(sale.total_price)}</div>
        </div>

        <div>
          <div class="metric-note" style="margin-bottom:10px;">Items</div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${sale.items
                  .map(
                    (item) => `
                    <tr>
                      <td>${item.product_name}</td>
                      <td>${item.quantity}</td>
                      <td>${formatCurrency(item.unit_price)}</td>
                      <td>${formatCurrency(item.total_price)}</td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    refreshLucideIcons();
  } catch (error) {
    console.error(error);
    showToast("Request failed", "error");
  }
};

loadSalesHistory();
