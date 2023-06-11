import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from "App/Models/Task";
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { createDownloadPathForTaskFiles } from "App/services/createDownloadPath"
import { extractUserId } from 'App/services/extractUserId'
import { uploadFile } from 'App/services/uploadFile'
import { convertPriorityList } from 'App/services/convertToString';

export enum priorityList {
    low,
    medium,
    high,
}
type UserQueryStringParams = {
    taskName?: string,
    page?: string,
    sort?: "asc" | "desc"
}

export default class TasksController {


    public async getTasks({ request, response }: HttpContextContract): Promise<void> {
        const queryString: UserQueryStringParams = request.qs()
        const userid: number = await extractUserId(request.header('authorization') as string)

        //sorting by desc or asc by query string
        const sort: "asc" | "desc" = queryString?.sort == "desc" || undefined ? "desc" : "asc"

        //search by task name and pagination 
        const perPage: number = 10
        const page: string = request.qs().page || '1'
        if (queryString.taskName) {
            const searchedTask: any = await Task.query().where('user_id', userid).where('name', `${queryString.taskName}`).orderBy('created_at', sort).paginate(Number(page), perPage)
            createDownloadPathForTaskFiles(searchedTask)
            convertPriorityList(searchedTask)
            return response.status(200).send(searchedTask)
        }
        const allUserTasks: any = await Task.query().where('user_id', userid).orderBy('created_at', sort).paginate(Number(page), perPage)

        //add dynamid path for download task files
        createDownloadPathForTaskFiles(allUserTasks)
        convertPriorityList(allUserTasks)
        response.status(200).send(allUserTasks)
    }


    public async createTasks({ request, response }: HttpContextContract): Promise<void> {
        const userid: number = await extractUserId(request.header('authorization') as string)

        //validation for inputs data
        const validateSchema: any = schema.create({
            name: schema.string([
                rules.minLength(3)
            ]),
            priority: schema.enum(
                Object.values(priorityList)
            ),
            content: schema.string.optional(),
            taskFileName: schema.file.optional({
                size: '2mb',
                extnames: ['jpg', 'gif', 'png', 'pdf', 'json', 'docs'],
            }),
        })
        const validatedData = await request.validate({ schema: validateSchema })
        //upload files
        let taskFileName: string | undefined = await uploadFile(validatedData.taskFileName, './taskFiles')

        const enumToNumber: number = Number(priorityList[validatedData.priority as priorityList])
        //create new record in database
        await Task.create({
            name: validatedData.name,
            content: validatedData.content,
            priority: (typeof enumToNumber === 'number') ? enumToNumber : 0,
            task_files: taskFileName,
            user_id: userid,
        })
        response.status(201).json({ "message": "task created successfully" })
    }


    public async editTasks({ request, response }: HttpContextContract): Promise<void> {
        const userid: number = await extractUserId(request.header('authorization') as string)

        //validation for inputs data
        const validateSchema: any = schema.create({
            id: schema.number([
                rules.exists({
                    table: 'tasks', column: 'id', where: {
                        user_id: userid,
                    },
                })
            ]),
            name: schema.string([
                rules.minLength(3)
            ]),
            priority: schema.enum(
                Object.values(priorityList)
            ),
            content: schema.string.optional(),
            taskFileName: schema.file.optional({
                size: '2mb',
                extnames: ['jpg', 'gif', 'png', 'pdf', 'json', 'docs'],
            }),
        })
        const validatedData = await request.validate({ schema: validateSchema })

        //upload files
        let taskFileName: string | undefined = await uploadFile(validatedData.taskFileName, './taskFiles')

        const enumToNumber: number = Number(priorityList[validatedData.priority as priorityList])
        const selectedTask = await Task.findBy('id', validatedData.id)

        await Task.updateOrCreate({
            name: selectedTask?.name,
            priority: selectedTask?.priority,
            content: selectedTask?.content,
            task_files: selectedTask?.task_files,
        }, {
            name: validatedData.name,
            content: validatedData.content,
            task_files: taskFileName,
            priority: (typeof enumToNumber === 'number') ? enumToNumber : 0,
        })

        response.status(201).json({ "message": "task edited successfully" })
    }


    public async deleteTasks({ request, response }: HttpContextContract): Promise<void> {
        const userid: number = await extractUserId(request.header('authorization') as string)
        //validation for inputs data
        const validateSchema = schema.create({
            id: schema.number([
                rules.exists({
                    table: 'tasks', column: 'id', where: {
                        user_id: userid,
                    },
                })
            ])
        })
        const validatedData = await request.validate({ schema: validateSchema })
        await Task.query().where('id', validatedData.id).delete()
        response.status(201).json({ "message": "task deleted successfully" })
    }

}
