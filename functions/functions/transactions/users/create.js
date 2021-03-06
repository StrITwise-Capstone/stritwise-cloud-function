const admin = require('firebase-admin');

const helper = require('../helper.js');

/**
 * Triggers when a new transaction document of type "ADD_USER" is created in the transaction collection.
 * Creates the user account and calls other various functions
 * @param {Object} transaction - transaction object containing the data of the user
 * @param {string} transactionId - Id of the transaction document
 */
module.exports = (transaction, transactionId) =>{
  return admin.auth().createUser({
    email: transaction.data.email,
    emailVerified: true,
    password: transaction.data.password,
  }).then((user) => {
    console.log("adding user untry now", user.uid);
    delete transaction.data.password;
    return createUserEntry(user.uid, transaction, transactionId);
  }).catch(err => {
    console.log('cloudFunction-userCreate failed', err);
    return helper.completeTransaction(false, transactionId, err);
  });
}

/**
 * Creates a data entry of the user in the users collection.
 * @param {string} userId - Id of the user document.
 * @param {Object} transaction - transaction object containing the data of the user.
 * @param {string} transactionId - Id of the transaction document.
 */
const createUserEntry = (userId, transaction, transactionId) => {
  return admin.firestore().collection('users').doc(userId).set(transaction.data)
    .then( doc => {
      console.log('New user Added', doc);
      return deleteDataFromTransaction(transactionId);
    })
    .catch(err => (console.log('function-createUserEntry failed', err)));
}

/**
 * Deletes the password field from the transaction document.
 * @param {string} transactionId - Id of the transaction document.
 */
const deleteDataFromTransaction = (transactionId) => {
  return admin.firestore().collection('transactions').doc(transactionId).update({ 
    'data.password': admin.firestore.FieldValue.delete()
  })
  .then( doc => {
    console.log('transaction data has been deleted', doc);
    return helper.completeTransaction(true, transactionId);
  })
  .catch(err => (console.log('function-deleteDataFromTransactionUser failed', err)));
}