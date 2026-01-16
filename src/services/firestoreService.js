import { db } from '../firebase';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    getDoc,
    setDoc,
    deleteDoc
} from 'firebase/firestore';

// Collection References
const DPR_COLLECTION = 'dprs';
const SITES_COLLECTION = 'sites';

export const firestoreService = {
    // --- DPR Operations ---

    // Save or Update DPR
    saveDPR: async (dprData, siteId) => {
        try {
            const dataToSave = {
                ...dprData,
                siteId,
                updatedAt: new Date().toISOString()
            };

            if (dprData.id && typeof dprData.id === 'string' && dprData.id.length > 20) {
                // Update existing document if ID looks like a Firestore ID
                const dprRef = doc(db, DPR_COLLECTION, dprData.id);
                await updateDoc(dprRef, dataToSave);
                return dprData.id;
            } else {
                // Create new document
                // If it has a local ID (number), we ignore it and let Firestore generate a new one
                // OR we can use the local ID if we want to preserve it during migration
                const docRef = await addDoc(collection(db, DPR_COLLECTION), dataToSave);
                return docRef.id;
            }
        } catch (error) {
            console.error("Error saving DPR to Firestore:", error);
            throw error;
        }
    },

    // Get DPR History for a Site
    getDPRHistory: async (siteId) => {
        try {
            // Removed orderBy to avoid needing a composite index
            const q = query(
                collection(db, DPR_COLLECTION),
                where("siteId", "==", siteId)
            );

            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort client-side (Newest first)
            return docs.sort((a, b) => {
                const dateA = new Date(a.projectInfo?.date || 0);
                const dateB = new Date(b.projectInfo?.date || 0);
                return dateB - dateA;
            });
        } catch (error) {
            console.error("Error fetching DPR history:", error);
            throw error;
        }
    },

    // Get Single DPR
    getDPR: async (dprId) => {
        try {
            const docRef = doc(db, DPR_COLLECTION, dprId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching DPR:", error);
            throw error;
        }
    },

    // Delete DPR
    deleteDPR: async (dprId) => {
        try {
            const docRef = doc(db, DPR_COLLECTION, dprId);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error("Error deleting DPR:", error);
            throw error;
        }
    },

    // --- Migration Utility ---
    // Upload local history to Firestore
    migrateLocalHistory: async (localHistory, siteId) => {
        let count = 0;
        for (const item of localHistory) {
            try {
                // Check if already exists (optional check by dprNo and date)
                // For now, just add
                await addDoc(collection(db, DPR_COLLECTION), {
                    ...item,
                    siteId,
                    migrated: true,
                    createdAt: new Date().toISOString()
                });
                count++;
            } catch (e) {
                console.error("Failed to migrate item:", item.dprNo, e);
            }
        }
        return count;
    }
};
