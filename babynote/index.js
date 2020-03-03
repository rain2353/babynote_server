
var crypto = require('crypto');
var uuid = require('uuid');
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var multer = require('multer');
var newDate = require('date-utils');
//Connect to MySQL
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'gustp1107!',
    database: 'babynote'
});

//PASSWORD ULTIL
var genRandomString = function (length) {
    return crypto.randomBytes(Math.ceil(length / 2) )
        .toString('hex') /* convert to hexa format */
        .slice(0, length); /* return required number of characters */
};

var sha512 = function (password, salt) {
    var hash = crypto.createHmac('sha512', salt); // Use SHA512
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

function saltHashPassword(userPassword) {
    var salt = genRandomString(16); // Gen random string with 16 character to salt
    var passwordData = sha512(userPassword, salt);
    return passwordData;
}

function checkHashPassword(userPassword, salt) {
    var passwordData = sha512(userPassword, salt);
    return passwordData;
}


var app = express();
app.use(bodyParser.json()); // Accept JSON Params
app.use(bodyParser.urlencoded({ extended: true })); // Accept URL Encoded params

// Start Server
/*
app.get('/', function (req, res) {
   res.send("Hello, World!!!!!")
   })
   */
// ----------------------------------------------------------회원가입------------------------------------------------------------------
app.post('/register/', (req, res, next) => {
    var post_data = req.body; // Get POST params

    var uid = uuid.v4(); // Get UUID v4 like '110abacsasas-af0x-90333-casasjkajksk
    var plaint_password = post_data.password; // Get password from post params
    var hash_data = saltHashPassword(plaint_password);
    var password = hash_data.passwordHash; // Get hash value
    var salt = hash_data.salt; // Get salt
    var today = new Date();
    var id = post_data.id;
    var name = post_data.name;
    var email = post_data.email;
    var phonenumber = post_data.phonenumber;
    var state = post_data.state;
    var nickname = post_data.nickname;
    var user = {
        "unique_id": uid,
        "id": id,
        "name": name,
        "phone_number": phonenumber,
        "email": email,
        "encrypted_password": password,
        "state": state,
        "nickname": nickname,
        "salt": salt,
        "created_at": today,
        "updated_at": today
    }
    con.query('SELECT * FROM user where id=?', [id], function (err, result, fields) {

        con.on('error', function (err) {
            console.log('[MySQL ERROR]', err);
        });

        if (result && result.length)
            res.json('User already exists!!! , 유저가 존재합니다.');
        else {
            con.query('INSERT INTO user SET ?', user, function (error, result, fields) {
                if (error) {
                    console.log("error ocurred", error);
                    res.send({
                        "code": 400,
                        "failed": "error ocurred",
                        "users": user
                    })
                } else {
                    console.log('The solution is: ', result);
                    res.send({
                        "code": 200,
                        "success": "user registered successfully , 유저 회원가입 성공하였습니다.",
                        "users": user
                    })
                }
            })
        }
    });

})
// ----------------------------------------------------------회원가입------------------------------------------------------------------
// ----------------------------------------------------------로그인------------------------------------------------------------------
app.post('/login/', (req, res, next) => {
    var post_data = req.body;

    //Extract email and password from request
    var user_password = post_data.password;
    var id = post_data.id;


    con.query('SELECT * FROM user where id=?', [id], function (err, result, fields) {

        con.on('error', function (err) {
            console.log('[MySQL ERROR]', err);
        });

        if (result && result.length) {
            var salt = result[0].salt; // Get salt of result if account exists
            var encrypted_password = result[0].encrypted_password;
            //Hash password from Login request with salt in Database
            var hashed_password = checkHashPassword(user_password, salt).passwordHash;
            if (encrypted_password == hashed_password)

                res.end("로그인 성공" + JSON.stringify(result[0])) // If password is true , return all info of user
            else
                res.end(JSON.stringify('Wrong password !! , 잘못된 비밀번호 입니다. '));
        }
        else {
            res.json('User not exists!!! , 유저가 존재하지 않습니다.')
        }
    });

})
// ----------------------------------------------------------로그인------------------------------------------------------------------
// ----------------------------------------------------------아이디 찾기------------------------------------------------------------------
app.post('/find_id/', (req, res, next) => {
    var post_data = req.body;

    //Extract email and password from request
    var user_name = post_data.name;
    var user_phonenumber = post_data.phonenumber;


    con.query('SELECT * FROM user where name=?', [user_name], function (err, result, fields) {

        con.on('error', function (err) {
            console.log('[MySQL ERROR]', err);
        });

        if (result && result.length) {
            var phone_number = result[0].phone_number;
            
            if (phone_number == user_phonenumber)

                res.end(JSON.stringify(result[0])) // If password is true , return all info of user
            else
                res.end(JSON.stringify('Wrong phonenumber !! , 잘못된 휴대폰 번호 입니다. '));
        }
        else {
            res.json('User not exists!!! , 유저가 존재하지 않습니다.')
        }
    });

})
// ----------------------------------------------------------아이디 찾기------------------------------------------------------------------
// ----------------------------------------------------------비밀번호 찾기------------------------------------------------------------------
app.post('/find_password/', (req, res, next) => {
    var post_data = req.body;

    //Extract email and password from request
    var user_id = post_data.id;
    var user_name = post_data.name;
    var user_phonenumber = post_data.phonenumber;


    con.query('SELECT * FROM user where id=?', [user_id], function (err, result, fields) {

        con.on('error', function (err) {
            console.log('[MySQL ERROR]', err);
        });

        if (result && result.length) {
            var name = result[0].name;
            var phone_number = result[0].phone_number;
            
            if (name == user_name) {
                if (phone_number == user_phonenumber){
                   
                       res.end(JSON.stringify(result[0]))

                //res.end(JSON.stringify(result[0])) // If password is true , return all info of user
                }else{
                res.end(JSON.stringify('Wrong phonenumber !! , 잘못된 휴대폰 번호 입니다. '));
                }
            }else{
                res.end(JSON.stringify('Wrong name !! , 잘못된 이름 입니다. '));
            }
            
        }
        else {
            res.json('User not exists!!! , 유저가 존재하지 않습니다.')
        }
    });

})
// ----------------------------------------------------------비밀번호 찾기------------------------------------------------------------------
// ----------------------------------------------------------비밀번호 변경------------------------------------------------------------------
app.post('/change_password/', (req, res, next) => {
    var post_data = req.body;

    //Extract email and password from request
    var user_id = post_data.id;
    // var uid = uuid.v4(); // Get UUID v4 like '110abacsasas-af0x-90333-casasjkajksk
    var plaint_password = post_data.password; // Get password from post params
    var hash_data = saltHashPassword(plaint_password);
    var password = hash_data.passwordHash; // Get hash value
    var salt = hash_data.salt; // Get salt
    

    con.query('SELECT * FROM user where id=?', [user_id], function (err, result, fields) {

        con.on('error', function (err) {
            console.log('[MySQL ERROR]', err);
        });

        if (result && result.length) {
            var user = {
                "unique_id": result[0].unique_id,
                "id": result[0].id,
                "name": result[0].name,
                "phone_number": result[0].phone_number,
                "email": result[0].email,
                "encrypted_password": password,
                "state": result[0].state,
                "nickname": result[0].nickname,
                "salt": salt,
                "created_at": result[0].created_at,
                "updated_at": result[0].updated_at,
                "id": result[0].id
            }
            var sql = 'UPDATE user SET unique_id=?,id=?,name=?,phone_number=?,email=?,encrypted_password=?,state=?,nickname=?,salt=?,created_at=?,updated_at=? WHERE id=?';
            con.query(sql,[result[0].unique_id,result[0].id,result[0].name,result[0].phone_number,result[0].email,password,result[0].state,result[0].nickname,salt,result[0].created_at,result[0].updated_at,result[0].id] , function (err, result, fields) {
            if (err) {
                console.log(err);
                res.status(500).send('Internal Server Error,비밀번호 변경에 실패하였습니다.');
            } else {
                res.end(JSON.stringify('비밀번호 변경이 완료되었습니다.'));
        }
    });    
        }  
    });
})
// ----------------------------------------------------------비밀번호 변경------------------------------------------------------------------

// ----------------------------------------------------------내정보 이름,이메일,휴대전화번호,호칭 변경------------------------------------------------------------------
app.post('/modify_myInfo/', (req, res, next) => {
    var post_data = req.body;
    var num = post_data.num;
    var unique_id = post_data.unique_id;
    var id = post_data.id;
    var name = post_data.name;
    var phone_number = post_data.phone_number;
    var email = post_data.email;
    var encrypted_password = post_data.encrypted_password;
    var state = post_data.state;
    var nickname = post_data.nickname;
    var salt = post_data.salt;
    var created_at = post_data.created_at;
    var updated_at = post_data.updated_at;

    var sql = 'UPDATE user SET unique_id=?,id=?,name=?,phone_number=?,email=?,encrypted_password=?,state=?,nickname=?,salt=?,created_at=?,updated_at=? WHERE num=?';
    con.query(sql,[unique_id,id,name,phone_number,email,encrypted_password,state,nickname,salt,created_at,updated_at,num] , function (err, result, fields) {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error,이름 변경에 실패하였습니다.');
        } else {
            res.end(JSON.stringify('이름 변경이 완료되었습니다.'));
        }
    });    
});

