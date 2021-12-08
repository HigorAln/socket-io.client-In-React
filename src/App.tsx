import styles from './style/home.module.scss'
import { FormEvent, useEffect, useState } from 'react';
import io from 'socket.io-client'
import axios from 'axios';

interface MessageProps {
  id: string;
  message: string;
  createdAt: Date;
}

const MessageQueue: MessageProps[] = [];

const socket = io('http://localhost:3333')
socket.on("new_message", (newMessage: MessageProps) => {
  MessageQueue.push(newMessage)
})

function App() {
  const [messageInScreen, setMessageInScreen] = useState<MessageProps[]>([])
  const [message, setMessage]=useState('')

  useEffect(()=>{
    axios.get<MessageProps[]>('http://localhost:3333/message')
      .then(result => setMessageInScreen(result.data))
  },[])

  useEffect(()=>{
    const timer = setInterval(()=>{
      if(MessageQueue.length > 0){
        setMessageInScreen([...messageInScreen, MessageQueue[0]])
        MessageQueue.shift()
      }
    },50)
  },[])

  async function handleSubmit(e: FormEvent){
    e.preventDefault()
    await axios.post<MessageProps>('http://localhost:3333/create',{
      message
    })

    setMessage('')
  }

  return(
    <div className={styles.container}>
      <div className={styles.chat}>
        <div className={styles.screen}>
          {messageInScreen.map((element: MessageProps)=>{
            return(
              <div key={element.id} className={styles.messageInScreen} >
                <p>{element.message}</p>
              </div>
            )
          })}
        </div>
        <div className={styles.input}>
          <form onSubmit={handleSubmit}>
            <input type="text" value={message} onChange={(e)=> setMessage(e.target.value)}/>
            <button type='submit'>Send</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
