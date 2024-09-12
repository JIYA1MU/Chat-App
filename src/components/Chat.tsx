import styled from "styled-components";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import {
  arrayUnion,
  doc,
  DocumentData,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useChatStore } from "../lib/chatStore";
import { useUserStore } from "../lib/userStore";
import upload from "../lib/upload";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<DocumentData | null>(null);
  const [text, setText] = useState("");
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    console.log(chatId);

    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      const chatData = res.data();
      if (chatData) {
        setChat(chatData);
      }
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e: any) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e: any) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    if (!chatId || !currentUser?.id) {
      console.log("Chat ID or current user is missing.");
      return;
    }

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser!.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", currentUser.id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          let userChatsData: any = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c: any) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          console.log(userChatsData[chatIndex]);

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
    setImg({
      file: null,
      url: "",
    });

    // setText{""}
  };

  return (
    <Chart_Area>
      <div className="top">
        <div className="user">
          <img src={user.avatar} />
          <div className="texts">
            <span>{user.username}</span>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" />
          <img src="./video.png" />
          <img src="./info.png" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message: any) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={message?.createAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} />}
              <p>{message.text}</p>
              {/* <span>{message}</span> */}
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          <img src="./camera.png" />
          <img src="./mic.png" />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img src="./emoji.png" onClick={() => setOpen((prev) => !prev)} />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </Chart_Area>
  );
};

const Chart_Area = styled.div`
  flex: 2;
  border-left: 1px solid #dddddd35;
  border-right: 1px solid #dddddd35;
  height: 100%;
  display: flex;
  flex-direction: column;
  .top {
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #dddddd35;
    .user {
      display: flex;
      align-items: center;
      gap: 20px;
      img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
      }
      .texts {
        display: flex;
        flex-direction: column;
        gap: 5px;
        span {
          font-size: 18px;
          font-weight: bold;
        }
        p {
          font-size: 14px;
          font-weight: 300;
          color: #a5a5a5;
        }
      }
    }
    .icons {
      display: flex;
      gap: 20px;
      img {
        width: 20px;
        height: 20px;
      }
    }
  }

  .center {
    padding: 20px;
    flex: 1;
    overflow: scroll;
    display: flex;
    flex-direction: column;
    gap: 20px;
    .message {
      max-width: 70%;
      display: flex;
      gap: 20px;
      &.own {
        align-self: flex-end;
        .texts {
          p {
            background-color: #5183fe;
          }
        }
      }
      img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
      }
      .texts {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
        img {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-radius: 10px;
        }
        p {
          padding: 20px;
          background-color: rgba(17, 25, 48, 0.3);
          border-radius: 10px;
        }
        span {
          font-size: 13px;
        }
      }
    }
  }

  .bottom {
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #dddddd35;
    gap: 20px;
    margin-top: auto;
    .icons {
      display: flex;
      gap: 20px;
    }
    img {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    input {
      flex: 1;
      background-color: rgba(17, 25, 40, 0.5);
      border: none;
      outline: none;
      color: white;
      border-radius: 10px;
      font-size: 16px;
      padding: 20px;

      &:disabled {
        background-color: #5182feb4;
        cursor: not-allowed;
      }
    }
    .emoji {
      position: relative;
      .picker {
        position: absolute;
        bottom: 50px;
      }
    }
    .sendButton {
      background-color: #5183fe;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;

      &:disabled {
        background-color: #5182feb4;
        cursor: not-allowed;
      }
    }
  }
`;
export default Chat;
