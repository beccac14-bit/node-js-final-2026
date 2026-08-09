const errorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'failed',
      message: 'JSON 格式錯誤',
    });
  }

  next(err);
};

module.exports = errorHandler;