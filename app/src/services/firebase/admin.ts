import admin from "firebase-admin";

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  console.log(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64);
} else {
  console.log("NÃO TEM FIREBASE_SERVICE");
}

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!, "base64").toString(
    "utf-8"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
