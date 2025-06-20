const topAppBar = new MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
const tabBar = new MDCTabBar(document.querySelector('.mdc-tab-bar'));

function toggleDrawer() {
  drawer.open = !drawer.open;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mdc-tab').forEach(tab => {
    tab.classList.remove('mdc-tab--active');
    tab.setAttribute('aria-selected', 'false');
    tab.querySelector('.mdc-tab-indicator').classList.remove('mdc-tab-indicator--active');
  });
  loadCryptoCards();
});

function filter(gefilterd) {
  document.querySelectorAll('.mdc-image-list__item').forEach(tab => tab.classList.add('hidden'));
  document.querySelectorAll(`.${gefilterd}`).forEach(element => element.classList.remove('hidden'));
}

function alleVerwijderen() {
  document.querySelectorAll('.mdc-tab').forEach(tab => {
    tab.classList.remove('mdc-tab--active');
    tab.setAttribute('aria-selected', 'false');
    const indicator = tab.querySelector('.mdc-tab-indicator');
    if (indicator) indicator.classList.remove('mdc-tab-indicator--active');
  });

  document.querySelectorAll('.mdc-image-list__item').forEach(element => element.classList.remove('hidden'));
}

function openSheet(sheetId) {
  document.getElementById(sheetId).classList.remove("sheet-out-of-view");
  document.getElementById(sheetId).classList.add("open");
  document.getElementById("overlay").classList.add("active");
}

function closeSheet(sheetId) {
  document.getElementById(sheetId).classList.remove("open");
  document.getElementById(sheetId).classList.add("sheet-out-of-view");
  document.getElementById("overlay").classList.remove("active");
}

document.getElementById('overlay').addEventListener('click', () => {
  document.querySelectorAll('.sheet.open, .mdc-bottom-sheet.open').forEach(sheet => {
    sheet.classList.remove('open');
    sheet.classList.add('sheet-out-of-view');
  });
  document.getElementById('overlay').classList.remove('active');
});

async function loadCryptoCards() {
  const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=100&page=1&sparkline=true");
  const data = await response.json();
  const container = document.getElementById("crypto-cards");

  data.forEach(coin => {
    const marketCap = coin.market_cap;
    let capClass = "";
    if (marketCap >= 10_000_000_000) {
      capClass = "large";
    } else if (marketCap >= 1_000_000_000) {
      capClass = "mid";
    } else {
      capClass = "small";
    }

    const changeColor = coin.price_change_percentage_24h >= 0 ? "green" : "red";
    const priceFormatted = `$${coin.current_price.toLocaleString()}`;
    const changeFormatted = `${coin.price_change_percentage_24h.toFixed(2)}%`;

    const sparklinePoints = coin.sparkline_in_7d.price
      .map((p, i) => `${i * 3},${50 - (p - Math.min(...coin.sparkline_in_7d.price)) * 2}`)
      .join(" ");

    const card = document.createElement("div");
    card.classList.add("mdc-image-list__item", capClass);
    card.style = `
      width: 90%;
      border: 1px solid #eee;
      border-radius: 12px;
      padding: 12px;
      font-family: sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    `;

    card.innerHTML = `
      <div style="display:flex; align-items:center; gap: 10px;">
        <img src="${coin.image}" width="24" height="24" />
        <div>
          <div><strong>${coin.symbol.toUpperCase()}</strong></div>
          <div style="font-size: 12px; color: #777;">${coin.name}</div>
        </div>
      </div>
      <svg width="100%" height="50">
        <polyline fill="none" stroke="red" stroke-width="1" points="${sparklinePoints}" />
      </svg>
      <div style="display:flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold;">${priceFormatted}</span>
        <span style="color: ${changeColor}; font-size: 12px;">${changeFormatted}</span>
      </div>
    `;

    card.addEventListener("click", () => showCoinSheet(coin));
    container.appendChild(card);
  });
}

const sheet = document.getElementById("coin-sheet");
const closeBtn = sheet.querySelector(".close-btn");

function showCoinSheet(coin) {
  document.getElementById("coin-title").textContent = coin.name;
  document.getElementById("coin-image").src = coin.image;
  document.getElementById("coin-info").innerHTML = `
    <p><strong>Symbol:</strong> ${coin.symbol.toUpperCase()}</p>
    <p><strong>Prijs:</strong> $${coin.current_price.toLocaleString()}</p>
    <p><strong>Verandering 24u:</strong> 
      <span style="color: ${coin.price_change_percentage_24h >= 0 ? 'green' : 'red'};">
        ${coin.price_change_percentage_24h.toFixed(2)}%
      </span>
    </p>
    <p><strong>Marktkapitalisatie:</strong> $${coin.market_cap.toLocaleString()}</p>
    <p><strong>Volume 24u:</strong> $${coin.total_volume.toLocaleString()}</p>
    <p><strong>Circulerende Voorraad:</strong> ${coin.circulating_supply.toLocaleString()}</p>
    <p><strong>Maximale Voorraad:</strong> ${coin.max_supply ? coin.max_supply.toLocaleString() : "Onbekend"}</p>
    <p><strong>All-Time Hoogte:</strong> $${coin.ath.toLocaleString()}</p>
    <p><strong>All-Time Laag:</strong> $${coin.atl.toLocaleString()}</p>
  `;
  openSheet("coin-sheet");
}

closeBtn.addEventListener("click", () => closeSheet("coin-sheet"));

document.querySelector("#market-sheet .close-sheet").addEventListener("click", () => closeSheet("market-sheet"));

document.querySelector("#news-sheet .close-sheet").addEventListener("click", () => closeSheet("news-sheet"));

document.getElementById("search-btn").addEventListener("click", () => {
  const searchContainer = document.getElementById("search-container");
  searchContainer.classList.toggle("hidden");
});

document.getElementById("coin-search").addEventListener("input", (e) => {
  const zoekterm = e.target.value.toLowerCase();
  const alleKaarten = document.querySelectorAll("#crypto-cards > div");
  alleKaarten.forEach(card => {
    const naam = card.textContent.toLowerCase();
    card.style.display = naam.includes(zoekterm) ? "block" : "none";
  });
});

async function loadMarketData() {
  const response = await fetch("https://api.coingecko.com/api/v3/global");
  const data = await response.json();
  const marketData = data.data;

  document.getElementById("market-cap").textContent = "$" + Number(marketData.total_market_cap.usd).toLocaleString();
  document.getElementById("market-volume").textContent = "$" + Number(marketData.total_volume.usd).toLocaleString();
  document.getElementById("btc-dominance").textContent = marketData.market_cap_percentage.btc.toFixed(2) + "%";
  document.getElementById("active-coins").textContent = marketData.active_cryptocurrencies;
}

function openMarketSheet() {
  loadMarketData();
  openSheet("market-sheet");
}

function openNewsSheet() {
  openSheet("news-sheet");
}

let deferredPrompt;
const installBtn = document.getElementById('install-button');
installBtn.style.display = "none";

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "inline-flex";

  installBtn.addEventListener("click", () => {
    installBtn.style.display = "none";
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      deferredPrompt = null;
    });
  });
});


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js')
      .then(reg => console.log('✅ Service Worker geregistreerd:', reg.scope))
      .catch(err => console.error('❌ Fout bij registratie:', err));
  });
}


