import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User"
import token from "App/services/token"
import { schema, rules } from '@ioc:Adonis/Core/Validator'


export default class AuthController {
   public async register({ request, response }: HttpContextContract) {
      const { name, lastName, email, password } = request.body()

      //validation for inputs data
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

      //validation for repetitive email
      const repetitive_email = await User.findBy('email', email)

      if (repetitive_email) {
         return response.status(400).json({ "message": "your email has been register brfore" })
      }

      await User.create({
         name,
         last_name: lastName,
         email,
         password,
      })
      response.status(201).json({ "message": "your account has been created successfully" })

   }

   public async loggin({ request, response }: HttpContextContract) {
      const { email, password } = request.body();
      const validateSchema = schema.create({
         password: schema.string([
            rules.minLength(6)
         ]),
         email: schema.string([
            rules.email(),
            rules.exists({
               table: 'users', column: 'email'
           })
         ]),

      })
      await request.validate({ schema: validateSchema })
      const registerEmail = await User.findBy('email', email)
      const realPassword = registerEmail?.$attributes.password
      if (!(password == realPassword)) {
         return response.status(401).json({ "message": "invalid password or empty in request body" })
      }
      const tokenGenrator = new token;

      const generated: string = tokenGenrator.sign(email)


      if (generated) {
         return response.status(201).json({ "message": `this is your token ,please set it on your authorization header : bearer ${generated}` })
      }
      response.status(400).json({ "message": "sorry sometings went wrong" })
   }



}

