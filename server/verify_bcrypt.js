const bcrypt = require('bcrypt');
const password = 'admin123';
bcrypt.hash(password, 10).then(hash => {
    console.log(`Generated Hash for 'admin123': ${hash}`);
    bcrypt.compare(password, hash).then(res => {
        console.log(`Comparison result: ${res}`);
    });
});
