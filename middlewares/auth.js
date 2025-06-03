module.exports = function (req, res, next) {
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ message: '사용자 인증 정보가 없습니다.' });
  }

  // userId를 req.user에 저장해 이후 로직에서 사용
  req.user = { user_id: userId };
  next();
};