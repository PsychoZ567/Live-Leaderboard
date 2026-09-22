const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQySHga4nlON8HonF7f16yEzmFmOgtnyWJr4abrRBfu4EieAjnQSmunOeNesQ3WyY8D2ERbdfMiHX8e/pub?output=csv";

let currentTab = "individuals";
let sortedDonors = [];
let sortedClasses = [];

function switchTab(tabName) {
  currentTab = tabName;
  document.getElementById("btn-individuals").classList.toggle("active", tabName === "individuals");
  document.getElementById("btn-classes").classList.toggle("active", tabName === "classes");
  renderLeaderboard();
}

function renderLeaderboard() {
  const container = document.getElementById("leaderboard");
  const list = currentTab === "individuals" ? sortedDonors : sortedClasses;

  container.innerHTML = list.map((item, index) => {
    let rankClass = "rank-blue";
    let badge = `#${index + 1}`;

    if (index === 0) {
      rankClass = "rank-gold";
      badge = `🥇 #1`;
    } else if (index === 1) {
      rankClass = "rank-silver";
      badge = `🥈 #2`;
    } else if (index === 2) {
      rankClass = "rank-bronze";
      badge = `🥉 #3`;
    }

    const subtitle = currentTab === "individuals" 
      ? `<span class="class-tag">(${item.className})</span>` 
      : ``;

    return `
      <div class="card ${rankClass}">
        <span>${badge} ${item.name} ${subtitle}</span>
        <div class="stats-group">
          <span class="cookies-pill">🍪 ${item.cookies}</span>
          <span class="money-pill">HK$${item.money}</span>
        </div>
      </div>
    `;
  }).join("");
}

async function loadData() {
  try {
    const response = await fetch(CSV_URL);
    const rawText = await response.text();

    const donors = {};
    const classes = {};
    const rows = rawText.trim().split("\n").slice(1);

    rows.forEach(row => {
      const columns = row.replace(/[\r\n]/g, "").split(",").map(item => item.trim().replace(/^["']|["']$/g, ''));
      const name = columns[0];
      const className = columns[1];
      const cookies = parseInt(columns[2], 10) || 0;
      const money = parseFloat(columns[3]) || 0;

      if (name && className && (cookies > 0 || money > 0)) {
        const cleanName = name.trim();
        const donorKey = cleanName.toLowerCase();
        
        if (!donors[donorKey]) {
          donors[donorKey] = { name: cleanName, className: className, cookies: 0, money: 0 };
        }
        donors[donorKey].cookies += cookies;
        donors[donorKey].money += money;

        const classKey = className.toUpperCase();
        if (!classes[classKey]) {
          classes[classKey] = { name: `Class ${classKey}`, cookies: 0, money: 0 };
        }
        classes[classKey].cookies += cookies;
        classes[classKey].money += money;
      }
    });

    sortedDonors = Object.values(donors).sort((a, b) => b.money - a.money);
    sortedClasses = Object.values(classes).sort((a, b) => b.money - a.money);

    renderLeaderboard();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

loadData();
setInterval(loadData, 30000);