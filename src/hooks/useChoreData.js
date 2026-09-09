import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase.js'

export function useChoreData() {
  const [rooms, setRooms] = useState([])
  const [tasks, setTasks] = useState([])
  const [profiles, setProfiles] = useState([])
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    const [roomsRes, tasksRes, profilesRes, completionsRes] = await Promise.all([
      supabase.from('rooms').select('*').order('name'),
      supabase.from('tasks').select('*').order('created_at'),
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('task_completions').select('*').order('completed_at'),
    ])

    if (roomsRes.error) console.log(roomsRes.error)
    else setRooms(roomsRes.data)

    if (tasksRes.error) console.log(tasksRes.error)
    else setTasks(tasksRes.data)

    if (profilesRes.error) console.log(profilesRes.error)
    else setProfiles(profilesRes.data)

    if (completionsRes.error) console.log(completionsRes.error)
    else setCompletions(completionsRes.data)

    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time fetch on mount, no data-fetching library in use
    fetchAll()
  }, [fetchAll])

  async function addRoom(name) {
    const { error } = await supabase.from('rooms').insert({ name })
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  async function markRoomCleaned(roomId) {
    const { error } = await supabase
      .from('rooms')
      .update({ last_cleaned: new Date().toISOString() })
      .eq('id', roomId)
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  async function updateRoom(roomId, { name, decayRate }) {
    const { error } = await supabase
      .from('rooms')
      .update({ name, decay_rate: decayRate })
      .eq('id', roomId)
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  async function deleteRoom(roomId) {
    const { error } = await supabase.from('rooms').delete().eq('id', roomId)
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  async function addTask({ roomId, title, assignedTo, frequency, dueDate }) {
    const { error } = await supabase.from('tasks').insert({
      room_id: roomId,
      title,
      assigned_to: assignedTo || null,
      frequency: frequency || 'once',
      due_date: dueDate || null,
    })
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  async function updateTask(taskId, { title, roomId, assignedTo, frequency, dueDate }) {
    const { error } = await supabase
      .from('tasks')
      .update({
        title,
        room_id: roomId,
        assigned_to: assignedTo || null,
        frequency,
        due_date: frequency === 'once' ? (dueDate || null) : null,
      })
      .eq('id', taskId)
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  async function deleteTask(taskId) {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  async function markTaskComplete(task) {
    const completedAt = new Date().toISOString()
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ completed_at: completedAt })
      .eq('id', task.id)
    if (taskError) {
      console.log(taskError)
      return { error: taskError }
    }

    if (task.assigned_to) {
      const { error: logError } = await supabase
        .from('task_completions')
        .insert({ task_id: task.id, completed_by: task.assigned_to, completed_at: completedAt })
      if (logError) console.log(logError)
    }

    await fetchAll()
    return { error: null }
  }

  async function addMember({ name, avatar }) {
    const { error } = await supabase.from('profiles').insert({ name, avatar })
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  async function updateMember(profileId, { name, avatar }) {
    const { error } = await supabase
      .from('profiles')
      .update({ name, avatar })
      .eq('id', profileId)
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  async function deleteMember(profileId) {
    const { error } = await supabase.from('profiles').delete().eq('id', profileId)
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  return {
    rooms,
    tasks,
    profiles,
    completions,
    loading,
    refetch: fetchAll,
    addRoom,
    updateRoom,
    deleteRoom,
    markRoomCleaned,
    addTask,
    updateTask,
    deleteTask,
    markTaskComplete,
    addMember,
    updateMember,
    deleteMember,
  }
}
