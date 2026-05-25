// Importar las funciones de Firebase (SDK Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, // <-- NUEVA FUNCIÓN IMPORTADA
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// TODO: Reemplaza esto con tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCqFOBzYQ71zv6vH0kdculIZQG-MdsqvRA",
    authDomain: "plataforma-calendario-ced.firebaseapp.com",
    projectId: "plataforma-calendario-ced",
    storageBucket: "plataforma-calendario-ced.firebasestorage.app",
    messagingSenderId: "441085748046",
    appId: "1:441085748046:web:c3fdef671885835c73b41f",
    measurementId: "G-9XDKT7XEQD"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const providerGoogle = new GoogleAuthProvider();

// Referencias del DOM
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const btnGoogle = document.getElementById('btn-google');
const mensaje = document.getElementById('mensaje');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Función auxiliar para validar campos vacíos
function validarCampos() {
    if(!emailInput.value || !passwordInput.value) {
        mensaje.style.color = "red";
        mensaje.textContent = "Por favor, ingresa correo y contraseña.";
        return false;
    }
    return true;
}

// 1. Iniciar sesión con Correo y Contraseña
btnLogin.addEventListener('click', () => {
    if(!validarCampos()) return;

    signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
        .then((userCredential) => {
            mensaje.style.color = "green";
            mensaje.textContent = `¡Bienvenido de nuevo, ${userCredential.user.email}!`;
            // Redirigir: window.location.href = "dashboard.html";
        })
        .catch((error) => {
            mensaje.style.color = "red";
            mensaje.textContent = `Error al entrar: ${error.message}`;
        });
});

// 2. REGISTRO de nuevo usuario
btnRegister.addEventListener('click', () => {
    if(!validarCampos()) return;

    createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
        .then((userCredential) => {
            mensaje.style.color = "green";
            mensaje.textContent = `¡Cuenta creada con éxito! Hola, ${userCredential.user.email}`;
            // Firebase inicia sesión automáticamente tras el registro exitoso
            // Redirigir: window.location.href = "dashboard.html";
        })
        .catch((error) => {
            mensaje.style.color = "red";
            // Manejar errores comunes como contraseñas cortas o correos ya en uso
            if(error.code === 'auth/email-already-in-use') {
                mensaje.textContent = "Este correo ya está registrado.";
            } else if(error.code === 'auth/weak-password') {
                mensaje.textContent = "La contraseña debe tener al menos 6 caracteres.";
            } else {
                mensaje.textContent = `Error al registrar: ${error.message}`;
            }
        });
});

// 3. Iniciar sesión o Registrarse con Google
btnGoogle.addEventListener('click', () => {
    signInWithPopup(auth, providerGoogle)
        .then((result) => {
            mensaje.style.color = "green";
            mensaje.textContent = `¡Hola, ${result.user.displayName}!`;
            window.location.href = "main.html";
            // Redirigir: window.location.href = "dashboard.html";
        })
        .catch((error) => {
            mensaje.style.color = "red";
            mensaje.textContent = `Error de Google: ${error.message}`;
        });
});