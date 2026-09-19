const express = require("express");
const path = require("path");

const app = express();

const PORT = 3000;

/* =========================
   FICHIYE PIBLIK
========================= */

app.use(express.static(__dirname));


/* =========================
   PAGE ACCUEIL
========================= */

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "index.html")
  );
});


/* =========================
   ADMIN
========================= */

app.get("/admin", (req, res) => {
  res.sendFile(
    path.join(__dirname, "admin.html")
  );
});


/* =========================
   EVENT
========================= */

app.get("/event", (req, res) => {
  res.sendFile(
    path.join(__dirname, "event.html")
  );
});


/* =========================
   ACHAT BILLET
========================= */

app.get("/buy", (req, res) => {
  res.sendFile(
    path.join(__dirname, "buy.html")
  );
});


/* =========================
   CREER UN EVENEMENT
========================= */

app.get("/create-event", (req, res) => {
  res.sendFile(
    path.join(__dirname, "create-event.html")
  );
});


/* =========================
   SHOP
========================= */

app.get("/shop", (req, res) => {
  res.sendFile(
    path.join(__dirname, "shop.html")
  );
});


/* =========================
   DEMARRER LE SERVEUR
========================= */

app.listen(PORT, () => {
  console.log(
    `HTTiket fonctionne sur http://localhost:${PORT}`
  );
});