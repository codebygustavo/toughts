const User = require('../models/User')

const bcript = require('bcryptjs')

module.exports = class AuthController {

    static login(req, res) {
        res.render('auth/login')
    }

    static async loginPost(req, res) {
        const { email, password } = req.body

        // find user
        const user = await User.findOne({ where: { email: email } })

        if (!user) {
            req.flash('message', 'Usuario não encontrado')
            res.render('auth/login')

            return
        }

        // check if password match
        const passwordMatch = bcript.compareSync(password, user.password)

        if (!passwordMatch) {
            req.flash('message', 'Senha incorreta')
            res.render('auth/login')

            return
        }

        try {
            const createduser = await User.create(user)

            // initialize session
            req.session.userid = createduser.id

            req.flash('message', 'Autentificação realizada com sucesso!')

            req.session.save(() => {
                res.redirect('/')
            })
        } catch (error) {
            console.log(error)
        }
    }

    static register(req, res) {
        res.render('auth/register')
    }

    static async registerPost(req, res) {
        const { name, email, password, confirmpassword } = req.body

        // password match validation
        if (password != confirmpassword) {
            // mensagem 
            req.flash('message', 'As senhas não conferem, tente novamente!')
            res.render('auth/register')

            return
        }

        // check if user exists
        const checkIfUserExists = await User.findOne({ where: { email: email } })

        if (checkIfUserExists) {
            // mensagem 
            req.flash('message', 'E-mail já está em uso')
            res.render('auth/register')

            return
        }

        // create a password
        const salt = bcript.genSaltSync(10)
        const hashendPassword = bcript.hashSync(password, salt)

        const user = {
            name,
            email,
            password: hashendPassword
        }

        try {
            const createduser = await User.create(user)

            // initialize session
            req.session.userid = createduser.id

            req.flash('message', 'Cadastro realizado com sucesso!')

            req.session.save(() => {
                res.redirect('/')
            })
        } catch (error) {
            console.log(error)
        }
    }

    static logout(req, res) {
        req.session.destroy()
        res.redirect('/login')
    }
}