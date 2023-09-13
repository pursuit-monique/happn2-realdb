const admin = require('firebase-admin');
var serviceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function verifyIdToken(idToken) {
  try {
    const ret = await admin.auth().verifyIdToken(idToken);
    return ret;
  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = { verifyIdToken }

//example res :
/**
 * {
  name: 'Qi',
  picture: 'https://lh3.googleusercontent.com/a/AAcHTtdi-5TKrY4RWSBhiH007PRqNVukAgnGK-FB4Ga9ux2YMR8=s96-c',
  iss: 'https://securetoken.google.com/virtual-dogfish-305504',
  aud: 'virtual-dogfish-305504',
  auth_time: 1693446176,
  user_id: '5OZlwKtMMIb1XiobruELS3vlERI2',
  sub: '5OZlwKtMMIb1XiobruELS3vlERI2',
  iat: 1693446176,
  exp: 1693449776,
  email: 'zoarcn@gmail.com',
  email_verified: true,
  firebase: {
    identities: { 'google.com': [Array], email: [Array] },
    sign_in_provider: 'google.com'
  },
  uid: '5OZlwKtMMIb1XiobruELS3vlERI2'
}
 */