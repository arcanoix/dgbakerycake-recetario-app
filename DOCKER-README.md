# 🐳 Guía de Docker para DG Bakery Cake

## Requisitos Previos
- Docker Desktop instalado
- Docker Compose instalado

## Comandos Principales

### 1. Construir la imagen Docker
```bash
docker-compose build
```

### 2. Iniciar el contenedor (primera vez)
```bash
docker-compose up
```

### 3. Iniciar en segundo plano
```bash
docker-compose up -d
```

### 4. Ver logs
```bash
docker-compose logs -f
```

### 5. Detener el contenedor
```bash
docker-compose down
```

### 6. Reconstruir y reiniciar
```bash
docker-compose down
docker-compose build
docker-compose up
```

## Ejecutar comandos dentro del contenedor

### Instalar una nueva dependencia
```bash
docker-compose exec app npm install <paquete>
```

### Ejecutar comandos npm
```bash
docker-compose exec app npm run <comando>
```

### Acceder al shell del contenedor
```bash
docker-compose exec app sh
```

## Acceso a la aplicación
Una vez iniciado el contenedor, la aplicación estará disponible en:
- **URL**: http://localhost:3000

## Solución de Problemas

### El contenedor no inicia
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Limpiar volúmenes
```bash
docker-compose down -v
```

### Ver contenedores activos
```bash
docker ps
```

### Ver todos los contenedores
```bash
docker ps -a
```
