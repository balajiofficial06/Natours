const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please let us the name'],
  },
  email: {
    type: String,
    required: [true, 'please let us know the Email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide the vaild Email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'lead-guide', 'user', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    //only work on create and work'
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password is not same',
    },
  },
  passwordChangedAt: {
    type: Date,
  },

  passwordResetToken: String,

  passwordResetExpire: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestrap) {
  if (this.passwordChangedAt) {
    const changedTimestrap = this.passwordChangedAt.getTime() / 1000;

    return changedTimestrap > JWTTimestrap;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const restToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(restToken)
    .digest('hex');

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  //console.log(this.passwordResetExpire, this.passwordResetToken);
  return restToken;
};

userSchema.pre('save', async function (next) {
  //only run if the function is only modifiyed
  if (!this.isModified('password')) return next();

  //encrypt the password
  this.password = await bcrypt.hash(this.password, 12);

  //delet the password confirm field.
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
