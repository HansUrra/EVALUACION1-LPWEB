import { scrypt, randomBytes, randomUUID } from 'node:crypto'

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

    // Generar una cadena aleatoria para el token
    const token = randomBytes(32).toString('hex');

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

    // Convertir los bytes en una cadena hexadecimal
    const tokenHex = token.toString('hex');

    // Concatenar la cadena JSON con la cadena hexadecimal
    const tokenCompleto = JSON.stringify(tokenData);

    

    return tokenCompleto;
}