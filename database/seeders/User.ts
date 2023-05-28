import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import { env } from 'process'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    await User.create(
      {
        name: 'admin',
        last_name: 'admin',
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        role: 1,
      })
  }
}
