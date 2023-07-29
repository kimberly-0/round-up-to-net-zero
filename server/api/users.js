const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const usersRouter = express.Router();
module.exports = usersRouter;

usersRouter.param('userId', async (req, res, next, userId) => {
    await prisma.user.findUniqueOrThrow({ where: { id: userId } })
        .then(user => {
            req.user = user
            next()
            return
        })
        .catch(error => {
            console.log(error)
            return res.status(404).send("User not found")
        });
});

/*
Get -> Read operations:
*/

usersRouter.get('/', async (req, res, next) => {
    return await prisma.user.findMany({ 
        select: {
            id: true,
            name: true,
            email: true,
            password: false,
            company: {
                select: {
                    name: true,
                    registrationNumber: true,
                    industry: true,
                    numberOfEmployees: true,
                },
            },
        }
    }).then(users => {
        return res.status(200).json(users)
    }).catch(error => {
        console.log(error)
        return res.status(400).send("Users not found");
    });
});

usersRouter.get('/:userId', (req, res, next) => {
    res.status(200).send(req.user);
});

/*
Post -> Create operations:
*/

const validateUser = (req, res, next) => {
    const toCreateUser = req.body.user;
    if (!toCreateUser.name || !toCreateUser.email || !toCreateUser.password) {
        return res.status(400).send();
    }
    if (!toCreateUser.companyId) {
        req.body.companyId = null;
    }
    next();
};

usersRouter.post('/', validateUser, async (req, res, next) => {
    const newUser = req.body.user;
    return await prisma.user.create({
        data: {
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            companyId: newUser.companyId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            password: false,
            company: {
                select: {
                    id: true,
                    name: true,
                    registrationNumber: true,
                    industry: true,
                    numberOfEmployees: true,
                },
            },
        },
    }).then(user => {
        return res.status(201).send({
            ...user
        })
    }).catch(error => {
        console.log(error)
        return res.status(400).send("Unable to create user");
    });
});

/*
Put -> Update operations:
*/

usersRouter.put('/:userId', async (req, res, next) => {
    const newUser = req.body.user;    
    return await prisma.user.update({
        where: { id: req.user.id },
        data: {
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            companyId: newUser.companyId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            password: false,
            company: {
                select: {
                    id: true,
                    name: true,
                    registrationNumber: true,
                    industry: true,
                    numberOfEmployees: true,
                },
            },
        },
    }).then(user => {
        return res.status(201).send({
            ...user
        })
    }).catch(error => {
        console.log(error)
        return res.status(400).send("Unable to update user");
    });
});

/*
Delete -> Delete operations:
*/

usersRouter.delete('/:userId', async (req, res, next) => {
    return await prisma.user.delete({
        where: { id: req.user.id },
        select: { id: true },
    }).then(user => {
        return res.status(202).send(user)
    }).catch(error => {
        console.log(error)
        return res.status(400).send("Unable to delete user");
    })
});
