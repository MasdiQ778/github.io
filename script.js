const admins = [
  { username: "admin1", password: "1234" },
  { username: "admin2", password: "1234" },
  { username: "admin3", password: "1234" },
  { username: "admin4", password: "1234" },
];

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const found = admins.find(a => a.username === user && a.password === pass);
  if (found) {
    localStorage.setItem("admin", user);
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("error").innerText = "Login gagal!";
  }
}

function logout() {
  localStorage.removeItem("admin");
  window.location.href = "index.html";
}

function checkLogin() {
  if (!localStorage.getItem("admin")) {
    window.location.href = "index.html";
  }
}

if (window.location.pathname.includes("dashboard.html")) {
  checkLogin();
  window.onload = function () {
    renderActiveBilling();
    renderHistory();
  };
}

function startBilling() {
  const name = document.getElementById("customer").value;
  const dur = parseInt(document.getElementById("duration").value);
  if (!name || !dur) return alert("Lengkapi data!");
  const pricePerHour = 5000;
  const now = new Date();
  const billing = {
    name,
    duration: dur,
    time: now.toLocaleTimeString(),
    endTime: Date.now() + dur * 60000,
    price: ((dur / 60) * pricePerHour).toFixed(0)
  };
  let active = JSON.parse(localStorage.getItem("active")) || [];
  active.push(billing);
  localStorage.setItem("active", JSON.stringify(active));
  renderActiveBilling();
}

function renderActiveBilling() {
  const wrap = document.getElementById("activeBilling");
  if (!wrap) return;
  wrap.innerHTML = "";
  let data = JSON.parse(localStorage.getItem("active")) || [];
  data.forEach((item, i) => {
    const remain = Math.max(0, item.endTime - Date.now());
    const mins = Math.floor(remain / 60000);
    const secs = Math.floor((remain % 60000) / 1000);
    const div = document.createElement("div");
    div.innerHTML = `<strong>${item.name}</strong><br>
      Sisa Waktu: ${mins}m ${secs}s<br>
      Harga: Rp ${item.price}<br>
      <button onclick="finishBilling(${i})">Selesai</button>`;
    wrap.appendChild(div);
  });
  setTimeout(renderActiveBilling, 1000);
}

function finishBilling(index) {
  let active = JSON.parse(localStorage.getItem("active")) || [];
  const item = active.splice(index, 1)[0];
  localStorage.setItem("active", JSON.stringify(active));
  let history = JSON.parse(localStorage.getItem("history")) || [];
  history.push({
    name: item.name,
    duration: Math.round((item.endTime - Date.now()) / 60000),
    price: item.price,
    time: item.time,
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const tbody = document.querySelector("#billingTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  const history = JSON.parse(localStorage.getItem("history")) || [];
  history.forEach(item => {
    const row = `<tr><td>${item.name}</td><td>${item.duration}m</td><td>Rp ${item.price}</td><td>${item.time}</td></tr>`;
    tbody.innerHTML += row;
  });
}

function clearToday() {
  const today = new Date().toLocaleDateString();
  let history = JSON.parse(localStorage.getItem("history")) || [];
  history = history.filter(h => h.date !== today);
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

function exportExcel() {
  const ws = XLSX.utils.table_to_sheet(document.getElementById("billingTable"));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Riwayat");
  XLSX.writeFile(wb, "riwayat_billing.xlsx");
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Riwayat Billing Raja Game", 10, 10);
  const rows = [...document.querySelectorAll("#billingTable tbody tr")].map(tr => [...tr.children].map(td => td.innerText));
  doc.autoTable({ head: [["Nama", "Durasi", "Harga", "Waktu"]], body: rows, startY: 20 });
  doc.save("riwayat_billing.pdf");
}
