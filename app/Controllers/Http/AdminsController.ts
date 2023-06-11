import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from "App/Models/User"
import { createDownloadForProfilePic } from "App/services/createDownloadPath"
import { uploadFile } from 'App/services/uploadFile'
import { convertAccessLevel } from 'App/services/convertToString'
export enum accessLevel {
    user,
    admin,
}
type AdminQueryStringParams = {
    searchByEmail?: string,
    page?: string,
    sort?: "asc" | "desc"
}
export default class AdminsController {

    public async usersList({ request, response }: HttpContextContract): Promise<void> {

        const queryString: AdminQueryStringParams = request.qs()

        //search by email you need to use {searchByEmail=} in your query
        const searchByEmail: string | undefined = queryString?.searchByEmail
        if (queryString.searchByEmail) {
            const selectedUser: User | null = await User.findBy('email', searchByEmail)
            //add download path for profilePic
            createDownloadForProfilePic(selectedUser)
            //convert users accese to string
            convertAccessLevel(selectedUser)
            return response.status(200).send(selectedUser)
        }

        //sorting by desc or asc by query string
        const sort: "asc" | "desc" = queryString?.sort == "desc" || undefined ? "desc" : "asc"

        //pagination
        const page: string = (queryString.page) || "1"
        const perPage: number = 3
        const allUsers: any = await User.query().where('id', '>', 0).orderBy('id', sort).paginate(Number(page), perPage)

        //add dynamid path for download profilePic
        createDownloadForProfilePic(allUsers)
        //convert users accese to string
        convertAccessLevel(allUsers)
        response.status(200).send(allUsers)
    }

    //create new account
    public async create({ request, response }: HttpContextContract): Promise<void> {

        const validateSchema: any = schema.create({
            name: schema.string([
                rules.minLength(3)
            ]),
            lastName: schema.string(),
            password: schema.string([
                rules.minLength(6)
            ]),
            email: schema.string([
                rules.email(),
                rules.unique({ table: 'users', column: 'email' }),
            ]),
            profilePic: schema.file.optional({
                size: '2mb',
                extnames: ['jpg', 'gif', 'png'],
            }),
            role: schema.enum((
                Object.values(accessLevel)
            )),
        })
        const validatedData = await request.validate({ schema: validateSchema })

        //upload files
        let fileName: string | undefined = await uploadFile(validatedData.profilePic, './profilePic')
        const hashedPassword: string = await Hash.make(validatedData.password)
        const enumToNumber: number = Number(accessLevel[validatedData.role])
        await User.create({
            name: validatedData.name,
            last_name: validatedData.lastName,
            email: validatedData.email,
            password: hashedPassword,
            profile_pic: fileName,
            role: (typeof enumToNumber === 'number') ? enumToNumber : 0,
        })
        response.status(201).json({ "message": "account has been created successfully" })

    }


    // edit account
    public async edit({ request, response }: HttpContextContract): Promise<void> {

        const validateSchema: any = schema.create({
            name: schema.string([
                rules.minLength(3)
            ]),
            lastName: schema.string(),
            password: schema.string([
                rules.minLength(6)
            ]),
            email: schema.string([
                rules.email(),
                rules.exists({
                    table: 'users', column: 'email'
                })
            ]),
            profilePic: schema.file.optional({
                size: '2mb',
                extnames: ['jpg', 'gif', 'png'],
            }),
            role: schema.enum((
                Object.values(accessLevel)
            )),
        })
        const validatedData = await request.validate({ schema: validateSchema })
        const selectedAccount: User | null = await User.findBy('email', validatedData.email)
        const hashedPassword: string = await Hash.make(validatedData.password as string)

        //upload files
        let fileName: string | undefined = await uploadFile(validatedData.profilePic, './profilePic')
        const enumToNumber: number = Number(accessLevel[validatedData.role])
        await User.updateOrCreate({
            name: selectedAccount?.name,
            last_name: selectedAccount?.last_name,
            email: selectedAccount?.email,
            password: selectedAccount?.password,
            profile_pic: selectedAccount?.profile_pic,
            role: selectedAccount?.role,
        }, {
            name: validatedData.name,
            last_name: validatedData.lastName,
            email: validatedData.email,
            password: hashedPassword,
            profile_pic: fileName,
            role: (typeof enumToNumber === 'number') ? enumToNumber : 1,
        })
        response.status(201).json({ "message": "account info has been edited successfully" })

    }

    public async delete({ request, response }: HttpContextContract): Promise<void> {

        const validateSchema: any = schema.create({
            email: schema.string([
                rules.email()
            ])
        })
        const validatedData = await request.validate({ schema: validateSchema })
        const findEmail: User | null = await User.findBy('email', validatedData.email)
        if (!findEmail) return response.status(404).json({ "message": "user with this email doen't exsist" })
        await User.query().where('email', validatedData.email as string).delete();
        response.status(201).json({ "message": "user has been deleted successfully" })

    }

}

