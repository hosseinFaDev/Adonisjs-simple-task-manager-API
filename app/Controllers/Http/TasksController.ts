import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { JwtPayload } from 'jsonwebtoken'
import Task from "App/Models/Task";
import User from "App/Models/User";
import token from "App/services/token";
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import {createDownloadPathTaskFile} from "App/services/createDownloadPath"

const checkToken: token = new token;

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
        const authorizationToken: string | undefined = request.header('authorization')
        const queryString: UserQueryStringParams = request.qs()

        if (checkToken.verify(authorizationToken as string)) {
            const decodedEmail: string | JwtPayload | null = checkToken.decoded(authorizationToken as string)
            const userData: User | null = await User.findBy('email', decodedEmail)
            const userid: number = userData?.$attributes.id

            //sorting by desc or asc by query string
            const sort: "asc" | "desc" = queryString?.sort == "desc" || undefined ? "desc" : "asc"

            //search by task name and pagination 
            const perPage: number = 10
            const page: string = request.qs().page || '1'
            if (queryString.taskName) {
                const searchedTask: any = await Task.query().where('user_id', userid).where('name', `${queryString.taskName}`).orderBy('created_at', sort).paginate(Number(page), perPage)
                //add dynamid path for download task files the //==> other way is create a functin for do this and stop repetitive code
                createDownloadPathTaskFile(searchedTask)
                return response.status(200).send(searchedTask)
            }

            const allUserTasks: any = await Task.query().where('user_id', userid).orderBy('created_at', sort).paginate(Number(page), perPage)

            //add dynamid path for download task files
            createDownloadPathTaskFile(allUserTasks)
            return response.status(200).send(allUserTasks)


        }

        return response.status(403).json({ "message": "set your authorization token please" })
    }


    public async createTasks({ request, response }: HttpContextContract): Promise<void> {
        const authorizationToken: string | undefined = request.header('authorization')

        if (checkToken.verify(authorizationToken as string)) {
            const decodedEmail: string | JwtPayload | null = checkToken.decoded(authorizationToken as string)
            const userData: User | null = await User.findBy('email', decodedEmail)
            const userid: number = userData?.$attributes.id

            //upload files
            const taskFiles: any = request.file('taskFiles')
            let fileName: string | undefined
            if (taskFiles) {
                await taskFiles.moveToDisk('./taskFiles')
                fileName = taskFiles.fileName;
            }
            //validation for inputs data
            const validateSchema: any = schema.create({
                name: schema.string([
                    rules.minLength(3)
                ]),
                priority: schema.enum(
                    Object.values(priorityList)
                ),

            })
            const validatedData = await request.validate({ schema: validateSchema })
            const enumToNumber: number = Number[priorityList[validatedData.priority as priorityList]]
            //create new record in database
            await Task.create({
                name: validatedData.name,
                content: validatedData.content,
                priority: (typeof enumToNumber === 'number') ? enumToNumber : 0,
                task_files: fileName,
                user_id: userid,
            })
            return response.status(201).json({ "message": "task created successfully" })
        }
        return response.status(403).json({ "message": "set your authorization token please" })
    }


    public async editTasks({ request, response }: HttpContextContract): Promise<void> {
        const authorizationToken: string | undefined = request.header('authorization')

        //extracting own id and email form user token
        if (checkToken.verify(authorizationToken as string)) {
            const decodedEmail: string | JwtPayload | null = checkToken.decoded(authorizationToken as string)
            const userData: User | null = await User.findBy('email', decodedEmail)
            const userid: number = userData?.$attributes.id

            //upload files
            const taskFiles: any = request.file('taskFiles')
            let fileName: string | undefined
            if (taskFiles) {
                await taskFiles.moveToDisk('./taskFiles')
                fileName = taskFiles.fileName;
            }

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

            })
            const validatedData = await request.validate({ schema: validateSchema })

            const enumToNumber: number = Number[priorityList[validatedData.priority as priorityList]]
            await Task.query().where('id', validatedData.id as number).update({
                name: validatedData.name,
                content: validatedData.content,
                priority: (typeof enumToNumber === 'number') ? enumToNumber : 0,
                task_files: fileName,
            })
            return response.status(201).json({ "message": "task edited successfully" })

        }
        return response.status(403).json({ "message": "set your authorization token please" })
    }


    public async deleteTasks({ request, response }: HttpContextContract): Promise<void> {
        const authorizationToken: string | undefined = request.header('authorization')
        //validation for inputs data

        if (checkToken.verify(authorizationToken as string)) {
            const decodedEmail: string | JwtPayload | null = checkToken.decoded(authorizationToken as string)
            const userData: User | null = await User.findBy('email', decodedEmail)
            const userid: number = userData?.$attributes.id
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
            return response.status(201).json({ "message": "task deleted successfully" })

        }
        return response.status(401).json({ "message": "set your authorization token please" })
    }
}
