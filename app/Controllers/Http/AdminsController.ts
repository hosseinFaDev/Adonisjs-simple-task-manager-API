import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from "App/Models/User"
type AdminBodyContent = {
    name?: string,
    lastName?: string,
    email?: string,
    password?: string,
    role?: number
}

type AdminQueryStringParams = {
    searchByEmail?: string,
    page?: string,
    sort?: "asc" | "desc"
}
export default class AdminsController {

    public async usersList({ request, response }: HttpContextContract) {


        const queryString: AdminQueryStringParams = request.qs()

        //search by email you need to use {searchByEmail=} in your query
        const searchByEmail: string | undefined = queryString?.searchByEmail
        if (queryString.searchByEmail) {
            const allUsers: User | null = await User.findBy('email', searchByEmail)

            // add dynamid path for download profilePic
            if (allUsers) {
                const fileName: string = allUsers.$attributes['profile_pic']
                allUsers.$attributes['profile_pic'] = 'for download profile pic cilck here==>' + '/download/' + fileName
            }
            return response.status(200).send(allUsers)

        }

        //sorting by desc or asc by query string
        const sort: "asc" | "desc" = queryString?.sort == "desc" || undefined ? "desc" : "asc"

        //pagination
        const page: string = (queryString.page) || "1"
        const perPage: number = 3
        const allUsers: any = await User.query().where('id', '>', 0).orderBy('id', sort).paginate(Number(page), perPage)

        //add dynamid path for download profilePic
        allUsers.map((user) => {
            const fileName: string = user.$attributes['profile_pic']
            user.$attributes['profile_pic'] = 'for download profile pic cilck here==>' + '/download/' + fileName
        })
        return response.status(200).send(allUsers)


    }

    //create new account
    public async create({ request, response }: HttpContextContract) {

        const body: AdminBodyContent = request.body()
        const profilePic: any = request.file('profilePic')


        //Validation in two different ways

        //firt one is normal validation

        // switch (true) {
        //     case name == null: return response.status(400).json({ "message": "name is empty"})
        //         break;
        //     case lastName == null: return response.status(400).json({ "message": "lastName is empty"})
        //         break;
        //     case email == null: return response.status(400).json({ "message": "email is empty"})
        //         break;
        //     case password == null: return response.status(400).json({ "message": "password is empty"})
        //         break;
        // }

        // const :string repetitive_email = await User.findBy('email', email)

        // if (repetitive_email) {
        //     return response.status(400).json({ "message": "this email has been register brfore"})
        // }


        //second one
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
            profilePic: schema.file({
                size: '2mb',
                extnames: ['jpg', 'gif', 'png'],
            }),
            role: schema.number([
                rules.range(0, 1)
            ])
        })

        //upload files and validation
        let fileName: string | undefined
        if (profilePic) {
            await profilePic.moveToDisk('./profilePic')
            fileName = profilePic.fileName;
        }

        await request.validate({ schema: validateSchema })
        const hashedPassword: string = await Hash.make(body.password as string)
        await User.create({
            name: body.name,
            last_name: body.lastName,
            email: body.email,
            password: hashedPassword,
            profile_pic: fileName,
            role: body.role
        })
        response.status(201).json({ "message": "account has been created successfully" })

    }



    // edit account
    public async edit({ request, response }: HttpContextContract) {

        const body: AdminBodyContent = request.body()
        const profilePic: any = request.file('profilePic')

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
            profilePic: schema.file({
                size: '2mb',
                extnames: ['jpg', 'gif', 'png'],
            }),
            role: schema.number([
                rules.range(0, 1)
            ])

        })
        await request.validate({ schema: validateSchema })
        const selectedAccount: User | null = await User.findBy('email', body.email)
        const hashedPassword: string = await Hash.make(body.password as string)


        //upload files and validation
        let fileName: string | undefined
        if (profilePic) {
            await profilePic.moveToDisk('./profilePic')
            fileName = profilePic.fileName;
        }


        await User.updateOrCreate({
            name: selectedAccount?.$attributes.name,
            last_name: selectedAccount?.$attributes.last_name,
            email: selectedAccount?.$attributes.email,
            password: selectedAccount?.$attributes.password,
            profile_pic: selectedAccount?.$attributes.profile_pic,
            role: selectedAccount?.$attributes.role,
        }, {
            name: body.name,
            last_name: body.lastName,
            email: body.email,
            password: hashedPassword,
            profile_pic: fileName,
            role: body.role,
        })
        response.status(201).json({ "message": "account info has been edited successfully" })

    }

    public async delete({ request, response }: HttpContextContract) {

        const body: Record<string, AdminBodyContent> = request.body();
        const validateSchema: any = schema.create({
            email: schema.string([
                rules.email()
            ])
        })
        await request.validate({ schema: validateSchema })
        const findEmail: User | null = await User.findBy('email', body.email)
        if (!findEmail) return response.status(404).json({ "message": "user with this email doen't exsist" })
        await User.query().where('email', body.email as string).delete();
        response.status(201).json({ "message": "user has been deleted successfully" })

    }



}

