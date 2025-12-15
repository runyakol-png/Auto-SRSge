function goBack() {
  window.location.href = "app.html";
}

const API_URL = "https://auto-srs-backend-1.onrender.com/orders";

async function loadOrders() {
  try {
    const res = await fetch(API_URL);
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
          ${order.title}
        </div>

        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-row">
              <span>${item.name}</span>
              <button class="status ${item.done ? "done" : "not-done"}">
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

loadOrders();
setInterval(loadOrders, 5000);
