// Import the functions you need from the SDKs you need
// react setting
// import { initializeApp } from "firebase/app";
// import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
// vanilla js setting
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js';
import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, OAuthProvider } from 'https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXc8M7SxXVJOBx5RGCUk_2e8PRSaIjgms",
  authDomain: "virtual-dogfish-305504.firebaseapp.com",
  projectId: "virtual-dogfish-305504",
  storageBucket: "virtual-dogfish-305504.appspot.com",
  messagingSenderId: "599627267696",
  appId: "1:599627267696:web:6d9b1b039a8092b9c43eb5"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
/////////////////////////////////////////
const authByGoogle = (callback) => {
  // 使用弹出窗口方式登录
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).then((result) => {
    // 登录成功的处理
    var user = result.user;
    const { accessToken, uid, displayName, email } = user;
    callback(accessToken);

  }).catch(function (error) {
    // 错误处理
    console.error(error);
  });
}
// const authByMicrosoft = (callback) => {
//   const provider = new OAuthProvider('microsoft.com');
//   provider.setCustomParameters({
//     prompt: "consent",
//     tenant: "consumers",
//   });
//   // 使用弹出窗口方式登录
//   signInWithPopup(auth, provider).then((result) => {
//     // 登录成功的处理
//     // var token = result.credential.accessToken;
//     var user = result.user;
//     const { accessToken, uid, displayName, email } = user;
//     fe_.userLoginWithThirdParty(accessToken, (res) => {
//       callback(res);
//     })
//   }).catch(function (error) {
//     // 错误处理

//     console.error(error);
//   });
// }

// const authByApple = () => {
//   const provider = new OAuthProvider('apple.com');
//   // 使用弹出窗口方式登录
//   signInWithPopup(auth, provider).then((result) => {
//     // 登录成功的处理
//     // var token = result.credential.accessToken;
//     var user = result.user;
//     const { accessToken, uid, displayName, email } = user;

//   }).catch(function (error) {
//     // 错误处理
//     console.error(error);
//   });
// }

export {
  authByGoogle
}