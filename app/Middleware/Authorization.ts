import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import token from "App/services/token";

export default class Authorization {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void | HttpContextContract>) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    const authorizationToken: string | undefined = request.header('authorization')
    if (token.verify(authorizationToken as string)) {

      return await next()
    }

    return response.status(403).json({ "message": "set your authorization token please" })

  }
}