// ----------------------------------------------------------내정보 이름,이메일,휴대전화번호,호칭 변경------------------------------------------------------------------

// ----------------------------------------------------------회원 탈퇴하기------------------------------------------------------------------
app.post('/membership_withdrawal/',(req,res,next) => {

    var num = req.body.num;
    var id = req.body.id;
   
     
     var sql = 'DELETE FROM user where num=? AND id=?';
     con.query(sql,[num,id], function (error, result, fields) {
         if (error) {
             console.log("error ocurred", error);
             res.send({
                 "code": 400,
                 "failed": "error ocurred"
             })
         } else {
             console.log('The solution is: ', result);
             res.send({
                 "code": 200,
                 "success": "회원을 탈퇴하였습니다.",
             })
             
         }
     })
 }); 
 // ----------------------------------------------------------회원 탈퇴하기------------------------------------------------------------------
var path = require('path');
var upload = multer({ 
    storage : multer.diskStorage({
        destination : function(req,file,cb) {
            cb(null,'uploads/');
        },
        filename : function (req,file,cb) {
            cb (null , new Date().valueOf() + path.extname(file.originalname));
        }
    })
 });
// ----------------------------------------------------------애기 등록------------------------------------------------------------------
app.post('/add_baby/',upload.single("file"),(req,res,next) => {

    let file = req.file
    let babyname = req.body.babyname;
    let babybirth = req.body.babybirth;
    let babygender = req.body.babygender;
    let baby_kindergarten = req.body.baby_kindergarten;
    let baby_class = req.body.baby_class;
    let parents_id = req.body.parents_id;
    let state = req.body.state;
    let result = {
        originalName : file.filename,
        size : file.size
    }
    // res.json(req.file);
     console.log(req.file);
    // console.log(req.file.path);
    // console.log(babyname);
    // console.log(babybirth);
    // console.log(babygender);
    // console.log(baby_kindergarten);
    // console.log(baby_class);
    // console.log(parents_id);
    var baby = {
        "baby_name": babyname,
        "baby_birth": babybirth,
        "baby_gender": babygender,
        "baby_kindergarten": baby_kindergarten,
        "baby_class": baby_class,
        "baby_imagepath": req.file.filename,
        "parents_id": parents_id
    }
    var sql = 'INSERT INTO add_baby (baby_name, baby_birth, baby_gender, baby_kindergarten, baby_class, baby_imagepath, parents_id, state) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
    con.query(sql,[babyname,babybirth,babygender,baby_kindergarten,baby_class,"http://10.0.2.2:3000/"+ req.file.filename,parents_id,state], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "자녀 추가에 성공하였습니다.",
            })
            console.log("add_baby",baby);
        }
    })
});
// ----------------------------------------------------------애기 등록------------------------------------------------------------------

// ----------------------------------------------------------수정할 아이 정보------------------------------------------------------------------
app.post('/select_baby/', (req,res,next) => {  
    var post_data = req.body; // Get POST BODY
    var num = post_data.num;  // GET field 'num' from post data

   
    con.query('SELECT * FROM add_baby where num=?', [num], function (err, result, fields) {

        con.on('error', function (err) {
            console.log('[MySQL ERROR]', err);
        });

        if (result && result.length) {

                res.end(JSON.stringify(result[0])) // If password is true , return all info of user
            
        }
    });
});
// ----------------------------------------------------------수정할 아이 정보------------------------------------------------------------------

// ----------------------------------------------------------아기 이름, 생일, 성별 , 유치원, 반이름 변경------------------------------------------------------------------
app.post('/modify_baby/', (req, res, next) => {
    var post_data = req.body;
    var num = post_data.num;
    let babyname = post_data.babyname;
    let babybirth = post_data.babybirth;
    let babygender = post_data.babygender;
    let baby_kindergarten = post_data.baby_kindergarten;
    let baby_class = post_data.baby_class;
    let baby_imagepath = post_data.baby_imagepath;
    let parents_id = post_data.parents_id;
    let state = post_data.state;

    var sql = 'UPDATE add_baby SET baby_name=?,baby_birth=?,baby_gender=?,baby_kindergarten=?,baby_class=?,baby_imagepath=?,parents_id=?,state=? WHERE num=? ';
    con.query(sql,[babyname,babybirth,babygender,baby_kindergarten,baby_class,baby_imagepath,parents_id,state,num] , function (err, result, fields) {
        if (err) {
            console.log(err);
            res.status(500).send('아이 정보수정에 실패하였습니다.');
        } else {
            res.end(JSON.stringify('아이 정보수정이 완료되었습니다.'));
        }
    });    
});

// ----------------------------------------------------------아기 이름, 생일, 성별 변경------------------------------------------------------------------

// ----------------------------------------------------------아기 프로필 사진 변경------------------------------------------------------------------
app.post('/modify_baby_image/',upload.single("file"),(req, res, next) => {
    let file = req.file
    var post_data = req.body;
    var num = post_data.num;
    let babyname = post_data.babyname;
    let babybirth = post_data.babybirth;
    let babygender = post_data.babygender;
    let baby_kindergarten = post_data.baby_kindergarten;
    let baby_class = post_data.baby_class;
    let parents_id = post_data.parents_id;
    let state = post_data.state;

    var sql = 'UPDATE add_baby SET baby_name=?,baby_birth=?,baby_gender=?,baby_kindergarten=?,baby_class=?,baby_imagepath=?,parents_id=?,state=? WHERE num=? ';
    con.query(sql,[babyname,babybirth,babygender,baby_kindergarten,baby_class,"http://10.0.2.2:3000/"+ req.file.filename,parents_id,state,num] , function (err, result, fields) {
        if (err) {
            console.log(err);
            res.status(500).send('사진 변경에 실패하였습니다.');
        } else {
            res.end(JSON.stringify('사진 변경이 완료되었습니다.'));
        }
    });    
});

// ----------------------------------------------------------아기 프로필 사진 변경------------------------------------------------------------------

