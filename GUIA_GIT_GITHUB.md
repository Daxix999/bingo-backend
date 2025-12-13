# 🔄 GUÍA PARA CONECTAR TU PROYECTO CON GITHUB

Esta guía te explica cómo conectar tu proyecto local con GitHub para que los cambios se sincronicen automáticamente.

---

## 📋 PREREQUISITOS

1. ✅ Tener Git instalado en tu PC
2. ✅ Tener una cuenta en GitHub
3. ✅ Tener tu proyecto en tu PC

---

## 🚀 PASO 1: VERIFICAR SI GIT ESTÁ INSTALADO

Abre PowerShell o Terminal y ejecuta:

```bash
git --version
```

Si te muestra una versión (ej: `git version 2.40.0`), está instalado. ✅

Si no está instalado, descárgalo de: https://git-scm.com/download/win

---

## 🔧 PASO 2: INICIALIZAR GIT EN TU PROYECTO

1. Abre PowerShell o Terminal
2. Navega a la carpeta de tu proyecto:

```bash
cd "C:\Users\nuevoadmin\Desktop\Estructura del poyecto de bingo"
```

3. Inicializa Git:

```bash
git init
```

4. Verifica que se creó la carpeta `.git` (está oculta, pero Git la creó)

---

## 📝 PASO 3: CONFIGURAR GIT (SOLO LA PRIMERA VEZ)

Configura tu nombre y email (solo una vez):

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@gmail.com"
```

**Ejemplo:**
```bash
git config --global user.name "Juan"
git config --global user.email "juan@gmail.com"
```

---

## 🔗 PASO 4: CONECTAR CON TU REPOSITORIO DE GITHUB

Tu repositorio ya existe en: https://github.com/Daxix999/bingo-backend

### Opción A: Si el repositorio está vacío o quieres reemplazarlo

1. Agrega el repositorio remoto:

```bash
git remote add origin https://github.com/Daxix999/bingo-backend.git
```

2. Verifica que se agregó correctamente:

```bash
git remote -v
```

Deberías ver:
```
origin  https://github.com/Daxix999/bingo-backend.git (fetch)
origin  https://github.com/Daxix999/bingo-backend.git (push)
```

### Opción B: Si el repositorio ya tiene contenido

1. Primero, descarga el contenido existente:

```bash
git remote add origin https://github.com/Daxix999/bingo-backend.git
git fetch origin
git branch -M main
git pull origin main --allow-unrelated-histories
```

Esto fusionará tu código local con el de GitHub.

---

## 📤 PASO 5: AGREGAR Y SUBIR TUS ARCHIVOS

### 5.1 Agregar todos los archivos

```bash
git add .
```

Esto agrega todos los archivos nuevos y modificados.

### 5.2 Hacer commit (guardar cambios)

```bash
git commit -m "Primera subida del proyecto completo"
```

**Nota:** Puedes cambiar el mensaje por lo que quieras, por ejemplo:
- `"Arreglos para Netlify y Render"`
- `"Agregado sistema de créditos"`
- `"Configuración de base de datos"`

### 5.3 Subir a GitHub

```bash
git push -u origin main
```

**Si te pide usuario y contraseña:**
- Usuario: `Daxix999`
- Contraseña: Usa un **Personal Access Token** (ver abajo cómo crearlo)

---

## 🔐 CREAR PERSONAL ACCESS TOKEN (Si te pide contraseña)

GitHub ya no acepta contraseñas normales, necesitas un token:

1. Ve a GitHub.com → Tu perfil → **Settings**
2. En el menú lateral, ve a **Developer settings**
3. Haz clic en **Personal access tokens** → **Tokens (classic)**
4. Haz clic en **Generate new token** → **Generate new token (classic)**
5. Dale un nombre: `Mi PC - Bingo Project`
6. Selecciona el scope: **repo** (marca la casilla completa)
7. Haz clic en **Generate token**
8. **COPIA EL TOKEN INMEDIATAMENTE** (solo se muestra una vez)
9. Cuando Git te pida contraseña, pega este token en lugar de tu contraseña

---

## 🔄 PASO 6: ACTUALIZAR CAMBIOS EN EL FUTURO

Cada vez que hagas cambios y quieras subirlos a GitHub:

```bash
# 1. Ver qué archivos cambiaron
git status

# 2. Agregar los cambios
git add .

# 3. Guardar los cambios con un mensaje
git commit -m "Descripción de los cambios"

# 4. Subir a GitHub
git push
```

**Ejemplo completo:**
```bash
git add .
git commit -m "Arreglado error de Netlify y actualizada configuración"
git push
```

---

## 📥 PASO 7: BAJAR CAMBIOS DE GITHUB

Si haces cambios en otra PC o alguien más sube cambios:

```bash
git pull
```

Esto descarga y fusiona los cambios automáticamente.

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "fatal: not a git repository"

**Solución:** Asegúrate de estar en la carpeta correcta y ejecuta `git init`

### ❌ Error: "remote origin already exists"

**Solución:** Elimina el remoto y agrégalo de nuevo:
```bash
git remote remove origin
git remote add origin https://github.com/Daxix999/bingo-backend.git
```

### ❌ Error: "failed to push some refs"

**Solución:** Primero baja los cambios:
```bash
git pull origin main --allow-unrelated-histories
git push
```

### ❌ Error: "authentication failed"

**Solución:** Usa un Personal Access Token en lugar de tu contraseña (ver arriba)

---

## ✅ CHECKLIST

- [ ] Git instalado y configurado
- [ ] Repositorio inicializado (`git init`)
- [ ] Remoto agregado (`git remote add origin`)
- [ ] Archivos agregados (`git add .`)
- [ ] Primer commit hecho (`git commit`)
- [ ] Código subido a GitHub (`git push`)
- [ ] Personal Access Token creado (si es necesario)

---

## 📚 COMANDOS ÚTILES

```bash
# Ver estado de los archivos
git status

# Ver historial de commits
git log

# Ver qué archivos cambiaron
git diff

# Deshacer cambios en un archivo
git checkout -- nombre-archivo.js

# Ver ramas
git branch

# Crear nueva rama
git branch nombre-rama

# Cambiar de rama
git checkout nombre-rama
```

---

## 🎯 FLUJO DE TRABAJO RECOMENDADO

1. **Hacer cambios** en tu código
2. **Verificar cambios:** `git status`
3. **Agregar cambios:** `git add .`
4. **Guardar cambios:** `git commit -m "mensaje descriptivo"`
5. **Subir a GitHub:** `git push`
6. **Netlify/Render se actualizan automáticamente** (si están conectados)

---

¡Con esto tendrás tu proyecto sincronizado con GitHub! 🚀

