interface Message {
  username: string
  text: string
  createdAt: number
}

export function generateMessage(username: string, text: string): Message {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
}

type LocationMessage = Omit<Message, 'text'> & {
  url: string
}

export function generateLocationMessage(username: string, url: string): LocationMessage {
  return {
    username,
    url,
    createdAt: new Date().getTime()
  }
}