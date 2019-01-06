const functions = require('firebase-functions');

exports.users = require('./functions/users');
exports.settings = require('./functions/settings');

// Deply new Functions :  firebase deploy --only functions
// Define new project alias :  firebase use --add 