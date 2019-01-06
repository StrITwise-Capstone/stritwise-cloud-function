const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

module.exports = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate((snap, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const transaction = snap.data();
    // Create user using admin SDK
    admin.auth().createUser({
      email: transaction.email,
      emailVerified: true,
      password: transaction.password,
    }).then((user) => {
      delete transaction.email;
      delete transaction.password;
      admin.firestore().collection('users').doc(user.uid).set({ ...transaction })
    }).catch(err => {
      console.log('cloudFunction-create did not run', err);
    });
  });

const createUserEntry = (userData) => {
  
  return admin.firestore().collection('users')
    .add(userData)
    .then( doc => console.log('New user Added', doc));
}

