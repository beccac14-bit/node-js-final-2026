const errorHandler = (err, req, res, next) => {

   // 已經送出 response 的話，交給 Express 內建處理，避免重複送 response
  if (res.headersSent) {
    return next(err);
  };
  
  // 400：JSON 格式錯誤
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'failed',
      message: 'JSON 格式錯誤',
    });
  };

  // 500：其他所有沒被上面攔截到的錯誤，統一當作伺服器內部錯誤
  console.error(err); // 印出來方便你自己 debug，正式環境通常會用 logger 取代
  return res.status(500).json({
    status: 'failed',
    message: '伺服器內部錯誤',
  });

};

module.exports = errorHandler;
