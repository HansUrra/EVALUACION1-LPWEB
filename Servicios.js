import { scrypt, randomBytes, randomUUID, createCipheriv } from 'node:crypto'

export async function validarContraseña(contraseña, hashAlmacenado) {
    const [salt, hashGuardado] = hashAlmacenado.split(':');
    const hashRecreado = await generarHash(contraseña, salt);
    console.log(hashRecreado)
    console.log(hashGuardado)
    return hashRecreado === hashGuardado;
}

async function generarHash(contraseña, salt) {
    return new Promise((resolve, reject) => {
        scrypt(contraseña, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(derivedKey.toString('hex'));
        });
    });
}

export function generarBearerToken(username) {

    const fechaActual = new Date();
    // Combinar los datos custom y el token en un objeto
    const tokenData = {
        username: username,
        creation: fechaActual.getDate().toString().padStart(2, '0') + "/" + 
            (fechaActual.getMonth() + 1).toString().padStart(2, '0') + "/" + 
            fechaActual.getFullYear() +
            " " + fechaActual.getHours().toString().padStart(2, '0') +
            ":" + fechaActual.getMinutes().toString().padStart(2, '0')+
            ":" + fechaActual.getSeconds().toString().padStart(2, '0'),

        expiration: fechaActual.getDate().toString().padStart(2, '0') + "/" + 
            (fechaActual.getMonth() + 1).toString().padStart(2, '0') + "/" + 
            fechaActual.getFullYear() +
            " " + (fechaActual.getHours() + 3) .toString().padStart(2, '0') +
            ":" + fechaActual.getMinutes().toString().padStart(2, '0')+
            ":" + fechaActual.getSeconds().toString().padStart(2, '0')
    };

    const iv = randomBytes(12);
    // Crear un cifrador usando el algoritmo AES
    const clave = Buffer.from("keykeykeykeykeykeykeykey", 'utf-8');
    const cifrador = createCipheriv('aes-192-ccm', clave, iv, {authTagLength: 16});

    // Cifrar la cadena JSON
    let tokenCifrado = cifrador.update(JSON.stringify(tokenData), 'utf-8', 'hex');

    console.log("token: " + tokenCifrado)
    return tokenCifrado;
}

export function validateMiddleware(req, res, next, users) {
    console.log("validando con middleware")
    const authHeader = req.headers['x-authorization'];

    let user = "";
    if (authHeader && authHeader.trim() !== '') {
        try {
            // Convertir el string JSON a un objeto JSON
            const jsonObject = authHeader;
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