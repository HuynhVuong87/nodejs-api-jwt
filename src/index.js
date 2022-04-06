const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Khởi tạo api
const app = express();

// Cho phép POST lên json object trong body
app.use(bodyParser.json());

// starting the server
const portNumber = 3000;
app.listen(portNumber, () => {
  console.log("listening on http://localhost:" + portNumber);
});

// Khởi tạo danh sách thành viên
const users = [];

// id khởi tạo của thành viên
let id = 1;

// Khi GET api / thì chạy:
// req : Request tới API
// res : Response trả về của API
app.get("/", (req, res) => {
  // Trả về dữ liệu
  res.json("hello world");
});

//---------------------------------------------------------------------

// Khi POST api /register thì chạy:
// Đăng kí tài khoản với dữ liệu username, password ở trong body
app.post("/users/register", async (req, res) => {
  try {
    const body = req.body;

    // Mã hoá mật khẩu trước khi lưu vào cơ sở dữ liệu:
    const salt = await bcrypt.genSalt(10);
    const password_encode = await bcrypt
      .hash(body.password, salt)
      .catch((error) => {
        throw error;
      });

    // Tạo dữ liệu cho 1 thành viên
    const user = {
      id: id,
      username: body.username,
      password: password_encode,
    };

    id++;

    // Lưu thông tin đăng nhập vào danh sách thành viên:
    users.push(user);

    // Trả về dữ liệu
    res.send("Register Success");
  } catch (error) {
    console.error(error);
    res.send("Có lỗi xảy ra, vui lòng kiểm tra log");
  }
});

//---------------------------------------------------------------------

// Khi GET api /users thì chạy:
// Api trả về danh sách thành viên đã đăng kí
app.get("/users", (req, res) => {
  res.send(users);
});

//---------------------------------------------------------------------

// Khi POST api /login thì chạy:
// Api đăng nhập tài khoản bằng username, password
app.post("/users/login", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    // Lấy ra thông tin user từ mảng danh sách thành viên users
    const info = users.find((x) => x.username == username);
    console.log(info);
    // Kiểm tra xem username gửi lên có tồn tại ko?
    if (info !== undefined) {
      // Kiểm tra password gửi lên có khớp không?
      const isMatch = await bcrypt.compare(password, info.password);
      if (isMatch) {
        // Tạo token để trả về cho client
        const JWT_SECRET = "matkhautaotoken";
        const token = jwt.sign(
          {
            id: info.id,
            username: info.username,
          },
          JWT_SECRET,
          {
            expiresIn: 60, // Token hết hạn sau 60 giây
          }
        );
        res.send(token);
      } else {
        res.status(500).send("Sai mật khẩu, vui lòng kiểm tra lại");
      }
    } else {
      res.status(500).send("username không tồn tại");
    }
  } catch (error) {
    console.error(error);
    res.send("Có lỗi xảy ra, vui lòng kiểm tra log");
  }
});
