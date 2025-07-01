import { db } from "../lib/firebase.js"
import { doc, setDoc } from "firebase/firestore"

// Test users with different scores for today's leaderboard
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
  {
    uid: "test_user_6",
    name: "Frank Miller",
    email: "frank.miller@company.com",
    score: 20,
  },
  {
    uid: "test_user_7",
    name: "Grace Lee",
    email: "grace.lee@company.com",
    score: 6,
  },
  {
    uid: "test_user_8",
    name: "Henry Taylor",
    email: "henry.taylor@company.com",
    score: 14,
  },
]

async function addTestData() {
  console.log("🎯 Adding test data to leaderboard...")

  // Get today's date in the same format used by the app
  const today = new Date().toISOString().split("T")[0] // yyyy-MM-dd format

  try {
    // Add each test user to Firestore
    for (const user of testUsers) {
      const docId = `${user.uid}_${today}`

      await setDoc(doc(db, "scores", docId), {
        uid: user.uid,
        name: user.name,
        email: user.email,
        score: user.score,
        date: today,
      })

      console.log(`✅ Added ${user.name} with score ${user.score}`)
    }

    console.log("🎉 Test data added successfully!")
    console.log(`📅 Date: ${today}`)
    console.log("🏆 Check your leaderboard page to see the results!")
  } catch (error) {
    console.error("❌ Error adding test data:", error)
  }
}

// Run the script
addTestData()
