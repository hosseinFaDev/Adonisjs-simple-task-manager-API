import User from 'App/Models/User'
import Task from 'App/Models/Task'

export function createDownloadForProfilePic(recivedUserData: User[] ): User[] {
    recivedUserData.forEach((user) => {
        const fileName: string = user['profile_pic']
        user['profile_pic'] = 'for download profile pic cilck here==>' + '/download/profilepic/' + fileName
    })
    return recivedUserData
}


export function createDownloadPathForTaskFiles(recivedFileName: Task[] ): Task[] {
    recivedFileName.forEach((task) => {
        const fileName: string = task['task_files']
        task['task_files'] = 'for download task files cilck here==>' + '/download/taskfiles/' + fileName
    })
    return recivedFileName
}