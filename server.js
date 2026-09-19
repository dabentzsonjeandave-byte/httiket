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

app.use(
  express.urlencoded({
    extended: true
  })
);


/*
   Désactiver le cache pour les pages
   afin d'éviter qu'une ancienne version
   de buy.html soit encore affichée.
*/

app.use((req, res, next) => {

  if (
    req.path === "/" ||
    req.path === "/buy" ||
    req.path === "/event" ||
    req.path === "/admin" ||
    req.path === "/create-event" ||
    req.path === "/shop"
  ) {

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    res.setHeader(
      "Pragma",
      "no-cache"
    );

    res.setHeader(
      "Expires",
      "0"
    );

  }

  next();

});


app.use(
  express.static(__dirname)
);


/* =========================
   PAGE ACCUEIL
========================= */

app.get(
  "/",
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "index.html"
      )
    );

  }
);


/* =========================
   ADMIN
========================= */

app.get(
  "/admin",
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "admin.html"
      )
    );

  }
);


/* =========================
   EVENT
========================= */

app.get(
  "/event",
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "event.html"
      )
    );

  }
);


/* =========================
   BUY
========================= */

app.get(
  "/buy",
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "buy.html"
      )
    );

  }
);


/* =========================
   CREATE EVENT
========================= */

app.get(
  "/create-event",
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "create-event.html"
      )
    );

  }
);


/* =========================
   SHOP
========================= */

app.get(
  "/shop",
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "shop.html"
      )
    );

  }
);


/* =========================
   MONCASH ACCESS TOKEN
========================= */

async function getMonCashToken() {

  if (
    !MONCASH_CLIENT_ID ||
    !MONCASH_CLIENT_SECRET
  ) {

    throw new Error(
      "Les identifiants MonCash ne sont pas configurés."
    );

  }


  const credentials =
    Buffer
      .from(
        `${MONCASH_CLIENT_ID}:${MONCASH_CLIENT_SECRET}`
      )
      .toString("base64");


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


  const responseText =
    await response.text();


  let data;


  try {

    data =
      JSON.parse(
        responseText
      );

  } catch {

    data = {
      raw: responseText
    };

  }


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
      "Impossible d'obtenir le token MonCash."
    );

  }


  if (!data.access_token) {

    console.error(
      "Token MonCash absent:",
      data
    );

    throw new Error(
      "MonCash n'a pas retourné de token."
    );

  }


  return data.access_token;

}


/* =========================
   CREATE MONCASH PAYMENT
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
         VALIDATION ORDER ID
      ========================= */

      if (!orderId) {

        return res.status(400).json({

          success: false,

          message:
            "orderId requis."

        });

      }


      /* =========================
         VALIDATION MONTANT
      ========================= */

      const numericAmount =
        Number(amount);


      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Montant invalide."

        });

      }


      /* =========================
         MONCASH TOKEN
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


      const responseText =
        await paymentResponse.text();


      let paymentData;


      try {

        paymentData =
          JSON.parse(
            responseText
          );

      } catch {

        paymentData = {
          raw: responseText
        };

      }


      console.log(
        "MonCash CreatePayment status:",
        paymentResponse.status
      );


      console.log(
        "MonCash CreatePayment response:",
        paymentData
      );


      /* =========================
         MONCASH ERROR
      ========================= */

      if (!paymentResponse.ok) {

        return res.status(
          paymentResponse.status
        ).json({

          success: false,

          message:
            "MonCash a refusé la création du paiement.",

          details:
            paymentData

        });

      }


      /* =========================
         PAYMENT TOKEN
      ========================= */

      const paymentToken =
        paymentData
          ?.payment_token
          ?.token;


      if (!paymentToken) {

        return res.status(500).json({

          success: false,

          message:
            "MonCash n'a pas retourné de payment token.",

          details:
            paymentData

        });

      }


      /* =========================
         PAYMENT URL
      ========================= */

      const paymentUrl =
        `${MONCASH_GATEWAY}/Payment/Redirect?token=${encodeURIComponent(
          paymentToken
        )}`;


      /* =========================
         SUCCESS
      ========================= */

      return res.status(200).json({

        success:
          true,

        orderId:
          String(orderId),

        amount:
          numericAmount,

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

        success:
          false,

        message:
          "Erreur lors de la connexion à MonCash.",

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
      "========== MONCASH RETURN =========="
    );

    console.log(
      "Query:",
      req.query
    );

    console.log(
      "Body:",
      req.body
    );


    res
      .status(200)
      .send(`

<!DOCTYPE html>

<html lang="fr">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    HTTiket - Retour MonCash
  </title>

  <style>

    body {

      font-family:
        Arial,
        sans-serif;

      background:
        #f5f5f5;

      text-align:
        center;

      padding:
        60px 20px;

    }


    .box {

      max-width:
        500px;

      margin:
        auto;

      background:
        white;

      padding:
        35px;

      border-radius:
        15px;

      box-shadow:
        0 4px 20px
        rgba(0,0,0,0.10);

    }


    h1 {

      color:
        #3B1464;

      margin-bottom:
        15px;

    }


    p {

      color:
        #555;

      line-height:
        1.6;

    }


    a {

      display:
        inline-block;

      margin-top:
        20px;

      padding:
        12px 20px;

      background:
        #F58220;

      color:
        white;

      text-decoration:
        none;

      border-radius:
        7px;

      font-weight:
        bold;

    }

  </style>

</head>


<body>

  <div class="box">

    <h1>
      Retour MonCash
    </h1>

    <p>
      Votre transaction a été reçue.
    </p>

    <p>
      HTTiket vérifie actuellement le paiement.
    </p>

    <a href="/">
      Retour à l'accueil
    </a>

  </div>

</body>

</html>

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
      "========== MONCASH ALERT =========="
    );

    console.log(
      "Query:",
      req.query
    );

    console.log(
      "Body:",
      req.body
    );


    res
      .status(200)
      .send(`

<!DOCTYPE html>

<html lang="fr">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    HTTiket - Paiement
  </title>

  <style>

    body {

      font-family:
        Arial,
        sans-serif;

      background:
        #f5f5f5;

      text-align:
        center;

      padding:
        60px 20px;

    }


    .box {

      max-width:
        500px;

      margin:
        auto;

      background:
        white;

      padding:
        35px;

      border-radius:
        15px;

      box-shadow:
        0 4px 20px
        rgba(0,0,0,0.10);

    }


    h1 {

      color:
        #3B1464;

      margin-bottom:
        15px;

    }


    p {

      color:
        #555;

      line-height:
        1.6;

    }


    a {

      display:
        inline-block;

      margin-top:
        20px;

      padding:
        12px 20px;

      background:
        #F58220;

      color:
        white;

      text-decoration:
        none;

      border-radius:
        7px;

      font-weight:
        bold;

    }

  </style>

</head>


<body>

  <div class="box">

    <h1>
      Paiement reçu
    </h1>

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

  }
);


/* =========================
   TEST SERVEUR
========================= */

app.get(
  "/test",
  (req, res) => {

    res.status(200).json({

      success:
        true,

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

      success:
        true,

      moncash:
        "Sandbox",

      clientIdConfigured:
        Boolean(
          MONCASH_CLIENT_ID
        ),

      clientSecretConfigured:
        Boolean(
          MONCASH_CLIENT_SECRET
        )

    });

  }
);


/* =========================
   START SERVER
========================= */

app.listen(
  PORT,
  () => {

    console.log(
      `HTTiket fonctionne sur le port ${PORT}`
    );

  }
);
