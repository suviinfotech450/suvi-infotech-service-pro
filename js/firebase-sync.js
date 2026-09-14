// =========================================================
// SUVI INFOTECH - COMMON FIREBASE SYNC
// =========================================================

window.SuviFirebaseSync = {

    async ready() {
        return await window.firebaseDbReady;
    },

    async save(collectionName, documentId, data) {

        const db = await this.ready();

        const {
            doc,
            setDoc,
            serverTimestamp
        } = await import(
            "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
        );

        const ref = doc(
            db,
            collectionName,
            documentId
        );

        await setDoc(ref, {
            ...data,
            updatedAt: serverTimestamp()
        }, {
            merge: true
        });

        console.log(
            "Firebase Sync Saved:",
            collectionName,
            documentId
        );

        return true;
    },

    async delete(collectionName, documentId) {

        const db = await this.ready();

        const {
            doc,
            deleteDoc
        } = await import(
            "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
        );

        await deleteDoc(
            doc(
                db,
                collectionName,
                documentId
            )
        );

        console.log(
            "Firebase Sync Deleted:",
            collectionName,
            documentId
        );

        return true;
    },

    async getAll(collectionName) {

        const db = await this.ready();

        const {
            collection,
            getDocs
        } = await import(
            "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
        );

        const snapshot = await getDocs(
            collection(
                db,
                collectionName
            )
        );

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

};