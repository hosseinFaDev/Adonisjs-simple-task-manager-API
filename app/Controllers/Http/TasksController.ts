import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { JwtPayload } from 'jsonwebtoken'
import Task from "App/Models/Task";
import User from "App/Models/User";
import token from "App/services/token";
import { schema, rules } from '@ioc:Adonis/Core/Validator'

const checkToken: token = new token;
enum priorityList {
    low,
    medium,
    high,
}
type UserBodyContent = {
    id?: number,
    name?: string,
    content?: string,
    priority?: priorityList,

}


export default class TasksController {


    public async getTasks({ request, response }: HttpContextContract) {
        const authorizationToken: string | undefined = request.header('authorization')

        if (checkToken.verify(authorizationToken as string)) {
            const decodedEmail: string | JwtPayload | null = checkToken.decoded(authorizationToken as string)
            const userData: User | null = await User.findBy('email', decodedEmail)
            const userid: number = userData?.$attributes.id

            //pagination and validation
            const perPage: number = 10
            const page: string = request.qs().page || '1'
            const allUserTasks: any = await Task.query().where('user_id', userid).paginate(Number(page), perPage)


            return response.status(200).send(allUserTasks)
        }
        return response.status(403).json({ "message": "set your authorization token please" })
    }


    public async createTasks({ request, response }: HttpContextContract) {
        const authorizationToken: string | undefined = request.header('authorization')

        if (checkToken.verify(authorizationToken as string)) {
            const decodedEmail: string | JwtPayload | null = checkToken.decoded(authorizationToken as string)
            const userData: User | null = await User.findBy('email', decodedEmail)
            const userid: number = userData?.$attributes.id
            const body: UserBodyContent = request.body()

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
            await request.validate({ schema: validateSchema })
            const enumToNumber = priorityList[body.priority as priorityList]
            //create new record in database
            await Task.create({
                name: body.name,
                content: body.content,
                priority: (typeof enumToNumber === 'number') ? enumToNumber : 0,
                task_files: fileName,
                user_id: userid,
            })
            return response.status(201).json({ "message": "task created successfully" })
        }
        return response.status(403).json({ "message": "set your authorization token please" })
    }


    public async editTasks({ request, response }: HttpContextContract) {
        const authorizationToken: string | undefined = request.header('authorization')

        //extracting own id and email form user token
        if (checkToken.verify(authorizationToken as string)) {
            const body: UserBodyContent = request.body()
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
                id: schema.number(),
                name: schema.string([
                    rules.minLength(3)
                ]),
                priority: schema.enum(
                    Object.values(priorityList)
                ),

            })
            await request.validate({ schema: validateSchema })


            //validation for changing own tasks with userId
            const correntCommentUser: Task[] = await Task.query().where('id', body.id as number)
            try {
                const correntCommentUserId: number = correntCommentUser[0].$attributes.user_id
                if (!(userid == correntCommentUserId)) {
                    return response.status(403).json({ "message": `task with id ${body.id} is not your task, recheck task id please` })
                }
            } catch {
                return response.status(404).json({ "message": `task with id ${body.id} not been found !!!, recheck task id please` })
            }

            const enumToNumber = priorityList[body.priority as priorityList]
            await Task.query().where('id', body.id as number).update({
                name: body.name,
                content: body.content,
                priority: (typeof enumToNumber === 'number') ? enumToNumber : 0,
                task_files: fileName,
            })
            return response.status(201).json({ "message": "task edited successfully" })

        }
        return response.status(403).json({ "message": "set your authorization token please" })
    }


    public async deleteTasks({ request, response }: HttpContextContract) {
        const authorizationToken: string | undefined = request.header('authorization')

        if (checkToken.verify(authorizationToken as string)) {
            const body: UserBodyContent = request.body()
            if (!body.id) return response.status(400).json({ "message": "fill task id please and try again" })
            const decodedEmail: string | JwtPayload | null = checkToken.decoded(authorizationToken as string)
            const userData: User | null = await User.findBy('email', decodedEmail)
            const userid: number = userData?.$attributes.id


            //validation for deleting own tasks
            const correntCommentUser: Task[] = await Task.query().where('id', body.id)
            try {
                const correntCommentUserId: number = correntCommentUser[0].$attributes.user_id
                if (!(userid == correntCommentUserId)) {
                    return response.status(403).json({ "message": `task with id ${body.id} is not your task, recheck task id please` })
                }
            } catch {
                return response.status(404).json({ "message": `task with id ${body.id} not been found !!! recheck task id please` })
            }

            await Task.query().where('id', body.id).delete()
            return response.status(201).json({ "message": "task deleted successfully" })

        }
        return response.status(401).json({ "message": "set your authorization token please" })
    }
}
