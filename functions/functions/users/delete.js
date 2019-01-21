const functions = require('firebase-functions');
const admin = require('firebase-admin');

module.exports = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate((snap, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    // delete user using using admin SDK
    const transaction = snap.data();
    if(transaction.transaction_type === "DELETE_USER"){
      return admin.auth().deleteUser(transaction.data).then(() => {
          return deleteUserEntry(transaction.data);
      })
      .catch((error) => (console.log('cloudFunction-userDelete failed', error)));
    }
    return null;
  });

  const deleteUserEntry = (userId) => {
    return admin.firestore().collection('users').doc(userId).delete()
      .then( doc => (console.log('user entry has been deleted', doc)))
      .catch(err => (console.log('function-deleteUserEntry failed', err)));
  }