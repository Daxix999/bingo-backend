# 📤 SUBIR TU PROYECTO COMPLETO A GITHUB

Guía paso a paso para subir todo lo que tienes en tu PC al repositorio de GitHub, reemplazando lo que esté ahí.

---

## 🎯 OBJETIVO

Subir **TODOS** los archivos de tu carpeta local a GitHub, reemplazando cualquier archivo que ya exista.

---

## ✅ PASO 1: ABRIR POWERSHELL

1. Presiona `Windows + X`
2. Selecciona **"Windows PowerShell"** o **"Terminal"**
3. Se abrirá una ventana negra

---

## 📂 PASO 2: NAVEGAR A TU CARPETA

Copia y pega este comando (ajusta la ruta si es diferente):

```powershell
cd "C:\Users\nuevoadmin\Desktop\Estructura del poyecto de bingo"
```

Presiona **Enter**.

**Verifica que estás en la carpeta correcta:**
```powershell
dir
```

Deberías ver tus carpetas: `backend`, `frontend`, `database`, etc.

---

## 🔧 PASO 3: VERIFICAR SI GIT ESTÁ INICIALIZADO

Ejecuta:

```powershell
git status
```

### Si ves: "fatal: not a git repository"

Significa que Git no está inicializado. Ejecuta:

```powershell
git init
```

### Si ves una lista de archivos

Significa que Git ya está inicializado. ✅ Continúa al siguiente paso.

---

## 🔗 PASO 4: CONECTAR CON GITHUB

Ejecuta este comando para conectar tu carpeta local con GitHub:

```powershell
git remote add origin https://github.com/Daxix999/bingo-backend.git
```

**Si te dice "remote origin already exists":**

Elimina el remoto anterior y agrégalo de nuevo:

```powershell
git remote remove origin
git remote add origin https://github.com/Daxix999/bingo-backend.git
```

**Verifica que se conectó correctamente:**

```powershell
git remote -v
```

Deberías ver:
```
origin  https://github.com/Daxix999/bingo-backend.git (fetch)
origin  https://github.com/Daxix999/bingo-backend.git (push)
```

---

## 📝 PASO 5: CONFIGURAR GIT (SOLO LA PRIMERA VEZ)

Si es la primera vez que usas Git en esta PC, configura tu nombre y email:

```powershell
git config --global user.name "Daxix999"
git config --global user.email "tu-email@gmail.com"
```

**Reemplaza `tu-email@gmail.com` con tu email real.**

---

## 📤 PASO 6: AGREGAR TODOS LOS ARCHIVOS

Este comando agrega **TODOS** los archivos de tu carpeta:

```powershell
git add .
```

**Espera unos segundos** mientras Git procesa los archivos.

**Verifica qué archivos se agregaron:**

```powershell
git status
```

Deberías ver una lista de archivos en verde que dice "Changes to be committed".

---

## 💾 PASO 7: GUARDAR LOS CAMBIOS (COMMIT)

Ejecuta:

```powershell
git commit -m "Actualización completa del proyecto desde PC local"
```

**Espera unos segundos** mientras Git guarda los cambios.

---

## 🚀 PASO 8: SUBIR A GITHUB (FORZAR SI ES NECESARIO)

### Opción A: Si es la primera vez o quieres reemplazar todo

```powershell
git push -u origin main --force
```

**⚠️ IMPORTANTE:** El `--force` reemplaza TODO lo que esté en GitHub con lo de tu PC.

### Opción B: Si ya tienes contenido y quieres fusionarlo

