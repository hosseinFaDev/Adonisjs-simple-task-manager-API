import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import token from "App/services/token";
import { JwtPayload } from 'jsonwebtoken'
import {accessLevel} from 'App/Controllers/Http/AdminsController'


export default class IsAdmin {
  public async handle(
    { request, response }: HttpContextContract
    , next: () => Promise<void>): Promise<void | HttpContextContract> {

    const authorizationToken: string | undefined = request.header('authorization')
    if (!authorizationToken) return response.status(403).json({ "message": "access denied! enter your JWT token" })
    if (token.verify(authorizationToken)) {
      const decodedEmail: string | JwtPayload | null = token.decoded(authorizationToken)
      const userData: User | null = await User.findBy('email', decodedEmail)
      const userRole: number = userData?.role as number
      if (userRole == accessLevel.admin) {

        return await next()
      }

    }
    return response.status(403).json({ "message": "access denied!" })

  }
}
