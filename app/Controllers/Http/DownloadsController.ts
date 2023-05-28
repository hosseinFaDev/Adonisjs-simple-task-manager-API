import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { env } from "process";

export default class DownloadsController {
    public async getProfilePic({ request, response }:HttpContextContract) {
        const fileName = request.params().params
        return response.attachment(env.PUBLIC_PIC_ADDRESS+ fileName)
    }
}
