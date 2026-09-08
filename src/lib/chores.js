export const roomIcons = {
  'Kitchen': '🍽️',
  'Bathroom': '🛁',
  'Living Room': '🛋️',
  'Bedroom': '👔',
  'Laundry Room': '🧺',
  'Garage': '🚗',
}

export const roomColors = {
  'Kitchen': '#DCFCE6',
  'Bathroom': '#DBEAFF',
  'Living Room': '#F3E8FE',
  'Bedroom': '#FEFAE4',
  'Laundry Room': '#FEE2E2',
  'Garage': '#F3E8FE',
}

export function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

export function startOfWeek() {
  const date = startOfToday()
  date.setDate(date.getDate() - date.getDay())
  return date
}

export function getDecayPercentage(lastCleanedDate, maxDays = 7) {
  const now = new Date()
  const lastCleaned = new Date(lastCleanedDate)
  const diffMs = Math.max(0, now - lastCleaned)
  const daysSinceCleaned = diffMs / (1000 * 60 * 60 * 24)
  return Math.round(Math.min((daysSinceCleaned / maxDays) * 100, 100))
}

export function timeAgo(date) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = Math.max(0, now - then)
  const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (daysSince === 0) return 'today'
  if (daysSince === 1) return '1 day ago'
  return `${daysSince} days ago`
}

export function cadenceDays(frequency) {
  if (frequency === 'daily') return 1
  if (frequency === 'weekly') return 7
  return null
}

export function frequencyLabel(frequency) {
  if (frequency === 'daily') return 'Daily'
  if (frequency === 'weekly') return 'Weekly'
  return 'One-time'
}

// Recurring tasks (daily/weekly) stay on the list forever - completing one just
// logs a completion timestamp, and it becomes "due" again once its cadence elapses.
export function isCompletedInCurrentCycle(task) {
  if (!task.completed_at) return false
  const days = cadenceDays(task.frequency)
  if (days === null) return true
  const diffDays = (Date.now() - new Date(task.completed_at).getTime()) / (1000 * 60 * 60 * 24)
  return diffDays < days
}

export function isOverdue(task) {
  if (isCompletedInCurrentCycle(task)) return false
  const days = cadenceDays(task.frequency)
  if (days === null) {
    return Boolean(task.due_date) && new Date(task.due_date) < startOfToday()
  }
  const reference = new Date(task.completed_at || task.created_at).getTime()
  const diffDays = (Date.now() - reference) / (1000 * 60 * 60 * 24)
  return diffDays > days
}

export function isOpenTask(task) {
  return !isCompletedInCurrentCycle(task)
}

export function isSameDay(a, b) {
  return a.toDateString() === b.toDateString()
}
