import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// Rota pública para UBS listar hospitais (Nota: Essa rota permite acesso a UBS)
router.get('/hospitais-publico', authenticateToken, authorizeRole(['ubs']), adminController.listarHospitaisPublico);

// Middleware geral para admin (as rotas abaixo exigirão perfil 'admin')
router.use(authenticateToken);
router.use(authorizeRole(['admin']));

// UBS
router.get('/ubs', adminController.listarUbs);
router.post('/ubs', adminController.cadastrarUbs);
router.put('/ubs/:id', adminController.editarUbs);
router.delete('/ubs/:id', adminController.deletarUbs);

// Hospitais
router.get('/hospitais', adminController.listarHospitais);
router.post('/hospitais', adminController.cadastrarHospital);
router.put('/hospitais/:id', adminController.editarHospital);
router.delete('/hospitais/:id', adminController.deletarHospital);

// Laboratórios
router.get('/laboratorios', adminController.listarLaboratorios);
router.post('/laboratorios', adminController.cadastrarLaboratorio);
router.put('/laboratorios/:id', adminController.editarLaboratorio);
router.delete('/laboratorios/:id', adminController.deletarLaboratorio);

// UPAs
router.get('/upas', adminController.listarUpas);
router.post('/upas', adminController.cadastrarUpa);
router.put('/upas/:id', adminController.editarUpa);
router.delete('/upas/:id', adminController.deletarUpa);

// Farmácias
router.get('/farmacias', adminController.listarFarmacias);
router.post('/farmacias', adminController.cadastrarFarmacia);
router.put('/farmacias/:id', adminController.editarFarmacia);
router.delete('/farmacias/:id', adminController.deletarFarmacia);

export default router;
