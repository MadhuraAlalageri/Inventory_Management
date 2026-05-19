const bcrypt = require('bcrypt');
const hash = '$2b$10$nAokD07YmpQRDdoycI1VVOvPI6n6PCM5TzwYMD7UpVLuz54Si0ryS';
const password = 'admin'; // User might be trying 'admin' or 'admin123'

bcrypt.compare(password, hash).then(res => {
    console.log(`Match for 'admin': ${res}`);
});

bcrypt.compare('admin123', hash).then(res => {
    console.log(`Match for 'admin123': ${res}`);
});

bcrypt.compare('Admin@123', hash).then(res => {
    console.log(`Match for 'Admin@123': ${res}`);
});
