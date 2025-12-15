const tg = window.Telegram.WebApp;
tg.expand();

document.getElementById("loginBtn").onclick = () => {
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("dashboard-screen").classList.add("active");
};
