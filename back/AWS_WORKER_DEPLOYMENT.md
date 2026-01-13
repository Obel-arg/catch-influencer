# Guía de Deployment del Worker en AWS

## Opción 1: Usando `nohup` (Más Simple)

### Comando básico:
```bash
cd /ruta/a/catch-influencer/back
nohup npm run start:worker > worker.log 2>&1 &
```

### Comando completo con variables de entorno:
```bash
cd /ruta/a/catch-influencer/back
nohup env NODE_ENV=production npm run start:worker > worker.log 2>&1 &
```

### Verificar que está corriendo:
```bash
ps aux | grep "node.*worker"
```

### Ver logs en tiempo real:
```bash
tail -f worker.log
```

### Detener el worker:
```bash
# Encontrar el PID
ps aux | grep "node.*worker"
# Matar el proceso
kill <PID>
```

---

## Opción 2: Usando `screen` (Recomendado para desarrollo)

### Instalar screen (si no está instalado):
```bash
sudo yum install screen  # Amazon Linux
# o
sudo apt-get install screen  # Ubuntu/Debian
```

### Comandos:
```bash
# Crear una sesión screen
screen -S worker

# Dentro de screen, ejecutar el worker
cd /ruta/a/catch-influencer/back
npm run start:worker

# Desconectar de screen (mantiene el proceso corriendo)
# Presionar: Ctrl+A, luego D

# Reconectar a la sesión
screen -r worker

# Listar todas las sesiones
screen -ls

# Matar una sesión
screen -X -S worker quit
```

---

## Opción 3: Usando `tmux` (Alternativa a screen)

### Instalar tmux:
```bash
sudo yum install tmux  # Amazon Linux
# o
sudo apt-get install tmux  # Ubuntu/Debian
```

### Comandos:
```bash
# Crear una sesión tmux
tmux new -s worker

# Dentro de tmux, ejecutar el worker
cd /ruta/a/catch-influencer/back
npm run start:worker

# Desconectar de tmux (mantiene el proceso corriendo)
# Presionar: Ctrl+B, luego D

# Reconectar a la sesión
tmux attach -t worker

# Listar todas las sesiones
tmux ls

# Matar una sesión
tmux kill-session -t worker
```

---

## Opción 4: Usando PM2 (Recomendado para Producción)

### Instalar PM2 globalmente:
```bash
npm install -g pm2
```

### Iniciar el worker con PM2:
```bash
cd /ruta/a/catch-influencer/back
pm2 start npm --name "worker" -- run start:worker
```

### Comandos útiles de PM2:
```bash
# Ver estado de todos los procesos
pm2 status

# Ver logs en tiempo real
pm2 logs worker

# Reiniciar el worker
pm2 restart worker

# Detener el worker
pm2 stop worker

# Eliminar el worker de PM2
pm2 delete worker

# Guardar la configuración actual para auto-restart
pm2 save

# Configurar PM2 para iniciar al arrancar el sistema
pm2 startup
# Seguir las instrucciones que aparecen
```

### Configurar PM2 para auto-restart:
```bash
# Crear archivo ecosystem.config.js en la raíz del proyecto
pm2 ecosystem
```

### Ejemplo de ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: 'worker',
    script: 'npm',
    args: 'run start:worker',
    cwd: '/ruta/a/catch-influencer/back',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/worker-error.log',
    out_file: './logs/worker-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

### Usar el archivo de configuración:
```bash
pm2 start ecosystem.config.js
```

---

## Opción 5: Usando systemd (Servicio del Sistema)

### Crear archivo de servicio:
```bash
sudo nano /etc/systemd/system/worker.service
```

### Contenido del archivo:
```ini
[Unit]
Description=Catch Influencer Worker
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/ruta/a/catch-influencer/back
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run start:worker
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Comandos para systemd:
```bash
# Recargar configuración de systemd
sudo systemctl daemon-reload

# Iniciar el servicio
sudo systemctl start worker

# Habilitar para que inicie al arrancar el sistema
sudo systemctl enable worker

# Ver estado
sudo systemctl status worker

# Ver logs
sudo journalctl -u worker -f

# Reiniciar
sudo systemctl restart worker

# Detener
sudo systemctl stop worker
```

---

## Verificación y Monitoreo

### Verificar que el proceso está corriendo:
```bash
# Ver procesos de Node
ps aux | grep node

# Ver procesos del worker específicamente
ps aux | grep "worker"

# Ver uso de recursos
top -p $(pgrep -f "worker")
```

### Ver logs:
```bash
# Si usas nohup
tail -f worker.log

# Si usas PM2
pm2 logs worker

# Si usas systemd
sudo journalctl -u worker -f
```

### Verificar puertos y conexiones:
```bash
# Ver conexiones activas
netstat -tulpn | grep node

# Ver procesos escuchando en puertos
lsof -i -P -n | grep node
```

---

## Recomendaciones

1. **Para desarrollo/testing**: Usa `screen` o `tmux`
2. **Para producción simple**: Usa `nohup` o `screen`
3. **Para producción robusta**: Usa **PM2** (recomendado)
4. **Para integración completa con el sistema**: Usa **systemd**

### PM2 es la mejor opción porque:
- ✅ Auto-restart si el proceso se cae
- ✅ Monitoreo de memoria y CPU
- ✅ Logs rotativos
- ✅ Fácil de usar
- ✅ Configuración persistente
- ✅ Cluster mode disponible

---

## Troubleshooting

### El worker se apaga después de cerrar la consola:
- Asegúrate de usar `nohup`, `screen`, `tmux`, `PM2` o `systemd`
- No ejecutes directamente con `npm run start:worker` sin uno de estos

### El worker consume mucha memoria:
- Configura `max_memory_restart` en PM2
- O usa `NODE_OPTIONS="--max-old-space-size=2048"` antes del comando

### El worker no inicia:
- Verifica que las variables de entorno estén configuradas
- Revisa los logs para errores
- Verifica que el puerto no esté en uso

### Verificar variables de entorno:
```bash
# Ver todas las variables
env

# Verificar una específica
echo $NODE_ENV
```
