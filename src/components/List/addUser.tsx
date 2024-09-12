import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore"
import { FormEvent, useState } from "react"
import styled from "styled-components"
import { db } from "../../lib/firebase"
import { useUserStore } from "../../lib/userStore"

const addUser = () => {
  const [user,setUser] = useState<any>(null)
  const {currentUser} = useUserStore()

  const handleSearch = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const username = formData.get("username")

    try{
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==",username))
      const querySnapShot = await getDocs(q)

      if(!querySnapShot.empty){
        querySnapShot.forEach((doc) => {
          setUser(doc.data())
        })
      }

    }catch(err){
      console.log(err)
    }
  }

  const handleAdd = async () =>{
    const chatRef = collection(db,"chats")
    const userChatsRef = collection(db,"userchats")
    
    try{
      const newChatRef = doc(chatRef)
      await setDoc(newChatRef,{
        createdAt: serverTimestamp(),
        messages: []
      })

      await updateDoc(doc(userChatsRef, user.id),{
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId:currentUser!.id,
          updatedAt: Date.now()
        })
      }) 

      await updateDoc(doc(userChatsRef, currentUser!.id),{
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId:user.id,
          updatedAt: Date.now()
        })
      }) 

    }catch(err){
      console.log(err)
    }
  }
  
  return (
    <User>
        <form onSubmit={handleSearch}>
            <input type="text" placeholder="Username" name="username" />
            <button>Search</button>
        </form>
        {user && <div className="user">
            <div className="detail">
                <img src={user.avatar} />
                <span>{user.username}</span>
            </div>
            <button onClick={handleAdd}>Add User</button>
        </div>}
    </User>
  )
}

const User = styled.div`
  width: max-content;
  height: max-content;
  padding: 30px;
  background-color: rgba(17, 25, 40, 0.781);
  border-radius: 10px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  form{
    display: flex;
    gap: 20px;
    input{
      padding: 20px;
      border-radius: 10px;
      border: none;
      outline: none;
    }
    button{
      padding: 20px;
      border-radius: 10px;
      background-color: #1a73e8;
      color: white;
      border: none;
      cursor: pointer;
    }
  }
  .user{
    margin-top: 50px;
    display: flex;
    align-items: center;
    justify-content :space-between;
    .detail{
      display: flex;
      align-items: center;
      gap: 20px;
      img{
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
      }
    }
    button{
      padding: 20px;
      border-radius: 10px;
      background-color: #1a73e8;
      color: white;
      border: none;
      cursor: pointer;
    }
  }
`

export default addUser