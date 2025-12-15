function goBack() {
  window.location.href = "app.html";
}

const API_URL = "https://auto-srs-backend-1.onrender.com";

let ALL_ORDERS = [];
let SEARCH_OPEN = false;

// ===== LOAD =====
async function loadOrders() {
  const res = await fetch(`${API_URL}/orders`);
  const data = await res.json();
  ALL_ORDERS = data;
  renderOrders(data);
}

// ===== RENDER =====
function renderOrders(orders) {
  const root = document.getElementById("orders");
  root.innerHTML = "";

  if (!orders.length) {
    root.innerHTML = "<div class='empty'>Ничего не найдено</div>";
    return;
  }

  orders.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
      <div class="order-header">
        <span>${order.title}</span>

        <div class="order-actions">
          <button class="edit-btn" onclick="editOrder(${order.id})">✏️</button>
          <button class="delete-btn" onclick="deleteOrder(${order.id})">🗑</button>
        </div>
      </div>

      <div class="order-items">
        ${order.items.map((item, index) => `
          <div class="order-row">
            <span>${item.name}</span>
            <button
              class="status ${item.done ? "done" : "not-done"}"
              onclick="toggleItem(${order.id}, ${index})"
            >
              ${item.done ? "ГОТОВО" : "НЕ ГОТОВО"}
            </button>
          </div>
        `).join("")}
      </div>

      <div class="order-master">
        Мастер: ${order.master || "—"}
      </div>

      <div class="order-date">
        ${new Date(order.createdAt).toLocaleString()}
      </div>
    `;

    root.appendChild(card);
  });
}

// ===== SEARCH =====
function toggleSearch() {
  const input = document.getElementById("searchInput");
  SEARCH_OPEN = !SEARCH_OPEN;
  input.style.display = SEARCH_OPEN ? "block" : "none";
  input.value = "";
  renderOrders(ALL_ORDERS);
  if (SEARCH_OPEN) input.focus();
}

function applySearch() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  const filtered = ALL_ORDERS.filter(o =>
    o.title.toLowerCase().includes(q)
  );
  renderOrders(filtered);
}

// ===== STATUS =====
async function toggleItem(orderId, index) {
  await fetch(`${API_URL}/orders/${orderId}/items/${index}`, { method: "PATCH" });
  loadOrders();
}

// ===== DELETE =====
async function deleteOrder(orderId) {
  if (!confirm("Удалить заказ полностью?")) return;
  await fetch(`${API_URL}/orders/${orderId}`, { method: "DELETE" });
  loadOrders();
}

// ===== EDIT FULL ORDER =====
async function editOrder(orderId) {
  const order = ALL_ORDERS.find(o => o.id === orderId);
  if (!order) return;

  const text = [
    order.title,
    ...order.items.map(i => i.name),
    order.master ? `Р/с ${order.master}` : ""
  ].join("\n");

  const edited = prompt("Редактировать заказ:", text);
  if (!edited) return;

  await fetch(`${API_URL}/orders/${orderId}/raw`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: edited })
  });

  loadOrders();
}

// ===== START =====
loadOrders();
setInterval(loadOrders, 5000);
