import * as admin from 'firebase-admin';

import serviceAccount from '../../firebase-service-account.json';

export const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});
