import { initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const email = process.argv[2]
if (!email) {
  console.error("Usage: node --env-file=.env scripts/set-admin-claim.mjs admin@email.com")
  process.exit(1)
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
})

const user = await getAuth().getUserByEmail(email)
await getAuth().setCustomUserClaims(user.uid, { admin: true })
console.log(`${email} is now an admin. Sign out and back in for it to take effect.`)