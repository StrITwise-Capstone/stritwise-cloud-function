const admin = require('firebase-admin');

const helper = require('../helper.js');

module.exports = (transaction, transactionId) =>{
  return admin.auth().createUser({
    email: transaction.data.email,
    emailVerified: true,
    password: transaction.data.password,
  }).then((user) => {
    console.log("adding user untry now", user.uid);
    delete transaction.data.password;
    return createUserEntry(user.uid, transaction.data, transactionId);
  }).catch(err => {
    console.log('cloudFunction-userCreate failed', err);
    return helper.completeTransaction(false, transactionId, err);
  });
}

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
    'data.password': admin.firestore.FieldValue.delete()
  })
  .then( doc => {
    console.log('transaction data has been deleted', doc);
    return helper.completeTransaction(true, transactionId);
  })
  .catch(err => (console.log('function-deleteDataFromTransactionUser failed', err)));
}