import { useEffect, useState } from 'react'
import { getMedia, saveMedia, deleteMedia } from '../media.js'

export function Media({ src, alt = '', className }) {
  const [url, setUrl] = useState(null)
  const m = /^idb:(image|video):(.+)$/.exec(src || '')
  useEffect(() => {
    if (!m) { setUrl(src || null); return }
    let u
    getMedia(m[2]).then((b) => { if (b) { u = URL.createObjectURL(b); setUrl(u) } })
    return () => u && URL.revokeObjectURL(u)
  }, [src])
  if (!url) return null
  return m?.[1] === 'video' || /\.(mp4|webm)(\?|$)/.test(url) ? <video src={url} controls className={className} /> : <img src={url} alt={alt} className={className} loading="lazy" />
}

export function Uploader({ value, onChange, label = 'Upload image / video', maxMB = 60 }) {
  const [busy, setBusy] = useState(false)
  const pick = async (e) => {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    if (!/^(image|video)\//.test(f.type)) return alert('Please choose an image or video file.')
    if (f.size > maxMB * 1024 * 1024) return alert(`File is larger than ${maxMB} MB.`)
    setBusy(true)
    try { if (value) await deleteMedia(value); onChange(await saveMedia(f)) } finally { setBusy(false) }
  }
  return (
    <div className="uploader">
      <Media src={value} className="preview" />
      <label className="btn ghost">{busy ? 'Uploading…' : label}<input type="file" accept="image/*,video/*" onChange={pick} hidden /></label>
      {value && <button type="button" className="btn ghost" onClick={async () => { await deleteMedia(value); onChange('') }}>Remove</button>}
    </div>
  )
}
