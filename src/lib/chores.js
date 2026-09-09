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

// frequency is null/0 for a one-time task (scheduled via due_date), or a
// positive integer N meaning "repeat every N days" - same unit as
// rooms.decay_rate, so the two share the same mental model.
export function frequencyLabel(frequency) {
  if (!frequency) return 'One-time'
  if (frequency === 1) return 'Daily'
  if (frequency === 7) return 'Weekly'
  return `Every ${frequency} days`
}

// Recurring tasks stay on the list forever - completing one just logs a
// completion timestamp, and it becomes "due" again once its cadence elapses.
export function isCompletedInCurrentCycle(task) {
  if (!task.last_completed) return false
  if (!task.frequency) return true
  const diffDays = (Date.now() - new Date(task.last_completed).getTime()) / (1000 * 60 * 60 * 24)
  return diffDays < task.frequency
}

export function isOverdue(task) {
  if (isCompletedInCurrentCycle(task)) return false
  if (!task.frequency) {
    return Boolean(task.due_date) && new Date(task.due_date) < startOfToday()
  }
  const reference = new Date(task.last_completed || task.created_at).getTime()
  const diffDays = (Date.now() - reference) / (1000 * 60 * 60 * 24)
  return diffDays > task.frequency
}

export function isOpenTask(task) {
  return !isCompletedInCurrentCycle(task)
}

export function isSameDay(a, b) {
  return a.toDateString() === b.toDateString()
}
