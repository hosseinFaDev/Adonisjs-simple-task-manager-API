import { accessLevel } from 'App/Controllers/Http/AdminsController'
import { priorityList } from 'App/Controllers/Http/TasksController'
import User from 'App/Models/User'
import Task from 'App/Models/Task'

export function convertAccessLevel(recivedFileName): User {
    recivedFileName.map((user) => {
        user.role = accessLevel[user.role]
    })
    return recivedFileName
}

export function convertPriorityList(recivedFileName): Task {
    recivedFileName.map((task) => {
        return task.priority = priorityList[task.priority]
    })
    return recivedFileName
}