const functions = require('firebase-functions');

const users = require("./users");
const students = require("./students");
const volunteers = require("./volunteers");

module.exports = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate((snap, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    // Create user using admin SDK
    const transaction = snap.data();
    const transactionId = context.params.transactionId;
    switch(transaction.transaction_type) {
        case 'ADD_USER':
          return users.create(transaction, transactionId);
        case 'DELETE_USER':
          return users.delete(transaction, transactionId);
        case 'ADD_STUDENT':
          return students.create(transaction, transactionId);
        case 'ADD_VOLUNTEER':
          return volunteers.create(transaction, transactionId);
        default:
          return null;
      }
  });