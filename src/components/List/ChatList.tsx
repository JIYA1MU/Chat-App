import { useEffect, useState } from "react";
import styled from "styled-components";
import AddUser from "./addUser";
import { useUserStore } from "../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<any[]>([]);
  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser!.id),
      async (res) => {
        const items = res.data()?.chats;
        if (!items) {
          setChats([]);
        }
        const promises = items?.map(async (item: any) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser]);

  const handleSelect = async (chat: any) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser!.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredChats = chats.filter((c: any) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  )

  return (
    <Chat_Wrapper>
      <div className="search">
        <div className="searchBar">
          <img src="/search.png" />
          <input
            type="text"
            placeholder="Search"
            onClick={(e) => setInput((e.target as HTMLInputElement).value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser!.id)
                ? "./avatar.png"
                : chat.user.avatar
            }
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser!.id)
                ? "User"
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser />}
    </Chat_Wrapper>
  );
};

const Chat_Wrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  .search {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;

    .searchBar {
      flex: 1;
      background-color: rgba(17, 25, 40, 0.5);
      display: flex;
      align-items: center;
      gap: 20px;
      border-radius: 10px;
      padding: 10px;

      input {
        background-color: transparent;
        border: none;
        outline: none;
        color: white;
        flex: 1;
      }

      img {
        width: 20px;
        height: 20px;
      }
    }
    .add {
      width: 36px;
      height: 36px;
      padding: 10px;
      border-radius: 10px;
      background-color: rgba(17, 25, 40, 0.5);
      cursor: pointer;
    }
  }
  .item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    cursor: pointer;
    border-bottom: 1px solid #dddddd35;
    img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
    }
    .texts {
      display: flex;
      flex-direction: column;
      gap: 10px;
      span {
        font-weight: 500;
      }
      p {
        font-size: 14px;
        font-weight: 300;
      }
    }
  }
`;

export default ChatList;
