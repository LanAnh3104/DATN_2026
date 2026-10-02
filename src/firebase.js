import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Thay thế bằng config thực tế từ dự án Firebase của bạn (trang web console.firebase.google.com)
const firebaseConfig = {
  apiKey: "AIzaSyB2dL_h5T1hhao073RskKhv0Re1JKXXIQc",
  authDomain: "nexusai-aa748.firebaseapp.com",
  projectId: "nexusai-aa748",
  storageBucket: "nexusai-aa748.firebasestorage.app",
  messagingSenderId: "924129135682",
  appId: "1:924129135682:web:df99794456afbd6d5a31db",
  measurementId: "G-9XRE5M54S2"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
