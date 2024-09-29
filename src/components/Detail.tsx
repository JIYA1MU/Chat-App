import styled from "styled-components";
import { auth, db } from "../lib/firebase";
import { useChatStore } from "../lib/chatStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useUserStore } from "../lib/userStore";

const Detail = () => {
  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser!.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Detail_Area>
      <div className="user">
        <img src={user?.avatar} />
        <h2>{user?.username}</h2>
        <p>Lorem, ipsum dolor sit amet.</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowUp.png" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" />
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked"
            : isReceiverBlocked
            ? "User blocked"
            : "Block User"}
        </button>
        <button className="logout" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </Detail_Area>
  );
};

const Detail_Area = styled.div`
  flex: 1;
  width: 0;
  .user {
    padding: 30px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    border-bottom: 1px solid #dddddd35;
    img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
    }
  }
  .info {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 30px;
    .option {
      .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        img {
          width: 30px;
          height: 30px;
          background-color: rgba(17, 25, 40, 0.3);
          padding: 10px;
          border-radius: 50%;
          cursor: pointer;
        }
      }
      .photos {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-top: 20px;
        .photoItem {
          display: flex;
          align-items: center;
          justify-content: space-between;
          .photoDetail {
            display: flex;
            align-items: center;
            gap: 20px;
            img {
              width: 40px;
              height: 40px;
              border-radius: 5px;
              object-fit: cover;
            }
            span {
              font-size: 14px;
              color: lightgray;
              font-weight: 300;
            }
          }
          .icon {
            width: 30px;
            height: 30px;
            background-color: rgba(17, 25, 40, 0.3);
            padding: 10px;
            border-radius: 50%;
            cursor: pointer;
          }
        }
      }
    }
    button {
      padding: 15px 20px;
      background-color: rgba(230, 74, 105, 0.553);
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      &:hover {
        background-color: rgba(230, 74, 105, 0.747);
      }
      &.logout {
        padding: 10px;
        background-color: #1882fcab;
      }
    }
  }
`;

export default Detail;
