const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authentication');

// Public route for getting data without authentication
router.get('/user', userController.getData); // This route is public, no token required

// Public routes for signUp and login
router.route('/user/signUp')
    .post(userController.SIGNUP);

router.route('/user/login')
    .post(userController.LOGIN);

router.use(authenticateToken); 

router.route('/user')
    .post(userController.addData); 

router.route('/user/remove')
    .delete(userController.removeItem); 

module.exports = router;
