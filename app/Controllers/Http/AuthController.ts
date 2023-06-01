import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import User from "App/Models/User"
import token from "App/services/token"
import { schema, rules } from '@ioc:Adonis/Core/Validator'
type AuthBodyContent = {
   name?: string,
   lastName?: string,
   email?: string,
   password?: string
}

export default class AuthController {
   public async register({ request, response }: HttpContextContract) {
      const body: AuthBodyContent = request.body()

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
      await request.validate({ schema: validateSchema })
      const hashedPassword: string = await Hash.make(body.password as string)

      await User.create({
         name: body.name,
         last_name: body.lastName,
         email: body.email,
         password: hashedPassword,
      })
      response.status(201).json({ "message": "your account has been created successfully" })

   }

   public async loggin({ request, response }: HttpContextContract) {
      const body: AuthBodyContent = request.body();
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
      await request.validate({ schema: validateSchema })
      const registerEmail: User | null = await User.findBy('email', body.email)
      const realPassword: string = registerEmail?.$attributes.password
      const isValidPassword: boolean = await Hash.verify(realPassword, body.password as string)
      if (!isValidPassword) {
         return response.status(401).json({ "message": "invalid password !!!" })
      }
      const tokenGenrator: token = new token;

      const generated: string = tokenGenrator.sign(body.email as string)


      if (generated) {
         return response.status(201).json({ "message": `this is your token ,please set it on your authorization header : bearer ${generated}` })
      }
      response.status(400).json({ "message": "sorry sometings went wrong" })
   }



}

