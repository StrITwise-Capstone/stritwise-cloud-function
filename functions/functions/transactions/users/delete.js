const admin = require('firebase-admin');

const helper = require('../helper.js');

module.exports = (transaction, transactionId) =>{
  return admin.auth().deleteUser(transaction.data).then(() => {
    return deleteUserEntry(transaction.data, transactionId);
  })
  .catch((err) => {
    console.log('cloudFunction-userDelete failed', err);
    return helper.completeTransaction(false, transactionId, err);
  });
}

const deleteUserEntry = (userId, transactionId) => {
  return admin.firestore().collection('users').doc(userId).delete()
    .then(doc => {
      console.log('user entry has been deleted', doc);
      return helper.completeTransaction(true, transactionId);
    })
    .catch(err => (console.log('function-deleteUserEntry failed', err)));
}