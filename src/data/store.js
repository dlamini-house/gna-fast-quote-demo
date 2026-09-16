import { useEffect, useState } from 'react'
import { TRIAL_DAYS, TRIAL_QUOTES } from './mockData'

const STORAGE_KEY = 'gna-fast-quote-demo-state'

const DEFAULT_APPLICATIONS = [
  { id: 1, company: 'BuildCore (Pty) Ltd', contact: 'John Mkhize', email: 'john@buildcore.co.za', companyReg: '2018/345678/07', companyAddress: '12 Innovation Drive, Waterfall City, Midrand, 1685', nhbrc: '30001234', registered: '12 Aug 2026', status: 'pending', certificateDataUrl: null },
  { id: 2, company: 'SA Structure (Pty) Ltd', contact: 'Sarah Naidoo', email: 'sarah@sa-structure.co.za', companyReg: '2016/221190/07', companyAddress: '4 Concrete Ave, Germiston, 1401', nhbrc: '30004567', registered: '11 Aug 2026', status: 'pending', certificateDataUrl: null },
  { id: 3, company: 'Metro Plans (Pty) Ltd', contact: 'Michael Botha', email: 'michael@metroplans.co.za', companyReg: '2019/778812/07', companyAddress: '77 Blueprint Rd, Sandton, 2196', nhbrc: '30007890', registered: '10 Aug 2026', status: 'pending', certificateDataUrl: null },
  { id: 4, company: 'DCD Engineering', contact: 'David Pillay', email: 'david@dcdeng.co.za', companyReg: '2015/119004/07', companyAddress: '9 Girder St, Boksburg, 1459', nhbrc: '30003321', registered: '05 Aug 2026', status: 'verified', certificateDataUrl: null },
  { id: 5, company: 'AV Designs (Pty) Ltd', contact: 'Anel van der Merwe', email: 'anel@avdesigns.co.za', companyReg: '2020/556231/07', companyAddress: '21 Facade Way, Centurion, 0157', nhbrc: '30006654', registered: '02 Aug 2026', status: 'verified', certificateDataUrl: null },
  { id: 6, company: 'Mkonto Builders', contact: 'Thabo Mkonto', email: 'thabo@mkontobuild.co.za', companyReg: '2017/990213/07', companyAddress: '3 Site Camp Rd, Soweto, 1818', nhbrc: '30011456', registered: '03 Sep 2026', status: 'rejected', reason: 'NHBRC certificate expired 14 Jun 2026 — applicant must upload a current certificate to reapply.', certificateDataUrl: null },
  { id: 7, company: 'QuickStruct CC', contact: 'Sipho Zulu', email: 'sipho@quickstruct.co.za', companyReg: '2014/665521/23', companyAddress: '58 Rebar St, Vanderbijlpark, 1911', nhbrc: '30012980', registered: '29 Aug 2026', status: 'rejected', reason: 'Certificate details did not match the registered company name.', certificateDataUrl: null }
]

const DEFAULT_ADMIN_USERS = [
  { id: 1, name: 'Gavin E.', email: 'gavine@gnafastquote.co.za', role: 'Master Admin', active: '15 min ago' },
  { id: 2, name: 'Lamu', email: 'lamu@dlaminihouse.co.za', role: 'Admin', active: '2 hours ago' },
  { id: 3, name: 'Support Team', email: 'support@gnafastquote.co.za', role: 'Admin', active: '1 day ago' }
]

function loadState() {
  let saved = {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) saved = JSON.parse(raw)
  } catch (e) {
    console.warn('Could not read local demo state', e)
  }
  // Merge with defaults so older saved state (before admin data existed) still works.
  const adminUsers =
    saved.adminUsers && saved.adminUsers.some((a) => a.email === 'gavine@gnafastquote.co.za')
      ? saved.adminUsers
      : DEFAULT_ADMIN_USERS // stale pre-Master-Admin data from an earlier demo build — reseed

  return {
    trialStartedAt: saved.trialStartedAt || new Date().toISOString(),
    plan: saved.plan || null,
    credits: saved.credits ?? 0,
    quotes: saved.quotes || [],
    applications: saved.applications || DEFAULT_APPLICATIONS,
    adminUsers,
    companyLogo: saved.companyLogo || null, // { name, dataUrl, type } — the signed-in contractor's own logo
    currentAdminEmail: saved.currentAdminEmail || null
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// Simple shared store via a module-level singleton + React state hook.
// This is a demo convenience, not a real state management library.
let listeners = []
let state = loadState()

function setState(updater) {
  state = typeof updater === 'function' ? updater(state) : updater
  saveState(state)
  listeners.forEach((l) => l(state))
}

export function useAppState() {
  const [local, setLocal] = useState(state)
  useEffect(() => {
    listeners.push(setLocal)
    return () => {
      listeners = listeners.filter((l) => l !== setLocal)
    }
  }, [])
  return [local, setState]
}

export function trialStatus(s) {
  const start = new Date(s.trialStartedAt)
  const daysUsed = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24))
  const daysLeft = Math.max(0, TRIAL_DAYS - daysUsed)
  const quotesLeft = Math.max(0, TRIAL_QUOTES - s.quotes.length)
  const onTrial = !s.plan
  const trialExpired = onTrial && (daysLeft === 0 || quotesLeft === 0)
  return { onTrial, daysLeft, quotesLeft, trialExpired }
}

export function canGenerateQuote(s) {
  if (s.plan) return s.credits > 0 || true // plan holders draw from monthly allowance (demo: unlimited within plan)
  const { trialExpired } = trialStatus(s)
  return !trialExpired
}

// ---- Admin actions ----
export function approveApplication(setState, id) {
  setState((s) => ({
    ...s,
    applications: s.applications.map((a) => (a.id === id ? { ...a, status: 'verified', reason: undefined } : a))
  }))
}

export function rejectApplication(setState, id, reason) {
  setState((s) => ({
    ...s,
    applications: s.applications.map((a) => (a.id === id ? { ...a, status: 'rejected', reason } : a))
  }))
}

export function addAdminUser(setState, admin) {
  setState((s) => ({
    ...s,
    adminUsers: [...s.adminUsers, { id: Date.now(), active: 'Just invited', ...admin }]
  }))
}

export function submitApplication(setState, data) {
  const newApp = {
    id: Date.now(),
    status: 'pending',
    registered: new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }),
    ...data
  }
  setState((s) => ({ ...s, applications: [newApp, ...s.applications] }))
  return newApp
}

export function setCompanyLogo(setState, logo) {
  setState((s) => ({ ...s, companyLogo: logo }))
}

export function signInAsAdmin(setState, email) {
  setState((s) => ({ ...s, currentAdminEmail: email }))
}

export function signOutAdmin(setState) {
  setState((s) => ({ ...s, currentAdminEmail: null }))
}

export function currentAdmin(s) {
  return s.adminUsers.find((a) => a.email === s.currentAdminEmail) || null
}

export function isMasterAdmin(s) {
  const admin = currentAdmin(s)
  return admin?.role === 'Master Admin'
}

