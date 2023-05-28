// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from "App/Models/User"
export default class AdminsController {

    public async usersList({ request, response }) {
        const queryString = request.qs()

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
        const sort = queryString.sort == "desc" || undefined ? "desc" as "desc" : "asc" as "asc"

        //pagination
        const page = queryString.page || 1
        const perPage = 3
        const allUsers = await User.query().where('id', '>', 0).orderBy('id', sort).paginate(page, perPage)

        //add dynamid path for download profilePic
        allUsers.map((user) => {
            const fileName = user.$attributes['profile_pic']
            user.$attributes['profile_pic'] = 'for download profile pic cilck here==>' + '/download/' + fileName
        })
        return response.status(200).send(allUsers)


    }

    //create new account
    public async create({ request, response }) {
        const { name, lastName, email, password } = request.body()

        //upload files and validation
        const profilePic = request.file('profilePic', {
            size: '2mb',
            extnames: ['jpg', 'png', 'gif'],
        })
        let fileName
        if (profilePic) {
            await profilePic.moveToDisk('./profilePic')
            fileName = profilePic.fileName;
        }
        if (!profilePic.isValid) {
            return profilePic.errors
        }

        //Validation in two different ways

        //firt one

        // switch (true) {
        //     case name == null: return response.status(400).send("name is empty")
        //         break;
        //     case lastName == null: return response.status(400).send("lastName is empty")
        //         break;
        //     case email == null: return response.status(400).send("email is empty")
        //         break;
        //     case password == null: return response.status(400).send("password is empty")
        //         break;
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
                rules.email()
            ]),


        })
        await request.validate({ schema: validateSchema })



        const repetitive_email = await User.findBy('email', email)

        if (repetitive_email) {
            return response.status(400).send('this email has been register brfore')
        }




        await User.create({
            name,
            last_name: lastName,
            email,
            password,
            profile_pic: fileName
        })
        response.status(201).send('account has been created successfully')

    }

    // edit account
    public async edit({ request, response }) {
        const { name, lastName, email, password, role = 0 } = request.body()
        const selectedAccount = await User.findBy('email', email)

        if (!selectedAccount) {
            return response.status(401).send('this email has not been found check your email please')
        }

        //upload files and validation
        const profilePic = request.file('profilePic', {
            size: '2mb',
            extnames: ['jpg', 'png', 'gif'],
        })
        let fileName
        if (profilePic) {
            await profilePic.moveToDisk('./profilePic')
            fileName = profilePic.fileName;
        }
        if (!profilePic.isValid) {
            return profilePic.errors
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
            password,
            profile_pic: fileName,
            role,
        })
        response.status(201).send('account info has been edited successfully')

    }

    public async delete({ request, response }) {
        const { email } = request.body();
        if (!email) return response.status(404).send('please enter your email in form-data')
        const findEmail = await User.findBy('email', email)
        if(!findEmail) return response.status(404).send('user with this email doen\'t exsist')
        await User.query().where('email', email).delete();
        response.status(201).send('user has been deleted successfully')

    }



}

