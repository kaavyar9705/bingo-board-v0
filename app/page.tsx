"use client"

import { useState, useEffect, useMemo } from "react"
import BingoSquare from "@/components/bingo-square"
import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from "@/lib/firebase"
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { format } from "date-fns"
import confetti from "canvas-confetti"
import Link from "next/link"

const phrases = [
  "Game Changer",
  "Hit the ground running",
  "Bandwidth",
  "Best Practices",
  "Touch Base",
  "Drill Down",
  "GNOSC",
  "Deep Dive",
  "Value-Add",
  "Take Offline",
  "Push the Envelope",
  "Move the Needle",
  "Quick Win",
  "Align Stakeholders",
  "Synergy",
  "Holistic View",
  "Circle Back",
  "Ping Me",
  "Streamline Efforts",
  "Bear With Me",
  "Low-Hanging Fruit",
  "Actionable Insights",
  "GAN",
  "Think Outside the Box",
  "Hit the Ground Running"
];


// Deterministic shuffle based on a seed (user ID + date)
function seededShuffle(array: string[], seed: string): string[] {
  const shuffled = [...array]
  let hash = 0

  // Create a simple hash from the seed
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Use the hash to seed a pseudo-random shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280
    const j = Math.floor((hash / 233280) * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [bingo, setBingo] = useState(false)
  const [boardLoaded, setBoardLoaded] = useState(false)
  const [savedBoard, setSavedBoard] = useState<string[] | null>(null)

  const today = format(new Date(), "yyyy-MM-dd")

  // Generate board based on user ID and date (deterministic)
  const board = useMemo(() => {
  if (!user) return []

  // Only use saved board if it's complete
  if (savedBoard && savedBoard.length === 25) {
    return savedBoard
  }

  // Generate new board if saved one is missing or invalid
  const seed = `${user.uid}_${today}`
  const shuffledPhrases = seededShuffle(phrases, seed)
const safePhrases = phrases// ensures length
const newBoard = [
  ...safePhrases.slice(0, 12),
  "LOGO_PLACEHOLDER",
  ...safePhrases.slice(12, 24),
]


  console.log("Generated new board for", user.displayName, "on", today, "- Board length:", newBoard.length)
  return newBoard
}, [user, today, savedBoard])


  const [markedSquares, setMarkedSquares] = useState(() => {
    return Array(25)
      .fill(false)
      .map((_, i) => i === 12) // Center square always marked
  })

  // Load existing board and progress when user signs in
  useEffect(() => {
    if (!user || boardLoaded) return

    const loadExistingBoard = async () => {
      try {
        const docId = `${user.uid}_${today}`
        const docRef = doc(db, "scores", docId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          console.log("Loaded existing board data:", data)

          if (data.board) {
            setSavedBoard(data.board)
          }

          if (data.markedSquares) {
            setMarkedSquares(data.markedSquares)
          }
        } else {
          console.log("No existing board found, will create new one")
        }
      } catch (error) {
        console.error("Error loading existing board:", error)
      } finally {
        setBoardLoaded(true)
      }
    }

    loadExistingBoard()
  }, [user, today, boardLoaded])
  useEffect(() => {
  if (!user || !boardLoaded) return;

  const docId = `${user.uid}_${today}`;
  const isValidBoard = board.length === 25 && !board.includes(undefined);

  const cleanedBoard = board.map((p) => p ?? "MISSING");

  const newScore = markedSquares.filter((m, i) => m && i !== 12).length;

  const userData = {
    uid: user.uid,
    name: user.displayName ?? user.email?.split("@")[0] ?? "Anonymous",
    email: user.email ?? "no-email@example.com",
    score: newScore,
    date: today,
    board: cleanedBoard,
    markedSquares,
    lastUpdated: new Date().toISOString(),
  };

  if (isValidBoard) {
    setDoc(doc(db, "scores", docId), userData)
      .then(() => console.log("✅ Score and board saved"))
      .catch((error) => console.error("❌ Error saving score:", error));
  } else {
    console.warn("⚠️ Board is invalid, not saving to Firestore");
  }
}, [markedSquares, user, board, today, boardLoaded]);

  // Save to localStorage as backup
  useEffect(() => {
    if (!user || !boardLoaded) return

    const storageKey = `markedSquares_${user.uid}_${today}`
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(markedSquares))
    }
  }, [markedSquares, user, today, boardLoaded])

  const handleSquareClick = (index: number) => {
    if (index === 12) return
    setMarkedSquares((prev) => {
      const updated = [...prev]
      updated[index] = !updated[index]
      if (checkBingo(updated)) {
        confetti({ spread: 100, origin: { y: 0.6 } })
        setBingo(true)
      }
      return updated
    })
  }

  const handleLogin = () => {
    // Check if we're in a potentially problematic environment
    const isEmbeddedWebview = /wv|WebView|(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent)
    const isInAppBrowser = /FBAN|FBAV|Instagram|Twitter|Line|WhatsApp/i.test(navigator.userAgent)

    if (isEmbeddedWebview || isInAppBrowser) {
      alert(
        [
          "⚠️ Google sign-in may not work in this browser.",
          "",
          "For the best experience, please:",
          "• Open this link in Safari (iOS) or Chrome (Android)",
          "• Copy the URL and paste it in your main browser",
          "",
          "This is due to Google's security policies for embedded browsers.",
        ].join("\n"),
      )
    }

    signInWithPopup(auth, provider).catch((error: any) => {
      if (error.code === "auth/unauthorized-domain") {
        alert(
          [
            "⚠️ Google sign-in is blocked for this host.",
            "",
            "Add the current preview domain to:",
            "Firebase Console → Authentication → Settings → Authorized domains",
            "",
            `Hostname detected: ${window.location.hostname}`,
          ].join("\n"),
        )
      } else if (error.code === "auth/popup-blocked") {
        alert(
          [
            "⚠️ Pop-up was blocked by your browser.",
            "",
            "Please:",
            "• Allow pop-ups for this site",
            "• Try again after enabling pop-ups",
          ].join("\n"),
        )
      } else if (error.code === "auth/cancelled-popup-request") {
        // User closed the popup, no need to show error
        console.log("Sign-in cancelled by user")
      } else {
        console.error("Login error:", error)
        alert(
          [
            "❌ Sign-in failed",
            "",
            "This might be due to:",
            "• Browser security restrictions",
            "• Network connectivity issues",
            "• Google's security policies",
            "",
            "Try opening this page in your main browser (Safari/Chrome).",
          ].join("\n"),
        )
      }
    })
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)

      // Reset board state when user changes
      if (!currentUser) {
        setBoardLoaded(false)
        setSavedBoard(null)
        setMarkedSquares(
          Array(25)
            .fill(false)
            .map((_, i) => i === 12),
        )
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user || !boardLoaded || board.length === 0) return

    const newScore = markedSquares.filter((m, i) => m && i !== 12).length
    const docId = `${user.uid}_${today}`

    console.log("Raw user object:", user)
    console.log("User properties:", {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    })

    // More thorough data cleaning
    const userData = {
      uid: user.uid || "unknown",
      name: user.displayName || user.email?.split("@")[0] || "Anonymous User",
      email: user.email || "no-email@example.com",
      score: newScore,
      date: today,
      board: board.filter((item) => item !== undefined), // Clean board array
      markedSquares: markedSquares.filter((item) => item !== undefined), // Clean marked squares
      lastUpdated: new Date().toISOString(),
    }

    // Recursive function to remove all undefined values
    function removeUndefined(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.filter((item) => item !== undefined).map(removeUndefined)
      } else if (obj !== null && typeof obj === "object") {
        const cleaned: any = {}
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            cleaned[key] = removeUndefined(value)
          }
        }
        return cleaned
      }
      return obj
    }

    const cleanUserData = removeUndefined(userData)

    console.log("Final clean user data:", cleanUserData)
    console.log("Data types:", {
      uid: typeof cleanUserData.uid,
      name: typeof cleanUserData.name,
      email: typeof cleanUserData.email,
      score: typeof cleanUserData.score,
      date: typeof cleanUserData.date,
      board: Array.isArray(cleanUserData.board) ? `array[${cleanUserData.board.length}]` : typeof cleanUserData.board,
      markedSquares: Array.isArray(cleanUserData.markedSquares)
        ? `array[${cleanUserData.markedSquares.length}]`
        : typeof cleanUserData.markedSquares,
      lastUpdated: typeof cleanUserData.lastUpdated,
    })

    setDoc(doc(db, "scores", docId), cleanUserData)
      .then(() => {
        console.log("✅ Score and board saved successfully!")
      })
      .catch((error) => {
        console.error("❌ Error saving score:", error)
        console.error("Failed data:", cleanUserData)
      })
  }, [markedSquares, user, board, today, boardLoaded])

  const checkBingo = (board: boolean[]) => {
    const lines = [
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24],
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20],
    ]
    return lines.some((line) => line.every((i) => board[i]))
  }

  const score = markedSquares.filter((m, i) => m && i !== 12).length + 1

  if (authLoading) return <div className="spinner">Loading...</div>

  if (user && !boardLoaded) {
    return <div className="spinner">Loading your board...</div>
  }

  return (
    <div className="min-h-screen">
      <nav className="nav">
        <Link href="/" className="nav-link font-sans">
          🏠 Bingo
        </Link>
        <span className="nav-separator">|</span>
        <Link href="/leaderboard" className="nav-link font-sans">
          🏆 Leaderboard
        </Link>
      </nav>

      <div className="app">
        {!user ? (
          <>
            <h1>Intern Bingo Board</h1>
            <p style={{ color: "white", marginBottom: "1rem", fontSize: "0.9rem" }}>
              📱 If sign-in doesn't work, try opening this page in Safari or Chrome
            </p>
            <button className="auth-button" onClick={handleLogin}>
              Sign in with Google
            </button>
          </>
        ) : (
          <>
            <h1>Welcome, {user.displayName}</h1>
            <h2>{"Today's score: " + score}</h2>
            <p style={{ color: "white", fontSize: "0.8rem", opacity: 0.7 }}>Your board for {today}</p>

            <button className="auth-button" onClick={() => signOut(auth).then(() => setUser(null))}>
              Logout
            </button>

            {board.length > 0 && (
              <div className="container">
                {board.map((phrase, i) => (
                  <BingoSquare
                    key={i}
                    phrase={phrase}
                    isMarked={markedSquares[i]}
                    onClick={() => handleSquareClick(i)}
                    isLogo={phrase === "LOGO_PLACEHOLDER"}
                    logoSrc="/logo.png"
                  />
                ))}
              </div>
            )}

            {bingo && (
              <div className="bingo-popup">
                <h2>🎉 Congrats! You got Bingo! 🎉</h2>
                <button className="auth-button" onClick={() => setBingo(false)}>
                  Close
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
