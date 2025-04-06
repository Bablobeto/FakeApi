// =======================================
// Global Constants and Preferences
// =======================================

// Determine if we use LowDB (server) or localStorage (client)
const useLowDB = localStorage.getItem("useLowDb") !== "false";

// DOM Elements
const notification = document.getElementById("notification");
const catListing = document.getElementById("categoryListing");
const preferredAlertAside = document.getElementById("leftSide");
const preferredAlertSettingsAside = document.getElementById("alertSettings");

// =======================================
// Product Category Functions
// =======================================

// Fetch products for a selected category
function fetchCategoryProducts(category = "electronics") {
  fetch(`/api/fetch-category-product?category=${encodeURIComponent(category)}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Fetched products by category:", data);
      parseDataToUI(data);
    })
    .catch((error) => console.error("Error fetching category products:", error));
}

// Inject category products into the UI
function parseDataToUI(products) {
  const container = document.getElementById("productListingContainer");
  container.innerHTML = "";

  products.forEach((product) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");

    itemDiv.setAttribute(
      "onclick",
      `setProductAlertAside("${product.category}", "${product.title}", '${product.price}', '${product.id}', '${product.image}')`
    );

    itemDiv.innerHTML = `
      <img src="${product.image || "../public/assets/image/default.png"}" alt="${product.title}" />
      <div>
        <span>${product.category}</span>
        <span>${product.title}</span>
        <span>£ ${product.price}</span>
      </div>
    `;

    container.appendChild(itemDiv);
  });
}

// =======================================
// Price Alert Functions
// =======================================

// Set a new price alert
function setPriceAlert() {
  document.getElementById("form").addEventListener("click", (e) => e.preventDefault());

  const { prdId, prdPrice } = validatedForm();
  const data = {
    prdImage: document.getElementById("asideImage").src,
    prdTitle: document.getElementById("asideTitle").innerText,
    prdId: parseInt(prdId),
    prdPrice: parseFloat(prdPrice),
  };

  if (useLowDB) {
    // Save to backend (LowDB)
    fetch("/api/set-price-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        document.getElementById("alertCounter").innerHTML = data.total;
      })
      .catch((error) => console.error("Error:", error));
  } else {
    // Save to localStorage
    const preferences = JSON.parse(localStorage.getItem("preferences") || "[]");
    preferences.push(data);
    localStorage.setItem("preferences", JSON.stringify(preferences));
    document.getElementById("alertCounter").innerHTML = preferences.length;

    alert("Price alert set successfully");
  }

  resetAsideForm();
}

// Form validation helper
function validatedForm() {
  const prdId = document.getElementById("prefPrdId")?.value || null;
  const prdPrice = document.getElementById("prefPrdPrice")?.value || null;

  if (!prdId || !prdPrice) throw new Error("Error setting preferred price!");
  return { prdId, prdPrice };
}

// Set selected product details into aside
function setProductAlertAside(category, title, price, id, image) {
  document.getElementById("asideCategory").innerHTML = category;
  document.getElementById("asideTitle").innerHTML = title;
  document.getElementById("asidePrice").innerHTML = "£ " + price;
  document.getElementById("asideImage").src = image;
  document.getElementById("prefPrdId").value = id;
}

// Reset aside form
function resetAsideForm() {
  document.getElementById("asideCategory").innerHTML = "";
  document.getElementById("asideTitle").innerHTML = "";
  document.getElementById("asidePrice").innerHTML = "";
  document.getElementById("asideImage").src = "http://localhost:3000/assets/image/default.png";
  document.getElementById("prefPrdId").value = "";
}

// =======================================
// Notification and Comparison
// =======================================

// Poll API to get updated product prices and check for matches
setInterval(() => {
  refreshFakeStoreApi();
}, 2000);

// Fetch and evaluate alert data
function refreshFakeStoreApi() {
  fetch("/api/refresh-fake-store-api")
    .then((res) => res.json())
    .then((data) => updateNotificationUI(data.evaluation, data.matches))
    .catch((error) => console.error("Error refreshing data:", error));
}

// Render the alert data into the notification table
function updateNotificationUI(alertData, matches) {
  const container = document.getElementById("tbody");
  document.getElementById("found").innerText = `${matches} match found`;
  container.innerHTML = "";

  alertData.forEach((alert) => {
    const itemRow = document.createElement("tr");
    const matchClass = alert.match ? "success" : "error";

    itemRow.innerHTML = `
      <td width="20%">
        <figure>
          <img src="${alert.prdImage}" alt="Default product image" />
          <figcaption>${alert.prdTitle}</figcaption>
        </figure>
      </td>
      <td align="center">${alert.prdPrice}</td>
      <td align="center">${alert.currentPrice}</td>
      <td align="center" class="${matchClass}" width="20%">
        ${alert.match ? "YES" : "NO"}
      </td>
    `;

    container.appendChild(itemRow);
  });
}

// =======================================
// UI Toggle Handlers
// =======================================

notification.addEventListener("click", () => {
  const showingSettings = preferredAlertSettingsAside.classList.contains("disp-0");
  preferredAlertSettingsAside.className = showingSettings ? "" : "disp-0";
  preferredAlertAside.className = showingSettings ? "disp-0" : "";
});

catListing.addEventListener("click", () => {
  preferredAlertSettingsAside.className = "disp-0";
  preferredAlertAside.className = "";
});

// =======================================
// Dark Mode Toggle
// =======================================

const toggleBtn = document.getElementById("themeToggle");
const body = document.body;

// Load saved dark mode preference
const isDark = localStorage.getItem("dark") === "true";
if (isDark) {
  body.classList.add("dark");
  toggleBtn.textContent = "☀️ Light";
}

// Handle dark mode toggle
toggleBtn.addEventListener("click", () => {
  const isNowDark = body.classList.toggle("dark");
  localStorage.setItem("dark", isNowDark);
  toggleBtn.textContent = isNowDark ? "☀️ Light" : "🌙 Dark";
});
