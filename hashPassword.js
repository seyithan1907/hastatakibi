const bcrypt = require('bcrypt');

const password = 'hsy190778'; // Admin şifresi
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Hata:', err);
        return;
    }
    console.log('Hashed password:', hash);
}); 