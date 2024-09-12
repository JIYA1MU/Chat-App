import styled from 'styled-components'
import './App.css'
import List from './components/List/List'
import Chat from './components/Chat'
import Detail from './components/Detail'
import Login from './components/Login'
import Notification from './components/Notification'
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'
import { useUserStore } from './lib/userStore'
import { useChatStore } from './lib/chatStore'

function App() {
  const { currentUser , isLoading, fetchUserInfo} = useUserStore()
  const { chatId } = useChatStore()

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user: any) => {
      fetchUserInfo(user?.uid)
    })

    return () => {
      unSub();
    }
  },[fetchUserInfo]);

  if (isLoading) return <Loading>Loading...</Loading>

  return (
    <>
    <Notification />
    <Container>
      {
        currentUser? (
          <>
            <List />
            {chatId && <Chat />}
            {chatId && <Detail />}
          </>
        ) : (<Login />)
      }
    </Container>
    </>
  )
}

const Loading = styled.div`
  padding: 50px;
  font-size:30px;
  border-radius: 10px;
  background-color: rgba(17,25,40,0.9)
`

const Container = styled.div`
  width: 80vw;
  height: 90vh;
  background-color: rgba(17,25,40,0.75);
  backdrop-filter: blur(19px) saturate(188%);
  border-radius: 12px; 
  border: 1px solid rgba(255, 255, 255, 0.125);
  color: white;
  display : flex;
`

export default App
