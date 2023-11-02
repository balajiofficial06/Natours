const express = require('express');
const userControler = require('../controler/userControler');
const authControler = require('../controler/authControler');

const router = express.Router();

router.post('/signUp', authControler.signUp);
router.post('/login', authControler.login);

router.post('/forgotPassword', authControler.forgotPassword);
router.patch('/resetPassword/:token', authControler.resetPassword);

router.patch(
  '/updateNewPassword',
  authControler.protect,
  authControler.updatePassword
);

router.patch('/updateMe', authControler.protect, userControler.updateMe);
router.delete('/deleteMe', authControler.protect, userControler.deleteMe);

router.get(
  '/me',
  authControler.protect,
  userControler.getMe,
  userControler.getSingleUser
);

router.route('/').get(userControler.getAllUser);

router
  .route('/:id')
  .get(userControler.getSingleUser)
  .patch(userControler.updateUser)
  .delete(userControler.deleteUser);

module.exports = router;
