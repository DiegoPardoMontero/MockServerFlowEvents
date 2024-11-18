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
    },
    {
      "id": 3,
      "nombre": "Curso de Inversiones",
      "aforo": 150,
      "fecha": "2024-10-05"
    },
    {
      "id": 4,
      "nombre": "Taller de Análisis Técnico",
      "aforo": 80,
      "fecha": "2024-11-15"
    },
    {
      "id": 5,
      "nombre": "Conferencia de Mercados",
      "aforo": 100,
      "fecha": "2024-12-01"
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
    },
    {
      "id": 3,
      "eventoId": 2,
      "nombre": "Alquiler sala trading",
      "categoria": "Instalaciones",
      "precio": 1200000.00,
      "fecha": "2024-09-18"
    },
    {
      "id": 4,
      "eventoId": 2,
      "nombre": "Software especializado",
      "categoria": "Tecnología",
      "precio": 300000.00,
      "fecha": "2024-09-19"
    },
    {
      "id": 5,
      "eventoId": 3,
      "nombre": "Plataforma virtual",
      "categoria": "Tecnología",
      "precio": 250000.00,
      "fecha": "2024-10-03"
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
    },
    {
      "id": 3,
      "eventoId": 2,
      "nombre": "Venta de entradas",
      "categoria": "Inscripciones",
      "precio": 1500000.00,
      "fecha": "2024-09-15"
    },
    {
      "id": 4,
      "eventoId": 2,
      "nombre": "Material digital",
      "categoria": "Productos",
      "precio": 450000.00,
      "fecha": "2024-09-20"
    },
    {
      "id": 5,
      "eventoId": 3,
      "nombre": "Suscripciones premium",
      "categoria": "Membresías",
      "precio": 800000.00,
      "fecha": "2024-10-01"
    }
  ]
};

const router = jsonServer.router(data);
server.use(middlewares);
server.use(jsonServer.bodyParser);

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

// PUT actualizar evento
server.put('/api/v1/eventos-flujo/:id', (req, res) => {
  try {
    const eventoId = parseInt(req.params.id);
    
    // Verificar si existe el evento
    const evento = router.db
      .get('eventos-flujo')
      .find({ id: eventoId })
      .value();

    if (!evento) {
      return res.status(404).json({
        code: "404",
        message: "Evento no encontrado."
      });
    }

    // Validar los campos requeridos
    if (!req.body.nombre || !req.body.aforo || !req.body.fecha) {
      return res.status(400).json({
        code: "400",
        message: "Los campos nombre, aforo y fecha son requeridos."
      });
    }

    // Actualizar el evento
    const updatedEvento = {
      ...evento,
      nombre: req.body.nombre,
      aforo: req.body.aforo,
      fecha: req.body.fecha
    };

    router.db
      .get('eventos-flujo')
      .find({ id: eventoId })
      .assign(updatedEvento)
      .write();

    res.json(updatedEvento);
  } catch (error) {
    res.status(500).json({
      code: "500",
      message: "Error al actualizar el evento."
    });
  }
});

// DELETE eliminar evento
server.delete('/api/v1/eventos-flujo/:id', (req, res) => {
  try {
    const eventoId = parseInt(req.params.id);
    
    // Verificar si existe el evento
    const evento = router.db
      .get('eventos-flujo')
      .find({ id: eventoId })
      .value();

    if (!evento) {
      return res.status(404).json({
        code: "404",
        message: "Evento no encontrado."
      });
    }

    // Eliminar los gastos asociados
    router.db
      .get('gastos')
      .remove({ eventoId })
      .write();

    // Eliminar los ingresos asociados
    router.db
      .get('ingresos')
      .remove({ eventoId })
      .write();

    // Eliminar el evento
    router.db
      .get('eventos-flujo')
      .remove({ id: eventoId })
      .write();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      code: "500",
      message: "Error al eliminar el evento."
    });
  }
});

// Rutas para totales
server.get('/api/v1/eventos-flujo/:id/ingresos-totales', (req, res) => {
  const eventoId = parseInt(req.params.id);
  const ingresosEvento = router.db
    .get('ingresos')
    .filter({ eventoId })
    .value();

  const total = ingresosEvento.reduce((sum, ingreso) => sum + ingreso.precio, 0);
  
  res.json({ total });
});

server.get('/api/v1/eventos-flujo/:id/gastos-totales', (req, res) => {
  const eventoId = parseInt(req.params.id);
  const gastosEvento = router.db
    .get('gastos')
    .filter({ eventoId })
    .value();

  const total = gastosEvento.reduce((sum, gasto) => sum + gasto.precio, 0);
  
  res.json({ total });
});

// Rutas para gastos e ingresos
server.get('/api/v1/eventos-flujo/:id/gastos', (req, res) => {
  const eventoId = parseInt(req.params.id);
  const gastos = router.db
    .get('gastos')
    .filter({ eventoId })
    .value();
  
  res.json(gastos);
});

server.get('/api/v1/eventos-flujo/:id/ingresos', (req, res) => {
  const eventoId = parseInt(req.params.id);
  const ingresos = router.db
    .get('ingresos')
    .filter({ eventoId })
    .value();
  
  res.json(ingresos);
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