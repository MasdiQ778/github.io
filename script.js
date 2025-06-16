const admins = [
  { username: "admin1", password: "raja123" },
  { username: "admin2", password: "raja234" },
  { username: "admin3", password: "raja345" },
  { username: "admin4", password: "raja456" }
];

// ---------------- Login ----------------
function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const valid = admins.find(a => a.username === user && a.password === pass);

  if (valid) {
    localStorage.setItem("loggedIn", user);
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("error").innerText = "Username atau Password salah!";
  }
}

function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "index.html";
}

// ---------------- Cek Login ---------------
if (location.pathname.includes("dashboard.html") && !localStorage.getItem("loggedIn")) {
  location.href = "index.html";
}

// ---------------- Billing ----------------
function startBilling() {
  const name = document.getElementById("customer").value.trim();
  const duration = parseInt(document.getElementById("duration").value.trim());

  if (!name || !duration) return alert("Lengkapi semua kolom!");

  const startTime = new Date().toLocaleString();
  const billing = { name, duration, startTime };
  let list = JSON.parse(localStorage.getItem("billingHistory")) || [];
  list.push(billing);
  localStorage.setItem("billingHistory", JSON.stringify(list));

  displayBilling();
  displayHistory();
}

function displayBilling() {
  const container = document.getElementById("activeBilling");
  container.innerHTML = "";
  const list = JSON.parse(localStorage.getItem("billingHistory")) || [];

  list.slice(-1).forEach(b => {
    const div = document.createElement("div");
    div.className = "bubble";
    div.innerHTML = `<strong>${b.name}</strong><br>Durasi: ${b.duration} menit<br>Mulai: ${b.startTime}`;
    container.appendChild(div);
  });
}

function displayHistory() {
  const tbody = document.querySelector("#billingTable tbody");
  tbody.innerHTML = "";
  const list = JSON.parse(localStorage.getItem("billingHistory")) || [];

  list.forEach(b => {
    const row = `<tr>
      <td>${b.name}</td>
      <td>${b.duration} menit</td>
      <td>${b.startTime}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function exportExcel() {
  const list = JSON.parse(localStorage.getItem("billingHistory")) || [];
  const ws = XLSX.utils.json_to_sheet(list);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "RiwayatBilling");
  XLSX.writeFile(wb, "Riwayat_Billing.xlsx");
}

async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Riwayat Billing Raja Game", 10, 10);
  const list = JSON.parse(localStorage.getItem("billingHistory")) || [];
  let y = 20;
  list.forEach((b, i) => {
    doc.text(`${i+1}. ${b.name} - ${b.duration} menit - ${b.startTime}`, 10, y);
    y += 10;
  });
  doc.save("Riwayat_Billing.pdf");
}

if (location.pathname.includes("dashboard.html")) {
  displayBilling();
  displayHistory();
}
