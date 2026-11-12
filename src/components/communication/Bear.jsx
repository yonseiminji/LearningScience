// 곰곰이 말풍선. The same row the class chat uses, so the two tabs look like
// one character speaking.
export default function Bear({ children }) {
  return (
    <div className="chat-row">
      <img src="/brand/gomgomi-question.webp" alt="" />
      <div className="chat-bear">{children}</div>
    </div>
  )
}
