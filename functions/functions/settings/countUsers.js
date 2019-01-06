const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

module.exports = functions.https.onRequest((request, response) => {
    response.send("CountUsers");
   });