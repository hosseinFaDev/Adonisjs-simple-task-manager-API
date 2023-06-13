import * as jsonwebtoken from 'jsonwebtoken'
import { decode } from 'jsonwebtoken'
import { env } from 'process'

const privateKey: string | undefined = env.APP_SECRET
export default class token {


    static sign(data: string): string {
        return jsonwebtoken.sign(data, `${privateKey}`)
    }


    static decoded(data: string): string | jsonwebtoken.JwtPayload | null {
        const token: string[] = data.split(' ')
        const pureToken: string = token[1]
        return decode(pureToken)
    }


    static verify(token: string): boolean {
        try {
            const pureToken: string[] = token.split(' ')
            jsonwebtoken.verify(pureToken[1], `${privateKey}`)

            return true
        } catch {
            return false
        }
    }


}