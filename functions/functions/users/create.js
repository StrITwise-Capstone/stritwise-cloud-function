const functions = require('firebase-functions');
const admin = require('firebase-admin');

//admin.initializeApp(functions.config().firebase);

module.exports = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate((snap, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const transaction = snap.data();
    // Create user using admin SDK
    if(transaction.transaction_type === "ADD_USER"){
      admin.auth().createUser({
        email: transaction.data.email,
        emailVerified: true,
        password: transaction.data.password,
      }).then((user) => {
        delete transaction.data.email;
        delete transaction.data.password;
        return createUserEntry(user.uid, transaction.data, snap.id);
      }).catch(err => {
        console.log('cloudFunction-create did not run', err);
      });
    }
  });

const createUserEntry = (userId, userData, transactionId) => {
  return admin.firestore().collection('users').doc(userId).set(userData)
    .then( doc => {
      console.log('New user Added', doc);
      return admin.firestore().collection('transaction').doc(transactionId).update({
        data: admin.firebase.firestore.FieldValue.delete()
      });
    })
    .catch(err => {
      console.log('cloudFunction-create did not run', err);
    });
}

