const express = require( "express");
const admin = require( "firebase-admin");
const cors = require( "cors");
const dotenv = require( "dotenv");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Access Granted", user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
