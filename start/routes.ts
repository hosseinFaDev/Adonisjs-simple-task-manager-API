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
  return { 'hello,you neet to register with post requset and enter this informations in requestBody (name,lastName,email,password), please go to ===>': `${env.HOST}:${env.PORT}/register` }
})


Route.group(() => {

  //auth route
  Route.post('/register', 'AuthController.register')
  Route.post('/loggin', 'AuthController.loggin')

  //admin route
  
  Route.get('/admin/usersList', 'AdminsController.usersList').middleware('IsAdmin')
  Route.post('/admin/create', 'AdminsController.create').middleware('IsAdmin')
  Route.patch('/admin/edit', 'AdminsController.edit').middleware('IsAdmin')
  Route.delete('/admin/delete', 'AdminsController.delete').middleware('IsAdmin')

  //user route
  Route.get('/users/tasks', 'TasksController.getTasks')
  Route.post('/users/tasks/create', 'TasksController.createTasks')
  Route.patch('/users/tasks/edit', 'TasksController.editTasks')
  Route.delete('/users/tasks', 'TasksController.deleteTasks')

}).prefix('/apt/v1')

//download route
Route.get('/download/:params', 'DownloadsController.getProfilePic')