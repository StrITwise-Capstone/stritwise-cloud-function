const admin = require('firebase-admin');

const helper = require('../helper.js');

//Transaction Type: "ADD_VOLUNTEER"

/**
 * Triggers when a new transaction document of type "ADD_VOLUNTEER" is created in the transaction collection.
 * Creates the volunteer account and calls other various functions
 * @param {Object} transaction - transaction object containing the data of the user
 * @param {string} transactionId - Id of the transaction document
 */
module.exports = (transaction, transactionId) =>{

    return admin.auth().createUser({
        email: transaction.data.email,
        emailVerified: true,
        password: transaction.data.password,
      }).then((volunteer) => {
        console.log("adding volunteer entry now", volunteer.uid);
        delete transaction.data.password;
        return createVolunteerEntry(volunteer.uid, transaction, transactionId);
      }).catch(err => {
        if (err.code === 'auth/email-already-exists') {
          return createExistingVolunteer(transaction, transactionId);
        } else {
          console.log('cloudFunction-volunteerCreate failed', err);
          return helper.completeTransaction(false, transactionId, err);
        }
      });
}

/**
 * Function that is invoked when an existing volunteer account exists in Firebase.
 * @param {Object} transaction - transaction object containing the data of the user.
 * @param {string} transactionId - Id of the transaction document.
 */
const createExistingVolunteer = (transaction, transactionId) =>{
    return admin.auth().getUserByEmail(transaction.data.email).then(volunteer =>{
        console.log("updating existing volunteer acc now", volunteer.uid);
        return updateExistingAcc(volunteer.uid, transaction, transactionId);
    }).catch(err => (console.log('function-createExistingVolunteer failed', err)));
}

/**
 * Function that is invoked to update the password of an existing volunteer account that exists in Firebase.
 * @param {string} volunteerId - Id of the volunteer document.
 * @param {Object} transaction - transaction object containing the data of the user.
 * @param {string} transactionId - Id of the transaction document.
 */
const updateExistingAcc = (volunteerId, transaction, transactionId) =>{
    return admin.auth().updateUser(volunteerId, {
        password: transaction.data.password,
      })
        .then(volunteer => {
            delete transaction.data.password;
            return createVolunteerEntry(volunteer.uid, transaction, transactionId);
        })
        .catch(err => (console.log('function-updateExistingVolunteerAcc failed', err)));
}
/**
 * Creates a data entry of the volunteer in the volunteers collection.
 * @param {string} volunteerId - Id of the volunteer document.
 * @param {Object} transaction - transaction object containing the data of the user.
 * @param {string} transactionId - Id of the transaction document.
 */
const createVolunteerEntry = (volunteerId, transaction, transactionId) => {
  return admin.firestore().collection('events').doc(transaction.data.eventId).collection('volunteers').doc(volunteerId).set(transaction.data)
    .then( doc => {
      console.log('New volunteer Added', doc);
      return deleteDataFromTransaction(transactionId);
    })
    .catch(err => (console.log('function-createVolunteerEntry failed', err)));
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
  .catch(err => (console.log('function-deleteDataFromTransactionVolunteer failed', err)));
}