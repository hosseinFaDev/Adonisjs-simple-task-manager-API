// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User"
import token from "App/services/token"
import { schema, rules } from '@ioc:Adonis/Core/Validator'


export default class AuthController {
   public async register({ request, response }) {
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
         return response.status(400).send('your email has been register brfore')
      }

      await User.create({
         name,
         last_name: lastName,
         email,
         password,
      })
      response.status(201).send('your account has been created successfully')

   }

   public async loggin({ request, response }) {
      const { email, password } = request.body();
      const registerEmail = await User.findBy('email', email)
      const realPassword = registerEmail?.$attributes.password
      if (!(password == realPassword)) {
         return response.status(401).send('invalid password or empty in request body')
      }
      const tokenGenrator = new token;

      const generated = tokenGenrator.sign(email)

      if (!registerEmail) {
         ('your email has not been register brfore')
      }

      if (generated) {
         return response.status(201).send(`this is your token ,please set it on your authorization header : bearer ${generated}`)
      }
      response.status(400).send('sorry sometings went wrong')
   }



}

