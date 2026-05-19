const bcrypt = require('bcrypt');
const hash = '$2b$10$DH/FuI1iwYaLKFV3os8QSOekS9ikIcZHSK3EphTjkA/zM3mw9RGYq';
const passwords = ['123456', 'password', 'employee', 'employee123', 'armtronix'];

passwords.forEach(pw => {
    bcrypt.compare(pw, hash).then(res => {
        if (res) console.log(`MATCH FOUND: ${pw}`);
    });
});
