import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import { auth, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../lib/upload";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Login = () => {

  const [avatar , setAvatar] = useState({
    file: null,
    url: ''
  })

  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth,provider)
  } 

  const handleAvatar = (e:any) => {
    if(e.target.files[0]){
      setAvatar({
        file:e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      })
    }
  }

  const handleLogin = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    setIsSigningIn(true)
    try{
      await signInWithEmailAndPassword(auth,email,password)
      toast.success("Successfully logged in!")
    }
    catch(err : any){
      console.log(err)
      toast.error(err.message)
    }
    finally{
      setIsSigningIn(false)
    }
  }

  const handleRegister = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!username || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    setIsSigningUp(true)

    try{
      const res = await createUserWithEmailAndPassword(auth,email,password);
      const imgURL = await upload(avatar.file);
      console.log(imgURL)

      await updateProfile(res.user,{
        displayName : username,
        photoURL: imgURL
      })

      await setDoc(doc(db, "users",res.user.uid),{
        username,
        email,
        avatar: imgURL,
        id: res.user.uid,
        blocked: []
      })

      await setDoc(doc(db, "userchats",res.user.uid),{
        chats: []
      })
      toast.success("Account Created! You can login now!")    
    }
    catch(err : any){
      console.log(err)
      toast.error(err.message)
    }
    finally{
      setIsSigningUp(false)
    }
  }

  return (
    <Box>
      <div className="item">
        <h2>Welcome back,</h2>
        <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" name="email" />
            <input type="password" placeholder="Password" name="password" />
            <button disabled={isSigningIn}>
              {isSigningIn ? <Loading /> : 'Sign In'}
            </button>
            OR
        </form>
            <button className="btn" onClick={handleGoogleSignIn}>Login with Google </button>
      </div>
      <div className="separator"></div>
      <div className="item">
      <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
            <label htmlFor="file">
              <img src={avatar.url || 'avatar.png'}  />
              Upload an Image
            </label>
            <input type="file" id="file" style={{display: 'none'}} onChange = {handleAvatar}/>
            <input type="text" placeholder="Username" name="username" />
            <input type="email" placeholder="Email" name="email" />
            <input type="password" placeholder="Password" name="password" />
            <button disabled={isSigningUp}>
             {isSigningUp ? <Loading /> : 'Sign Up'}
            </button>
        </form>
      </div>
    </Box>
  );
};

const Loading = styled(AiOutlineLoading3Quarters)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    from {transform: rotate(0deg)}
    to {transform: rotate(360deg)}
  }
`

const Box = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 100px;
  .item{
    flex: 1;
    display: flex ;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    .btn{  
      padding: 20px;
      border: none;
      background-color: #1f8ef1;
      color: white;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      &:disabled{
        cursor: not-allowed;
        background-color: #1f8ff196;
      }
    }
    form{
      display: flex ;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      input{
        padding: 20px;
        border: none;
        outline: none;
        background-color: rgba(17, 25, 40, 0.6);
        color: white;
        border-radius: 5px;
      }
      label{
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        text-decoration: underline;
        img{
          width :50px;
          height: 50px;
          border-radius: 10px;
          object-fit: cover;
          opacity: 0.6;
        }
      }
      button{
        width: 100%;
        padding: 20px;
        border: none;
        background-color: #1f8ef1;
        color: white;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 500;
        &:disabled{
          cursor: not-allowed;
          background-color: #1f8ff196;
        }
      }
    }
  }
  .separator{
    height: 80%;
    width: 2px;
    background-color: #dddddd35;
  }
`

export default Login;
