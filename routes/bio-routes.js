import express from 'express';

import checkAuth from '../middleware/check-auth.js';
import {
	addLinkBio,
	deleteLinkBio,
	editLinkBio,
	editValuesBio,
	getProfileMetric,
	getProfileMetricWithDate,
	reorderPositionLinksBio,
	storageViews,
} from '../controllers/bio-controller.js';

const router = express.Router();

router.post('/profile-metric', getProfileMetric);
router.post('/profile-metric-activity', getProfileMetricWithDate);
router.post('/profile-view', storageViews);
router.put('/edit-bio', checkAuth, editValuesBio);
router.post('/add-link', checkAuth, addLinkBio);
router.post('/edit-link', checkAuth, editLinkBio);
router.put('/reorder-link', reorderPositionLinksBio);

export default router;
