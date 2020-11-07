const bcrypt = require("bcrypt");

async function encrypt(plaintext) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plaintext, salt);
}

async function validate(plaintext, hash) {
    return await bcrypt.compare(plaintext, hash);
}

module.exports =  {
    encrypt, 
    validate,
}