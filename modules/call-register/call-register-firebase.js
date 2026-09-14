// SUVI INFOTECH - Call Register Firebase Sync

async function syncCallToFirebase(callData) {
    try {
        if (!window.firebaseDb) {
            console.warn("Firebase database not available.");
            return false;
        }

        const { collection, addDoc, serverTimestamp } =
            await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

        await addDoc(collection(window.firebaseDb, "callRegister"), {
            ...callData,
            syncedAt: serverTimestamp(),
            source: "mobile"
        });

        console.log("Call Register synced to Firebase:", callData.callId);
        return true;

    } catch (error) {
        console.error("Call Register Firebase Sync Error:", error);
        return false;
    }
}