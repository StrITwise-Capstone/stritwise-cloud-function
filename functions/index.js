const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

admin.firestore().settings({
    timestampsInSnapshots: true,
  });

exports.points = require('./functions/points');
exports.transactions = require('./functions/transactions');

// Deply new Functions :  firebase deploy --only functions
// Define new project alias :  firebase use --add 