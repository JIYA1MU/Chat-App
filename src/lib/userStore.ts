import { create } from 'zustand';
import { doc, getDoc } from 'firebase/firestore'; 
import { db } from './firebase'; 

interface User {
    id: string; 
    username: string; 
    email: string; 
    avatar: string; 
    blocked?: string[];
}

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  fetchUserInfo: (uid: string | null) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid: string | null) => {
    if (!uid) {
      set({ currentUser: null, isLoading: false });
      return;
    }
    
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data());
        set({ currentUser: docSnap.data() as User, isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.error(err);
      set({ currentUser: null, isLoading: false });
    }
  },
}));
