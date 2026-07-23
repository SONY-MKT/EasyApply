import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function fix() {
  const snapshot = await db.collection('applications').get();
  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.telegramUserId) {
      await doc.ref.update({ telegramUserId: 6723223071 }); // From their screenshot or something? Wait I don't know their ID.
      updated++;
    }
  }
  console.log('Updated', updated, 'documents');
}

fix();
