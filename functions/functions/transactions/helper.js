const admin = require('firebase-admin');

exports.completeTransaction = (completed, transactionId, error=null) => {
    updateValues = {
      'completed': completed,
    }
    if (error !== null) {
      updateValues.errorMessage = error.message;
    }
    return admin.firestore().collection('transactions').doc(transactionId).update(updateValues)
      .then( doc => (console.log('transactionStatus has been updated', doc)))
      .catch(err => (console.log('function-updateTransactionStatus failed', err)));
}