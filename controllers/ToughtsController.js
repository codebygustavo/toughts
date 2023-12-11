const Tought = require('../models/Tought')
const User = require('../models/User')

const { Op } = require('sequelize')

module.exports = class ToughtController {
    static async showToughts(req, res) {

        let search = ""

        if (req.query.search) {
            search = req.query.search
        }

        let order = "DESC"

        if (req.query.order === 'old') {
            order = "ASC"
        } else {
            order = "DESC"
        }

        const toughtsData = await Tought.findAll({
            include: User,
            where: {
                title: { [Op.like]: `%${search}%` }
            },
            order: [['createdAt', order]]
        })

        const toughs = toughtsData.map((result) => result.get({ plain: true }));

        let toughsQty = toughs.length

        if (toughsQty === 0) {
            toughsQty = false
        }

        res.render('toughts/home', { toughs, search, toughsQty })
    }

    static async dashboard(req, res) {

        const userId = req.session.userid

        const user = await User.findOne({
            where: {
                id: userId,
            },
            include: Tought,
            plain: true,
        })

        // check if user exists
        if (!user) {
            res.redirect('/login')
        }

        const toughts = user.Toughts.map((result) => result.dataValues)

        let emptyToughts = false

        if (toughts.length === 0) {
            emptyToughts = true
        }

        res.render('toughts/dashboard', { toughts, emptyToughts })
    }

    static async createToughts(req, res) {
        res.render('toughts/create')
    }

    static async createToughtsSave(req, res) {

        const tought = {
            title: req.body.title,
            UserId: req.session.userid
        }

        console.log('id do usuario: ', tought.UserId)

        await Tought.create(tought)

        req.flash('message', 'Pensamento criado com sucesso!')

        try {
            req.session.save(() => {
                res.redirect('/toughts/dashboard')
            })
        } catch (error) {
            console.log(error)
        }
    }

    static async removeTought(req, res) {

        const id = req.body.id
        const UserId = req.session.userid

        await Tought.destroy({ where: { id: id, Userid: UserId } })

        req.flash('message', 'Pensamento removido com sucesso!')

        try {
            req.session.save(() => {
                res.redirect('/toughts/dashboard')
            })
        } catch (error) {
            console.log(error)
        }

    }

    static async updateToughts(req, res) {
        const id = req.params.id

        const tought = await Tought.findOne({ where: { id: id }, raw: true })

        res.render("toughts/edit", { tought })

    }

    static async updateToughtsSave(req, res) {

        const id = req.body.id

        const tough = {
            title: req.body.title
        }

        try {
            await Tought.update(tough, { where: { id: id } })
            req.flash('message', 'Pensamento atualizado')
            req.session.save(() => {
                res.redirect('/toughts/dashboard')
            })
        } catch (error) {
            console.log(error)
        }

    }
}