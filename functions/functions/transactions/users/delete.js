const admin = require('firebase-admin');

const helper = require('../helper.js');

/**
 * Triggers when a new transaction document of type "DELETE_USER" is created in the transaction collection.
 * Deletes the user account and calls other various functions
 * @param {Object} transaction - transaction object containing the data of the user
 * @param {string} transactionId - Id of the transaction document
 */
module.exports = (transaction, transactionId) =>{
  return admin.auth().deleteUser(transaction.data).then(() => {
    return deleteUserEntry(transaction.data, transactionId);
  })
  .catch((err) => {
    console.log('cloudFunction-userDelete failed', err);
    return helper.completeTransaction(false, transactionId, err);
  });
}

/**
 * Deletes the data entry of the user from the users collection.
 * @param {string} userId - Id of the user document
 * @param {string} transactionId - Id of the transaction document.
 */
const deleteUserEntry = (userId, transactionId) => {
  return admin.firestore().collection('users').doc(userId).delete()
    .then(doc => {
      console.log('user entry has been deleted', doc);
      return helper.completeTransaction(true, transactionId);
    })
    .catch(err => (console.log('function-deleteUserEntry failed', err)));
}