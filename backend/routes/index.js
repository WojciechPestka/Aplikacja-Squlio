const express = require('express');
const router = express.Router();

const RegisterController = require('../controllers/RegisterController')
const LoginController = require('../controllers/LoginController')
const AdminController = require('../controllers/AdminController')
const ActivateUser = require('../controllers/ActivateUserController')
const CharacterController = require('../controllers/CharacterController')
const GetCharacterController = require('../controllers/GetCharacterController')
const DailyQuestionsController = require('../controllers/DailyQuestionsController');
const MathQuestionsController = require('../controllers/MathQuestionsController');
const ItemShopController = require('../controllers/ItemShopController')
const WardrobeController = require('../controllers/WardrobeController')
const ScienceQuestionsController = require('../controllers/ScienceQuestlionsController');
const EnglishQuestionsController = require('../controllers/EnglishQuestlionsController');
const ProgramingQuestionsController = require('../controllers/ProgramingQuestlionsController');
const UserStatsController = require('../controllers/UserStatsController');
const TasksController = require('../controllers/TasksController')
const AchievementsController  = require('../controllers/AchievementsController')
const DailyStatsController = require('../controllers/DailyStatsController')
const ResetPasswordController = require('../controllers/ResetPasswordController')
const BuyHeartController = require('../controllers/HeartShopController')

const authenticateUser = require('../middlewares/authenticateUser');
const { loginLimiter, detectInjection, blockIP, isBlocked } = require('../middlewares/attackDetection');
const checkEditableCharacter = require('../middlewares/checkEditableCharacter');

router.post('/api/register', RegisterController.Register)
router.post('/api/login', isBlocked, loginLimiter, detectInjection, LoginController.Login)
router.post('/api/activation', authenticateUser, ActivateUser.ActivateUser)
router.post('/api/saveCharacter', authenticateUser, checkEditableCharacter, CharacterController.Savecharacter)
router.get('/api/character', authenticateUser, GetCharacterController.getCharacter)
router.post('/CreateDailyQuestion', AdminController.CreateDailyQuestion)
router.post('/CreateMathsQuestion', AdminController.CreateMathsQuestion)
router.post('/CreateProgrammingQuestion', AdminController.CreateProgrammingQuestion);
router.post('/CreateScienceQuestion', AdminController.CreateScienceQuestion);
router.post('/CreateEnglishQuestion', AdminController.CreateEnglishQuestion);
router.get('/api/daily-question', authenticateUser, DailyQuestionsController.getDailyQuestion);
router.post('/api/submit-answer', authenticateUser, DailyQuestionsController.submitAnswer);
router.get('/api/math-questions/:level', authenticateUser, MathQuestionsController.getMathQuestion);
router.post('/api/submit-math-answer', authenticateUser, MathQuestionsController.submitMathAnswer);
router.get('/api/science-questions/:level', authenticateUser, ScienceQuestionsController.getScienceQuestion);
router.post('/api/submit-science-answer', authenticateUser, ScienceQuestionsController.submitScienceAnswer);
router.get('/api/english-questions/:level', authenticateUser, EnglishQuestionsController.getEnglishQuestion);
router.post('/api/submit-english-answer', authenticateUser, EnglishQuestionsController.submitEnglishAnswer);
router.get('/api/programing-questions/:level', authenticateUser, ProgramingQuestionsController.getProgramingQuestion);
router.post('/api/submit-programing-answer', authenticateUser, ProgramingQuestionsController.submitProgramingAnswer);
router.post('/CreateShopItem', AdminController.CreateShopItem);
router.get('/api/shop/items', authenticateUser, ItemShopController.getShopItems);
router.post('/api/shop/buy-item', authenticateUser, ItemShopController.BuyItem);
router.post('/api/buy-edit-character', authenticateUser, ItemShopController.BuyEditCharacter);
router.get('/api/wardrobe/items', authenticateUser, WardrobeController.getWardrobeItems);
router.post('/api/select-item', authenticateUser, WardrobeController.selectItem);
router.get('/api/userstats', authenticateUser, UserStatsController.getUserStats);
router.get('/api/get-tasks', authenticateUser, TasksController.getTasks);
router.get('/api/get-achievements', authenticateUser, AchievementsController.getAchievements);
router.post('/get-all-users', GetCharacterController.getAllUsers);
router.get('/get-user-data/:id', GetCharacterController.getAllUserData);
router.put('/update-user/:id', GetCharacterController.updateUserData);
router.get('/api/stats/:date', DailyStatsController.getDailyStats);
router.get('/api/stats/compare/:date1/:date2', DailyStatsController.compareDailyStats);
router.post('/api/send-reset-code', ResetPasswordController.sendResetCode);
router.post('/api/reset-password', ResetPasswordController.resetPassword);
router.post('/api/buy-heart', authenticateUser, BuyHeartController.BuyHeart);
router.post('/api/get-heart-shop', authenticateUser, BuyHeartController.GetHeartShop);

module.exports = router;