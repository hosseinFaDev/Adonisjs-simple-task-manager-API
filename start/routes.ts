/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import { env } from 'process'

Route.get('/', async () => {
  return { 'hello,you neet to register with post requset and enter this informations in requestBody (name,lastName,email,password), please go to ===>':`${env.HOST}:${env.PORT}/register`}
})

//auth route
Route.post('/apt/v1/register','AuthController.register')
Route.post('/apt/v1/loggin','AuthController.loggin')

//admin route
Route.get('/apt/v1/admin/usersList','AdminsController.usersList').middleware('IsAdmin')
Route.post('/apt/v1/admin/create','AdminsController.create').middleware('IsAdmin')
Route.patch('/apt/v1/admin/edit','AdminsController.edit').middleware('IsAdmin')
Route.delete('/apt/v1/admin/delete','AdminsController.delete').middleware('IsAdmin')

//user route
Route.get('/apt/v1/users/tasks','TasksController.getTasks')
Route.post('/apt/v1/users/tasks/create','TasksController.createTasks')
Route.patch('/apt/v1/users/tasks/edit','TasksController.editTasks')
Route.delete('/apt/v1/users/tasks','TasksController.deleteTasks')

//download route
Route.get('/download/:params','DownloadsController.getProfilePic')