// ----------------------------------------------------------등록한 아이 삭제하기------------------------------------------------------------------
app.post('/delete_baby/',(req,res,next) => {

    var num = req.body.num;
    var babyname = req.body.babyname;
   
     
     var sql = 'DELETE FROM add_baby where num=? AND baby_name=?';
     con.query(sql,[num,babyname], function (error, result, fields) {
         if (error) {
             console.log("error ocurred", error);
             res.send({
                 "code": 400,
                 "failed": "error ocurred"
             })
         } else {
             console.log('The solution is: ', result);
             res.send({
                 "code": 200,
                 "success": "아이를 삭제하였습니다.",
             })
             
         }
     })
 });
 // ----------------------------------------------------------등록한 아이 삭제하기------------------------------------------------------------------

var publicDir = (__dirname + '/uploads/');
app.use(express.static(publicDir));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// ----------------------------------------------------------내가 등록한 모든 애기 정보------------------------------------------------------------------
app.get("/babys/:parents_id",(req,res,next)=>{
    con.query('SELECT * FROM add_baby where parents_id=?',[req.params.parents_id],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            res.end(JSON.stringify(result));
            // console.log(result);
        } else {
            res.end(JSON.stringify("No baby here"));
        }
    })
});
// ----------------------------------------------------------내가 등록한 모든 애기 정보------------------------------------------------------------------
// ----------------------------------------------------------메인 화면에 아기 정보------------------------------------------------------------------
app.get("/mybaby/:parents_id/:num",(req,res,next)=>{
    var num = req.params.num;
    con.query('SELECT * FROM add_baby where parents_id=?',[req.params.parents_id],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            res.end(JSON.stringify(result[num]))
            console.log(num);
            console.log(result[num]);
        } else {
            res.end(JSON.stringify("No baby here"));
        }
    })
});
// ----------------------------------------------------------메인 화면에 아기 정보------------------------------------------------------------------
// ----------------------------------------------------------유저정보------------------------------------------------------------------
app.post('/user/', (req,res,next) => {  
    var post_data = req.body; // Get POST BODY
    var id = post_data.id;  // GET field 'id' from post data

   
    con.query('SELECT * FROM user where id=?', [id], function (err, result, fields) {

        con.on('error', function (err) {
            console.log('[MySQL ERROR]', err);
        });

        if (result && result.length) {

                res.end(JSON.stringify(result[0])) // If password is true , return all info of user
            
        }
        else {
            res.json('User not exists!!! , 유저가 존재하지 않습니다.')
        }
    });
});
// ----------------------------------------------------------유저정보------------------------------------------------------------------
// ----------------------------------------------------------공지사항 등록------------------------------------------------------------------
app.post('/add_notice/',upload.single("file"),(req,res,next) => {

    let file = req.file;
    let notice_title = req.body.notice_title;
    let notice_content = req.body.notice_content;
    let newDate = new Date();
    var week = new Array('일','월','화','수','목','금','토');
    let notice_time = newDate.toFormat('YYYY-MM-DD ')+ week[newDate.getDay()] + '요일 '+ newDate.toFormat('HH:MI:SS');
    let notice_writer = req.body.notice_writer;
    let notice_nickname = req.body.notice_nickname;
    let kindergarten = req.body.kindergarten;
    let classname = req.body.classname;
    let result = {
        originalName : file.filename,
        size : file.size
    }
    // res.json(req.file);
     console.log(req.file);
    // console.log(req.file.path);
    // console.log(babyname);
    // console.log(babybirth);
    // console.log(babygender);
    // console.log(baby_kindergarten);
    // console.log(baby_class);
    // console.log(parents_id);
    var notice = {
        "notice_title": notice_title,
        "notice_content": notice_content,
        "notice_image": req.file.filename,
        "notice_time": notice_time,
        "notice_writer": notice_writer,
        "notice_nickname":notice_nickname,
        "kindergarten": kindergarten,
        "classname": classname
    }
    var sql = 'INSERT INTO notice (notice_title, notice_content, notice_image, notice_time, notice_writer, notice_nickname, kindergarten, classname) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
    con.query(sql,[notice_title,notice_content,"http://10.0.2.2:3000/"+ req.file.filename,notice_time,notice_writer,notice_nickname,kindergarten,classname], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "공지사항을 작성하였습니다.",
            })
            console.log("add_notice",notice);
        }
    })
});
// ----------------------------------------------------------공지사항 등록------------------------------------------------------------------
// ----------------------------------------------------------공지사항 글 수정하기------------------------------------------------------------------
app.post('/notice_modify/',upload.single("file"),(req,res,next) => {

    let file = req.file;
    let notice_num = req.body.notice_num;
    let notice_title = req.body.notice_title;
    let notice_content = req.body.notice_content;
    let notice_time = req.body.notice_time;
    let notice_writer = req.body.notice_writer;
    let notice_nickname = req.body.notice_nickname;
    let kindergarten = req.body.kindergarten;
    let classname = req.body.classname;
    let result = {
        originalName : file.filename,
        size : file.size
    }
    
    var sql = 'UPDATE notice SET notice_title = ?, notice_content = ?, notice_image = ?, notice_time = ?, notice_writer = ?, notice_nickname = ?, kindergarten = ?, classname = ? WHERE num = ?';
    con.query(sql,[notice_title,notice_content,"http://10.0.2.2:3000/"+ req.file.filename,notice_time,notice_writer,notice_nickname,kindergarten,classname,notice_num], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "공지사항을 수정하였습니다.",
            })
            
        }
    })
});
// ----------------------------------------------------------공지사항 글 수정하기------------------------------------------------------------------
// ----------------------------------------------------------공지사항 글 삭제하기------------------------------------------------------------------
app.post('/notice_delete/',(req,res,next) => {

   var num = req.body.num;
  
    
    var sql = 'DELETE FROM notice where num=?';
    con.query(sql,[num], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "공지사항 글을 삭제하였습니다.",
            })
            
        }
    })
});
// ----------------------------------------------------------공지사항 글 삭제하기------------------------------------------------------------------
// ----------------------------------------------------------공지사항 리스트------------------------------------------------------------------
app.get("/notice_list/:kindergarten/:classname",(req,res,next)=>{
    var kindergarten = req.params.kindergarten;
    var classname = req.params.classname;
    con.query('SELECT * FROM notice where kindergarten=? AND classname=?',[kindergarten,classname],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            
                res.end(JSON.stringify(result));
                console.log(result);
            
        } else {
        }
    })
});
// ----------------------------------------------------------공지사항 리스트------------------------------------------------------------------
// ----------------------------------------------------------공지사항 댓글 읽기------------------------------------------------------------------
app.get("/notice_text_comment_read/:notice_num",(req,res,next)=>{
    con.query('SELECT * FROM notice_comment where notice_num=?',[req.params.notice_num],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            res.end(JSON.stringify(result));
            // console.log(result);
        } else {
        }
    })
});
// ----------------------------------------------------------공지사항 댓글 읽기------------------------------------------------------------------
// ----------------------------------------------------------공지사항 댓글 쓰기------------------------------------------------------------------
app.post('/notice_text_comment_write/', (req, res, next) => {
    var post_data = req.body; // Get POST params
    var notice_num = post_data.notice_num;
    var comment_writer = post_data.comment_writer;
    var comment_nickname = post_data.comment_nickname;
    var comment_content = post_data.comment_content;
    let newDate = new Date();
    var week = new Array('일','월','화','수','목','금','토');
    let comment_time = newDate.toFormat('YYYY-MM-DD ')+ week[newDate.getDay()] + '요일 '+ newDate.toFormat('HH:MI:SS');
    
    var sql = 'INSERT INTO notice_comment (notice_num, comment_writer, comment_nickname, comment_content, comment_time) VALUES(?, ?, ?, ?, ?)';
    con.query(sql,[notice_num,comment_writer,comment_nickname,comment_content,comment_time], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.end(JSON.stringify(result));
        }
    })

})
// ----------------------------------------------------------공지사항 댓글 쓰기------------------------------------------------------------------
// ----------------------------------------------------------공지사항 댓글 수정하기------------------------------------------------------------------
app.post('/notice_text_modify_comment/', (req, res, next) => {
    var post_data = req.body; // Get POST params
    var num = post_data.num;
    var notice_num = post_data.notice_num;
    var comment_writer = post_data.comment_writer;
    var comment_nickname = post_data.comment_nickname;
    var comment_content = post_data.comment_content;
    let comment_time = post_data.comment_time;
    
    var sql = 'UPDATE notice_comment SET notice_num = ?, comment_writer = ?, comment_nickname = ?, comment_content = ?, comment_time = ? WHERE num = ?';
    con.query(sql,[notice_num,comment_writer,comment_nickname,comment_content,comment_time,num], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.end(JSON.stringify(result));
        }
    })

})
// ----------------------------------------------------------공지사항 댓글 수정하기------------------------------------------------------------------
// ----------------------------------------------------------공지사항 댓글 삭제하기------------------------------------------------------------------
app.post('/notice_comment_delete/',(req,res,next) => {

    var num = req.body.num;
   
     
     var sql = 'DELETE FROM notice_comment where num=?';
     con.query(sql,[num], function (error, result, fields) {
         if (error) {
             console.log("error ocurred", error);
             res.send({
                 "code": 400,
                 "failed": "error ocurred"
             })
         } else {
             console.log('The solution is: ', result);
             res.send({
                 "code": 200,
                 "success": "공지사항 댓글을 삭제하였습니다.",
             })
             
         }
     })
 });
 // ----------------------------------------------------------공지사항 댓글 삭제하기------------------------------------------------------------------
 // ----------------------------------------------------------앨범 사진 등록------------------------------------------------------------------
