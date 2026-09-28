import { useState, useEffect } from "react";
import api from "../services/api";

function AIChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [title, setTitle] = useState("");
  const [history, setHistory] = useState([]);

  const [topic, setTopic] = useState("Python");
  const [interviewQuestion, setInterviewQuestion] = useState("");
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadSessions = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await api.get("/sessions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSessions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadHistory = async (sessionId) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await api.get(
        `/chat-history/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createSession = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await api.post(
        "/sessions",
        {
          title: title,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadSessions();
      setSelectedSession(response.data.id);
      setTitle("");
    } catch (error) {
      console.error(error);
    }
  };

  const startInterview = async () => {
    try {
      const response = await api.post(
        `/start-interview?topic=${topic}`
      );

      setInterviewQuestion(response.data.question);
      setInterviewAnswer("");
      setFeedback("");
    } catch (error) {
      console.error(error);
    }
  };

  const submitInterviewAnswer = async () => {
    if (!interviewAnswer.trim()) {
      alert("Please enter your answer");
      return;
    }

    try {
      const response = await api.post(
        "/evaluate-answer",
        {
          question: interviewQuestion,
          answer: interviewAnswer,
        }
      );

      setFeedback(response.data.feedback);
    } catch (error) {
      console.error(error);
      alert("Evaluation failed");
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const token = localStorage.getItem("access_token");

      await api.delete(
        `/chat-history/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadHistory(selectedSession);
    } catch (error) {
      console.error(error);
      alert("Failed to delete chat");
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const askAI = async () => {
    if (!selectedSession) {
      alert("Please select a session first");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await api.post(
        "/ask-ai",
        {
          question: question,
          session_id: selectedSession,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnswer(response.data.answer);

      loadHistory(selectedSession);

      setQuestion("");
    } catch (error) {
      console.error(error);
      alert("AI request failed");
    }
  };

  return (
    <div className="container">
      <h2>AI Interview Coach</h2>

      <p>
        Practice interview questions on Python,
        FastAPI, SQL, JWT and React.
      </p>

      <div className="section">
        <h3>Create Session</h3>

        <input
          type="text"
          placeholder="Session title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button onClick={createSession}>
          Create Session
        </button>
      </div>

      <div className="section">
        <h3>Sessions ({sessions.length})</h3>

        <div className="session-list">
          {sessions.map((session) => (
            <button
              key={session.id}
              className="session-btn"
              onClick={() => {
                setSelectedSession(session.id);
                loadHistory(session.id);
              }}
            >
              {session.title}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>Mock Interview</h3>

        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option>Python</option>
          <option>FastAPI</option>
          <option>SQL</option>
          <option>React</option>
        </select>

        <button onClick={startInterview}>
          Start Interview
        </button>

        {interviewQuestion && (
          <>
            <div className="answer-box">
              <strong>Question:</strong>

              <p>{interviewQuestion}</p>
            </div>

            <textarea
              rows="6"
              placeholder="Type your answer here..."
              value={interviewAnswer}
              onChange={(e) =>
                setInterviewAnswer(e.target.value)
              }
            />

            <button
              onClick={submitInterviewAnswer}
            >
              Submit Answer
            </button>

            {feedback && (
              <div className="answer-box">
                <h4>AI Feedback</h4>

                <p>{feedback}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="section">
        <h3>Ask AI</h3>

        <input
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button
          onClick={askAI}
          disabled={!question.trim()}
        >
          Ask AI
        </button>
      </div>

      <div className="selected-session">
        Selected Session ID: {selectedSession || "None"}
      </div>

      <div className="section">
        <h3>Latest Answer</h3>

        <div className="answer-box">
          {answer || "No answer yet"}
        </div>
      </div>

      <div className="section">
        <h3>Conversation History</h3>

        {history.length === 0 ? (
          <p>No conversation yet.</p>
        ) : (
          history.map((chat) => (
            <div
              key={chat.id}
              className="chat-box"
            >
              <p>
                <small>
                  {new Date(
                    chat.created_at
                  ).toLocaleString()}
                </small>
              </p>

              <p>
                <strong>You:</strong>{" "}
                {chat.question}
              </p>

              <p>
                <strong>AI:</strong>{" "}
                {chat.answer}
              </p>

              <button
                onClick={() =>
                  deleteChat(chat.id)
                }
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AIChat;