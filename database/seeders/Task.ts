import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Task from 'App/Models/Task'

export default class extends BaseSeeder {
  public async run(): Promise<void> {
    // Write your database queries inside the run method
    await Task.create({
      name: 'how to run',
      content: 'first run users seed',
      priority: 1,
      user_id: 1,
    })
  }
}
