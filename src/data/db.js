// A tiny local "database" for the demo: same collection/document shape and
// async API you'd get from a real document database, backed by the
// browser's localStorage instead of a server. No authentication, no
// network — every visitor gets their own private store in their own
// browser, which is exactly what this demo needs.
//
// This is deliberately NOT a shared, cross-device database — that needs a
// real backend (the project's chosen stack is Firestore; see
// decisions-and-stack). Swapping this module for a Firestore-backed one
// later shouldn't require touching any of the calling code, since the
// function signatures already match: get/set/list/remove, all Promises.

const DB_PREFIX = 'gna-fast-quote-db:'

function readCollection(collection) {
  try {
    const raw = localStorage.getItem(DB_PREFIX + collection)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    console.warn(`Could not read "${collection}" collection`, e)
    return {}
  }
}

function writeCollection(collection, data) {
  try {
    localStorage.setItem(DB_PREFIX + collection, JSON.stringify(data))
  } catch (e) {
    console.warn(`Could not write "${collection}" collection (storage full?)`, e)
  }
}

// Resolve once storage has "settled" — kept async so this reads the same
// way a real network-backed database call would from calling code.
function resolved(value) {
  return Promise.resolve(value)
}

export const db = {
  async get(collection, id) {
    const all = readCollection(collection)
    return resolved(all[id] || null)
  },

  async list(collection) {
    const all = readCollection(collection)
    return resolved(Object.values(all))
  },

  async set(collection, id, data) {
    const all = readCollection(collection)
    const record = { ...data, id, updatedAt: new Date().toISOString() }
    all[id] = record
    writeCollection(collection, all)
    return resolved(record)
  },

  async remove(collection, id) {
    const all = readCollection(collection)
    delete all[id]
    writeCollection(collection, all)
    return resolved(true)
  }
}
