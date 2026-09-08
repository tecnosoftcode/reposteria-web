// backend/src/config/firebase.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('📦 Inicializando Firebase Admin...');

// Función para inicializar Firebase
function initFirebase() {
  try {
    // Si ya está inicializado
    if (admin.apps && admin.apps.length > 0) {
      console.log('ℹ️ Firebase Admin ya estaba inicializado');
      return admin;
    }

    // Opción 1: Desde variable de entorno Base64
    const base64Credentials = process.env.FIREBASE_CREDENTIALS_BASE64;
    if (base64Credentials) {
      try {
        const credentialsJSON = Buffer.from(base64Credentials, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(credentialsJSON);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin inicializado desde Base64');
        return admin;
      } catch (error) {
        console.log('⚠️ Falló inicialización desde Base64:', error.message);
      }
    }

    // Opción 2: Desde archivo JSON
    const jsonPath = path.join(__dirname, '../../firebase-service-account.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin inicializado desde archivo JSON');
        return admin;
      } catch (error) {
        console.log('⚠️ Falló inicialización desde JSON:', error.message);
      }
    }

    // Opción 3: Usar variables de entorno individuales
    if (process.env.FIREBASE_PROJECT_ID && 
        process.env.FIREBASE_PRIVATE_KEY && 
        process.env.FIREBASE_CLIENT_EMAIL) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          })
        });
        console.log('✅ Firebase Admin inicializado desde variables de entorno');
        return admin;
      } catch (error) {
        console.log('⚠️ Falló inicialización desde variables:', error.message);
      }
    }

    console.error('❌ No se pudo inicializar Firebase Admin');
    return null;
  } catch (error) {
    console.error('❌ Error inicializando Firebase Admin:', error.message);
    return null;
  }
}

// Inicializar y exportar
const firebaseAdmin = initFirebase();

// Si no se pudo inicializar, exportar null
if (!firebaseAdmin) {
  console.error('❌ Firebase Admin no disponible');
  module.exports = null;
} else {
  module.exports = firebaseAdmin;
}