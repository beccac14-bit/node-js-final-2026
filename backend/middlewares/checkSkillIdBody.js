
const checkSkillIdBody = (req, res, next) => {
    
const { skillId } = req.params;

// 400：根本不是 uuid 格式（例如隨便打 abc）不列入驗收

    // uuid 正則表達式
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!UUID_REGEX.test(skillId) || skillId.trim() === '') {
        return res.status(400).json({
        status: 'failed',
        message: 'ID錯誤',
        });
    }

    next();
};

module.exports = checkSkillIdBody;