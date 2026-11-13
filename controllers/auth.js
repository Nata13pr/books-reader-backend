const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises")

const {User} = require("../models/user");

const {HttpError, ctrlWrapper} = require("../helpers");

const {SECRET_KEY} = process.env;


const nodemailer = require("nodemailer");
require('dotenv').config();

const {GMAIL_PASSWORD} = process.env;

const nodemailerConfig = {
    host: 'smtp.gmail.com',
    poкt: 465,
    secure: true,
    auth: {
        user: 'nata13pr@gmail.com',
        pass: GMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
}

const transport = nodemailer.createTransport(nodemailerConfig);
const email = {
    to: "ponem99624@jcaton.com",
    from: "nata13pr@gmail.com",
    subject: "Test email",
    html: "<p><strong>Test email</strong> from localhost:3000</p>"
}

transport.sendMail(email)
    .then(() => console.log("Email send success"))
    .catch(error => console.log(error.message));

const avatarsDir = path.join(__dirname, "../", "public", "avatars")

const register = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});

    if (user) {
        throw HttpError(409, "Email already in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);

    const newUser = await User.create({...req.body, password: hashPassword, avatarURL});

    res.status(201).json({
        email: newUser.email,
        name: newUser.name,
    })
}

const login = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        throw HttpError(401, "Email or password invalid");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, "Email or password invalid");
    }

    const payload = {
        id: user._id,
    }

    const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "23h"});
    await User.findByIdAndUpdate(user._id, {token});

    res.json({
        token,
    })
}

const getCurrent = async (req, res) => {
    const {email, name} = req.user;

    res.json({
        email,
        name,
    })
}

const logout = async (req, res) => {
    const {_id} = req.user;
    await User.findByIdAndUpdate(_id, {token: ""});

    res.json({
        message: "Logout success"
    })
}

const updateAvatar = async (req, res) => {
    const {_id} = req.user;
    const {path: tempUpload, originalname} = req.file;
    const filename = `${_id}_${originalname}`
    const resultUpload = path.join(avatarsDir, filename)
    await fs.rename(tempUpload, resultUpload)
    const avatarURL = path.join('avatars', filename)
    await User.findByIdAndUpdate(_id, {avatarURL})

    res.json({
        avatarURL
    })
}

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),
}