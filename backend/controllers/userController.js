const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();
const userRepository = dataSource.getRepository('User');


// POST /api/users/signup 註冊新會員帳號
const postUsersSignup = async (req, res) => {
const { name, email, password } = req.body;
  
  // 1. 檢查欄位是否正確
  // 錯誤 400：缺少必要欄位
    if ( !name?.trim() || !email?.trim() || !password?.trim() ) {
        return res.status(400).json({
          status: 'false', 
          message: `欄位未填寫正確`});  
    };

  // 2. 檢查密碼是否符合規則
  // 錯誤 400：密碼規則由後端把關：必須同時包含英文大寫、英文小寫、數字，長度 8～16 字
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/;
    const passwordCorrectFormat = passwordRegex.test(userInfo.password);
    
    if( !passwordCorrectFormat ){
      return res.status(400).json({
        status: 'false',
        message: `密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字`});  
    };

  // 3. 檢查是否有重複
  // 錯誤 409：Email 已被使用
  
    const existingUser = await userRepository.findOneBy({ email });
  
    if (existingUser) {
      return res.status(409).json({
        status: 'failed',
        message: 'Email 已被使用'});
    };

  // 4.註冊用戶
    // a. 產生 Salt（rounds = 10）
    const salt = await bcrypt.genSalt(10);
    // b. 將密碼加鹽雜湊後儲存（模擬存入資料庫）
    const hashedPassword = await bcrypt.hash( password, salt );
    // c. 將新使用者（包含 id、email、加密後 password）存進 user（先 create 再 save）
    const newUser = userRepository.create({ 
      name, 
      email, 
      password: hashedPassword,
      role: 'USER' });
    ;
    const savedUser = await userRepository.save(newMember)
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: savedPackage.id,
          name: savedPackage.name }}
    });
    
};


// POST /api/users/login 會員登入，取得 JWT token
const postUsersLogin = async (req, res) => {
  // 1. 檢查欄位是否正確
  // 錯誤 400：缺少必要欄位
    const { id, email, password, role } = req.body;
    if ( !name?.trim() || !email?.trim() || !password?.trim() ) {
        return res.status(400).json({
          status: 'false', 
          message: `欄位未填寫正確`});  
    };

  // 2. 檢查密碼是否符合規則
  // 錯誤 400：必須同時包含英文大寫、英文小寫、數字，長度 8～16 字
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/;
    const passwordCorrectFormat = passwordRegex.test(userInfo.password);
    
    if( !passwordCorrectFormat ){
      return res.status(400).json({
          status: 'false', 
          message: `欄位未填寫正確`}); 
    };

  // 3. 檢查 email 是否有符合的使用者
  // 錯誤 400：使用者不存在或密碼輸入錯誤
    const existingUser = await userRepository.findOneBy({ email });

    if( !existingUser ){
        return res.status(400).json({
          status: 'false', 
          message: `帳號或密碼錯誤`});
    }
  // 4. 驗證 password 是否輸入正確
    // 錯誤 400：使用者不存在或密碼輸入錯誤
    const isMatch = await bcrypt.compare(password , existingUser.password);
    if(!isMatch){
        return res.status(400).json({
          status: 'false', 
          message: `帳號或密碼錯誤`});
    };

  // 5. 回傳 201：用 jwt.sign 簽出 token，payload 必須包含 { id, role, exp } 
    // secret 使用 process.env.JWT_SECRET，有效期設為 10 天

    const payload = { id, role };
    const SECRET = process.env.JWT_SECRET;
    const token = jwt.sign( payload, SECRET, {exp : '10d'} );
    res.status(201).json({ 
      status: 'success',
      token,
      data: { user: name }
    });
};

module.exports = {
  postUsersSignup,
  postUsersLogin
  
};
