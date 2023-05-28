import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Task from "App/Models/Task";
import User from "App/Models/User";
import token from "App/services/token";
import { schema, rules } from '@ioc:Adonis/Core/Validator'

const checkToken = new token;
enum priorityList {
    low,
    medium,
    high,
}

export default class TasksController {


    public async getTasks({ request, response }: HttpContextContract) {
        const authorizationToken = request.header('authorization')


        if (checkToken.verify(authorizationToken)) {
            const decodedEmail = checkToken.decoded(authorizationToken)
            const userData = await User.findBy('email', decodedEmail)
            const userid = userData?.$attributes.id

            //pagination and validation
            const perPage = 10
            const page = request.qs().page || 1
            const allUserTasks = await Task.query().where('user_id', userid).paginate(page, perPage)

            return response.status(200).send(allUserTasks)
        }
        return response.status(403).json({ "message": "set your authorization token please" })
    }


    public async createTasks({ request, response }: HttpContextContract) {
        const authorizationToken = request.header('authorization')

        if (checkToken.verify(authorizationToken)) {
            const decodedEmail = checkToken.decoded(authorizationToken)
            const userData = await User.findBy('email', decodedEmail)
            const userid = userData?.$attributes.id
            const { name, content, priority = priorityList.low } = request.body()

            //upload files
            const taskFiles = request.file('taskFiles')
            let fileName : string | undefined
            if (taskFiles) {
                await taskFiles.moveToDisk('./taskFiles')
                fileName = taskFiles.fileName;
            }
            //validation for inputs data
            const validateSchema = schema.create({
                name: schema.string([
                    rules.minLength(3)
                ]),
                priority: schema.number([
                    rules.range(0, 2)
                ]),

            })
            await request.validate({ schema: validateSchema })

            //create new record in database
            await Task.create({
                name,
                content,
                priority,
                task_files: fileName,
                user_id: userid,
            })
            return response.status(201).json({ "message": "task created successfully" })
        }
        return response.status(403).json({ "message": "set your authorization token please" })
    }


    public async editTasks({ request, response }: HttpContextContract) {
        const authorizationToken = request.header('authorization')

        //extracting own id and email form user token
        if (checkToken.verify(authorizationToken)) {
            const { id, name, content, priority } = request.body()
            const decodedEmail = checkToken.decoded(authorizationToken)
            const userData = await User.findBy('email', decodedEmail)
            const userid = userData?.$attributes.id

            //upload files
            const taskFiles = request.file('taskFiles')
            let fileName : string | undefined
            if (taskFiles) {
                await taskFiles.moveToDisk('./taskFiles')
                fileName = taskFiles.fileName;
            }

            //validation for inputs data
            const validateSchema = schema.create({
                id: schema.number(),
                name: schema.string([
                    rules.minLength(3)
                ]),
                priority: schema.number([
                    rules.range(0, 2)
                ]),

            })
            await request.validate({ schema: validateSchema })

            
            //validation for changing own tasks with userId
            const correntCommentUser = await Task.query().where('id', id)
            try {
                const correntCommentUserId = correntCommentUser[0].$attributes.user_id
                if (!(userid == correntCommentUserId)) {
                    return response.status(403).json({ "message": `task with id ${id} is not your task, recheck task id please` })
                }
            } catch {
                return response.status(404).json({ "message": `task with id ${id} not been found !!!, recheck task id please` })
            }


            await Task.query().where('id', id).update({
                name,
                content,
                priority,
                task_files: fileName,
            })
            return response.status(201).json({ "message": "task edited successfully" })

        }
        return response.status(403).json({ "message": "set your authorization token please" })
    }


    public async deleteTasks({ request, response }: HttpContextContract) {
        const authorizationToken = request.header('authorization')

        if (checkToken.verify(authorizationToken)) {
            const { id } = request.body()
            if (!id) return response.status(400).json({ "message": "fill task id please and try again" })
            const decodedEmail = checkToken.decoded(authorizationToken)
            const userData = await User.findBy('email', decodedEmail)
            const userid = userData?.$attributes.id


            //validation for deleting own tasks
            const correntCommentUser = await Task.query().where('id', id)
            try {
                const correntCommentUserId = correntCommentUser[0].$attributes.user_id
                if (!(userid == correntCommentUserId)) {
                    return response.status(403).json({ "message": `task with id ${id} is not your task, recheck task id please` })
                }
            } catch {
                return response.status(404).json({ "message": `task with id ${id} not been found !!! recheck task id please` })
            }

            await Task.query().where('id', id).delete()
            return response.status(201).json({ "message": "task deleted successfully" })

        }
        return response.status(401).json({ "message": "set your authorization token please" })
    }
}
