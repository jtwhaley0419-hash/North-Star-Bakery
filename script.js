"use strict";
// Client-side demo only. No personal information is transmitted or stored.
const BAKERY_ITEMS = [
  { id: "signature-loaf", name: "Signature Loaf" },
  { id: "pastries", name: "Morning Pastries" },
  { id: "cakes", name: "Celebration Cakes" }
];
const STORAGE_KEYS = { favorites: "northStarBakeryFavorites", requestType: "northStarBakeryRequestType" };
function readSaved(key, fallback) {
  try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
  catch (error) { return fallback; }
}
function saveValue(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* Private browsing may block storage. */ }
}
function validFavorites() {
  const saved = readSaved(STORAGE_KEYS.favorites, []);
  return Array.isArray(saved) ? saved.filter(id => BAKERY_ITEMS.some(item => item.id === id)) : [];
}
function renderFavorites() {
  const options = document.getElementById("favorite-options");
  if (!options) return;
  const selected = validFavorites();
  options.replaceChildren();
  BAKERY_ITEMS.forEach(item => {
    const label = document.createElement("label"); label.className = "favorite-choice";
    const check = document.createElement("input"); check.type = "checkbox"; check.value = item.id;
    check.checked = selected.includes(item.id);
    check.addEventListener("change", () => toggleFavorite(item.id, check.checked));
    label.append(check, document.createTextNode(item.name)); options.append(label);
  });
  const names = BAKERY_ITEMS.filter(item => selected.includes(item.id)).map(item => item.name);
  document.getElementById("favorites-summary").textContent = names.length ? "Saved favorites: " + names.join(", ") : "No favorites saved yet.";
}
function toggleFavorite(id, checked) {
  const current = validFavorites();
  saveValue(STORAGE_KEYS.favorites, checked ? [...new Set([...current, id])] : current.filter(item => item !== id));
  renderFavorites();
}
function showError(id, message) {
  const field = document.getElementById(id); const error = document.getElementById(id + "-error");
  if (!field || !error) return;
  error.textContent = message;
  if (message) field.setAttribute("aria-invalid", "true"); else field.removeAttribute("aria-invalid");
}
function validateRequest() {
  const name = document.getElementById("full-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const request = document.getElementById("request-type").value;
  const pickup = document.getElementById("pickup-date").value;
  const details = document.getElementById("items").value.trim();
  const errors = {
    "full-name": name.length < 2 ? "Enter your name (at least 2 characters)." : "",
    "email": !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email address." : "",
    "request-type": !request ? "Choose a request type." : "",
    "pickup-date": request === "pre-order" && !pickup ? "Choose a pickup date for a pre-order." : "",
    "items": details.length < 10 ? "Please enter at least 10 characters about your request." : ""
  };
  Object.entries(errors).forEach(([id, message]) => showError(id, message));
  return !Object.values(errors).some(Boolean);
}
function setupForm() {
  const form = document.getElementById("bakery-request"); if (!form) return;
  const requestType = document.getElementById("request-type");
  const remembered = readSaved(STORAGE_KEYS.requestType, "");
  if (["pre-order", "question"].includes(remembered)) requestType.value = remembered;
  requestType.addEventListener("change", () => saveValue(STORAGE_KEYS.requestType, requestType.value));
  const favorites = validFavorites().map(id => BAKERY_ITEMS.find(item => item.id === id)?.name).filter(Boolean);
  document.getElementById("remembered-favorites").textContent = favorites.length ? "Your saved favorites: " + favorites.join(", ") : "Browse Products to save favorite bakery items.";
  ["full-name", "email", "request-type", "pickup-date", "items"].forEach(id => {
    const field = document.getElementById(id);
    field.addEventListener("input", () => { if (field.getAttribute("aria-invalid") === "true") validateRequest(); });
    field.addEventListener("change", () => { if (field.getAttribute("aria-invalid") === "true") validateRequest(); });
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const ok = validateRequest();
    const status = document.getElementById("form-status");
    status.textContent = ok ? "Your request looks good! This is a demo, so nothing was sent to the bakery." : "Please correct the highlighted fields above.";
    if (!ok) form.querySelector('[aria-invalid="true"]')?.focus();
  });
}
document.addEventListener("DOMContentLoaded", () => {
  renderFavorites(); setupForm();
  document.getElementById("clear-favorites")?.addEventListener("click", () => { saveValue(STORAGE_KEYS.favorites, []); renderFavorites(); });
});
