import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";
import { v4 as uuid } from "uuid"

const upload = async (file : any) => {
    let downloadURL = 'https://firebasestorage.googleapis.com/v0/b/reactchat-a0176.appspot.com/o/download.png?alt=media&token=a7630b67-a9c4-433c-8f86-6d452456a09f'
    if(!file) return downloadURL
    const ID = uuid()
    const storageRef = ref(storage, `images/${ID}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    if(uploadTask.snapshot.ref){
        await getDownloadURL(uploadTask.snapshot.ref).then((download) => {
            console.log(download) 
            downloadURL = download

        })
    }
    return downloadURL
};
            
export default upload;
