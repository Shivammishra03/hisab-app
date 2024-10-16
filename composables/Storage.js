import Dexie from 'dexie'

const db = new Dexie('hisabDatabase')
db.version(1).stores({
  hisabs: '++id, title, content, createdAt'
})

export default db