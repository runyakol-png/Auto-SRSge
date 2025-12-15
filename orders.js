function goBack() {
  window.location.href = "app.html";
}

const API_URL = "https://auto-srs-backend-1.onrender.com";

// ===== ЗАГРУЗКА ЗАКАЗОВ =====
async function loadOrders() {
  try {
    const res = await fetch(`${API_URL}/orders`);
    const data = await res.json();

    const root = document.getElementById("orders");
    root.innerHTML = "";

    if (!data.length) {
      root.innerHTML = "<div class='empty'>Заказов пока нет</div>";
      return;
    }

    data.forEach(order => {
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

  } catch (err) {
    console.error("Ошибка загрузки заказов:", err);
    document.getElementById("orders").innerHTML =
      "<div class='error'>Ошибка загрузки заказов</div>";
  }
}

// ===== ПЕРЕКЛЮЧЕНИЕ СТАТУСА ПОЗИЦИИ =====
async function toggleItem(orderId, index) {
  try {
    await fetch(`${API_URL}/orders/${orderId}/items/${index}`, {
      method: "PATCH"
    });
    loadOrders();
  } catch (err) {
    console.error("Ошибка изменения статуса:", err);
  }
}

// ===== УДАЛЕНИЕ ЗАКАЗА =====
async function deleteOrder(orderId) {
  if (!confirm("Удалить заказ полностью?")) return;

  try {
    await fetch(`${API_URL}/orders/${orderId}`, {
      method: "DELETE"
    });
    loadOrders();
  } catch (err) {
    console.error("Ошибка удаления заказа:", err);
  }
}

// ===== РЕДАКТИРОВАНИЕ ВСЕГО ЗАКАЗА =====
async function editOrder(orderId) {
  try {
    // получаем актуальный заказ
    const orders = await fetch(`${API_URL}/orders`).then(r => r.json());
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // собираем текст в привычном виде
    const rawText = [
      order.title,
      ...order.items.map(i => i.name),
      order.master ? `Р/с ${order.master}` : ""
    ]
      .filter(Boolean)
      .join("\n");

    const edited = prompt("Редактировать заказ целиком:", rawText);
    if (!edited) return;

    await fetch(`${API_URL}/orders/${orderId}/raw`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: edited })
    });

    loadOrders();
  } catch (err) {
    console.error("Ошибка редактирования заказа:", err);
  }
}

// ===== START =====
loadOrders();
setInterval(loadOrders, 5000);
