const jsonServer = require('json-server');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 8083;

const data = {
  "eventos-flujo": [
    {
      "id": 1,
      "nombre": "Workshop de Finanzas",
      "aforo": 50,
      "fecha": "2024-08-15"
    },
    {
      "id": 2,
      "nombre": "Seminario de Trading",
      "aforo": 300,
      "fecha": "2024-09-20"
    }
  ],
  "gastos": [
    {
      "id": 1,
      "eventoId": 1,
      "nombre": "Material didáctico",
      "categoria": "Materiales",
      "precio": 150000.00,
      "fecha": "2024-08-10"
    },
    {
      "id": 2,
      "eventoId": 1,
      "nombre": "Coffee break",
      "categoria": "Alimentación",
      "precio": 450000.00,
      "fecha": "2024-08-15"
    }
  ],
  "ingresos": [
    {
      "id": 1,
      "eventoId": 1,
      "nombre": "Inscripciones anticipadas",
      "categoria": "Inscripciones",
      "precio": 750000.00,
      "fecha": "2024-07-15"
    },
    {
      "id": 2,
      "eventoId": 1,
      "nombre": "Patrocinios",
      "categoria": "Patrocinios",
      "precio": 300000.00,
      "fecha": "2024-08-01"
    }
  ]
};

const router = jsonServer.router(data);
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Configuración de CORS y headers
server.use((req, res, next) => {
  res.header('Content-Type', 'application/json');
  res.header('Accept', 'application/json');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

// GET eventos-flujo por ID
server.get('/api/v1/eventos-flujo/:id', (req, res) => {
  const eventoId = parseInt(req.params.id);
  const evento = router.db
    .get('eventos-flujo')
    .find({ id: eventoId })
    .value();

  if (evento) {
    res.json(evento);
  } else {
    res.status(404).json({
      code: "404",
      message: "Evento no encontrado."
    });
  }
});

// GET gastos de un evento
server.get('/api/v1/eventos-flujo/:id/gastos', (req, res) => {
  const eventoId = parseInt(req.params.id);
  const gastos = router.db
    .get('gastos')
    .filter({ eventoId })
    .value();
  
  res.json(gastos);
});

// GET ingresos de un evento
server.get('/api/v1/eventos-flujo/:id/ingresos', (req, res) => {
  const eventoId = parseInt(req.params.id);
  const ingresos = router.db
    .get('ingresos')
    .filter({ eventoId })
    .value();
  
  res.json(ingresos);
});

// GET total de gastos de un evento
server.get('/api/v1/eventos-flujo/:id/gastos-totales', (req, res) => {
  const eventoId = parseInt(req.params.id);
  const gastosEvento = router.db
    .get('gastos')
    .filter({ eventoId })
    .value();

  const total = gastosEvento.reduce((sum, gasto) => sum + gasto.precio, 0);
  res.json({ total });
});

// GET total de ingresos de un evento
server.get('/api/v1/eventos-flujo/:id/ingresos-totales', (req, res) => {
  const eventoId = parseInt(req.params.id);
  const ingresosEvento = router.db
    .get('ingresos')
    .filter({ eventoId })
    .value();

  const total = ingresosEvento.reduce((sum, ingreso) => sum + ingreso.precio, 0);
  res.json({ total });
});

// POST crear nuevo gasto
server.post('/api/v1/gastos', (req, res) => {
  try {
    const gastos = router.db.get('gastos');
    const newId = gastos.size().value() + 1;
    
    const newGasto = {
      id: newId,
      ...req.body,
      precio: parseFloat(req.body.precio)
    };
    
    gastos.push(newGasto).write();
    res.status(201).json(newGasto);
  } catch (error) {
    res.status(500).json({
      code: "500",
      message: "Error al crear el gasto."
    });
  }
});

// POST crear nuevo ingreso
server.post('/api/v1/ingresos', (req, res) => {
  try {
    const ingresos = router.db.get('ingresos');
    const newId = ingresos.size().value() + 1;
    
    const newIngreso = {
      id: newId,
      ...req.body,
      precio: parseFloat(req.body.precio)
    };
    
    ingresos.push(newIngreso).write();
    res.status(201).json(newIngreso);
  } catch (error) {
    res.status(500).json({
      code: "500",
      message: "Error al crear el ingreso."
    });
  }
});

// PUT actualizar gasto
server.put('/api/v1/gastos/:id', (req, res) => {
  try {
    const gastoId = parseInt(req.params.id);
    const gasto = router.db.get('gastos').find({ id: gastoId }).value();

    if (!gasto) {
      return res.status(404).json({
        code: "404",
        message: "Gasto no encontrado."
      });
    }

    const updatedGasto = {
      ...gasto,
      ...req.body,
      id: gastoId,
      precio: parseFloat(req.body.precio)
    };

    router.db
      .get('gastos')
      .find({ id: gastoId })
      .assign(updatedGasto)
      .write();

    res.json(updatedGasto);
  } catch (error) {
    res.status(500).json({
      code: "500",
      message: "Error al actualizar el gasto."
    });
  }
});

// PUT actualizar ingreso
server.put('/api/v1/ingresos/:id', (req, res) => {
  try {
    const ingresoId = parseInt(req.params.id);
    const ingreso = router.db.get('ingresos').find({ id: ingresoId }).value();

    if (!ingreso) {
      return res.status(404).json({
        code: "404",
        message: "Ingreso no encontrado."
      });
    }

    const updatedIngreso = {
      ...ingreso,
      ...req.body,
      id: ingresoId,
      precio: parseFloat(req.body.precio)
    };

    router.db
      .get('ingresos')
      .find({ id: ingresoId })
      .assign(updatedIngreso)
      .write();

    res.json(updatedIngreso);
  } catch (error) {
    res.status(500).json({
      code: "500",
      message: "Error al actualizar el ingreso."
    });
  }
});

// DELETE eliminar gasto
server.delete('/api/v1/gastos/:id', (req, res) => {
  try {
    const gastoId = parseInt(req.params.id);
    const gasto = router.db.get('gastos').find({ id: gastoId }).value();
    
    if (!gasto) {
      return res.status(404).json({
        code: "404",
        message: "Gasto no encontrado."
      });
    }
    
    router.db.get('gastos').remove({ id: gastoId }).write();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      code: "500",
      message: "Error al eliminar el gasto."
    });
  }
});

// DELETE eliminar ingreso
server.delete('/api/v1/ingresos/:id', (req, res) => {
  try {
    const ingresoId = parseInt(req.params.id);
    const ingreso = router.db.get('ingresos').find({ id: ingresoId }).value();
    
    if (!ingreso) {
      return res.status(404).json({
        code: "404",
        message: "Ingreso no encontrado."
      });
    }
    
    router.db.get('ingresos').remove({ id: ingresoId }).write();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      code: "500",
      message: "Error al eliminar el ingreso."
    });
  }
});

server.use('/api/v1', router);

server.listen(PORT, () => {
  console.log(`JSON Server está corriendo en el puerto ${PORT}`);
});