```javascript
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
   MONCASH - RETURN URL
   Notification de paiement
========================= */

app.all("/moncash/return", (req, res) => {

  console.log("=================================");
  console.log("MONCASH RETURN");
  console.log("Query :", req.query);
  console.log("Body  :", req.body);
  console.log("=================================");

  res.status(200).send("OK");

});


/* =========================
   MONCASH - ALERT URL
   Retour client après paiement
========================= */

app.all("/moncash/alert", (req, res) => {

  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HTTiket - Paiement</title>

      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f5f5f5;
          padding: 40px 20px;
          text-align: center;
        }

        .box {
          max-width: 600px;
          margin: auto;
          background: white;
          padding: 35px;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }

        h1 {
          color: #3B1464;
          margin-bottom: 15px;
        }

        p {
          color: #555;
          line-height: 1.6;
        }

        a {
          display: inline-block;
          margin-top: 20px;
          background: #F58220;
          color: white;
          padding: 13px 22px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
        }
      </style>
    </head>

    <body>

      <div class="box">

        <h1>Merci pour votre paiement</h1>

        <p>
          Votre demande de paiement a été reçue.
        </p>

        <p>
          HTTiket va vérifier la transaction.
        </p>

        <a href="/">
          Retour à l'accueil
        </a>

      </div>

    </body>
    </html>
  `);

});


/* =========================
   DEMARRER LE SERVEUR
========================= */

app.listen(PORT, () => {

  console.log(
    `HTTiket fonctionne sur le port ${PORT}`
  );

});
```
