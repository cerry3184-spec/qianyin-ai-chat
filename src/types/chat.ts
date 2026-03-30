export interface Message{
  role:"user"|"assistant"
  content:string
  reader?:ReadableStreamDefaultReader
  model?:string|null
} 

export interface Conversation{
  id:string;
  title:string;
  messages:Message[];
  createdAt:string;
}
