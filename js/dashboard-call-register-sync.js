document.addEventListener("DOMContentLoaded", async function () {
    const countElement = document.getElementById("callRegisterCount");

    if (!countElement) return;

    try {
        if (window.firebaseDbReady) {
            await window.firebaseDbReady;
        }

        if (!window.firebaseDb) {
            console.warn("Firebase database not available.");
            return;
        }

        const { collection, getDocs } =
            await import(
                "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
            );

        const snapshot = await getDocs(
            collection(window.firebaseDb, "callRegister")
        );

        countElement.textContent = snapshot.size;

        console.log(
            "Dashboard Call Register Count:",
            snapshot.size
        );

    } catch (error) {
        console.error(
            "Dashboard Call Register Sync Error:",
            error
        );
    }
});