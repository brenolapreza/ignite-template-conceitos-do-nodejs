const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(400).json({ error: "User not found!" })
  }

  request.user = user;

  return next()
}
app.post('/users', (request, response) => {
  const { username, user } = request.body

  const userExist = users.find(user => user.username === username)

  if (userExist) {
    return response.status(400).json({ error: "Username already exists" })
  }

  users.push({
    id: uuidv4(),
    user: user,
    username: username,
    todos: []
  })

  return response.status(201).json({ msg: "Usuário criado com sucesso!" })
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body

  const result = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(result)


  return response.status(201).json(result)


});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    response.status(401).json({ error: "Todo no exists" })
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(201).json({ msg: "Success a edit todo!" })


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const done = user.todos.find(todo => todo.id === id)

  if (!done) {
    response.status(401).json({ error: "User id no exists" })
  }

  done.done = true

  return response.status(201).json(done)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params

  const todo = user.todos.findIndex(todo => todo.id === id)

  if (todo === -1) {
    response.status(401).json({ error: "User id no exists" })
  }

  user.todos.splice(todo, 1)

  return response.status(201).json(todo)


});

module.exports = app;