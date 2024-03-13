import express from 'express';
import {
	authenticateUser,
	createNicknameUser,
	profileLink,
	profileUser,
	registerUser,
} from '../controllers/user-controller.js';
import checkAuth from '../middleware/check-auth.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', authenticateUser);
router.get('/profile-link/:nickname', profileLink);
router.get('/perfil', checkAuth, profileUser);

export default router;
