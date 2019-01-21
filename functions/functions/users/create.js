const functions = require('firebase-functions');
const admin = require('firebase-admin');

module.exports = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate((snap, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    // Create user using admin SDK
    const transaction = snap.data();
    const transactionId = context.params.transactionId;
    if(transaction.transaction_type === "ADD_USER"){
      return admin.auth().createUser({
        email: transaction.data.email,
        emailVerified: true,
        password: transaction.data.password,
      }).then((user) => {
        console.log("adding user untry now", user.uid);
        delete transaction.data.email;
        delete transaction.data.password;
        return createUserEntry(user.uid, transaction.data, transactionId);
      }).catch(err => (console.log('cloudFunction-userCreate failed', err)));
    }
    return null;
  });

const createUserEntry = (userId, userData, transactionId) => {
  return admin.firestore().collection('users').doc(userId).set(userData)
    .then( doc => {
      console.log('New user Added', doc);
      return deleteDataFromTransaction(transactionId);
    })
    .catch(err => (console.log('function-createUserEntry failed', err)));
}

const deleteDataFromTransaction = (transactionId) => {
  return admin.firestore().collection('transactions').doc(transactionId).update({
    data: admin.firebase.firestore.FieldValue.delete()
  })
  .then( doc => (console.log('transaction data has been deleted', doc)))
  .catch(err => (console.log('function-deleteDataFromTransaction failed', err)));
}