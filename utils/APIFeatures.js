class Features {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filtering() {
    const queryObj = { ...this.queryString };
    const queryExculde = ['page', 'limit', 'fields', 'sort'];
    queryExculde.forEach((el) => delete queryObj[el]);

    //1.2) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const querySort = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(querySort);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const querySelect = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(querySelect);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paging() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = Features;
