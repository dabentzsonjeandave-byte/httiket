const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

/* =========================
   MONCASH CONFIGURATION
========================= */

const MONCASH_CLIENT_ID =
  process.env.MONCASH_CLIENT_ID;

const MONCASH_CLIENT_SECRET =
  process.env.MONCASH_CLIENT_SECRET;

const MONCASH_API =
  "https://sandbox.moncashbutton.digicelgroup.com/Api";

const MONCASH_GATEWAY =
  "https://sandbox.moncashbutton.digicelgroup.com/Moncash-business";


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
   MONCASH ACCESS TOKEN
========================= */

async function getMonCashToken() {

  if (
    !MONCASH_CLIENT_ID ||
    !MONCASH_CLIENT_SECRET
  ) {
    throw new Error(
      "MONCASH_CLIENT_ID ou MONCASH_CLIENT_SECRET manquant"
    );
  }

  const credentials =
    Buffer.from(
      `${MONCASH_CLIENT_ID}:${MONCASH_CLIENT_SECRET}`
    ).toString("base64");

  const response =
    await fetch(
      `${MONCASH_API}/oauth/token`,
      {
        method: "POST",

        headers: {
          "Authorization":
            `Basic ${credentials}`,

          "Content-Type":
            "application/x-www-form-urlencoded",

          "Accept":
            "application/json"
        },

        body:
          "grant_type=client_credentials&scope=read,write"
      }
    );


  const data =
    await response.json();


  console.log(
    "MonCash OAuth status:",
    response.status
  );


  if (!response.ok) {

    console.error(
      "MonCash OAuth error:",
      data
    );

    throw new Error(
      "Impossible d'obtenir le token MonCash"
    );

  }


  return data.access_token;
}


/* =========================
   MONCASH CREATE PAYMENT
========================= */

app.post(
  "/api/create-payment",
  async (req, res) => {

    try {

      const {
        orderId,
        amount
      } = req.body;


      /* =========================
         VALIDATION
      ========================= */

      if (!orderId) {

        return res.status(400).json({
          success: false,
          message: "orderId requis"
        });

      }


      const numericAmount =
        Number(amount);


      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {

        return res.status(400).json({
          success: false,
          message: "Montant invalide"
        });

      }


      /* =========================
         TOKEN MONCASH
      ========================= */

      const accessToken =
        await getMonCashToken();


      /* =========================
         CREATE PAYMENT
      ========================= */

      const paymentResponse =
        await fetch(
          `${MONCASH_API}/v1/CreatePayment`,
          {

            method: "POST",

            headers: {

              "Authorization":
                `Bearer ${accessToken}`,

              "Content-Type":
                "application/json",

              "Accept":
                "application/json"

            },

            body:
              JSON.stringify({

                amount:
                  numericAmount,

                orderId:
                  String(orderId)

              })

          }
        );


      const paymentData =
        await paymentResponse.json();


      console.log(
        "MonCash CreatePayment status:",
        paymentResponse.status
      );


      console.log(
        "MonCash CreatePayment response:",
        paymentData
      );


      if (!paymentResponse.ok) {

        return res.status(
          paymentResponse.status
        ).json({

          success: false,

          message:
            "MonCash a refusé la création du paiement",

          details:
            paymentData

        });

      }


      /* =========================
         PAYMENT TOKEN
      ========================= */

      const paymentToken =
        paymentData?.payment_token?.token;


      if (!paymentToken) {

        return res.status(500).json({

          success: false,

          message:
            "MonCash n'a pas retourné de payment token",

          details:
            paymentData

        });

      }


      /* =========================
         URL MONCASH
      ========================= */

      const paymentUrl =
        `${MONCASH_GATEWAY}/Payment/Redirect?token=${encodeURIComponent(paymentToken)}`;


      return res.status(200).json({

        success: true,

        orderId:
          String(orderId),

        amount:
          numericAmount,

        paymentToken:
          paymentToken,

        paymentUrl:
          paymentUrl

      });

    }

    catch (error) {

      console.error(
        "Erreur MonCash:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Erreur lors de la connexion à MonCash",

        error:
          error.message

      });

    }

  }
);


/* =========================
   MONCASH RETURN
========================= */

app.all(
  "/moncash/return",
  (req, res) => {

    console.log(
      "================================="
    );

    console.log(
      "MONCASH RETURN"
    );

    console.log(
      "Query:",
      req.query
    );

    console.log(
      "Body:",
      req.body
    );

    console.log(
      "================================="
    );


    res.status(200).send(`
      <h1>Retour MonCash</h1>
      <p>Votre transaction a été reçue.</p>
      <p>HTTiket vérifie actuellement le paiement.</p>
      <p>
        <a href="/">Retour à l'accueil</a>
      </p>
    `);

  }
);


/* =========================
   MONCASH ALERT
========================= */

app.all(
  "/moncash/alert",
  (req, res) => {

    console.log(
      "================================="
    );

    console.log(
      "MONCASH ALERT"
    );

    console.log(
      "Query:",
      req.query
    );

    console.log(
      "Body:",
      req.body
    );

    console.log(
      "================================="
    );


    res.status(200).send(`
      <h1>Merci pour votre paiement</h1>

      <p>
        Votre demande de paiement a été reçue.
      </p>

      <p>
        HTTiket va vérifier la transaction.
      </p>

      <p>
        <a href="/">Retour à l'accueil</a>
      </p>
    `);

  }
);


/* =========================
   TEST SERVEUR
========================= */

app.get(
  "/test",
  (req, res) => {

    res.status(200).json({

      success: true,

      message:
        "HTTiket fonctionne correctement",

      moncash:
        "Sandbox",

      port:
        PORT

    });

  }
);


/* =========================
   TEST MONCASH CONFIG
========================= */

app.get(
  "/api/moncash-test",
  (req, res) => {

    res.status(200).json({

      success: true,

      moncash:
        "Sandbox",

      clientIdConfigured:
        Boolean(MONCASH_CLIENT_ID),

      clientSecretConfigured:
        Boolean(MONCASH_CLIENT_SECRET)

    });

  }
);


/* =========================
   DEMARRER LE SERVEUR
========================= */

app.listen(
  PORT,
  () => {

    console.log(
      `HTTiket fonctionne sur le port ${PORT}`
    );

  }
);
