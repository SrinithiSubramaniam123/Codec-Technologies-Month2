// Image/video uploads are stored as Blobs in IndexedDB and referenced as "idb:<image|video>:<id>".
const open = () => new Promise((res, rej) => {
  const r = indexedDB.open('pfcms-media', 1)
  r.onupgradeneeded = () => r.result.createObjectStore('f')
  r.onsuccess = () => res(r.result)
  r.onerror = () => rej(r.error)
})
const run = async (mode, fn) => {
  const db = await open()
  return new Promise((res, rej) => {
    const tx = db.transaction('f', mode)
    const req = fn(tx.objectStore('f'))
    tx.oncomplete = () => res(req.result)
    tx.onerror = () => rej(tx.error)
  })
}
export async function saveMedia(file) {
  const type = file.type.startsWith('video') ? 'video' : 'image'
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  await run('readwrite', (s) => s.put(file, id))
  return `idb:${type}:${id}`
}
export const getMedia = (id) => run('readonly', (s) => s.get(id))
export const deleteMedia = (ref) => { const m = /^idb:\w+:(.+)$/.exec(ref || ''); return m ? run('readwrite', (s) => s.delete(m[1])) : null }
