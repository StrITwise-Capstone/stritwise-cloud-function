const admin = require('firebase-admin');

const helper = require('../helper.js');

//Transaction Type: "ADD_STUDENT"

module.exports = (transaction, transactionId) =>{

    return admin.auth().createUser({
        email: transaction.data.email,
        emailVerified: true,
        password: transaction.data.password,
      }).then((student) => {
        console.log("adding student entry now", student.uid);
        delete transaction.data.password;
        return createStudentEntry(transaction.data.eventId, student.uid, transaction.data, transactionId);
      }).catch(err => {
        if (err.code === 'auth/email-already-exists') {
          return createExistingStudent(transaction.data.email, transaction.data.eventId, transaction, transactionId);
        } else {
          console.log('cloudFunction-studentCreate failed', err);
          return helper.completeTransaction(false, transactionId, err);
        }
      });
}

const createExistingStudent = (studentEmail, eventId, transaction, transactionId) =>{
    return admin.auth().getUserByEmail(studentEmail).then(student =>{
        console.log("updating existing student acc now", student.uid);
        return updateExistingAcc(eventId, student.uid, transaction, transactionId);
    }).catch(err => (console.log('function-createExistingStudent failed', err)));
}

const updateExistingAcc = (eventId, studentId, transaction, transactionId) =>{
    return admin.auth().updateUser(studentId, {
        password: transaction.data.password,
      })
        .then(student => {
            delete transaction.data.password;
            return createStudentEntry(eventId, student.uid, transaction.data, transactionId);
        })
        .catch(err => (console.log('function-updateExistingStudentAcc failed', err)));
}

const createStudentEntry = (eventId, studentId, studentData, transactionId) => {
  return admin.firestore().collection('events').doc(eventId).collection('students').doc(studentId).set(studentData)
    .then( doc => {
      console.log('New student Added', doc);
      return deleteDataFromTransaction(transactionId);
    })
    .catch(err => (console.log('function-createStudentEntry failed', err)));
}

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