import styled from "styled-components"
import UserInfo from "./UserInfo"
import ChatList from "./ChatList"

const List = () => {
  return (
    <List_Area>
      <UserInfo />
      <ChatList />
    </List_Area>
  )
}

const List_Area = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`
export default List