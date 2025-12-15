const orders = [
  {
    id: "4189",
    car: "Mercedes",
    items: [
      { name: "Торпедо", status: "pending" },
      { name: "Руль", status: "pending" },
      { name: "Штора", status: "pending" }
    ]
  },
  {
    id: "4190",
    car: "BMW",
    items: [
      { name: "Потолок", status: "done" }
    ]
  }
];

const container = document.getElementById("orders");

function render() {
  container.innerHTML = "";

  orders.forEach(order => {
    const el = document.createElement("div");
    el.className = "order";

    el.innerHTML = `
      <div class="order-title">Заказ #${order.id} · ${order.car}</div>
      ${order.items.map((item, i) => `
        <div class="item">
          <span>${item.name}</span>
          <span class="status ${item.status}"
            onclick="toggle(${orders.indexOf(order)}, ${i})">
            ${item.status === "done" ? "ГОТОВО" : "НЕ ГОТОВО"}
          </span>
        </div>
      `).join("")}
    `;

    container.appendChild(el);
  });
}

function toggle(orderIndex, itemIndex) {
  const item = orders[orderIndex].items[itemIndex];
  item.status = item.status === "done" ? "pending" : "done";
  render();
}

render();
