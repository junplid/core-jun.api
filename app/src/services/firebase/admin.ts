import admin from "firebase-admin";
import serviceAccount from "./junplid-6dc90-firebase-adminsdk-fbsvc-2971998be7.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
