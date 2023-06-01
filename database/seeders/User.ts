import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import { env } from 'process'
import Hash from '@ioc:Adonis/Core/Hash'

export default class extends BaseSeeder {
  public async run(): Promise<void> {
    // Write your database queries inside the run method
    const hashedPassword: string = await Hash.make(env.ADMIN_PASSWORD as string)

    await User.create(
      {
        name: 'admin',
        last_name: 'admin',
        email: env.ADMIN_EMAIL,
        password: hashedPassword,
        role: 1,
      })
  }
}