app.post('/add_album/',upload.single("file"),(req,res,next) => {

    let file = req.file;
    let newDate = new Date();
    var week = new Array('일','월','화','수','목','금','토');
    let album_time = newDate.toFormat('YYYY-MM-DD ')+ week[newDate.getDay()] + '요일 '+ newDate.toFormat('HH:MI:SS');
    let album_writer = req.body.album_writer;
    let album_nickname = req.body.album_nickname;
    let kindergarten = req.body.kindergarten;
    let classname = req.body.classname;
    let result = {
        originalName : file.filename,
        size : file.size
    }
   
    var sql = 'INSERT INTO album (album_image, album_writer,album_nickname, kindergarten, classname, album_time) VALUES(?, ?, ?, ?, ?, ?)';
    con.query(sql,["http://10.0.2.2:3000/"+ req.file.filename,album_writer,album_nickname,kindergarten,classname, album_time], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "앨범 사진을 등록하였습니다.",
            })
            
        }
    })
});
// ----------------------------------------------------------앨범 사진 등록------------------------------------------------------------------
// ----------------------------------------------------------앨범 리스트------------------------------------------------------------------
app.get("/album_list/:kindergarten/:classname",(req,res,next)=>{
    var kindergarten = req.params.kindergarten;
    var classname = req.params.classname;
    con.query('SELECT * FROM album where kindergarten=? AND classname=? ORDER BY num DESC',[kindergarten,classname],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            
                res.end(JSON.stringify(result));
                console.log(result);
            
        } else {
        }
    })
});
// ----------------------------------------------------------앨범 리스트------------------------------------------------------------------
// ----------------------------------------------------------앨범 사진 삭제하기------------------------------------------------------------------
app.post('/album_delete/',(req,res,next) => {

    var num = req.body.num;
   
     
     var sql = 'DELETE FROM album where num=?';
     con.query(sql,[num], function (error, result, fields) {
         if (error) {
             console.log("error ocurred", error);
             res.send({
                 "code": 400,
                 "failed": "error ocurred"
             })
         } else {
             console.log('The solution is: ', result);
             res.send({
                 "code": 200,
                 "success": "앨범 사진을 삭제하였습니다.",
             })
             
         }
     })
 });
 // ----------------------------------------------------------앨범 사진 삭제하기------------------------------------------------------------------
 // ----------------------------------------------------------앨범 사진 수정하기------------------------------------------------------------------
app.post('/album_modify/',upload.single("file"),(req,res,next) => {

    let file = req.file;
    let num = req.body.num;
    let album_time = req.body.album_time;
    let album_writer = req.body.album_writer;
    let album_nickname = req.body.album_nickname;
    let kindergarten = req.body.kindergarten;
    let classname = req.body.classname;
    let result = {
        originalName : file.filename,
        size : file.size
    }
    
    var sql = 'UPDATE album SET album_image = ?, album_writer = ?, album_nickname = ?, kindergarten = ?, classname = ?, album_time = ? WHERE num = ?';
    con.query(sql,["http://10.0.2.2:3000/"+ req.file.filename,album_writer,album_nickname,kindergarten,classname,album_time,num], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "사진을 수정하였습니다.",
            })
            
        }
    })
});
// ----------------------------------------------------------앨범 사진 수정하기------------------------------------------------------------------
// ----------------------------------------------------------앨범 댓글 읽기------------------------------------------------------------------
app.get("/album_comment_read/:album_num",(req,res,next)=>{
    con.query('SELECT * FROM album_comment where album_num=?',[req.params.album_num],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            res.end(JSON.stringify(result));
            // console.log(result);
        } else {
        }
    })
});
// ----------------------------------------------------------앨범 댓글 읽기------------------------------------------------------------------
// ----------------------------------------------------------앨범 댓글 쓰기------------------------------------------------------------------
app.post('/album_comment_write/', (req, res, next) => {
    var post_data = req.body; // Get POST params
    var album_num = post_data.album_num;
    var comment_writer = post_data.comment_writer;
    var comment_nickname = post_data.comment_nickname;
    var comment_content = post_data.comment_content;
    let newDate = new Date();
    var week = new Array('일','월','화','수','목','금','토');
    let comment_time = newDate.toFormat('YYYY-MM-DD ')+ week[newDate.getDay()] + '요일 '+ newDate.toFormat('HH:MI:SS');
    
    var sql = 'INSERT INTO album_comment (album_num, comment_writer, comment_nickname, comment_content, comment_time) VALUES(?, ?, ?, ?, ?)';
    con.query(sql,[album_num,comment_writer,comment_nickname,comment_content,comment_time], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.end(JSON.stringify(result));
        }
    })

})
// ----------------------------------------------------------앨범 댓글 쓰기------------------------------------------------------------------
// ----------------------------------------------------------앨범 댓글 수정하기------------------------------------------------------------------
app.post('/album_modify_comment/', (req, res, next) => {
    var post_data = req.body; // Get POST params
    var num = post_data.num;
    var album_num = post_data.album_num;
    var comment_writer = post_data.comment_writer;
    var comment_nickname = post_data.comment_nickname;
    var comment_content = post_data.comment_content;
    let comment_time = post_data.comment_time;
    
    var sql = 'UPDATE album_comment SET album_num = ?, comment_writer = ?, comment_nickname = ?, comment_content = ?, comment_time = ? WHERE num = ?';
    con.query(sql,[album_num,comment_writer,comment_nickname,comment_content,comment_time,num], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.end(JSON.stringify(result));
        }
    })

})
// ----------------------------------------------------------앨범 댓글 수정하기------------------------------------------------------------------
// ----------------------------------------------------------앨범 댓글 삭제하기------------------------------------------------------------------
app.post('/album_comment_delete/', (req, res, next) => {

    var num = req.body.num;

    var sql = 'DELETE FROM album_comment where num=?';
    con.query(sql, [num], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "댓글을 삭제하였습니다.",
            })

        }
    })
});
 // ----------------------------------------------------------앨범 댓글 삭제하기------------------------------------------------------------------

 // ----------------------------------------------------------식단표 작성하기------------------------------------------------------------------
