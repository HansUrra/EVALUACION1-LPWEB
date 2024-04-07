import express from 'express'
import bodyParser from 'body-parser'
import { scrypt, randomBytes, randomUUID } from 'node:crypto'

import { validarContraseña, generarBearerToken } from './Servicios.js'

const app = express()
app.use(bodyParser.json());

const users = [{
	username: 'admin',
	name: 'Gustavo Alfredo Marín Sáez',
	password: '1b6ce880ac388eb7fcb6bcaf95e20083:341dfbbe86013c940c8e898b437aa82fe575876f2946a2ad744a0c51501c7dfe6d7e5a31c58d2adc7a7dc4b87927594275ca235276accc9f628697a4c00b4e01' // certamen123
}]

let todos = []

app.use(express.static('public'))

// Su código debe ir aquí...

function validateMiddleware(req, res, next) {
    const authHeader = req.headers['x-authorization'];
    let user = "";

    if (authHeader && authHeader.trim() !== '') {
        try {
            // Convertir el string JSON a un objeto JSON
            const jsonObject = JSON.parse(authHeader);
            user = jsonObject.username;
        } catch (error) {
            console.error('Error al analizar el encabezado de autorización JSON:', error.message);
            return res.status(401).send();
        }
    } else {
        console.log('El encabezado de autorización está vacío o no está definido.');
        return res.status(401).send();
    }

    // Verificar si el usuario está en la lista de usuarios
    const userIndex = users.findIndex((u) => u.username == user)

    if (userIndex == -1) {
        console.log("error validacion")
        return res.status(401).send();
    } else {
        console.log("validado")
        next();
    }
}

app.get('/api', (req, res) => {
	res.contentType('text/plain');
	res.status(200).send('Hello World!');
})

//LOGIN 
app.post('/api/login', async (req, res)  => {
    res.contentType('application/json');

    const userInput = req.body.username;
    const pwInput = req.body.password;

    if (userInput === undefined || userInput === "")
        return res.status(400).send("Ingrese un usuario válido");
    if (pwInput === undefined || pwInput === "") 
        return res.status(400).send("Ingrese una contraseña válida");

    const indiceUsuario = users.findIndex((user) => user.username === userInput);

    if (indiceUsuario === -1) {
        return res.status(401).send("Usuario o contraseña Incorrectos");
    }

    try {
        const isValidCredentials = await validarContraseña(pwInput, users[indiceUsuario].password);
        if (isValidCredentials == false) {
            return res.status(401).send();
        }

        const resp = { 
            username: users[indiceUsuario].username, 
            name: users[indiceUsuario].name,
            token: generarBearerToken(users[indiceUsuario].username)
        };

        return res.status(200).send(resp);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Error interno del servidor");
    }
});


app.get("/api/todos", validateMiddleware, (req, res)  =>  {
	res.contentType('application/json');
	let lista = []

	todos.forEach(element => {

		lista.push({
			id: element.id,
			title: element.title,
			completed: element.completed
		})
	});

	res.status(200).send(lista);
})

app.get("/api/todos/:id", validateMiddleware, (req, res) => {
	res.contentType('application/json');

	const id = req.params.id;

	const todoIndex = todos.findIndex((t) => t.id == id);

	if (todoIndex == -1) {
		res.status(404).send("Item no existe");
	} else {
		const respuesta = {
			id: todo[todoIndex].id,
			title: todo[todoIndex].title,
			completed: todo[todoIndex].completed
		}
		res.status(200).send(respuesta);
	}
})


app.post("/api/todos", validateMiddleware, (req, res) => {
	res.contentType('application/json');
	
	try {
		const title = req.body.title;

		const todo = {
			id: randomUUID().toString(),
			title: title,
			completed: false
		}

		todos.push(todo);
	
		res.status(201).send(todo);
	} catch (err) {
		res.status(400);
	} 
})


app.put("/api/todos/:id", validateMiddleware, (req, res) => {
	res.contentType('application/json');

	const id = req.params.id;
	const title = req.body.title;
	const completed = req.body.completed;
	
	try {

		const todoIndex = todos.findIndex((todo) => todo.id == id);

		let todoExist = todos[todoIndex];

		const todo = {
			id: id,
			title: title ? title : todoExist.title,
			completed: completed ? completed : todoExist.completed
		}
	
		todos[todoIndex] = todo;

		res.status(200).send(todo);
	} catch (err) {
		res.status(400);
	} 
})


app.delete("/api/todos/:id", validateMiddleware, (req, res) => {
	const id = req.params.id;

	try {
		const todosArray = todos;
		const todoIndex = todos.findIndex((todo) => todo.id == id);

		todos.splice(todoIndex, 1);
		res.status(204).send();

	} catch (err) {
		res.status(404);
	} 
})


// ... hasta aquí

export default app