const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.database();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Ruta para recibir coordenadas
app.post("/updateLocation", async (req, res) => {
  try {
    const { id, lat, lng, hora } = req.body;

    if (!id || !lat || !lng) {
      return res.status(400).send("Datos incompletos");
    }

    await db.ref(`vehiculos/${id}`).set({
      lat,
      lng,
      hora: hora || new Date().toISOString(),
    });

    return res.status(200).send("Ubicación actualizada");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error al guardar ubicación");
  }
});

exports.api = functions.https.onRequest(app);
