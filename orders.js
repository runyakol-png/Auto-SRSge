function goBack() {
  window.location.href = "app.html";
}

async function loadOrders() {
  const res = await fetch("/api/add-order");
  const data = await res.json();

  const root = document.getElementById("orders");
  root.innerHTML = "";

  data.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
      <div class="order-header">
        Заказ #${order.orderId || "—"}
      </div>

      ${order.items.map(i => `
        <div class="order-row">
          <span>${i.name}</span>
          <button class="status ${i.done ? "done" : "not-done"}">
            ${i.done ? "ГОТОВО" : "НЕ ГОТОВО"}
          </button>
        </div>
      `).join("")}

      <div class="order-master">
        Мастер: ${order.master || "—"}
      </div>
    `;

    root.appendChild(card);
  });
}

loadOrders();
