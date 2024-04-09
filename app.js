import express from 'express'
import bodyParser from 'body-parser'
import { scrypt, randomBytes, randomUUID } from 'node:crypto'

import { validatePassword, generateBearerToken, validateMiddleware } from './Servicios.js'

const app = express()
app.use(bodyParser.json());

const users = [{
	username: 'admin',
	name: 'Gustavo Alfredo Marín Sáez',
	password: '1b6ce880ac388eb7fcb6bcaf95e20083:341dfbbe86013c940c8e898b437aa82fe575876f2946a2ad744a0c51501c7dfe6d7e5a31c58d2adc7a7dc4b87927594275ca235276accc9f628697a4c00b4e01' // certamen123
}]

const todos = []

app.use(express.static('public'))

// Su código debe ir aquí...

// HOLA MUNDO - ENDPOINT
app.get('/api', (req, res) => {
	res.contentType('text/plain');
	return res.status(200).send('Hello World!');
})

// LOGIN - ENDPOINT
app.post('/api/login', async (req, res)  => {

    const userInput = req.body.username;
    const pwInput = req.body.password;

    if (userInput === undefined || userInput === "")
        return res.status(400).send("Ingrese un usuario válido");
    if (pwInput === undefined || pwInput === "") 
        return res.status(400).send("Ingrese una contraseña válida");

	//USUARIO EXISTE?
    const userIndex = users.findIndex((user) => user.username === userInput);
    if (userIndex === -1) {
        return res.status(401).send("Usuario o contraseña Incorrectos");
    }

    try {
        const isValidCredentials = await validatePassword(pwInput, users[userIndex].password);
        if (isValidCredentials == false) {
            return res.status(401).send("Usuario o contraseña Incorrectos");
        }

        const resp = { 
            username: users[userIndex].username, 
            name: users[userIndex].name,
            token: generateBearerToken(users[userIndex].username)
        };

		res.contentType('application/json');
        return res.status(200).send(resp);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Error interno del servidor");
    }
});

// LISTAR TODOS - ENDPOINT
app.get("/api/todos", validateMiddleware, (req, res)  =>  {
	
	let lista = []

	todos.forEach(element => {

		lista.push({
			id: element.id,
			title: element.title,
			completed: element.completed
		})
	});
	res.contentType('application/json');
	return res.status(200).send(lista);
})

// BUSCAR UN TODO - ENDPOINT
app.get("/api/todos/:id", validateMiddleware, (req, res) => {

	const id = req.params.id;

	// TODO EXISTE?
	const todoIndex = todos.findIndex((t) => t.id == id);
	if (todoIndex == -1) 
		return res.status(404).send("Item no existe");


	const respuesta = {
		id: todo[todoIndex].id,
		title: todo[todoIndex].title,
		completed: todo[todoIndex].completed
	}
	res.contentType('application/json');
	return res.status(200).send(respuesta);
})

// INSERTAR UN TODO - ENDPOINT
app.post("/api/todos", validateMiddleware, (req, res) => {
	
	try {
		const title = req.body.title;

		const todo = {
			id: randomUUID().toString(),
			title: title,
			completed: false
		}

		todos.push(todo);
		res.contentType('application/json');
		return res.status(201).send(todo);
	} catch (err) {
		return res.status(400);
	} 
})

// MODIFICAR UN TODO - ENDPOINT
app.put("/api/todos/:id", validateMiddleware, (req, res) => {

	const id = req.params.id;
	const title = req.body.title;
	const completed = req.body.completed;

	if (!typeof title === 'string')
		return res.status(400).send();
	if (!typeof completed === 'boolean')
		return res.status(400).send();
	
	try {

		const todoIndex = todos.findIndex((todo) => todo.id == id);
		if (todoIndex == -1)
			return res.status(404).send("El item a modificar no existe");
		

		let todoExist = todos[todoIndex];
		const todo = {
			id: id,
			title: title ? title : todoExist.title,
			completed: completed ? completed : todoExist.completed
		}
	
		todos[todoIndex] = todo;

		res.contentType('application/json');
		return res.status(200).send(todo);

	} catch (err) {
		return res.status(400).send();
	} 
})

// ELIMINAR UN TODO - ENDPOINT
app.delete("/api/todos/:id", validateMiddleware, (req, res) => {
	const id = req.params.id;

	try {
		const todosArray = todos;
		const todoIndex = todos.findIndex((todo) => todo.id == id);

		if (todoIndex == -1)
			return res.status(404).send("El item a eliminar no existe");

		todos.splice(todoIndex, 1);
		return res.status(204).send();

	} catch (err) {
		return res.status(404);
	} 
})


// ... hasta aquí

export default app