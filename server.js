const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));


/* =========================
   PAGE ACCUEIL
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


/* =========================
   ADMIN
========================= */

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});


/* =========================
   EVENT
========================= */

app.get("/event", (req, res) => {
  res.sendFile(path.join(__dirname, "event.html"));
});


/* =========================
   ACHAT BILLET
========================= */

app.get("/buy", (req, res) => {
  res.sendFile(path.join(__dirname, "buy.html"));
});


/* =========================
   CREER UN EVENEMENT
========================= */

app.get("/create-event", (req, res) => {
  res.sendFile(path.join(__dirname, "create-event.html"));
});


/* =========================
   SHOP
========================= */

app.get("/shop", (req, res) => {
  res.sendFile(path.join(__dirname, "shop.html"));
});


/* =========================
   MONCASH - RETURN
========================= */

app.all("/moncash/return", (req, res) => {
  console.log("=================================");
  console.log("MONCASH RETURN");
  console.log("Query:", req.query);
  console.log("Body:", req.body);
  console.log("=================================");

  res.status(200).send("OK");
});


/* =========================
   MONCASH - ALERT
========================= */

app.all("/moncash/alert", (req, res) => {
  res.status(200).send(`
    <h1>Merci pour votre paiement</h1>
    <p>Votre demande de paiement a été reçue.</p>
    <p>HTTiket va vérifier la transaction.</p>
    <p><a href="/">Retour à l'accueil</a></p>
  `);
});


/* =========================
   TEST SERVEUR
========================= */

app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HTTiket fonctionne correctement",
    moncash: "Sandbox",
    port: PORT
  });
});


/* =========================
   DEMARRER LE SERVEUR
========================= */

app.listen(PORT, () => {
  console.log(`HTTiket fonctionne sur le port ${PORT}`);
});