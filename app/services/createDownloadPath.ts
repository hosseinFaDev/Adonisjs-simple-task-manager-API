import {accessLevel} from 'App/Controllers/Http/AdminsController'
import {priorityList} from 'App/Controllers/Http/TasksController'


export function createDownloadPathforfilePic (recivedFileName){

    recivedFileName.map((user) => {
        const fileName: string = user.$attributes['profile_pic']
        user.$attributes['profile_pic'] = 'for download profile pic cilck here==>' + '/download/profilepic/' + fileName
        user.$attributes['role'] = accessLevel[user.$attributes['role']]
         
    })
    return recivedFileName
}


export function createDownloadPathTaskFile (recivedFileName){

    recivedFileName.map((task) => {
        const fileName: string = task.$attributes['task_files']
        const priorityNumber: number = task.$attributes['priority']
        task.$attributes['priority'] = priorityList[priorityNumber]
        task.$attributes['task_files'] = 'for download task files cilck here==>' + '/download/taskfiles/' + fileName
    })     
    return recivedFileName
}