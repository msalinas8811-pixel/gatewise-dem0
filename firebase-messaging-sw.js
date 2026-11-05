/* GateWise · notificaciones push en segundo plano (Firebase Cloud Messaging) */
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js');
self.window = self; // config.js escribe en window
importScripts('config.js');
if (self.GATEWISE_FIREBASE_PROD && !/PEGAR/.test(self.GATEWISE_FIREBASE_PROD.apiKey)) {
  firebase.initializeApp(self.GATEWISE_FIREBASE_PROD);
  // El servidor envía "notification", así que Firebase muestra el aviso solo (sin duplicarlo aquí)
  firebase.messaging();
}
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => { for (const c of l) { if ('focus' in c) return c.focus(); } return clients.openWindow('./'); }));
});
