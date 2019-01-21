const functions = require('firebase-functions');
const admin = require('firebase-admin');

module.exports = functions.firestore
  .document('events/{eventId}/teams/{teamId}/credit_transactions/{credit_transaction_Id}')
  .onCreate((event, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    // Create user using admin SDK
    const eventId = context.params.eventId; 
    const teamId = context.params.teamId;
    // ref to the parent document
    const colRef = admin.firestore().collection('events').doc(eventId).collection('teams').doc(teamId);
    // get all credit_modified values and add them together
    return colRef.collection('credit_transactions').get().then(querySnapshot => {
      // get the total comment count
      let credit = 0;
      // loop over bills to create a plain JS array
      querySnapshot.forEach(doc => {
        credit += doc.data().credit_modified
      });            
      console.log(credit);
      // run update
      return updateCredit(credit, colRef);
    })
  });


const updateCredit = (credit, colRef) => {
  return colRef.update({ credit: credit })
    .then( doc => (console.log("credit updated", doc)))
    .catch( err => (console.log('cloudFunction-pointsUpdate failed', err)));
}