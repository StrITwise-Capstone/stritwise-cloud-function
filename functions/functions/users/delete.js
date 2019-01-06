const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

module.exports = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate((snap, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const userID = snap.data().userID;
    // Create user using admin SDK

    admin.auth().deleteUser(userID)
      .then(() => {
        admin.firestore().collection('users').doc(userID).delete()
          .then(() => console.log('cloudFunction-delete success'));
      })
      .catch((error) => {
        console.log('cloudFunction-delete did not delete user Entry', error);
      });
  });