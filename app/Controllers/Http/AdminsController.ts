import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from "App/Models/User"
export default class AdminsController {

    public async usersList({ request, response }: HttpContextContract) {
        const queryString: Record<string, any> = request.qs()

        //search by email you need to use {searchByEmail=} in your query
        const searchByEmail: string = queryString.searchByEmail
        if (queryString.searchByEmail) {
            const allUsers = await User.findBy('email', searchByEmail)

            // add dynamid path for download profilePic
            if (allUsers) {
                const fileName = allUsers.$attributes['profile_pic']
                allUsers.$attributes['profile_pic'] = 'for download profile pic cilck here==>' + '/download/' + fileName
            }
            return response.status(200).send(allUsers)

        }

        //sorting by desc or asc by query string
        const sort: "desc" | "asc" = queryString.sort == "desc" || undefined ? "desc" as "desc" : "asc" as "asc"

        //pagination
        const page: any = queryString.page || 1
        const perPage: number = 3
        const allUsers = await User.query().where('id', '>', 0).orderBy('id', sort).paginate(page, perPage)

        //add dynamid path for download profilePic
        allUsers.map((user) => {
            const fileName = user.$attributes['profile_pic']
            user.$attributes['profile_pic'] = 'for download profile pic cilck here==>' + '/download/' + fileName
        })
        return response.status(200).send(allUsers)


    }

    //create new account
    public async create({ request, response }: HttpContextContract) {
        const { name, lastName, email, password } = request.body()
        const profilePic = request.file('profilePic')


        //Validation in two different ways

        //firt one

        // switch (true) {
        //     case name == null: return response.status(400).json("name is empty")
        //         break;
        //     case lastName == null: return response.status(400).json("lastName is empty")
        //         break;
        //     case email == null: return response.status(400).json("email is empty")
        //         break;
        //     case password == null: return response.status(400).json("password is empty")
        //         break;
        // }

        // const repetitive_email = await User.findBy('email', email)

        // if (repetitive_email) {
        //     return response.status(400).send('this email has been register brfore')
        // }


        //second one
        const validateSchema = schema.create({
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
            })
        })

        //upload files and validation
        let fileName: string | undefined
        if (profilePic) {
            await profilePic.moveToDisk('./profilePic')
            fileName = profilePic.fileName;
        }

        await request.validate({ schema: validateSchema })
        const hashedPassword = await Hash.make(password)
        await User.create({
            name,
            last_name: lastName,
            email,
            password:hashedPassword,
            profile_pic: fileName
        })
        response.status(201).json({ "message": "account has been created successfully" })

    }



    // edit account
    public async edit({ request, response }: HttpContextContract) {
        const { name, lastName, password, email, role = 0 } = request.body()
        const profilePic = request.file('profilePic')

        const validateSchema = schema.create({
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

        })
        await request.validate({ schema: validateSchema })
        const selectedAccount = await User.findBy('email', email)
        const hashedPassword = await Hash.make(password)


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
            name,
            last_name: lastName,
            email,
            password:hashedPassword,
            profile_pic: fileName,
            role,
        })
        response.status(201).json({ "message": "account info has been edited successfully" })

    }

    public async delete({ request, response }: HttpContextContract) {
        const { email } = request.body();
        const validateSchema = schema.create({
            email: schema.string([
                rules.email()
            ])
        })
        await request.validate({ schema: validateSchema })
        const findEmail = await User.findBy('email', email)
        if (!findEmail) return response.status(404).json({ "message": "user with this email doen't exsist" })
        await User.query().where('email', email).delete();
        response.status(201).json({ "message": "user has been deleted successfully" })

    }



}