app.post('/add_carte/',upload.fields([{name: 'file1'},{name: 'file2'},{name: 'file3'}]),(req,res,next) => {
    console.log(req.files);
    let file1 = req.files['file1'][0].filename;
    let file2 = req.files['file2'][0].filename;
    let file3 = req.files['file3'][0].filename;
    let menu1 = req.body.menu1;
    let menu2 = req.body.menu2;
    let menu3 = req.body.menu3;
    let writer_id = req.body.writer_id;
    let writer_nickname = req.body.writer_nickname;
    let kindergarten = req.body.kindergarten;
    let classname = req.body.classname;
    let carte_time = req.body.carte_time;
    let newDate = new Date();
    var week = new Array('일','월','화','수','목','금','토');
    let carte_write_time = newDate.toFormat('YYYY-MM-DD ')+ week[newDate.getDay()] + '요일 '+ newDate.toFormat('HH:MI:SS');
    
   
    var sql = 'INSERT INTO carte (file1, file2, file3, menu1, menu2, menu3, writer_id, writer_nickname, kindergarten, classname, carte_time, carte_write_time) VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    con.query(sql,["http://10.0.2.2:3000/"+ file1,"http://10.0.2.2:3000/"+ file2,"http://10.0.2.2:3000/"+ file3,menu1,menu2,menu3,writer_id,writer_nickname,kindergarten,classname, carte_time, carte_write_time], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "식단표를 작성하였습니다.",
            })
            
        }
    })
});
// ----------------------------------------------------------식단표 작성하기------------------------------------------------------------------
// ----------------------------------------------------------식단표 리스트------------------------------------------------------------------
app.get("/carte_list/:kindergarten/:classname",(req,res,next)=>{
    var kindergarten = req.params.kindergarten;
    var classname = req.params.classname;
    con.query('SELECT * FROM carte where kindergarten=? AND classname=?',[kindergarten,classname],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            
                res.end(JSON.stringify(result));
                console.log(result);
            
        } else {
        }
    })
});
// ----------------------------------------------------------식단표 리스트------------------------------------------------------------------
 // ---------------------------------------------------------식단표 수정하기------------------------------------------------------------------
 app.post('/carte_modify/',upload.fields([{name: 'file1'},{name: 'file2'},{name: 'file3'}]),(req,res,next) => {

    console.log(req.files);
    let num = req.body.num;
    let file1 = req.files['file1'][0].filename;
    let file2 = req.files['file2'][0].filename;
    let file3 = req.files['file3'][0].filename;
    let menu1 = req.body.menu1;
    let menu2 = req.body.menu2;
    let menu3 = req.body.menu3;
    let writer_id = req.body.writer_id;
    let writer_nickname = req.body.writer_nickname;
    let kindergarten = req.body.kindergarten;
    let classname = req.body.classname;
    let carte_time = req.body.carte_time;
    let carte_write_time = req.body.carte_write_time;
    
    var sql = 'UPDATE carte SET file1 = ?, file2 = ?, file3 = ?, menu1 = ?, menu2 = ?, menu3 = ?, writer_id = ?, writer_nickname = ?, kindergarten = ?, classname = ?, carte_time = ?, carte_write_time = ? WHERE num = ?';
    con.query(sql,["http://10.0.2.2:3000/"+ file1,"http://10.0.2.2:3000/"+ file2,"http://10.0.2.2:3000/"+ file3,menu1,menu2,menu3,writer_id,writer_nickname,kindergarten,classname, carte_time, carte_write_time,num], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "식단표를 수정하였습니다.",
            })
            
        }
    })
});
// ----------------------------------------------------------식단표 수정하기------------------------------------------------------------------
// ----------------------------------------------------------식단표 삭제하기------------------------------------------------------------------
app.post('/carte_delete/',(req,res,next) => {

    var num = req.body.num;
   
     
     var sql = 'DELETE FROM carte where num=?';
     con.query(sql,[num], function (error, result, fields) {
         if (error) {
             console.log("error ocurred", error);
             res.send({
                 "code": 400,
                 "failed": "error ocurred"
             })
         } else {
             console.log('The solution is: ', result);
             res.send({
                 "code": 200,
                 "success": "식단표를 삭제하였습니다.",
             })
             
         }
     })
 });
 // ----------------------------------------------------------식단표 삭제하기------------------------------------------------------------------
// ----------------------------------------------------------식단표 댓글 읽기------------------------------------------------------------------
app.get("/carte_comment_read/:carte_num",(req,res,next)=>{
    con.query('SELECT * FROM carte_comment where carte_num=?',[req.params.carte_num],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            res.end(JSON.stringify(result));
            // console.log(result);
        } else {
        }
    })
});
// ----------------------------------------------------------식단표 댓글 읽기------------------------------------------------------------------
// ----------------------------------------------------------식단표 댓글 쓰기------------------------------------------------------------------
app.post('/carte_comment_write/', (req, res, next) => {
    var post_data = req.body; // Get POST params
    var carte_num = post_data.carte_num;
    var comment_writer = post_data.comment_writer;
    var comment_nickname = post_data.comment_nickname;
    var comment_content = post_data.comment_content;
    let newDate = new Date();
    var week = new Array('일','월','화','수','목','금','토');
    let comment_time = newDate.toFormat('YYYY-MM-DD ')+ week[newDate.getDay()] + '요일 '+ newDate.toFormat('HH:MI:SS');
    
    var sql = 'INSERT INTO carte_comment (carte_num, comment_writer, comment_nickname, comment_content, comment_time) VALUES(?, ?, ?, ?, ?)';
    con.query(sql,[carte_num,comment_writer,comment_nickname,comment_content,comment_time], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.end(JSON.stringify(result));
        }
    })

})
// ----------------------------------------------------------식단표 댓글 쓰기------------------------------------------------------------------
// ----------------------------------------------------------식단표 댓글 수정하기------------------------------------------------------------------
app.post('/carte_modify_comment/', (req, res, next) => {
    var post_data = req.body; // Get POST params
    var num = post_data.num;
    var carte_num = post_data.carte_num;
    var comment_writer = post_data.comment_writer;
    var comment_nickname = post_data.comment_nickname;
    var comment_content = post_data.comment_content;
    let comment_time = post_data.comment_time;
    
    var sql = 'UPDATE carte_comment SET carte_num = ?, comment_writer = ?, comment_nickname = ?, comment_content = ?, comment_time = ? WHERE num = ?';
    con.query(sql,[carte_num,comment_writer,comment_nickname,comment_content,comment_time,num], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.end(JSON.stringify(result));
        }
    })

})
// ----------------------------------------------------------식단표 댓글 수정하기------------------------------------------------------------------
// ----------------------------------------------------------식단표 댓글 삭제하기------------------------------------------------------------------
app.post('/carte_comment_delete/',(req,res,next) => {

    var num = req.body.num;
   
     
     var sql = 'DELETE FROM carte_comment where num=?';
     con.query(sql,[num], function (error, result, fields) {
         if (error) {
             console.log("error ocurred", error);
             res.send({
                 "code": 400,
                 "failed": "error ocurred"
             })
         } else {
             console.log('The solution is: ', result);
             res.send({
                 "code": 200,
                 "success": "댓글을 삭제하였습니다.",
             })
             
         }
     })
 });
 // ----------------------------------------------------------식단표 댓글 삭제하기------------------------------------------------------------------
