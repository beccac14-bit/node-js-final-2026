const express = require('express');
const router = express.Router();
const dataSource = require('../config/data-source');
const courseRepository = dataSource.getRepository('Course');
const { LessThanOrEqual, MoreThan } = require('typeorm');

// GET　/api/courses　取得全站「進行中」的課程列表（公開，不用登入）
const getCourseList = async (req, res) => {

  const now = new Date();
  const ongoingCourses = await courseRepository.find({   // 如果無資料會回傳空陣列
      where: { start_at: LessThanOrEqual(now), end_at: MoreThan(now), }, // 判斷標準：start_at <= 現在時間 < end_at。
      select: {
        id: true,
        name: true,
        description: true,
        start_at: true,
        end_at: true,
        max_participants: true,
        coach: { user: { name: true }},
        skill: { name: true }
      },
      relations: {
        coach: { user: true },
        skill: true
      },
  }); 

  const result = ongoingCourses.map( course => ({ // 空陣列 map 出來也是空陣列，因此不需要多加一層 .length===0 的判斷
        id: course.id,
        name: course.name,
        description: course.description,
        start_at: course.start_at,
        end_at: course.end_at,
        max_participants: course.max_participants,
        coach_name: course.coach.user.name,
        skill_name: course.skill.name,
    }));
  
   res.status(200).json({
     status: 'success',
     data: result    
   });
               
};

module.exports = {
  getCourseList
}
