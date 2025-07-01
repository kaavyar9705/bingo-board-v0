import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc, collection, getDocs } from "firebase/firestore"

// Firebase config (same as in your app)
const firebaseConfig = {
  apiKey: "AIzaSyAOcKUqJoEmQe1OfI8qiFlg--SDKS_IlXM",
  authDomain: "bingo-board-9d1a3.firebaseapp.com",
  projectId: "bingo-board-9d1a3",
  storageBucket: "bingo-board-9d1a3.firebasestorage.app",
  messagingSenderId: "434433857836",
  appId: "1:434433857836:web:b5699b5c34aa8722d13489",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Test users with different scores
const testUsers = [
  {
    uid: "test_user_1",
    name: "Alice Johnson",
    email: "alice.johnson@company.com",
    score: 18,
  },
  {
    uid: "test_user_2",
    name: "Bob Smith",
    email: "bob.smith@company.com",
    score: 15,
  },
  {
    uid: "test_user_3",
    name: "Carol Davis",
    email: "carol.davis@company.com",
    score: 22,
  },
  {
    uid: "test_user_4",
    name: "David Wilson",
    email: "david.wilson@company.com",
    score: 8,
  },
  {
    uid: "test_user_5",
    name: "Emma Brown",
    email: "emma.brown@company.com",
    score: 12,
  },
]

async function addTestData() {
  console.log("🎯 Starting test data addition...")

  // Get today's date in yyyy-MM-dd format
  const today = new Date().toISOString().split("T")[0]
  console.log(`📅 Today's date: ${today}`)

  try {
    // First, let's check if we can connect to Firestore
    console.log("🔍 Testing Firestore connection...")

    // Try to read existing scores to test connection
    const scoresRef = collection(db, "scores")
    const snapshot = await getDocs(scoresRef)
    console.log(`✅ Connected! Found ${snapshot.size} existing score documents`)

    // Add each test user
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i]
      const docId = `${user.uid}_${today}`

      console.log(`📝 Adding user ${i + 1}/${testUsers.length}: ${user.name}`)

      const scoreData = {
        uid: user.uid,
        name: user.name,
        email: user.email,
        score: user.score,
        date: today,
      }

      await setDoc(doc(db, "scores", docId), scoreData)
      console.log(`✅ Successfully added ${user.name} with score ${user.score}`)
    }

    console.log("🎉 All test data added successfully!")
    console.log("🏆 Go to /leaderboard to see the results!")

    // Verify the data was added
    console.log("🔍 Verifying data was added...")
    const newSnapshot = await getDocs(scoresRef)
    console.log(`📊 Total documents now: ${newSnapshot.size}`)
  } catch (error) {
    console.error("❌ Error occurred:", error)
    console.error("Error details:", error.message)

    if (error.code) {
      console.error("Error code:", error.code)
    }
  }
}

// Run the script
addTestData()
