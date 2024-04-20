import express from 'express'
import { scrypt, randomBytes, randomUUID } from 'node:crypto'

import { validatePassword, generateBearerToken, validateMiddleware } from './Servicios.js'

const app = express()
app.use(express.json());

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

	const { username, password } = req.body;

    if (username === undefined || username === "" || typeof username !== "string")
        return res.status(400).send("Ingrese un usuario válido");
    if (password === undefined || password === "" || typeof password !== "string") 
        return res.status(400).send("Ingrese una contraseña válida");

	//USUARIO EXISTE?
    const user = users.find((user) => user.username === username);
    if (user === null) {
        return res.status(401).send("Usuario o contraseña Incorrectos");
    }

    try {
        const isValidCredentials = await validatePassword(password, user.password);
        if (isValidCredentials == false) {
            return res.status(401).send("Usuario o contraseña Incorrectos");
        }

        res.send({ 
            username: user.username, 
            name: user.name,
            token: generateBearerToken(user.username)
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Error interno del servidor");
    }
});

// LISTAR TODOS - ENDPOINT
app.get("/api/todos", validateMiddleware, (req, res)  =>  {
	res.contentType('application/json');
	return res.status(200).send(todos);
})

// BUSCAR UN TODO - ENDPOINT
app.get("/api/todos/:id", validateMiddleware, (req, res) => {

	const id = req.params.id;

	// TODO EXISTE?
	const todo = todos.find((t) => t.id == id);
	if (todo == null) 
		return res.status(404).send("Item no se encuentra");

	return res.send(todo);
})

// INSERTAR UN TODO - ENDPOINT
app.post("/api/todos", validateMiddleware, (req, res) => {
	const { title } = req.body;

	try {

		if (typeof title !== "string")
			return res.status(400).send("Titulo no valido");

		const todo = {
			id: randomUUID().toString(),
			title: title,
			completed: false
		}

		todos.push(todo);
		return res.status(201).send(todo);
	} catch (err) {
		return res.status(400).send(err);
	} 
})

// MODIFICAR UN TODO - ENDPOINT
app.put("/api/todos/:id", validateMiddleware, (req, res) => {

	const id = req.params.id;
	const { title, completed } = req.body;

	if (!typeof title === 'string')
		return res.status(400).send("entrada no valida");
	if (!typeof completed === 'boolean')
		return res.status(400).send("entrada no valida");
	
	try {

		const todoFind = todos.find((todo) => todo.id == id);
		if (todoFind == null)
			return res.status(404).send("El item a modificar no existe");

			console.log("title:" + title + " completed: " + completed)
		if (title !== undefined)
			todoFind.title = title;
		if (completed !== undefined)
			todoFind.completed = completed

		return res.status(200).send(todoFind);

	} catch (err) {
		return res.status(400).send();
	} 
})

// ELIMINAR UN TODO - ENDPOINT
app.delete("/api/todos/:id", validateMiddleware, (req, res) => {
	try {
		const todoIndex = todos.findIndex((todo) => todo.id == req.params.id);

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