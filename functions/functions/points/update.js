const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Triggers when a new credit_transaction document is created in the credit_transaction collection.
 * Tabulates all credit_transaction documents in the credit_transaction collection
 * and updates the credit field of the chosen team document.
 */
module.exports = functions.firestore
  .document('events/{eventId}/teams/{teamId}/credit_transactions/{credit_transaction_Id}')
  .onCreate((event, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    // Create user using admin SDK
    const eventId = context.params.eventId; 
    const teamId = context.params.teamId;
    // ref to the parent document
    const teamRef = admin.firestore().collection('events').doc(eventId).collection('teams').doc(teamId);
    // get all credit_modified values and add them together
    return teamRef.collection('credit_transactions').get().then(querySnapshot => {
      // get the total comment count
      let credit = 0;
      // loop over bills to create a plain JS array
      querySnapshot.forEach(doc => {
        credit += doc.data().credit_modified
      });            
      // run update
      return updateCredit(credit, teamRef);
    })
  });

/**
 * Updates the credit field of the chosen team document.
 * @param {number} credit - total credits earned by the team
 * @param {Object} teamRef - collection Reference to the specific team document
 */
const updateCredit = (credit, teamRef) => {
  return teamRef.update({ credit: credit })
    .then( doc => (console.log("credit updated", doc)))
    .catch( err => (console.log('cloudFunction-pointsUpdate failed', err)));
}