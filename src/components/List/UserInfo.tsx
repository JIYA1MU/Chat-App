import styled from "styled-components"
import { useUserStore } from "../../lib/userStore"

const UserInfo = () => {
  const { currentUser } = useUserStore()

  if(!currentUser) return  <div>Current user is possibly null</div>

  return (
    <Wrapper>
        <div className="user">
        <img src={currentUser.avatar} alt=""  />
        <h2>{currentUser.username}</h2>
        
        </div>
        <div className="icons">
          <img src="./more.png" alt=""  />
          <img src="./video.png" alt=""  />
          <img src="./edit.png" alt=""  />
        </div>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .user{
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

  .icons{
    display: flex;
    gap: 20px;
    img{
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
  }
`

export default UserInfo