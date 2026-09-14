/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at
 * https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

setGlobalOptions({maxInstances: 10});

exports.testFunction = onRequest((request, response) => {
  logger.info("SUVI TEST FUNCTION CALLED");

  response.status(200).json({
    success: true,
    message: "SUVI INFOTECH Firebase Functions is working",
  });
});
