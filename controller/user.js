
var User = require('../index')
var mysql = require('mysql');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'gustp1107!',
    database: 'babynote'
});
connection.connect();


exports.createUser = function (req, res) {
    // 생성되는 코드 디비로 입력 부분
    var today = new Date();
    const password = req.body.password;
    const hash = crypto.createHash('sha256')
    hash.update(password)
    let hash_password = hash.digest('hex');
    var users = {
        "id": req.body.id,
        "password": hash_password,
        "name": req.body.name,
        "phonenumber": req.body.phonenumber,
        "email": req.body.email,
        "state": req.body.state,
        "nickname": req.body.nickname,
        "created_at": today

    }
    connection.query('INSERT INTO users SET ?', users, function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred",
                "users": users
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "user registered successfully",
                "users": users
            })
        }
    })


}

// exports.readUser = function (req, res) {
//     // 확인되는 코드
//     let id = req.body.userName;
//     let password = req.body.password;
//     var sql = 'SELECT * FROM users';
//     console.log("유저 확인작업.")

//     connection.query('SELECT * FROM users WHERE id = ?',[id],function (err, rows, fields) {
//         if (err) {
//             console.log(err);
//             console.log("실패1")
//             res.send("유저확인 실패1")
//         } else {
//             for (var i = 0; i < rows.length; i++) {
//                 console.log(rows[i].id);
//                 res.send("유저가 확인되었습니다.")
//             }

//         }
//     });
//     console.log("유저 확인 실패2")
//     res.send("유저확인 실패2")

// }
exports.readUser = function (req, res) {
    var id = req.body.id,
        password = req.body.password;
    const hash = crypto.createHash('sha256')
    hash.update(password)
    let hash_password = hash.digest('hex');
    var sql = 'SELECT * FROM users WHERE id = ?';
    connection.query(sql, [id],
        function (err, results) {
            if (err) {
                // console.log("error ocurred", error);
                res.send({
                    "code": 400,
                    "failed": "error ocurred",
                    "id": id,
                    "password": password,
                    "hash_password": hash_password

                })
            } else {
                // console.log('The solution is: ', results);
                if (results.length > 0) {
                    if (results[0].password == hash_password) {

                        res.send({
                            "code": 200,
                            "success": "login sucessfull",
                            "id": id,
                            "password": password,
                            "hash_password": hash_password
                        });
                    } else {

                        res.send({
                            "code": 204,
                            "success": "id and password does not match",
                            "id": id,
                            "password": password,
                            "hash_password": hash_password
                        });
                    }
                } else {

                    res.send({
                        "code": 204,
                        "success": "id does not exists",
                        "id": id,
                        "password": password,
                        "hash_password": hash_password
                    });
                }
            }
        })
}
exports.updateUser = function (req, res) {
    // 수정되는 코드
    res.send("유저가 수정되었습니다.")
}

exports.deleteUser = function (req, res) {
    // 삭제되는 코드
    res.send("유저가 삭제되었습니다.")
}