const admin = require('firebase-admin');

const helper = require('../helper.js');

//Transaction Type: "ADD_STUDENT"

/**
 * Triggers when a new transaction document of type "ADD_STUDENT" is created in the transaction collection.
 * Creates the student account and calls other various functions
 * @param {Object} transaction - transaction object containing the data of the user
 * @param {string} transactionId - Id of the transaction document
 */
module.exports = (transaction, transactionId) =>{

    return admin.auth().createUser({
        email: transaction.data.email,
        emailVerified: true,
        password: transaction.data.password,
      }).then((student) => {
        console.log("adding student entry now", student.uid);
        delete transaction.data.password;
        return createStudentEntry(student.uid, transaction, transactionId);
      }).catch(err => {
        if (err.code === 'auth/email-already-exists') {
          return createExistingStudent(transaction, transactionId);
        } else {
          console.log('cloudFunction-studentCreate failed', err);
          return helper.completeTransaction(false, transactionId, err);
        }
      });
}

/**
 * Function that is invoked when an existing student account exists in Firebase.
 * @param {Object} transaction - transaction object containing the data of the user.
 * @param {string} transactionId - Id of the transaction document.
 */
const createExistingStudent = (transaction, transactionId) =>{
    return admin.auth().getUserByEmail(transaction.data.email).then(student =>{
        console.log("updating existing student acc now", student.uid);
        return updateExistingAcc(student.uid, transaction, transactionId);
    }).catch(err => (console.log('function-createExistingStudent failed', err)));
}

/**
 * Function that is invoked to update the password of an existing student account that exists in Firebase.
 * @param {string} studentId - Id of the student document.
 * @param {Object} transaction - transaction object containing the data of the user.
 * @param {string} transactionId - Id of the transaction document.
 */
const updateExistingAcc = (studentId, transaction, transactionId) =>{
    return admin.auth().updateUser(studentId, {
        password: transaction.data.password,
      })
        .then(student => {
            delete transaction.data.password;
            return createStudentEntry(student.uid, transaction, transactionId);
        })
        .catch(err => (console.log('function-updateExistingStudentAcc failed', err)));
}

/**
 * Creates a data entry of the student in the students collection.
 * @param {string} studentId - Id of the student document.
 * @param {Object} transaction - transaction object containing the data of the user.
 * @param {string} transactionId - Id of the transaction document.
 */
const createStudentEntry = (studentId, transaction, transactionId) => {
  return admin.firestore().collection('events').doc(transaction.data.eventId).collection('students').doc(studentId).set(transaction.data)
    .then( doc => {
      console.log('New student Added', doc);
      return deleteDataFromTransaction(transactionId);
    })
    .catch(err => (console.log('function-createStudentEntry failed', err)));
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
  .catch(err => (console.log('function-deleteDataFromTransactionStudent failed', err)));
}