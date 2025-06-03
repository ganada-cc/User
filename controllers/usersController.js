const usersService = require('../services/usersService');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// 회원가입
exports.postUsers = async function (req,res) {
    const {
        user_id,
        password,
        name,
        phone_number,
        relationship,
        patient_name,
        birth_date,
        sex,
        dementia_registration,
        medication
    } = req.body;
    const signUpResponse = await usersService.createUser(
        user_id,
        password,
        name,
        phone_number,
        relationship,
        patient_name,
        birth_date,
        sex,
        dementia_registration,
        medication
      );
      if (signUpResponse == "성공") {
        return res.status(200).send(`
        <script>
          if (confirm('회원가입에 성공했습니다.')) {
            window.location.href = "/";
          }
        </script>
      `)
      }
      else {
        return res.send(`
        <script>
          if (confirm('회원가입에 실패했습니다. 회원가입 정보를 다시 한 번 확인해주세요.')) {
            window.location.href = "/users/signup";
          }

        </script>
      `);
      }
};


// userController.js (로그인 함수 내)
exports.login = async function (req, res) {
  const { user_id, password } = req.body;

  const signInResponse = await usersService.postSignIn(user_id, password);
  if (signInResponse.user_id == user_id) {
    return res
      .cookie("x_auth", signInResponse.jwt, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
      })
      .redirect('/calendar');  // 여기에 넣으면 로그인 후 바로 이동!
  } else {
    // 로그인 실패 처리
    return res.send(`
      <script>
        if (confirm('로그인에 실패했습니다.')) {
          window.location.href = "/";
        }
      </script>
    `);
  }
};


//커뮤니티 요청 처리
exports.getRelation = function(req, res) {
  const userId = req.params.userId;
  usersService.getUserRelation(userId)
    .then(relationship => {
      if (!relationship) return res.status(404).json({ message: "No relation found" });
      res.json({ relationship });
    })
    .catch(() => res.status(500).json({ message: "Server error" }));
};