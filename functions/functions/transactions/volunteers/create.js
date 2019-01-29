const admin = require('firebase-admin');

const helper = require('../helper.js');

//Transaction Type: "ADD_VOLUNTEER"

module.exports = (transaction, transactionId) =>{

    return admin.auth().createUser({
        email: transaction.data.email,
        emailVerified: true,
        password: transaction.data.password,
      }).then((volunteer) => {
        console.log("adding volunteer entry now", volunteer.uid);
        delete transaction.data.password;
        return createVolunteerEntry(transaction.data.eventId, volunteer.uid, transaction.data, transactionId);
      }).catch(err => {
        if (err.code === 'auth/email-already-exists') {
          return createExistingVolunteer(transaction.data.email, transaction.data.eventId, transaction, transactionId);
        } else {
          console.log('cloudFunction-volunteerCreate failed', err);
          return helper.completeTransaction(false, transactionId, err);
        }
      });
}

const createExistingVolunteer = (volunteerEmail, eventId, transaction, transactionId) =>{
    return admin.auth().getUserByEmail(volunteerEmail).then(volunteer =>{
        console.log("updating existing volunteer acc now", volunteer.uid);
        return updateExistingAcc(eventId, volunteer.uid, transaction, transactionId);
    }).catch(err => (console.log('function-createExistingVolunteer failed', err)));
}

const updateExistingAcc = (eventId, volunteerId, transaction, transactionId) =>{
    return admin.auth().updateUser(volunteerId, {
        password: transaction.data.password,
      })
        .then(volunteer => {
            delete transaction.data.password;
            return createVolunteerEntry(eventId, volunteer.uid, transaction.data, transactionId);
        })
        .catch(err => (console.log('function-updateExistingVolunteerAcc failed', err)));
}

const createVolunteerEntry = (eventId, volunteerId, volunteerData, transactionId) => {
  return admin.firestore().collection('events').doc(eventId).collection('volunteers').doc(volunteerId).set(volunteerData)
    .then( doc => {
      console.log('New volunteer Added', doc);
      return deleteDataFromTransaction(transactionId);
    })
    .catch(err => (console.log('function-createVolunteerEntry failed', err)));
}

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