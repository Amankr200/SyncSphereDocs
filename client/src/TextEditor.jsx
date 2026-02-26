import { useCallback, useEffect, useState } from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import { io } from "socket.io-client"
import { useParams } from "react-router-dom"
import { useAuth } from "./context/AuthContext"

const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
]

export default function TextEditor() {
    const { id: documentId } = useParams()
    const { user } = useAuth()
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()
    const [activeUsers, setActiveUsers] = useState([])
    const [typingUsers, setTypingUsers] = useState(new Set())
    const [shareMode, setShareMode] = useState('edit')
    const [isOwner, setIsOwner] = useState(false)
    const [title, setTitle] = useState('Untitled')

    useEffect(() => {
        const token = localStorage.getItem('token')
        const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
        const s = io(socketUrl, {
            auth: { token }
        })

        s.on("connect", () => console.log("Socket connected:", s.id))
        s.on("connect_error", (err) => console.error("Socket connection error:", err.message))

        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = (docPayload) => {
            console.log("Document payload received:", docPayload.title)
            const { data, title, owner, shareMode, currentUser } = docPayload
            quill.setContents(data)
            setShareMode(shareMode)
            setTitle(title)

            const isUserOwner = owner === currentUser
            setIsOwner(isUserOwner)

            if (shareMode === 'view' && !isUserOwner) {
                quill.disable()
            } else {
                quill.enable()
            }
        }

        socket.on("load-document", handler)

        socket.on("active-users", users => {
            setActiveUsers(users)
        })

        socket.on("permission-updated", (newMode) => {
            setShareMode(newMode)
            // We need to re-check ownership here, but since isOwner is stable for the component life
            // after the first load-document, we can use it.
            if (newMode === 'view') {
                // re-fetch isOwner from closure or state if needed, 
                // but easier to check against currentUser if we stored it
                // For now, let's use the state value.
                setIsOwner(prev => {
                    if (newMode === 'view' && !prev) quill.disable()
                    else quill.enable()
                    return prev
                })
            } else {
                quill.enable()
            }
        })

        socket.emit("get-document", documentId)
        console.log(`Requested document: ${documentId}`)

        const loadingTimeout = setTimeout(() => {
            if (quill && quill.getText().trim() === "Loading...") {
                console.warn("Document load is taking longer than expected. Check server logs and socket connection.")
            }
        }, 5000)

        return () => {
            socket.off("load-document", handler)
            socket.off("active-users")
            socket.off("permission-updated")
        }
    }, [socket, quill, documentId])

    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = (delta, oldDelta, source) => {
            if (source !== "user") return
            socket.emit("send-changes", delta)
        }
        quill.on("text-change", handler)

        return () => {
            quill.off("text-change", handler)
        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = delta => {
            quill.updateContents(delta)
        }
        socket.on("receive-changes", handler)

        return () => {
            socket.off("receive-changes", handler)
        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) return

        const interval = setInterval(() => {
            if (shareMode === 'edit' || isOwner) {
                socket.emit("save-document", quill.getContents())
            }
        }, SAVE_INTERVAL_MS)

        return () => {
            clearInterval(interval)
        }
    }, [socket, quill, shareMode, isOwner])

    // --- Typing Indicator & Cursor ---
    useEffect(() => {
        if (socket == null) return

        const handler = ({ user, isTyping }) => {
            setTypingUsers(prev => {
                const newSet = new Set(prev)
                if (isTyping) {
                    newSet.add(user)
                } else {
                    newSet.delete(user)
                }
                return newSet
            })
        }

        socket.on("user-typing", handler)

        return () => {
            socket.off("user-typing", handler)
        }
    }, [socket])

    useEffect(() => {
        if (socket == null || quill == null) return

        let typingTimeout
        const handler = (delta, oldDelta, source) => {
            if (source !== "user") return

            socket.emit("typing-start")

            clearTimeout(typingTimeout)
            typingTimeout = setTimeout(() => {
                socket.emit("typing-end")
            }, 1000)
        }

        quill.on("text-change", handler)

        return () => {
            quill.off("text-change", handler)
            clearTimeout(typingTimeout)
        }
    }, [socket, quill])

    // --- Cursor Tracking & Active Users ---
    useEffect(() => {
        if (socket == null || quill == null || !user) return;

        const selectionHandler = (range, oldRange, source) => {
            if (range) {
                socket.emit("send-cursor-position", range);
            }
        }
        quill.on('selection-change', selectionHandler);

        return () => {
            quill.off('selection-change', selectionHandler);
        }
    }, [socket, quill, user]);
    // ------------------------------------

    const changePermission = (newMode) => {
        setShareMode(newMode);
        socket.emit("permission-change", newMode);
    }

    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return

        wrapper.innerHTML = ""
        const editor = document.createElement("div")
        wrapper.append(editor)
        const q = new Quill(editor, {
            theme: "snow",
            modules: { toolbar: TOOLBAR_OPTIONS },
        })
        q.disable()
        q.setText("Loading...")
        setQuill(q)
    }, [])

    return (
        <div className="text-editor-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div className="active-users-bar">
                <a href="/dashboard" className="btn btn-secondary" style={{ marginRight: '1rem', padding: '0.4rem 0.8rem' }}>
                    ← Dashboard
                </a>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {activeUsers.map((u, i) => (
                        <div key={i} className="user-badge" title={u.name || 'Anonymous'}>
                            {(u.name || '?').charAt(0).toUpperCase()}
                        </div>
                    ))}
                </div>

                {typingUsers.size > 0 && (
                    <div className="typing-indicator">
                        <span>•</span>
                        {Array.from(typingUsers).join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
                    </div>
                )}

                <div className="share-controls">
                    {isOwner ? (
                        <>
                            <label>Access:</label>
                            <select value={shareMode} onChange={(e) => changePermission(e.target.value)}>
                                <option value="edit">Everyone can Edit</option>
                                <option value="view">Everyone can View</option>
                            </select>
                        </>
                    ) : (
                        <span className="permission-badge" style={{
                            background: shareMode === 'view' ? '#fde047' : '#86efac',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.8rem',
                            color: '#1e293b'
                        }}>
                            {shareMode === 'view' ? 'View Only' : 'Can Edit'}
                        </span>
                    )}
                    <button className="btn btn-primary" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!");
                    }} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                        Share
                    </button>
                </div>
            </div>
            <div className="editor-container" ref={wrapperRef}></div>
        </div>
    )
}
