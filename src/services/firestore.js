import { db } from './firebase';
import {
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    serverTimestamp,
} from 'firebase/firestore';

const getChatRef = (userId) => doc(db, 'users', userId, 'chats', 'default');

export const saveChat = async (userId, messages, model) => {
    if (!userId) return;
    try {
        await setDoc(getChatRef(userId), {
            messages,
            model,
            updatedAt: serverTimestamp(),
        });
    } catch (err) {
        console.error('Failed to save chat:', err);
    }
};

export const loadChat = async (userId) => {
    if (!userId) return null;
    try {
        const snap = await getDoc(getChatRef(userId));
        if (snap.exists()) {
            return snap.data();
        }
        return null;
    } catch (err) {
        console.error('Failed to load chat:', err);
        return null;
    }
};

export const clearChat = async (userId) => {
    if (!userId) return;
    try {
        await deleteDoc(getChatRef(userId));
    } catch (err) {
        console.error('Failed to clear chat:', err);
    }
};
