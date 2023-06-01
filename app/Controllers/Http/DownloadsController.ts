import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { env } from "process";

export default class DownloadsController {
    public async getProfilePic({ request, response }: HttpContextContract): Promise<void> {
        const fileName: string = request.params().params
        return response.attachment(env.PUBLIC_PIC_ADDRESS + fileName)
    }
    public async getTaskFiles({ request, response }: HttpContextContract): Promise<void> {
        const fileName: string = request.params().params
        return response.attachment(env.PUBLIC_FILE_ADDRESS + fileName)
    }
}