```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 🔐 PASO 9: AUTENTICACIÓN

Cuando ejecutes `git push`, te pedirá:

1. **Username:** `Daxix999`
2. **Password:** Aquí NO pongas tu contraseña de GitHub

**Necesitas un Personal Access Token:**

### Cómo crear el token:

1. Ve a: https://github.com/settings/tokens
2. Haz clic en **"Generate new token"** → **"Generate new token (classic)"**
3. Dale un nombre: `Mi PC - Bingo Project`
4. Selecciona el scope: **repo** (marca toda la casilla)
5. Haz clic en **"Generate token"** al final
6. **COPIA EL TOKEN** (solo se muestra una vez, algo como: `ghp_xxxxxxxxxxxxx`)
7. Cuando Git te pida contraseña, **pega este token**

---

## ✅ VERIFICACIÓN

Después de `git push`, deberías ver:

```
Enumerating objects: XX
Counting objects: 100% (XX/XX)
Writing objects: 100% (XX/XX)
To https://github.com/Daxix999/bingo-backend.git
 * [new branch]      main -> main
```

**Verifica en GitHub:**
1. Ve a: https://github.com/Daxix999/bingo-backend
2. Refresca la página (F5)
3. Deberías ver todos tus archivos y carpetas

---

## 🔄 ACTUALIZAR EN EL FUTURO

Cada vez que hagas cambios en tu PC y quieras subirlos a GitHub:

```powershell
# 1. Ir a tu carpeta (si no estás ahí)
cd "C:\Users\nuevoadmin\Desktop\Estructura del poyecto de bingo"

# 2. Agregar todos los cambios
git add .

# 3. Guardar con un mensaje descriptivo
git commit -m "Descripción de los cambios que hiciste"

# 4. Subir a GitHub
git push
```

**Ejemplo:**
```powershell
git add .
git commit -m "Arreglado error de Netlify y agregado sistema de créditos"
git push
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "fatal: not a git repository"

**Solución:**
```powershell
git init
```

### ❌ Error: "remote origin already exists"

**Solución:**
```powershell
git remote remove origin
git remote add origin https://github.com/Daxix999/bingo-backend.git
```

### ❌ Error: "authentication failed"

**Solución:** Usa un Personal Access Token en lugar de tu contraseña (ver Paso 9)

### ❌ Error: "failed to push some refs"

**Solución:** Forza el push:
```powershell
git push -u origin main --force
```

### ❌ Error: "Please tell me who you are"

**Solución:** Configura tu nombre y email:
```powershell
git config --global user.name "Daxix999"
git config --global user.email "tu-email@gmail.com"
```

---

## 📋 COMANDOS COMPLETOS (COPIA Y PEGA TODO)

Si quieres hacerlo todo de una vez, copia y pega estos comandos en orden:

```powershell
# 1. Ir a tu carpeta
cd "C:\Users\nuevoadmin\Desktop\Estructura del poyecto de bingo"

# 2. Inicializar Git (si no está inicializado)
git init

# 3. Configurar usuario (solo primera vez)
git config --global user.name "Daxix999"
git config --global user.email "tu-email@gmail.com"

# 4. Conectar con GitHub
git remote remove origin
git remote add origin https://github.com/Daxix999/bingo-backend.git

# 5. Agregar todos los archivos
git add .

# 6. Guardar cambios
git commit -m "Actualización completa del proyecto desde PC local"

# 7. Subir a GitHub (fuerza si es necesario)
git push -u origin main --force
```

**⚠️ IMPORTANTE:** 
- Reemplaza `tu-email@gmail.com` con tu email real
- Cuando te pida contraseña, usa el Personal Access Token

---

## ✅ CHECKLIST

- [ ] PowerShell abierto
- [ ] Navegado a la carpeta correcta
- [ ] Git inicializado (`git init`)
- [ ] Remoto conectado (`git remote add origin`)
- [ ] Usuario configurado (`git config`)
- [ ] Archivos agregados (`git add .`)
- [ ] Cambios guardados (`git commit`)
- [ ] Personal Access Token creado
- [ ] Código subido (`git push`)
- [ ] Verificado en GitHub que los archivos están ahí

---

## 🎯 RESULTADO ESPERADO

Después de seguir estos pasos:

✅ Todos tus archivos locales estarán en GitHub  
✅ Cualquier archivo que exista en GitHub será reemplazado  
✅ Tu repositorio estará 100% actualizado con tu PC  
✅ Netlify y Render se actualizarán automáticamente  

---

¡Con esto tendrás tu proyecto completamente sincronizado! 🚀

