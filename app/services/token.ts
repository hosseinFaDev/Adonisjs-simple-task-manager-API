import * as jsonwebtoken from 'jsonwebtoken'
import { decode } from 'jsonwebtoken'
import { env } from 'process'

const privateKey = env.APP_SECRET
export default class token {


    public sign(data) {
        return jsonwebtoken.sign(data, `${privateKey}`)
    }


    public decoded(data) {
        const token = data.split(' ')
        const pureToken = token[1]
        return decode(pureToken)
    }


    public verify(token) {
        try {
            const pureToken = token.split(' ')
            jsonwebtoken.verify(pureToken[1], `${privateKey}`)

            return true
        } catch {
            return false
        }
    }


}