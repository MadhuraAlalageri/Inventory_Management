const bcrypt = require('bcrypt');
const hash = '$2b$10$nAokD07YmpQRDdoycI1VVOvPI6n6PCM5TzwYMD7UpVLuz54Si0ryS';
const passwords = ['admin', 'admin123', 'admin@123', 'Admin@123', 'password', '123456', 'admin1@gmail.com', 'Admin123', 'admin1234', 'Admin'];

passwords.forEach(p => {
    if (bcrypt.compareSync(p, hash)) {
        console.log('Found:', p);
    }
});
