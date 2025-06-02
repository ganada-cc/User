const { response } = require('express');
const pool = require('../main');
const usersModel = require('../models/usersModel');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const baseResponse = require("../config/baseResponseStatus");

// 회원가입
exports.createUser = async function (
  user_id,
  password,
  gd_phone,
  relationship,
  user_name,
  patient_name,
  birth_date,
  gender,
  dementia_registration,
  medication
) {
  try {
    const hashedPassword = await crypto
      .createHash("sha512")
      .update(password)
      .digest("hex");

    const insertUserParams = [
      user_id,
      hashedPassword,
      user_name,
      relationship,
      gd_phone    
    ];

    const patient_id = `${user_id}_${Date.now()}`;

    const insertPatientParams = [
      user_id,
      patient_id,
      patient_name,
      birth_date,
      dementia_registration,
      medication,
      gender
    ].map(value => value === undefined ? '' : value);

    await usersModel.insertUser(pool, insertUserParams);
    await usersModel.insertPatient(pool, insertPatientParams);

    return '성공';
  } catch (err) {
    console.error(err);
    return 'createUserError';
  }
};

// 아이디 확인
exports.userIdCheck = async function (user_id) {
  return await usersModel.selectUserId(pool, user_id);
};

// 비밀번호 확인
exports.passwordCheck = async function (selectUserPasswordParams) {
  const result = await usersModel.selectUserPassword(pool, selectUserPasswordParams);
  return result[0];
};

// 이름 조회
exports.accountCheck = async function (user_id) {
  return await usersModel.selectUserAccount(pool, user_id);
};

// 로그인
exports.postSignIn = async function (user_id, password) {
  try {
    console.log("[postSignIn] 시작", user_id);

    const userIdRows = await exports.userIdCheck(user_id);
    if (userIdRows.length < 1) {
      console.error("[로그인 실패] 존재하지 않는 아이디:", user_id);
      return baseResponse.SIGNIN_EMAIL_WRONG;
    }

    const selectUserId = userIdRows[0].user_id;

    const hashedPassword = await crypto
      .createHash("sha512")
      .update(password)
      .digest("hex");

    const selectUserPasswordParams = [selectUserId, hashedPassword];
    const passwordRow = await exports.passwordCheck(selectUserPasswordParams);

    if (!passwordRow || passwordRow.password !== hashedPassword) {
      console.error("[로그인 실패] 비밀번호 불일치:", user_id);
      return baseResponse.SIGNIN_PASSWORD_WRONG;
    }

    const userInfoRows = await exports.accountCheck(user_id);
    const userName = userInfoRows[0]?.name || "";

    const token = jwt.sign(
      { user_id, name: userName },
      process.env.JWT_SECRET,
      { expiresIn: "7d", subject: "user" }
    );

    console.log("[로그인 성공] 토큰 발급 완료", user_id);

    const insertUserJWTParams = [token, user_id];
    await usersModel.insertUserJWT(pool, insertUserJWTParams);

    return {
      user_id,
      user_name: userName,
      jwt: token,
    };
  } catch (err) {
    console.error("[postSignIn error]", err);
    return baseResponse.DB_ERROR;
  }
};

// 커뮤니티 요청 처리
exports.getUserRelation = function(userId) {
  return usersModel.getRelationByUserId(pool, userId)
    .then(rows => rows.length ? rows[0].relationship : null);
};
