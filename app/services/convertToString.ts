import { accessLevel } from 'App/Controllers/Http/AdminsController'
import { priorityList } from 'App/Controllers/Http/TasksController'
import User from 'App/Models/User'
import Task from 'App/Models/Task'

export function convertAccessLevel(recivedFileName: User[]): User[] {
    recivedFileName.forEach((user) => {
        ((user.role as unknown) as string) = accessLevel[user.role]
    })
    return recivedFileName
}

export function convertPriorityList(recivedFileName: Task[]): Task[] {
    recivedFileName.forEach((task) => {
        ((task.priority as unknown) as string) = priorityList[task.priority]
    })
    return recivedFileName
}