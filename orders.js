function goBack() {
  window.location.href = "app.html";
}

const API_URL = "https://auto-srs-backend-1.onrender.com";

let ALL_ORDERS = [];
let SEARCH_OPEN = false;
let AUTO_REFRESH = true;

// ================= LOAD ORDERS =================
async function loadOrders() {
  try {
    const res = await fetch(`${API_URL}/orders`);
    const data = await res.json();

    ALL_ORDERS = data;

    // ⚠️ если идет поиск — НЕ перерисовываем
    if (!SEARCH_OPEN) {
      renderOrders(data);
    }

  } catch (err) {
    console.error("Ошибка загрузки заказов:", err);
    document.getElementById("orders").innerHTML =
      "<div class='error'>Ошибка загрузки заказов</div>";
  }
}

// ================= RENDER =================
function renderOrders(orders, query = "") {
  const root = document.getElementById("orders");
  root.innerHTML = "";

  if (!orders.length) {
    root.innerHTML = "<div class='empty'>Ничего не найдено</div>";
    return;
  }

  orders.forEach((order, idx) => {
    const card = document.createElement("div");
    card.className = "order-card";
    if (idx === 0 && query) card.id = "first-found";

    card.innerHTML = `
      <div class="order-header">
        <span>${highlight(order.title, query)}</span>

        <div class="order-actions">
          <button class="edit-btn" onclick="editOrder(${order.id})">✏️</button>
          <button class="delete-btn" onclick="deleteOrder(${order.id})">🗑</button>
        </div>
      </div>

      <div class="order-items">
        ${order.items.map((item, index) => `
          <div class="order-row">
            <span>${highlight(item.name, query)}</span>
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
        Мастер: ${highlight(order.master || "—", query)}
      </div>

      <div class="order-date">
        ${new Date(order.createdAt).toLocaleString()}
      </div>
    `;

    root.appendChild(card);
  });

  // 📌 автоскролл к первому найденному
  if (query) {
    setTimeout(() => {
      const el = document.getElementById("first-found");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
}

// ================= SEARCH =================
function toggleSearch() {
  const box = document.getElementById("searchBox");
  const input = document.getElementById("searchInput");

  SEARCH_OPEN = !SEARCH_OPEN;
  AUTO_REFRESH = !SEARCH_OPEN;

  box.style.display = SEARCH_OPEN ? "block" : "none";
  input.value = "";

  if (!SEARCH_OPEN) {
    renderOrders(ALL_ORDERS);
  }

  if (SEARCH_OPEN) {
    setTimeout(() => input.focus(), 50);
  }
}

function handleSearchKey(e) {
  if (e.key === "Enter") {
    applySearch();
  }
}

function applySearch() {
  AUTO_REFRESH = false;

  const query = document
    .getElementById("searchInput")
    .value
    .toLowerCase();

  if (!query) {
    AUTO_REFRESH = true;
    renderOrders(ALL_ORDERS);
    return;
  }

  const filtered = ALL_ORDERS.filter(order =>
    order.title.toLowerCase().includes(query) ||
    order.master.toLowerCase().includes(query) ||
    order.items.some(i => i.name.toLowerCase().includes(query))
  );

  renderOrders(filtered, query);
}

// ================= HIGHLIGHT =================
function highlight(text, query) {
  if (!query || !text) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(`(${escaped})`, "gi"),
    `<mark style="background:#ff000055;color:#fff;border-radius:4px;padding:0 3px;">$1</mark>`
  );
}

// ================= STATUS =================
async function toggleItem(orderId, index) {
  await fetch(`${API_URL}/orders/${orderId}/items/${index}`, {
    method: "PATCH"
  });
  loadOrders();
}

// ================= DELETE =================
async function deleteOrder(orderId) {
  if (!confirm("Удалить заказ полностью?")) return;
  await fetch(`${API_URL}/orders/${orderId}`, { method: "DELETE" });
  loadOrders();
}

// ================= EDIT FULL ORDER =================
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

// ================= START =================
loadOrders();

setInterval(() => {
  if (AUTO_REFRESH) {
    loadOrders();
  }
}, 5000);