// ----------------------------------------------------------투약의뢰서 작성------------------------------------------------------------------
app.post('/request_medicine/',(req,res,next) => {

    
    let newDate = new Date();
    var week = new Array('일','월','화','수','목','금','토');
    let write_time = newDate.toFormat('YYYY-MM-DD ')+ week[newDate.getDay()] + '요일 '+ newDate.toFormat('HH:MI:SS');
    let babyname = req.body.babyname;
    let request_day = req.body.request_day;
    let symptom = req.body.symptom;
    let medicine = req.body.medicine;
    let cc = req.body.cc;
    let numberoftimes = req.body.numberoftimes;
    let medicine_time = req.body.medicine_time;
    let storage = req.body.storage;
    let baby_comment = req.body.baby_comment;
    let kindergarten = req.body.kindergarten;
    let classname = req.body.classname;
    let parents_id = req.body.parents_id;
    let parents_name = req.body.parents_name;
    let baby_image = req.body.baby_image;
   
    var sql = 'INSERT INTO administratoin_request_form (babyname, request_day,symptom, medicine, cc, numberoftimes, medicine_time, storage, baby_comment, kindergarten, classname, parents_id, parents_name, baby_image, write_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    con.query(sql,[babyname,request_day,symptom,medicine,cc,numberoftimes,medicine_time,storage,baby_comment,kindergarten,classname, parents_id, parents_name, baby_image, write_time], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "투약의뢰서를 작성하였습니다.",
            })
            
        }
    })
});
// ----------------------------------------------------------투약의뢰서 작성------------------------------------------------------------------

// ----------------------------------------------------------투약의뢰서 전체 리스트 ( 선생님 )------------------------------------------------------------------
app.get("/request_list_all/:kindergarten/:classname",(req,res,next)=>{
    var kindergarten = req.params.kindergarten;
    var classname = req.params.classname;
    con.query('SELECT * FROM administratoin_request_form where kindergarten=? AND classname=?',[kindergarten,classname],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            
                res.end(JSON.stringify(result));
                console.log(result);
            
        } else {
        }
    })
});
// ----------------------------------------------------------투약의뢰서 전체 리스트 ( 선생님 )------------------------------------------------------------------

// ----------------------------------------------------------투약의뢰서 리스트 ( 학부모 )------------------------------------------------------------------
app.get("/request_list/:kindergarten/:classname/:parents_id/:babyname",(req,res,next)=>{
    var kindergarten = req.params.kindergarten;
    var classname = req.params.classname;
    var parents_id = req.params.parents_id;
    var babyname = req.params.babyname;
    con.query('SELECT * FROM administratoin_request_form where kindergarten=? AND classname=? AND parents_id=? AND babyname=?',[kindergarten,classname,parents_id,babyname],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            
                res.end(JSON.stringify(result));
                console.log(result);
            
        } else {
        }
    })
});
// ----------------------------------------------------------투약의뢰서 리스트 ( 학부모 )------------------------------------------------------------------

// ----------------------------------------------------------투약의뢰서 글 삭제하기------------------------------------------------------------------
app.post('/request_delete/',(req,res,next) => {

    var num = req.body.num;
   
     
     var sql = 'DELETE FROM administratoin_request_form where num=?';
     con.query(sql,[num], function (error, result, fields) {
         if (error) {
             console.log("error ocurred", error);
             res.send({
                 "code": 400,
                 "failed": "error ocurred"
             })
         } else {
             console.log('The solution is: ', result);
             res.send({
                 "code": 200,
                 "success": "투약의뢰서 글을 삭제하였습니다.",
             })
             
         }
     })
 });
 // ----------------------------------------------------------투약의뢰서 글 삭제하기------------------------------------------------------------------

 // ----------------------------------------------------------투약의뢰서 댓글 읽기------------------------------------------------------------------
app.get("/request_comment_read/:request_num",(req,res,next)=>{
    con.query('SELECT * FROM administration_request_form_comment where request_num=?',[req.params.request_num],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            res.end(JSON.stringify(result));
            // console.log(result);
        } else {
        }
    })
});
// ----------------------------------------------------------투약의뢰서 댓글 읽기------------------------------------------------------------------
// ----------------------------------------------------------투약의뢰서 댓글 쓰기------------------------------------------------------------------
app.post('/request_comment_write/', (req, res, next) => {
    var post_data = req.body; // Get POST params
    var request_num = post_data.request_num;
    var comment_writer = post_data.comment_writer;
    var comment_nickname = post_data.comment_nickname;
    var comment_content = post_data.comment_content;
    let newDate = new Date();
    var week = new Array('일','월','화','수','목','금','토');
    let comment_time = newDate.toFormat('YYYY-MM-DD ')+ week[newDate.getDay()] + '요일 '+ newDate.toFormat('HH:MI:SS');
    
    var sql = 'INSERT INTO administration_request_form_comment (request_num, comment_writer, comment_nickname, comment_content, comment_time) VALUES(?, ?, ?, ?, ?)';
    con.query(sql,[request_num,comment_writer,comment_nickname,comment_content,comment_time], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.end(JSON.stringify(result));
        }
    })

})
// ----------------------------------------------------------투약의뢰서 댓글 쓰기------------------------------------------------------------------
// ----------------------------------------------------------투약의뢰서 댓글 수정하기------------------------------------------------------------------
app.post('/request_modify_comment/', (req, res, next) => {
    var post_data = req.body; // Get POST params
    var num = post_data.num;
    var request_num = post_data.request_num;
    var comment_writer = post_data.comment_writer;
    var comment_nickname = post_data.comment_nickname;
    var comment_content = post_data.comment_content;
    let comment_time = post_data.comment_time;
    
    var sql = 'UPDATE administration_request_form_comment SET request_num = ?, comment_writer = ?, comment_nickname = ?, comment_content = ?, comment_time = ? WHERE num = ?';
    con.query(sql,[request_num,comment_writer,comment_nickname,comment_content,comment_time,num], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.end(JSON.stringify(result));
        }
    })

})
// ----------------------------------------------------------투약의뢰서 댓글 수정하기------------------------------------------------------------------
// ----------------------------------------------------------투약의뢰서 댓글 삭제하기------------------------------------------------------------------
app.post('/request_comment_delete/',(req,res,next) => {

    var num = req.body.num;
   
     
     var sql = 'DELETE FROM administration_request_form_comment where num=?';
     con.query(sql,[num], function (error, result, fields) {
         if (error) {
             console.log("error ocurred", error);
             res.send({
                 "code": 400,
                 "failed": "error ocurred"
             })
         } else {
             console.log('The solution is: ', result);
             res.send({
                 "code": 200,
                 "success": "댓글을 삭제하였습니다.",
             })
             
         }
     })
 });
 // ----------------------------------------------------------투약의뢰서 댓글 삭제하기------------------------------------------------------------------

 // ----------------------------------------------------------귀가동의서 작성------------------------------------------------------------------
app.post('/write_consent/',(req,res,next) => {

    
    let newDate = new Date();
    var week = new Array('일','월','화','수','목','금','토');
    let write_time = newDate.toFormat('YYYY-MM-DD ')+ week[newDate.getDay()] + '요일 '+ newDate.toFormat('HH:MI:SS');
    let babyname = req.body.babyname;
    let consent_day = req.body.consent_day;
    let consent_time = req.body.consent_time;
    let consent_how = req.body.consent_how;
    let relation1 = req.body.relation1;
    let call1 = req.body.call1;
    let relation2 = req.body.relation2;
    let call2 = req.body.call2;
    let kindergarten = req.body.kindergarten;
    let classname = req.body.classname;
    let parents_id = req.body.parents_id;
    let baby_image = req.body.baby_image;
   
    var sql = 'INSERT INTO consent_form (baby_image, babyname, consent_day, consent_time, consent_how, relation1, call1, relation2, call2, kindergarten, classname, parents_id, write_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    con.query(sql,[baby_image,babyname,consent_day,consent_time,consent_how,relation1,call1,relation2,call2,kindergarten,classname, parents_id, write_time], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "귀가동의서를 작성하였습니다.",
            })
            
        }
    })
});
// ----------------------------------------------------------귀가동의서 작성------------------------------------------------------------------

