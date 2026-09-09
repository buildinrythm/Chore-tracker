import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase.js'

export function useChoreData() {
  const [household, setHousehold] = useState(null)
  const [me, setMe] = useState(null)
  const [rooms, setRooms] = useState([])
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const meRes = await supabase.from('users').select('*').eq('id', user.id).maybeSingle()
    if (meRes.error) console.log(meRes.error)

    if (!meRes.data) {
      setMe(null)
      setHousehold(null)
      setLoading(false)
      return
    }
    setMe(meRes.data)

    const [householdRes, roomsRes, tasksRes, membersRes, logsRes] = await Promise.all([
      supabase.from('households').select('*').eq('id', meRes.data.household_id).maybeSingle(),
      supabase.from('rooms').select('*').order('name'),
      supabase.from('tasks').select('*').order('created_at'),
      supabase.from('users').select('*').order('created_at'),
      supabase.from('logs').select('*').order('completed_at'),
    ])

    if (householdRes.error) console.log(householdRes.error)
    else setHousehold(householdRes.data)

    if (roomsRes.error) console.log(roomsRes.error)
    else setRooms(roomsRes.data)

    if (tasksRes.error) console.log(tasksRes.error)
    else setTasks(tasksRes.data)

    if (membersRes.error) console.log(membersRes.error)
    else setMembers(membersRes.data)

    if (logsRes.error) console.log(logsRes.error)
    else setLogs(logsRes.data)

    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time fetch on mount, no data-fetching library in use
    fetchAll()
  }, [fetchAll])

  async function createHousehold(name) {
    const { error } = await supabase.rpc('create_household', { household_name: name })
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  async function joinHousehold(code) {
    const { error } = await supabase.rpc('join_household', { code })
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  async function addRoom(name) {
    const { error } = await supabase.from('rooms').insert({
      name,
      household_id: household.id,
      decay_rate: 7,
      last_cleaned: new Date().toISOString(),
    })
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

  async function markRoomCleaned(roomId) {
    const { error } = await supabase
      .from('rooms')
      .update({ last_cleaned: new Date().toISOString() })
      .eq('id', roomId)
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  async function addTask({ roomId, name, assignedTo, frequency, dueDate }) {
    const { error } = await supabase.from('tasks').insert({
      room_id: roomId,
      name,
      assigned_to: assignedTo || null,
      frequency: frequency || null,
      due_date: frequency ? null : (dueDate || null),
    })
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  async function updateTask(taskId, { name, roomId, assignedTo, frequency, dueDate }) {
    const { error } = await supabase
      .from('tasks')
      .update({
        name,
        room_id: roomId,
        assigned_to: assignedTo || null,
        frequency: frequency || null,
        due_date: frequency ? null : (dueDate || null),
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
      .update({ last_completed: completedAt })
      .eq('id', task.id)
    if (taskError) {
      console.log(taskError)
      return { error: taskError }
    }

    if (task.assigned_to) {
      const { error: logError } = await supabase
        .from('logs')
        .insert({ task_id: task.id, room_id: task.room_id, user_id: task.assigned_to, completed_at: completedAt })
      if (logError) console.log(logError)
    }

    await fetchAll()
    return { error: null }
  }

  async function updateMyProfile({ name, avatar }) {
    if (!me) return { error: new Error('Not in a household yet') }
    const { error } = await supabase.from('users').update({ name, avatar }).eq('id', me.id)
    if (error) console.log(error)
    else await fetchAll()
    return { error }
  }

  return {
    household,
    me,
    rooms,
    tasks,
    members,
    logs,
    loading,
    refetch: fetchAll,
    createHousehold,
    joinHousehold,
    addRoom,
    updateRoom,
    deleteRoom,
    markRoomCleaned,
    addTask,
    updateTask,
    deleteTask,
    markTaskComplete,
    updateMyProfile,
  }
}
