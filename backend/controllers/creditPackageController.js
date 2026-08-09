const dataSource = require('../config/data-source');

// GET /api/credit_package 取得購買方案列表
const getPackages = async (req, res) => {
  const packageRepository = dataSource.getRepository('Credit_package');
  const creditPackages = await packageRepository.find(); // 等於 GET

  res.status(200).json({
    status: 'success',
    data: creditPackages,
  });
};

module.exports = {
  getPackages,
};