// ----------------------------------------------------------귀가동의서 전체 리스트 ( 선생님 )------------------------------------------------------------------
app.get("/consent_list_all/:kindergarten/:classname",(req,res,next)=>{
    var kindergarten = req.params.kindergarten;
    var classname = req.params.classname;
    con.query('SELECT * FROM consent_form where kindergarten=? AND classname=?',[kindergarten,classname],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            
                res.end(JSON.stringify(result));
                console.log(result);
            
        } else {
        }
    })
});
// ----------------------------------------------------------귀가동의서 전체 리스트 ( 선생님 )------------------------------------------------------------------

// ----------------------------------------------------------귀가동의서 리스트 ( 학부모 )------------------------------------------------------------------
app.get("/consent_list/:kindergarten/:classname/:parents_id/:babyname",(req,res,next)=>{
    var kindergarten = req.params.kindergarten;
    var classname = req.params.classname;
    var parents_id = req.params.parents_id;
    var babyname = req.params.babyname;
    con.query('SELECT * FROM consent_form where kindergarten=? AND classname=? AND parents_id=? AND babyname=?',[kindergarten,classname,parents_id,babyname],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            
                res.end(JSON.stringify(result));
                console.log(result);
            
        } else {
        }
    })
});
// ----------------------------------------------------------귀가동의서 리스트 ( 학부모 )------------------------------------------------------------------

// ----------------------------------------------------------귀가동의서 글 삭제하기------------------------------------------------------------------
app.post('/consent_delete/',(req,res,next) => {

    var num = req.body.num;
   
     
     var sql = 'DELETE FROM consent_form where num=?';
     con.query(sql,[num], function (error, result, fields) {
         if (error) {
             console.log("error ocurred", error);
             res.send({
                 "code": 400,
                 "failed": "error ocurred"
             })
         } else {
             console.log('The solution is: ', result);
             res.send({
                 "code": 200,
                 "success": "귀가동의서 글을 삭제하였습니다.",
             })
             
         }
     })
 });
 // ----------------------------------------------------------귀가동의서 글 삭제하기------------------------------------------------------------------

 // ----------------------------------------------------------귀가동의서 댓글 읽기------------------------------------------------------------------
app.get("/consent_comment_read/:consent_num",(req,res,next)=>{
    con.query('SELECT * FROM consent_form_comment where consent_num=?',[req.params.consent_num],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            res.end(JSON.stringify(result));
            // console.log(result);
        } else {
        }
    })
});
// ----------------------------------------------------------귀가동의서 댓글 읽기------------------------------------------------------------------
// ----------------------------------------------------------귀가동의서 댓글 쓰기------------------------------------------------------------------
app.post('/consent_comment_write/', (req, res, next) => {
    var post_data = req.body; // Get POST params
    var consent_num = post_data.consent_num;
    var comment_writer = post_data.comment_writer;
    var comment_nickname = post_data.comment_nickname;
    var comment_content = post_data.comment_content;
    let newDate = new Date();
    var week = new Array('일','월','화','수','목','금','토');
    let comment_time = newDate.toFormat('YYYY-MM-DD ')+ week[newDate.getDay()] + '요일 '+ newDate.toFormat('HH:MI:SS');
    
    var sql = 'INSERT INTO consent_form_comment (consent_num, comment_writer, comment_nickname, comment_content, comment_time) VALUES(?, ?, ?, ?, ?)';
    con.query(sql,[consent_num,comment_writer,comment_nickname,comment_content,comment_time], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.end(JSON.stringify(result));
        }
    })

})
// ----------------------------------------------------------귀가동의서 댓글 쓰기------------------------------------------------------------------
// ----------------------------------------------------------귀가동의서 댓글 수정하기------------------------------------------------------------------
app.post('/consent_modify_comment/', (req, res, next) => {
    var post_data = req.body; // Get POST params
    var num = post_data.num;
    var consent_num = post_data.consent_num;
    var comment_writer = post_data.comment_writer;
    var comment_nickname = post_data.comment_nickname;
    var comment_content = post_data.comment_content;
    let comment_time = post_data.comment_time;
    
    var sql = 'UPDATE consent_form_comment SET consent_num = ?, comment_writer = ?, comment_nickname = ?, comment_content = ?, comment_time = ? WHERE num = ?';
    con.query(sql,[consent_num,comment_writer,comment_nickname,comment_content,comment_time,num], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.end(JSON.stringify(result));
        }
    })

})
// ----------------------------------------------------------귀가동의서 댓글 수정하기------------------------------------------------------------------
// ----------------------------------------------------------귀가동의서 댓글 삭제하기------------------------------------------------------------------
app.post('/consent_comment_delete/',(req,res,next) => {

    var num = req.body.num;
   
     
     var sql = 'DELETE FROM consent_form_comment where num=?';
     con.query(sql,[num], function (error, result, fields) {
         if (error) {
             console.log("error ocurred", error);
             res.send({
                 "code": 400,
                 "failed": "error ocurred"
             })
         } else {
             console.log('The solution is: ', result);
             res.send({
                 "code": 200,
                 "success": "댓글을 삭제하였습니다.",
             })
             
         }
     })
 });
 // ----------------------------------------------------------귀가동의서 댓글 삭제하기------------------------------------------------------------------

// ----------------------------------------------------------알림장 작성중에 원아 선택할수있게 리스트 불러오기------------------------------------------------------------------
app.get("/baby_list/:kindergarten/:classname/:state",(req,res,next)=>{
    var kindergarten = req.params.kindergarten;
    var classname = req.params.classname;
    var state = req.params.state;
    con.query('SELECT * FROM add_baby where baby_kindergarten=? AND baby_class =? AND state=?',[kindergarten,classname,state],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            
                res.end(JSON.stringify(result));
                console.log(result);
            
        } else {
        }
    })
});
// ----------------------------------------------------------알림장 작성중에 원아 선택할수있게 리스트 불러오기-----------------------------------------------------------------

// ----------------------------------------------------------알림장 작성 등록------------------------------------------------------------------
app.post('/add_advice/',upload.single("file"),(req,res,next) => {

    let advice_baby = req.body.advice_baby;
    let advice_content = req.body.advice_content;
    let file = req.file;
    let feel = req.body.feel;
    let health = req.body.health;
    let temperature = req.body.temperature;
    let MealorNot = req.body.MealorNot;
    let sleep = req.body.sleep;
    let poop = req.body.poop;
    let newDate = new Date();
    var week = new Array('일','월','화','수','목','금','토');
    let advice_time = newDate.toFormat('YYYY-MM-DD ')+ week[newDate.getDay()] + '요일 ';
    let advice_write_time =  newDate.toFormat('YYYY-MM-DD ')+ week[newDate.getDay()] + '요일 '+ newDate.toFormat('HH:MI:SS');
    let advice_writer = req.body.advice_writer;
    let advice_nickname = req.body.advice_nickname;
    let kindergarten = req.body.kindergarten;
    let classname = req.body.classname;
    let baby_image = req.body.baby_image;
    var sql = 'INSERT INTO advice (advice_baby, advice_content, file, feel, health, temperature, MealorNot, sleep, poop, advice_writer, advice_nickname, kindergarten, classname, advice_time, advice_write_time, baby_image) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    con.query(sql,[advice_baby,advice_content,"http://10.0.2.2:3000/"+ req.file.filename,feel,health,temperature,MealorNot,sleep,poop,advice_writer,advice_nickname,kindergarten,classname,advice_time,advice_write_time, baby_image], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "알림장을 작성하였습니다.",
            })
        }
    })
});
// ----------------------------------------------------------알림장 작성 등록------------------------------------------------------------------

