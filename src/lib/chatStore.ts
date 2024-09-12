import { create } from 'zustand';
import { useUserStore } from './userStore';

interface ChatStore {
  chatId: string | null;
  user: any | null; 
  isCurrentUserBlocked: boolean;
  isReceiverBlocked: boolean;
  changeChat: (chatId: string, user: any) => Promise<void>;
  changeBlock: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,

  changeChat: async (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser; 
    
    //Check if Current useer is blocked
    if(user.blocked.includes(currentUser!.id)){
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      })
    }

    //Check if receiver user is blocked
    else if(user.blocked.includes(user.id)){
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      })
    }else{
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      })
    }  
  },
  changeBlock: () => {
    set((state) => ({...state, isReceiverBlocked: !state.isReceiverBlocked}))
  }
}));



