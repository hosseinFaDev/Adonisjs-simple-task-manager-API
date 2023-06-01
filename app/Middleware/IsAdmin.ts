import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import token from "App/services/token";
import { JwtPayload } from 'jsonwebtoken'
const checkToken: token = new token;

enum role {
  user,
  admin
}

export default class IsAdmin {
  public async handle(
    { request, response }: HttpContextContract
    , next: () => Promise<void>) {

    const authorizationToken: string | undefined = request.header('authorization')
    if (!authorizationToken) return response.status(403).json({ "message": "access denied! enter your JWT token" })
    if (checkToken.verify(authorizationToken)) {
      const decodedEmail: string | JwtPayload | null = checkToken.decoded(authorizationToken)
      const userData: User | null = await User.findBy('email', decodedEmail)
      const userRole: number = userData?.$attributes.role
      if (userRole == role.admin) {

        return await next()
      }

    }
    return response.status(403).json({ "message": "access denied!" })

  }
}
