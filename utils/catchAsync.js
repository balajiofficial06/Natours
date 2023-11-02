module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next); //when catch is having next argument the error will be transported to errorhandling middleware
};
