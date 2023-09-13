// Import the functions you need from the SDKs you need
// react setting
// import { initializeApp } from "firebase/app";
// import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
// vanilla js setting
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js';
import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, OAuthProvider } from 'https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCudu9cYENiIt9Eu03kuLxnF0DImAIT4c",
  authDomain: "happn-a55f6.firebaseapp.com",
  projectId: "happn-a55f6",
  storageBucker: "happn-a55f6.appspot.com",
  messagingSenderId: "668673071584",
  appId: "1:668673071584:web:02287f4669d34ee254f385"
}
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