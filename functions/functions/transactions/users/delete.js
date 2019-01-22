const admin = require('firebase-admin');

module.exports = (transaction, transactionId) =>{
  return admin.auth().deleteUser(transaction.data).then(() => {
    return deleteUserEntry(transaction.data);
  })
  .catch((error) => (console.log('cloudFunction-userDelete failed', error)));
}

const deleteUserEntry = (userId) => {
  return admin.firestore().collection('users').doc(userId).delete()
    .then( doc => (console.log('user entry has been deleted', doc)))
    .catch(err => (console.log('function-deleteUserEntry failed', err)));
}