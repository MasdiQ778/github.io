const admins = [
  { username: "admin1", password: "1234" },
  { username: "admin2", password: "1234" },
  { username: "admin3", password: "1234" },
  { username: "admin4", password: "1234" },
];

function logout() {
  localStorage.removeItem("admin");
  window.location.href = "index.html";
}

function initDashboard() {
  if (!localStorage.getItem("admin")) {
    window.location.href = "index.html";
  }
  updateActiveBilling();
  updateHistoryTable();
}

function startBilling() {
  const name = document.getElementById("customer").value;
  const minutes = parseInt(document.getElementById("duration").value);
  if (!name || !minutes) return alert("Isi nama dan durasi!");

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + minutes * 60000);
  const pricePerHour = 5000;
  const price = Math.round((minutes / 60) * pricePerHour);

  const billing = {
    name,
    duration: minutes,
    startTime: startTime.toLocaleTimeString(),
    endTime: endTime.getTime(),
    price
  };

  const active = JSON.parse(localStorage.getItem("activeBilling") || "[]");
  active.push(billing);
  localStorage.setItem("activeBilling", JSON.stringify(active));
  updateActiveBilling();
}

function updateActiveBilling() {
  const container = document.getElementById("activeBillingList");
  container.innerHTML = "";
  const now = Date.now();
  const list = JSON.parse(localStorage.getItem("activeBilling") || "[]");

  list.forEach((item, index) => {
    const remaining = Math.max(0, item.endTime - now);
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);

    const card = document.createElement("div");
    card.className = "billing-card";
    card.innerHTML = `
      <strong>${item.name}</strong><br>
      Sisa: ${mins}m ${secs}s<br>
      Harga: Rp ${item.price}<br>
      <button onclick="finishBilling(${index})">Selesai</button>
    `;
    container.appendChild(card);
  });

  setTimeout(updateActiveBilling, 1000);
}

function finishBilling(index) {
  let active = JSON.parse(localStorage.getItem("activeBilling") || "[]");
  const finished = active.splice(index, 1)[0];
  localStorage.setItem("activeBilling", JSON.stringify(active));

  const history = JSON.parse(localStorage.getItem("billingHistory") || "[]");
  history.push({
    name: finished.name,
    duration: finished.duration + "m",
    price: finished.price,
    startTime: finished.startTime,
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem("billingHistory", JSON.stringify(history));
  updateHistoryTable();
}

function updateHistoryTable() {
  const tbody = document.getElementById("history-table-body");
  tbody.innerHTML = "";
  const history = JSON.parse(localStorage.getItem("billingHistory") || "[]");

  history.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.duration}</td>
      <td>Rp ${item.price}</td>
      <td>${item.startTime}</td>
    `;
    tbody.appendChild(row);
  });
}

function clearTodayHistory() {
  const today = new Date().toLocaleDateString();
  let history = JSON.parse(localStorage.getItem("billingHistory") || "[]");
  history = history.filter(h => h.date !== today);
  localStorage.setItem("billingHistory", JSON.stringify(history));
  updateHistoryTable();
}

function exportExcel() {
  const ws = XLSX.utils.table_to_sheet(document.getElementById("billing-history"));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Riwayat");
  XLSX.writeFile(wb, "riwayat_billing.xlsx");
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Riwayat Billing Raja Game", 10, 10);
  const rows = [...document.querySelectorAll("#billing-history tbody tr")].map(tr =>
    [...tr.children].map(td => td.innerText));
  doc.autoTable({ head: [["Nama", "Durasi", "Harga", "Waktu"]], body: rows, startY: 20 });
  doc.save("riwayat_billing.pdf");
}
