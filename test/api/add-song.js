import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const data = req.body;
    await db.collection("songs").add(data);
    res.status(200).send("Lagu berhasil disimpan!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal menyimpan lagu");
  }
}
