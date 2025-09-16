// ---------- Product ----------
class Pizza {
  constructor({ size, toppings, addons, delivery }) {
    this.size = size;
    this.toppings = toppings || [];
    this.addons = addons || [];
    this.delivery = delivery;
    this.createdAt = new Date().toISOString();
  }
  toString() {
    return `${this.size} pizza — ${this.toppings.join(', ') || 'no toppings'}${this.addons.length ? ' + ' + this.addons.join(', ') : ''} (${this.delivery})`;
  }
}

// ---------- Builder ----------
class PizzaBuilder {
  constructor() {
    this.size = 'Medium';
    this.toppings = [];
    this.addons = [];
    this.delivery = 'Pickup';
  }
  setSize(size) { this.size = size; return this; }
  addTopping(t) { this.toppings.push(t); return this; }
  addAddon(a) { this.addons.push(a); return this; }
  setDelivery(d) { this.delivery = d; return this; }
  build() {
    // return a Pizza instance (immutable-ish snapshot)
    return new Pizza({
      size: this.size,
      toppings: [...this.toppings],
      addons: [...this.addons],
      delivery: this.delivery
    });
  }
}

// ---------- Singleton OrderManager ----------
class OrderManager {
  constructor() {
    // enforce singleton
    if (OrderManager._instance) return OrderManager._instance;
    this.orders = [];
    OrderManager._instance = this;
  }
  static getInstance() {
    return OrderManager._instance || new OrderManager();
  }
  placeOrder(pizza) {
    this.orders.push(pizza);
  }
  removeOrder(index) {
    if (index >= 0 && index < this.orders.length) this.orders.splice(index, 1);
  }
  clearOrders() { this.orders = []; }
  getAll() { return [...this.orders]; } // return a shallow copy
}

// ---------- DOM wiring ----------
const sizeEl = document.getElementById('size');
const deliveryEl = document.getElementById('delivery');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const ordersList = document.getElementById('ordersList');
const placeAllBtn = document.getElementById('placeAllBtn');
const showJsonBtn = document.getElementById('showJsonBtn');
const jsonOutput = document.getElementById('jsonOutput');

function getCheckedValues(selector) {
  return Array.from(document.querySelectorAll(selector + ':checked')).map(i => i.value);
}

function renderOrders() {
  const manager = OrderManager.getInstance();
  ordersList.innerHTML = '';
  manager.getAll().forEach((o, idx) => {
    const li = document.createElement('li');
    li.className = 'order-item';
    li.innerHTML = `
      <div>
        <strong>Order ${idx+1}</strong>
        <small>${o.toString()}</small>
      </div>
      <div>
        <button data-index="${idx}" class="removeBtn">Remove</button>
      </div>`;
    ordersList.appendChild(li);
  });

  // attach remove handlers
  Array.from(document.querySelectorAll('.removeBtn')).forEach(btn=>{
    btn.addEventListener('click', () => {
      const i = +btn.dataset.index;
      OrderManager.getInstance().removeOrder(i);
      renderOrders();
    });
  });

  jsonOutput.classList.add('hidden');
}

addBtn.addEventListener('click', () => {
  const builder = new PizzaBuilder()
    .setSize(sizeEl.value)
    .setDelivery(deliveryEl.value);

  getCheckedValues('.topping').forEach(t => builder.addTopping(t));
  getCheckedValues('.addon').forEach(a => builder.addAddon(a));

  const pizza = builder.build();
  OrderManager.getInstance().placeOrder(pizza);
  renderOrders();
});

clearBtn.addEventListener('click', () => {
  // reset form to defaults
  document.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);
  sizeEl.value = 'Medium';
  deliveryEl.value = 'Home Delivery';
});

placeAllBtn.addEventListener('click', () => {
  const manager = OrderManager.getInstance();
  if (manager.getAll().length === 0) { alert('Cart is empty'); return; }
  // simulate placing orders
  alert(`Placing ${manager.getAll().length} order(s). Check console for JSON.`);
  console.log('Placed orders:', manager.getAll());
  manager.clearOrders();
  renderOrders();
});

showJsonBtn.addEventListener('click', () => {
  const manager = OrderManager.getInstance();
  jsonOutput.textContent = JSON.stringify(manager.getAll(), null, 2);
  jsonOutput.classList.toggle('hidden');
});

// initial render
renderOrders();
