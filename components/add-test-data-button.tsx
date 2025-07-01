"use client"

import { useState } from "react"
import { db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"

const testUsers = [
  { uid: "test_1", name: "Alice Johnson", email: "alice@company.com", score: 18 },
  { uid: "test_2", name: "Bob Smith", email: "bob@company.com", score: 15 },
  { uid: "test_3", name: "Carol Davis", email: "carol@company.com", score: 22 },
  { uid: "test_4", name: "David Wilson", email: "david@company.com", score: 8 },
  { uid: "test_5", name: "Emma Brown", email: "emma@company.com", score: 12 },
]

export default function AddTestDataButton() {
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState("")

  const addTestData = async () => {
    setIsAdding(true)
    setMessage("Adding test data...")

    try {
      const today = new Date().toISOString().split("T")[0]

      for (const user of testUsers) {
        const docId = `${user.uid}_${today}`
        await setDoc(doc(db, "scores", docId), {
          uid: user.uid,
          name: user.name,
          email: user.email,
          score: user.score,
          date: today,
        })
      }

      setMessage("✅ Test data added! Check the leaderboard.")
    } catch (error) {
      console.error("Error adding test data:", error)
      setMessage("❌ Error adding test data. Check console.")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div style={{ margin: "1rem 0" }}>
      <button
        onClick={addTestData}
        disabled={isAdding}
        style={{
          backgroundColor: "#b88c9e",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          cursor: isAdding ? "not-allowed" : "pointer",
          opacity: isAdding ? 0.6 : 1,
        }}
      >
        {isAdding ? "Adding..." : "Add Test Data"}
      </button>
      {message && <p style={{ color: "white", fontSize: "0.9rem", marginTop: "0.5rem" }}>{message}</p>}
    </div>
  )
}
