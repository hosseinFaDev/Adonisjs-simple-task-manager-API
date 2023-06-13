import { JwtPayload } from 'jsonwebtoken'
import User from "App/Models/User";
import token from "App/services/token";

export async function extractUserId(authorizationToken: string): Promise<number> {
    // const authorizationToken: string | undefined = request.header('authorization')
    const decodedEmail: string | JwtPayload | null = token.decoded(authorizationToken as string)
    const userData: User | null = await User.findBy('email', decodedEmail)
    const userid: number = userData?.id as number
    return userid
}