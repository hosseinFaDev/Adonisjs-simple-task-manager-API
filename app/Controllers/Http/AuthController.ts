import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import User from "App/Models/User"
import token from "App/services/token"
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class AuthController {
   public async register({ request, response }: HttpContextContract): Promise<void> {

      //validation for inputs data
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
            rules.unique({
               table: 'users', column: 'email'
            })
         ]),

      })
      const validatedData =  await request.validate({ schema: validateSchema })
      const hashedPassword: string = await Hash.make(validatedData.password)

      await User.create({
         name: validatedData.name,
         last_name: validatedData.lastName,
         email: validatedData.email,
         password: hashedPassword,
      })
      response.status(201).json({ "message": "your account has been created successfully" })

   }

   public async loggin({ request, response }: HttpContextContract): Promise<void> {
      const validateSchema: any = schema.create({
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
      const validatedData = await request.validate({ schema: validateSchema })
      const registerEmail: User | null = await User.findBy('email', validatedData.email)
      const realPassword: string = registerEmail?.$attributes.password
      const isValidPassword: boolean = await Hash.verify(realPassword, validatedData.password as string)
      if (!isValidPassword) {
         return response.status(401).json({ "message": "invalid password !!!" })
      }
      const tokenGenrator: token = new token;

      const generated: string = tokenGenrator.sign(validatedData.email as string)

      if (generated) {
         return response.status(201).json({ "message": `this is your token ,please set it on your authorization header : bearer ${generated}` })
      }
      response.status(400).json({ "message": "sorry sometings went wrong" })
   }

}

