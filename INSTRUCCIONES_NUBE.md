# Guía de Configuración: Base de Datos en la Nube (Firebase) ☁️

Para hacer que tu sistema de inventario **Soleh** guarde sus datos en la nube y puedas abrirlo y verlo actualizado desde cualquier dispositivo o lugar del mundo, sigue estos sencillos pasos para configurar una base de datos gratuita en Firebase.

---

## Paso 1: Crear tu Proyecto en Firebase (Gratis)
1. Ve a la consola de Firebase: [https://console.firebase.google.com/](https://console.firebase.google.com/) e inicia sesión con tu cuenta de Google.
2. Haz clic en **"Agregar proyecto"** (o "Crear un proyecto").
3. Escribe el nombre de tu proyecto (por ejemplo: `soleh-inventario`).
4. Haz clic en **"Continuar"**.
5. Desactiva la opción de *Google Analytics* (no es necesaria para este sistema) y haz clic en **"Crear proyecto"**.
6. Espera unos segundos a que se cree el proyecto y haz clic en **"Continuar"**.

---

## Paso 2: Crear la Base de Datos de Firestore
1. En el menú de la izquierda, haz clic en **"Build"** (Construir) y selecciona **"Firestore Database"**.
2. Haz clic en el botón **"Crear base de datos"** (Create database).
3. Selecciona la ubicación de tu base de datos (puedes dejar la que viene por defecto, ej. `nam5 (us-central)`) y haz clic en **"Siguiente"**.
4. Selecciona **"Iniciar en modo de prueba"** (esto habilitará los permisos de lectura y escritura iniciales) y haz clic en **"Crear"**.

---

## Paso 3: Configurar las Reglas de Acceso (Importante)
Para que el sistema de inventario pueda guardar y cargar los datos directamente desde tu página web sin requerir contraseñas complejas ni servidores intermedios, necesitamos asegurarnos de que la base de datos permita lectura y escritura pública protegida por tu ID secreto:

1. Dentro de **Firestore Database**, ve a la pestaña **"Reglas"** (Rules) en la parte superior.
2. Reemplaza el código existente por las siguientes reglas básicas de acceso público:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Haz clic en el botón **"Publicar"** (Publish) en la parte superior derecha para guardar los cambios.
*(Nota: Tus datos están protegidos porque el identificador único de tu documento actúa como una llave secreta que solo tú conoces).*

---

## Paso 4: Conectar tu Inventario a la Nube (2 opciones)

### Opción A: Desde la propia Página Web (Recomendado y más rápido)
1. Abre tu sistema de inventario (ya sea localmente con `iniciar.bat` o desde tu página web ya subida).
2. Verás un nuevo indicador en la parte superior derecha al lado de "Reiniciar Caja" que dice **"Modo Local"** con un círculo gris.
3. Haz clic en el icono de **Configuración (engranaje ⚙️)** al lado del indicador.
4. En el modal que se abre:
   - **Firebase Project ID**: Pega el ID de tu proyecto de Firebase. Lo puedes encontrar en la URL de tu consola de Firebase o en la configuración del proyecto (por ejemplo: `soleh-inventario-12345`).
   - **ID Secreto**: Haz clic en el botón **"Generar Nuevo"** para crear un ID secreto único (llave) o escribe uno propio. *¡Copia este ID y guárdalo en tus notas para no perderlo!*
5. Haz clic en **"Subir mis Datos Locales a la Nube 📤"** para migrar instantáneamente todos los productos, ventas y gastos que ya tenías guardados en este navegador a tu base de datos en la nube.
6. Haz clic en **"Guardar Configuración"**.
7. ¡Listo! El indicador cambiará a 🟢 **"Nube Activa"**. Ahora cualquier cambio que realices se guardará automáticamente en la nube.

---

### Opción B: Mediante Variables de Entorno (Para despliegue definitivo)
Si deseas que la página web ya venga configurada por defecto y no tengas que introducir las credenciales cuando la abras en un dispositivo nuevo:
1. Abre el archivo `.env.local` y `.env.production` en la carpeta de tu proyecto.
2. Rellena las variables con tus datos:
   ```env
   VITE_FIREBASE_PROJECT_ID=tu-proyecto-id-aqui
   VITE_INVENTORY_SECRET_ID=tu-id-secreto-generado-aqui
   ```
3. Vuelve a construir el proyecto (`npm run build`) y sube la carpeta `dist` a tu hosting. La web se conectará automáticamente a tu nube.
