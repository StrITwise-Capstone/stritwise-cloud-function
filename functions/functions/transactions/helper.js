const admin = require('firebase-admin');

/**
 * Updates a transaction document with completed status and corresponding error message if applicable
 * @param {boolean} completed - Status of the transaction
 * @param {string} transactionId - Id of a specific transaction document
 * @param {Object} error - Error Object that contains error messeage and error code
 */
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