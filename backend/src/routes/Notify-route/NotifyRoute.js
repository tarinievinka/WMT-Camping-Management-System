const express = require('express');
const router  = express.Router();
const ctrl    = require('../../controllers/Notify-controller/NotifyController');

router.post('/add',              ctrl.addNotifyRequest);
router.get('/all',               ctrl.getAllNotifyRequests);
router.patch('/mark/:id',        ctrl.markAsNotified);
router.delete('/delete/:id',     ctrl.deleteNotifyRequest);

module.exports = router;