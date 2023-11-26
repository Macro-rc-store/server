import express, { Request, Response, NextFunction } from 'express';
import os from 'os';

interface ActuatorOptions {
  basePath?: string;
}

function actuator(options: ActuatorOptions = {}) {
  const basePath = options.basePath || '/';
  const router = express.Router();

  router.get(`${basePath}/health`, (req: Request, res: Response) => {
    res.send('ok');
  });

  router.get(`${basePath}/metrics`, (req: Request, res: Response) => {
    const mem = process.memoryUsage();
    const totalRam = os.totalmem();
    const ramUsage = mem.rss;
    const uptime = process.uptime();
  
    res.json({
      mem: {
        rss: ramUsage,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        external: mem.external,
        arrayBuffers: mem.arrayBuffers,
      },
      totalRam,
      ramUsage,
      freeRam: os.freemem(),
      uptime,
    });
  });

  return router;
}

export default actuator;