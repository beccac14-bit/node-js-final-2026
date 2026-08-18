const express = require('express');
const router = express.Router();
const dataSource = require('../config/data-source');
const coachRepository = dataSource.getRepository('Coach');
const coachLinkSkillRepository = dataSource.coachLinkSkillRepository('CoachLinkSkill');
const courseRepository = dataSource.getRepository('Course');
import { MoreThan } from 'typeorm';
// const { In, IsNull  } = require('typeorm');

// GET 取得教練分頁列表 /api/coaches
const getCoachesList = async (req, res) => {

  const per = Number(req.query.per);
  const page = Number(req.query.page);

  // 1. 錯誤 400：觸發條件：缺 per 或 page、或其中任何一個不是可轉成非負整數的字串
  if (
    req.query.per === undefined ||
    req.query.page === undefined ||
    !Number.isInteger(per) || per < 0 ||
    !Number.isInteger(page) || page < 0
  ){
    return res.status(400).json({
      status: 'failed',
      message: '欄位未填寫正確'
    });
  };

  // 2. SELECT id, user_id 跟 name; skip 是跳過幾筆、take 是拿幾筆
    // 舉例：page = 1（第一頁）你要拿前 3 筆，前面不用跳過任何一筆：skip = 0（不跳過）、take = 3（拿 3 筆）
    // page = 2（第二頁），你要跳過第一頁那 3 筆，再拿接下來的 3 筆：skip = 3（跳過前 3 筆）、take = 3（拿 3 筆）
  const coaches = await coachRepository.find({
    select: {
      id: true,
      user_id: true,
      name: true,
    },
      skip: (page - 1) * per,
      take: per,
    });

  // 3. map 重組回傳 date，雖然和 enity 欄位名稱相同，但為避免混淆還是再寫一次
  const data = coaches.map((coach) => ({
    id: coach.id, // 教練 id（uuid，拿這個去查教練詳情）
    user_id: coach.user_id, // 這位教練對應的使用者 id（uuid）
    name: coach.name, // 教練名字
  }));  
  
  return res.status(200).json({
    status: 'success',
    data: data   
  });

};

// GET /api/coaches/{coachId} 取得單一教練詳細資料（公開，不用登入）
const getSpecificCoach = async (req, res) => {
  const { coachId } = req.params;

  // 1. 錯誤 400：coachId 為空或無效字串
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 
  if( !coachId || !coachId.trim() === '' || UUID_REGEX.test(coachId) ){
    return res.status(400).json({
      status: 'failed', 
      message: '欄位未填寫正確'
    });
  };

  // 2. 錯誤 400：查無此教練
  const existingCoach = await coachRepository.findOneBy({ id: coachId });
  if( !existingCoach ){
    return res.status(400).json({
      status: 'failed',
      message: '找不到該教練'
    });
  };
  
  // 3. 取教練的 skills 拼成字串陣列 
  const existingUser = await userRepository.findOneBy({ id: existingCoach.user_id });
  const links = await coachLinkSkillRepository.find({ 
    where: { coach_id: coachId },
    relations: { skill: true } 
  });
  const skill_names = links.map( (link) => link.name );

  res.status(200).json({
    status: 'success',
    data: { 
      user: {
        name: existingUser.name,
        role: "COACH"
      },
      coach: {
        id: existingCoach.id,
        user_id: existingCoach.user_id,
        experience_years: existingCoach.experience_years,
        description: existingCoach.description,
        profile_image_url: existingCoach.profile_image_url,
        created_at: existingCoach.created_at,
        updated_at: existingCoach.updated_at,
        skills: skill_names
      }
    };       
  });
  
};


// GET api/coaches/{coachId}/courses 取得指定教練「未結束」的課程列表（公開，不用登入）
const getSpecificCoachCourseList = async (req, res) => {

  const { coachId } = req.params;
  
  // 1. 錯誤 400：coachId 為空或無效字串
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 
  if( !coachId || !coachId.trim() === '' || UUID_REGEX.test(coachId) ){
    return res.status(400).json({
      status: 'failed', 
      message: '欄位未填寫正確'
    });
  };

  // 2. 錯誤 400：查無此教練
  const existingCoach = await coachRepository.findOneBy({ id: coachId });
  if( !existingCoach ){
    return res.status(400).json({
      status: 'failed',
      message: '找不到該教練'
    });
  };

  const ongoingCourses = await courseRepository.find( where: { coach_id: coachId, end_at: MoreThan(now) } ); 
  驗證 uuid 格式（空、uuid REGEX）
  比對 coachid
  比對時間要未結束 end_at > now（未結束，含尚未開始的課）

  回傳的有可能是空陣列

  res.status(200).json({
    status: 'success',
    data: [{}]
    id: "5f2c1a9e-7b3d-4e8f-9a0b-1c2d3e4f5a6b"
                    name: "晨間瑜伽"
                    description: "適合新手的伸展課程"
                    start_at: "2026-08-20T10:00:00.000Z"
                    end_at: "2026-08-20T12:00:00.000Z"
                    max_participants: 10
                    coach_name: "肌肉小美"
                    skill_name: "瑜伽"

    
  })
}


                    

module.exports = {
  getCoachesList,
  getSpecificCoach
}
