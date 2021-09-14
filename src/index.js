const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find( user => user.username === username);

  if(!user){
    return response.status(404).json({error: "This user doesn't exists!"});
  }

  request.user = user;

  next()
}

function checkTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const foundTodo = user.todos.find( todo => todo.id === id );
  
  if(!foundTodo){
    return response.status(404).json({error: "Todo not found!"});
  }

  request.todo = foundTodo;
  
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const userAlreadyExists = users.some(
    users => users.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({ error: "user already exits!" })
  };

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);
  
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkTodo, (request, response) => {
  const { todo } = request;
  const { title, deadline} = request.body;

  todo.title = title;
  todo.deadline = deadline;

  return response.send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkTodo, (request, response) => {
  const { todo } = request;
  const { user } = request;

  user.todos.splice(user.todos.indexOf(todo),1);

  return response.status(204).send();

});

module.exports = app;