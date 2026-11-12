import { COPY, channelsFor } from '../../communication.js'

// Which medium the message is for. Switching regenerates, so an edit in hand
// is confirmed first by the panel.
export default function ChannelSelector({ recipientId, value, onSelect }) {
  const channels = channelsFor(recipientId)
  if (channels.length === 0) return null

  return (
    <div className="commu-field">
      <span className="commu-field-label">{COPY.channelQuestion}</span>
      <div className="commu-row">
        {channels.map((channel) => (
          <button
            key={channel.id}
            type="button"
            className={channel.id === value ? 'chat-chip is-on' : 'chat-chip'}
            aria-pressed={channel.id === value}
            onClick={() => onSelect(channel.id)}
          >
            {channel.label}
          </button>
        ))}
      </div>
      {value ? <p className="commu-hint">{channels.find((c) => c.id === value)?.shape}</p> : null}
    </div>
  )
}
