
# Adonisjs simple task manager API

**wellcome**

**MYSQL is this project database and use lucid ORM :**
  
**please set your database and other system configs in .env file**

**users can be created by two way : registration and by admin**

**don't forget add in header "authentication" and set your token "bearar +your genrated token" for have access**

  

**for start after clone project in your system and cd to directory run this commends in root project**

1. npm install package.json
2. node ace migration:run
3. node ace db:seed -i (select database/seeders/User)
4. node ace db:seed -i (now select database/seeders/Task)
5. node ace serve --watch


**end point's:**

**auth**

- for create a new User send a post request(needs to =>name,lastName ,email,profilePic,role) to : http://HOST/api/v1/register
- now for get your JWT token you neet to loggin by send a post request to: http://HOST/api/v1/loggin

**now set you JWT token in your authorization header**

- now you can create your task by send a post request(needs to => name,content,priority(low,medium,high),[taskFiles] in form-data body) to: http://localhost:3333/api/v1/users/tasks/create

- for edit your task you need to send a patch request(needs to =>name,content,priority(low,medium,high),[taskFiles] in form-data body) to http://localhost:3333/api/v1/users/tasks/edit

- for delete your task by send delete request(need to task id in form-data body ) to : http://localhost:3333/api/v1/users/tasks

- for see all your tasks send get request to : http://localhost:3333/api/v1/users/tasks

- for see tasks you can do this things mention in below:

- you can sort them by asc or desc send query parms =>?sort=desc or sort=asc

- you can search for specific task by set query parms => ?taskName=

**admin (need to JWT token and you should first do login with email and password to get that user and pass set in .env file)**

- now how can create new user by send a post request(needs to =>,email,name,lastName,password,profilePic,role(user,admin) in form-data body) to http://localhost:3333/api/v1/admin/create

- for edit your task you need to send a patch request(needs to =>,email,name,lastName,password,profilePic,role(user,admin) in form-data body) to: http://localhost:3333/api/v1/admin/edit

- for delete user by send delete request(need to email) in form-data body to : http://localhost:3333/api/v1/admin/delete
- for see all users send get request to : http://localhost:3333/api/v1/admin/usersList
- for see  all users you can do this things mention in below:

- you can sort them by asc or desc send query parms =>?sort=desc or sort=asc

- you can search for specific email by set query parms => ?searchByEmail=email@gmail.com

- you can download profile Picture when you click on profilePic links they like =>http://localhost:3333/download/picName.png

  
  
  

**this project is just for test and practice**