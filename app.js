const tg = window.Telegram?.WebApp;

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

const btnLogin = document.getElementById('btn-login');
const btnSend = document.getElementById('btn-send');
const userName = document.getElementById('user-name');

if (tg) {
  tg.ready();
  const user = tg.initDataUnsafe?.user;
  if (user) {
    userName.textContent = user.first_name || '';
  }
}

btnLogin.onclick = () => {
  if (!tg) return alert('Открой через Telegram');
  show('screen-main');
};

btnSend.onclick = () => {
  const payload = {
    order: document.getElementById('order-id').value,
    status: document.getElementById('order-status').value,
    comment: document.getElementById('order-comment').value,
    time: Date.now()
  };
  tg.sendData(JSON.stringify(payload));
  tg.showAlert('Отчёт отправлен');
};