// ----------------------------------------------------------알림장 전체 리스트 ( 선생님 )------------------------------------------------------------------
app.get("/all_advice_list/:kindergarten/:classname",(req,res,next)=>{
    var kindergarten = req.params.kindergarten;
    var classname = req.params.classname;
    con.query('SELECT * FROM advice where kindergarten=? AND classname=?',[kindergarten,classname],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            
                res.end(JSON.stringify(result));
                console.log(result);
            
        } else {
        }
    })
});
// ----------------------------------------------------------알림장 전체 리스트 ( 선생님 )------------------------------------------------------------------

// ----------------------------------------------------------알림장 리스트 ( 학부모 )------------------------------------------------------------------
app.get("/advice_list/:kindergarten/:classname/:advice_baby",(req,res,next)=>{
    var kindergarten = req.params.kindergarten;
    var classname = req.params.classname;
    var advice_baby = req.params.advice_baby;
    con.query('SELECT * FROM advice where kindergarten=? AND classname=? AND advice_baby=?',[kindergarten,classname,advice_baby],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            
                res.end(JSON.stringify(result));
                console.log(result);
            
        } else {
        }
    })
});
// ----------------------------------------------------------알림장 리스트 ( 학부모 )------------------------------------------------------------------

 // ---------------------------------------------------------알림장 수정하기------------------------------------------------------------------
 app.post('/advice_modify/',upload.single("file"),(req,res,next) => {

    let num = req.body.num;
    let advice_baby = req.body.advice_baby;
    let advice_content = req.body.advice_content;
    let file = req.file;
    let feel = req.body.feel;
    let health = req.body.health;
    let temperature = req.body.temperature;
    let MealorNot = req.body.MealorNot;
    let sleep = req.body.sleep;
    let poop = req.body.poop;
    let advice_time = req.body.advice_time;
    let advice_write_time =  req.body.advice_write_time;
    let advice_writer = req.body.advice_writer;
    let advice_nickname = req.body.advice_nickname;
    let kindergarten = req.body.kindergarten;
    let classname = req.body.classname;
    let baby_image = req.body.baby_image;
    
    var sql = 'UPDATE advice SET advice_baby = ?, advice_content = ?, file = ?, feel = ?, health = ?, temperature = ?, MealorNot = ?, sleep = ?, poop = ?, advice_writer = ?, advice_nickname = ?, kindergarten = ?, classname = ?, advice_time = ?, advice_write_time = ?, baby_image = ? WHERE num = ?';
    con.query(sql,[advice_baby,advice_content,"http://10.0.2.2:3000/"+ file.filename,feel,health,temperature,MealorNot,sleep,poop,advice_writer,advice_nickname,kindergarten,classname, advice_time, advice_write_time,baby_image,num], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.send({
                "code": 200,
                "success": "알림장을 수정하였습니다.",
            })
            
        }
    })
});
// ----------------------------------------------------------알림장 수정하기------------------------------------------------------------------

// ----------------------------------------------------------알림장 글 삭제하기------------------------------------------------------------------
app.post('/advice_delete/',(req,res,next) => {

    var num = req.body.num;
   
     
     var sql = 'DELETE FROM advice where num=?';
     con.query(sql,[num], function (error, result, fields) {
         if (error) {
             console.log("error ocurred", error);
             res.send({
                 "code": 400,
                 "failed": "error ocurred"
             })
         } else {
             console.log('The solution is: ', result);
             res.send({
                 "code": 200,
                 "success": "투약의뢰서 글을 삭제하였습니다.",
             })
             
         }
     })
 });
 // ----------------------------------------------------------알림장 글 삭제하기------------------------------------------------------------------

 // ----------------------------------------------------------알림장 댓글 읽기------------------------------------------------------------------
 app.get("/advice_comment_read/:advice_num",(req,res,next)=>{
    con.query('SELECT * FROM advice_comment where advice_num=?',[req.params.advice_num],function(error,result,fields){
        con.on('error',function(err){
            console.log('[MY SQL ERROR]',err);
        });

        if(result && result.length){
            res.end(JSON.stringify(result));
            // console.log(result);
        } else {
        }
    })
});
// ----------------------------------------------------------알림장 댓글 읽기------------------------------------------------------------------
// ----------------------------------------------------------알림장 댓글 쓰기------------------------------------------------------------------
app.post('/advice_comment_write/', (req, res, next) => {
    var post_data = req.body; // Get POST params
    var advice_num = post_data.advice_num;
    var comment_writer = post_data.comment_writer;
    var comment_nickname = post_data.comment_nickname;
    var comment_content = post_data.comment_content;
    let newDate = new Date();
    var week = new Array('일','월','화','수','목','금','토');
    let comment_time = newDate.toFormat('YYYY-MM-DD ')+ week[newDate.getDay()] + '요일 '+ newDate.toFormat('HH:MI:SS');
    
    var sql = 'INSERT INTO advice_comment (advice_num, comment_writer, comment_nickname, comment_content, comment_time) VALUES(?, ?, ?, ?, ?)';
    con.query(sql,[advice_num,comment_writer,comment_nickname,comment_content,comment_time], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.end(JSON.stringify(result));
        }
    })

})
// ----------------------------------------------------------알림장 댓글 쓰기------------------------------------------------------------------
// ----------------------------------------------------------알림장 댓글 수정하기------------------------------------------------------------------
app.post('/advice_modify_comment/', (req, res, next) => {
    var post_data = req.body; // Get POST params
    var num = post_data.num;
    var advice_num = post_data.advice_num;
    var comment_writer = post_data.comment_writer;
    var comment_nickname = post_data.comment_nickname;
    var comment_content = post_data.comment_content;
    let comment_time = post_data.comment_time;
    
    var sql = 'UPDATE advice_comment SET advice_num = ?, comment_writer = ?, comment_nickname = ?, comment_content = ?, comment_time = ? WHERE num = ?';
    con.query(sql,[advice_num,comment_writer,comment_nickname,comment_content,comment_time,num], function (error, result, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', result);
            res.end(JSON.stringify(result));
        }
    })

})
// ----------------------------------------------------------알림장 댓글 수정하기------------------------------------------------------------------
// ----------------------------------------------------------알림장 댓글 삭제하기------------------------------------------------------------------
app.post('/advice_comment_delete/',(req,res,next) => {

    var num = req.body.num;
   
     
     var sql = 'DELETE FROM advice_comment where num=?';
     con.query(sql,[num], function (error, result, fields) {
         if (error) {
             console.log("error ocurred", error);
             res.send({
                 "code": 400,
                 "failed": "error ocurred"
             })
         } else {
             console.log('The solution is: ', result);
             res.send({
                 "code": 200,
                 "success": "댓글을 삭제하였습니다.",
             })
             
         }
     })
 });
 // ----------------------------------------------------------알림장 댓글 삭제하기------------------------------------------------------------------
// Start Server
app.listen(3000, () => {
    console.log('서버 가동 Restful running on port 3000');
})

// IP 주소 , 현재 서버 주소 
var os = require('os');
var interfaces = os.networkInterfaces();
var port2 = 3000
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
console.log("현재 서버주소 : " + addresses + ":" + port2);