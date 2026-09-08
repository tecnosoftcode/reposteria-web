// backend/src/config/firebase.js
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');

console.log('📦 Inicializando Firebase Admin...');

// Función para inicializar Firebase
function initFirebase() {
  try {
    // Si ya está inicializado
    if (getApps().length > 0) {
      console.log('ℹ️ Firebase Admin ya estaba inicializado');
      return;
    }

    // Opción 1: Desde variable de entorno Base64
    const base64Credentials = process.env.FIREBASE_CREDENTIALS_BASE64;
    if (base64Credentials) {
      try {
        const credentialsJSON = Buffer.from(base64Credentials, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(credentialsJSON);
        
        initializeApp({
          credential: cert(serviceAccount)
        });
        console.log('✅ Firebase Admin inicializado desde Base64');
        return;
      } catch (error) {
        console.log('⚠️ Falló inicialización desde Base64:', error.message);
      }
    }

    // Opción 2: Desde archivo JSON
    const jsonPath = path.join(__dirname, '../../firebase-service-account.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        initializeApp({
          credential: cert(serviceAccount)
        });
        console.log('✅ Firebase Admin inicializado desde archivo JSON');
        return;
      } catch (error) {
        console.log('⚠️ Falló inicialización desde JSON:', error.message);
      }
    }

    // Opción 3: Usar variables de entorno individuales
    if (process.env.FIREBASE_PROJECT_ID && 
        process.env.FIREBASE_PRIVATE_KEY && 
        process.env.FIREBASE_CLIENT_EMAIL) {
      try {
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          })
        });
        console.log('✅ Firebase Admin inicializado desde variables de entorno');
        return;
      } catch (error) {
        console.log('⚠️ Falló inicialización desde variables:', error.message);
      }
    }

    console.error('❌ No se pudo inicializar Firebase Admin');
    return;
  } catch (error) {
    console.error('❌ Error inicializando Firebase Admin:', error.message);
    return;
  }
}

// Inicializar y exportar
initFirebase();

// Si no se pudo inicializar, exportar null
const admin = {
  getAuth,
  apps: getApps()
};

if (getApps().length > 0) {
  module.exports = admin;
} else {
  console.error('❌ Firebase Admin no disponible');
  module.exports = null;
}