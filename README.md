# Adonisjs simple task manager API
**wellcome**
**MYSQL is this project database and lucid ORM :**

**please set your database and other system configs in  .env file**
**users can be created by two way by registration and by admin**
**don't forget add in header "authentication" and set your token "bearar +your genrated token" for have access**

**for start after clone project in your system run this commends in root project**

 1. npm install package.json
 2. node ace migration:run
 3. node ace db:seed -i       (database/seeders/User)
 4. node ace db:seed -i       (database/seeders/Task)

 
**end point's:**

**auth**
 - for create a new User send a post request(need :name,lastName ,email,[profilePic,role) to : http://HOST/api/v1/register
 - now for  get your JWT token you neet to loggin by send a post request to: http://HOST/api/v1/loggin

**now set you JWT token in your authorization header** 
 - now you can create your task by send a post request(need:name,content,priority,[taskFiles] in form-data body) to  http://localhost:3333/api/v1/users/tasks/create
 - for edit your task you need to send a patch request(need:name,content,priority,[taskFiles] in form-data body) to  http://localhost:3333/api/v1/users/tasks/edit
 - for see all your tasks send get request to  : http://localhost:3333/api/v1/users/tasks
 - for delete your task by send delete request(need to task id in form-data body ) to  : http://localhost:3333/api/v1/users/tasks

**admin (need to JWT token and so should first loggin with email and password to get that)**
 - now how can create new user by send a post request(need:name,content,priority,[taskFiles] in form-data body) to  http://localhost:3333/api/v1/admin/create
 - for edit your task you need to send a patch request(need:name,content,priority,[taskFiles] in form-data body) to  http://localhost:3333/api/v1/admin/edit
 - for delete user by send delete request(need to email in form-data body ) to  : http://localhost:3333/api/v1/admin/delete
 -  for see all your tasks send get request to  : http://localhost:3333/api/v1/users/tasks
 - for last one (see users) you can do this things mention in below:
 - you can pagination by send query parms => /?page=
 - you can sort them by asc or desc send query parms =>?sort=desc or sort=asc
 - you can search for specific email by set query parms => ?searchByEmail=email@gmail.com
 - you can download profile Picture when you click on profilePic links they like =>http://localhost:3333/download/picName.png



 
**this project is just for test and practice**
