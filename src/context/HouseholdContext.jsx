import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  writeBatch,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db, ensureSignedIn } from '../firebase'

const HouseholdContext = createContext(null)

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion
const PROFILE_KEY = 'stocknest_profile_name'
const HOUSEHOLD_KEY = 'stocknest_household_id'
const ALERT_KEY = 'stocknest_low_stock_alert'

function randomCode() {
  const part = () =>
    Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
  return `${part()}-${part()}`
}

export function HouseholdProvider({ children }) {
  const [uid, setUid] = useState(null)
  const [name, setName] = useState(() => localStorage.getItem(PROFILE_KEY) || '')
  const [householdId, setHouseholdId] = useState(() => localStorage.getItem(HOUSEHOLD_KEY) || '')
  const [household, setHousehold] = useState(null)
  const [items, setItems] = useState([])
  const [history, setHistory] = useState([])
  const [authReady, setAuthReady] = useState(false)
  const [error, setError] = useState('')
  const [lowStockAlertEnabled, setLowStockAlertEnabledState] = useState(
    () => localStorage.getItem(ALERT_KEY) !== 'off'
  )

  const setLowStockAlertEnabled = useCallback((enabled) => {
    localStorage.setItem(ALERT_KEY, enabled ? 'on' : 'off')
    setLowStockAlertEnabledState(enabled)
  }, [])

  useEffect(() => {
    ensureSignedIn()
      .then((user) => setUid(user.uid))
      .catch((err) => setError(err.message))
      .finally(() => setAuthReady(true))
  }, [])

  // subscribe to household doc
  useEffect(() => {
    if (!householdId) {
      setHousehold(null)
      return
    }
    const ref = doc(db, 'households', householdId)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setHousehold({ id: snap.id, ...snap.data() })
      } else {
        setHousehold(null)
      }
    })
    return unsub
  }, [householdId])

  // subscribe to items
  useEffect(() => {
    if (!householdId) {
      setItems([])
      return
    }
    const ref = collection(db, 'households', householdId, 'items')
    const unsub = onSnapshot(ref, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [householdId])

  // subscribe to history (most recent 100)
  useEffect(() => {
    if (!householdId) {
      setHistory([])
      return
    }
    const ref = query(
      collection(db, 'households', householdId, 'history'),
      orderBy('updatedAt', 'desc'),
      limit(100)
    )
    const unsub = onSnapshot(ref, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [householdId])

  const saveName = useCallback((newName) => {
    localStorage.setItem(PROFILE_KEY, newName)
    setName(newName)
  }, [])

  const createHousehold = useCallback(
    async (ownerName) => {
      if (!uid) throw new Error('Not signed in yet')
      let code = randomCode()
      // extremely low collision chance; single attempt with fallback retry
      let ref = doc(db, 'households', code)
      let snap = await getDoc(ref)
      if (snap.exists()) {
        code = randomCode()
        ref = doc(db, 'households', code)
      }
      await setDoc(ref, {
        createdAt: serverTimestamp(),
        ownerUid: uid,
        members: {
          [uid]: { name: ownerName, role: 'owner', addedAt: new Date().toISOString() },
        },
      })
      localStorage.setItem(HOUSEHOLD_KEY, code)
      setHouseholdId(code)
      return code
    },
    [uid]
  )

  const joinHousehold = useCallback(
    async (code, memberName) => {
      if (!uid) throw new Error('Not signed in yet')
      const normalized = code.trim().toUpperCase()
      const ref = doc(db, 'households', normalized)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        throw new Error('No household found for that code. Double-check it and try again.')
      }
      const trimmedName = memberName.trim()
      const existingMembers = snap.data().members || {}
      // A new device (new anonymous uid) with a name that already matches
      // someone in this household (case/whitespace-insensitive) is treated
      // as that same person reconnecting, not a new person — replace their
      // old entry instead of adding a duplicate.
      const priorEntry = Object.entries(existingMembers).find(
        ([, member]) => member.name?.trim().toLowerCase() === trimmedName.toLowerCase()
      )

      const batch = writeBatch(db)
      if (priorEntry) {
        const [oldUid, oldMember] = priorEntry
        batch.update(ref, {
          [`members.${oldUid}`]: deleteField(),
          [`members.${uid}`]: { name: trimmedName, role: oldMember.role, addedAt: oldMember.addedAt },
        })
      } else {
        batch.update(ref, {
          [`members.${uid}`]: { name: trimmedName, role: 'member', addedAt: new Date().toISOString() },
        })
      }
      await batch.commit()
      localStorage.setItem(HOUSEHOLD_KEY, normalized)
      setHouseholdId(normalized)
      return normalized
    },
    [uid]
  )

  const removeMember = useCallback(
    async (memberUid) => {
      if (!household) return
      const adminUid = household.ownerUid
      const removedName = household.members?.[memberUid]?.name
      const adminName = household.members?.[adminUid]?.name

      const batch = writeBatch(db)
      batch.update(doc(db, 'households', householdId), { [`members.${memberUid}`]: deleteField() })

      if (removedName && adminName && removedName.trim().toLowerCase() !== adminName.trim().toLowerCase()) {
        const itemsSnap = await getDocs(
          query(collection(db, 'households', householdId, 'items'), where('updatedBy', '==', removedName))
        )
        const historySnap = await getDocs(
          query(collection(db, 'households', householdId, 'history'), where('updatedBy', '==', removedName))
        )
        itemsSnap.forEach((d) => batch.update(d.ref, { updatedBy: adminName }))
        historySnap.forEach((d) => batch.update(d.ref, { updatedBy: adminName }))
      }

      await batch.commit()
    },
    [householdId, household]
  )

  const leaveHousehold = useCallback(() => {
    localStorage.removeItem(HOUSEHOLD_KEY)
    setHouseholdId('')
    setHousehold(null)
    setItems([])
    setHistory([])
  }, [])

  const logHistory = useCallback(
    async (entry) => {
      await addDoc(collection(db, 'households', householdId, 'history'), {
        ...entry,
        updatedAt: serverTimestamp(),
        updatedBy: name,
      })
    },
    [householdId, name]
  )

  const addItem = useCallback(
    async (item) => {
      const ref = await addDoc(collection(db, 'households', householdId, 'items'), {
        ...item,
        purchased: false,
        updatedAt: serverTimestamp(),
        updatedBy: name,
      })
      await logHistory({
        itemId: ref.id,
        itemName: item.name,
        iconKey: item.iconKey,
        changeType: 'created',
        oldQty: null,
        newQty: item.quantity,
        unit: item.unit,
      })
      return ref.id
    },
    [householdId, name, logHistory]
  )

  const updateItemQuantity = useCallback(
    async (item, newQty) => {
      const clamped = Math.max(0, Math.round(newQty * 100) / 100)
      const ref = doc(db, 'households', householdId, 'items', item.id)
      const nowAboveThreshold = clamped > item.minThreshold
      await updateDoc(ref, {
        quantity: clamped,
        purchased: nowAboveThreshold ? false : item.purchased,
        updatedAt: serverTimestamp(),
        updatedBy: name,
      })
      await logHistory({
        itemId: item.id,
        itemName: item.name,
        iconKey: item.iconKey,
        changeType: clamped > item.quantity ? 'increase' : clamped < item.quantity ? 'decrease' : 'set',
        oldQty: item.quantity,
        newQty: clamped,
        unit: item.unit,
      })
    },
    [householdId, name, logHistory]
  )

  const updateItemDetails = useCallback(
    async (itemId, patch) => {
      const ref = doc(db, 'households', householdId, 'items', itemId)
      await updateDoc(ref, { ...patch, updatedAt: serverTimestamp(), updatedBy: name })
    },
    [householdId, name]
  )

  const deleteItem = useCallback(
    async (itemId) => {
      await deleteDoc(doc(db, 'households', householdId, 'items', itemId))
    },
    [householdId]
  )

  const setPurchased = useCallback(
    async (itemIds, purchased) => {
      await Promise.all(
        itemIds.map((id) =>
          updateDoc(doc(db, 'households', householdId, 'items', id), { purchased })
        )
      )
    },
    [householdId]
  )

  const value = useMemo(
    () => ({
      uid,
      authReady,
      name,
      saveName,
      householdId,
      household,
      hasHousehold: Boolean(householdId),
      items,
      history,
      error,
      createHousehold,
      joinHousehold,
      leaveHousehold,
      removeMember,
      addItem,
      updateItemQuantity,
      updateItemDetails,
      deleteItem,
      setPurchased,
      lowStockAlertEnabled,
      setLowStockAlertEnabled,
    }),
    [
      uid,
      authReady,
      name,
      saveName,
      householdId,
      household,
      items,
      history,
      error,
      createHousehold,
      joinHousehold,
      leaveHousehold,
      removeMember,
      addItem,
      updateItemQuantity,
      updateItemDetails,
      deleteItem,
      setPurchased,
      lowStockAlertEnabled,
      setLowStockAlertEnabled,
    ]
  )

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>
}

export function useHousehold() {
  const ctx = useContext(HouseholdContext)
  if (!ctx) throw new Error('useHousehold must be used within HouseholdProvider')
  return ctx
}