const mconnect = require('./db')
const express = require('express');
const cp = require('cookie-parser');
const cors = require('cors');
const dy = require('body-parser');
const app = express();
const Log = require('./models/Login');
const jwt = require('jsonwebtoken');
const cookiePar = require('cookie-parser')
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator');
// same as for mysql 




mconnect();


app.use(cp());
app.use(cors());
app.use(dy.json());
app.use(dy.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Home');
})



app.post('/login', [
    check('email_id', 'Email length should be 10 to 30 charactes').isLength({ min: 10, max: 30 }),
    check('email_id', 'Not a valid Email').isEmail(),
    check('password', 'password should not contain special charactes').isAlphanumeric(),
    check('password', 'password length should be 5 to 30 characters').isLength({ min: 5, max: 30 }),
], async (req, res) => {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            res.send(err.errors[0].msg);
        }
        else {
            const { password, email_id } = req.body;
            const user = await Log.findOne({ email_id });
            if (!user) {
                res.send("user does not exist");
            }
            else {
                const valid_password = await bcrypt.compare(password, user.hash_password);
                if (!valid_password) {
                    res.send("invalid credentials");
                }
                else {
                    const exp = Date.now() + 1000 * 24 * 60 * 60;
                    const tok = user.email_id;
                    const token = jwt.sign({ id: user.email_id }, "jwt-secret-key");
                    cookiePar.JSONCookies("token", token);
                    res.cookie("token", token, {
                        expires: new Date(exp),
                        secure: true,
                        httpOnly: true
                    });
                    return res.json({ Status: "Success", token: tok });
                }
            }
        }

    } catch (error) {
        return res.send({ Status: "Error" });
    }
});



app.post('/sign-in',[
    check('email_id', 'Email length should be 10 to 30 charactes').isEmail().isLength({ min: 10, max: 30 }),
    check('name', 'Name should not contain digits').isAlpha(),
    check('password', 'password  should not contain special charactes').isAlphanumeric(),
    check('password', 'password length should 5 t0 30 characters').isLength({ min: 5, max: 30 }),
], async (req, res) => {
    try {
        const { name, password, email_id } = req.body;
        const user = await Log.findOne({ email_id });
        if (user) {
            res.send("user already exist");
        }
        else {
            const salt = 5;
            const hashPassword = await bcrypt.hash(password, salt);
            const new_user = new Log({ name, email_id, hash_password: hashPassword, password: password });
            await new_user.save();
            return res.send({ Status: "Success" });
        }
    } catch (error) {
        return res.send({ Status: "Error" });
    }


});


app.listen(300, (req, res) => {
    // res.send('hello') ;
    console.log("app started");
})