const express = require('express');
const route = express.Router();
const user = require('../controller/user')
const auth = require('../auth/auth')

route.route('/user')
    .post(user.createUser)
    .get( user.readUser)
    .put( user.updateUser)
    .delete( user.deleteUser)

route.route('/test')
    .get((req, res) => {
        console.log(req.query)
        res.send("확인")
    })
    .post((req, res) => {
        console.log(req.body)
        res.send("POST 방식")
    })
route.route('/test/:id')
    .get((req, res) => {
        // 데이터를 업데이트 하거나 , 삭제할떄 이렇게 사용한다.
        console.log(req)

        res.send("확인2")
    })
module.exports = route;

// Creat = Post = 회원가입 
// Read = Get = 로그인
// Update = Put = 회원정보수정
// Delete = Delete = 탈퇴