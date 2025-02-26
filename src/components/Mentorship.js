import React, { useState } from "react";

const skillsList = [
  "React", "Node.js", "Python", "Django", "Java", 
  "Spring Boot", "SQL", "MongoDB", "Machine Learning", "CSS",
  "Dancing", "Singing", "Debating", "Public Speaking", "Teamwork",
  "Leadership", "Communication", "Creativity", "Problem Solving", "Time Management"
];

const usersDatabase = [
  { name: "Rohan", skills: ["React", "Dancing", "CSS"], bio: "A sophomore CS student passionate about web development and dance." },
  { name: "Bob", skills: ["Python", "Django", "Singing"], bio: "An AI enthusiast who loves coding and performing on stage." },
  { name: "Samay", skills: ["Java", "Dancing", "Debating"], bio: "Third-year engineering student interested in competitive coding and public speaking." },
  { name: "Janvi", skills: ["Debating", "MongoDB", "Express"], bio: "Final-year IT student specializing in backend development and debate competitions." },
  { name: "Ananya", skills: ["Machine Learning", "Teamwork", "Time Management"], bio: "A data science enthusiast who enjoys collaborative projects and hackathons." },
  { name: "Karan", skills: ["SQL", "Leadership", "Problem Solving"], bio: "Aspiring software engineer with a knack for databases and team leadership." }
];

export default function Mentorship() {
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [matchedUsers, setMatchedUsers] = useState([]);
    const [showSkills, setShowSkills] = useState(true);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [meetLink, setMeetLink] = useState("");
    const [showMatches, setShowMatches] = useState(true);
    
    const handleSkillChange = (skill) => {
      setSelectedSkills((prevSkills) =>
        prevSkills.includes(skill)
          ? prevSkills.filter((s) => s !== skill)
          : [...prevSkills, skill]
      );
    };

    const handleSubmit = () => {
      const matches = usersDatabase.filter((user) =>
        user.skills.some((skill) => selectedSkills.includes(skill))
      );

      setMatchedUsers(matches);
      setShowSkills(false);
      setShowMatches(true);
    };

    const handleSendMessage = () => {
      if (newMessage.trim() !== "") {
        setChatMessages([...chatMessages, { sender: "You", text: newMessage }]);
        setNewMessage("");
      }
    };

    const handleConnect = () => {
      setMeetLink("https://meet.google.com/new");
      setShowMatches(false); 
    };

    return (
      <div className="container mt-5">
        <h2 className="text-center">Mentorship Program</h2>

        {/* Skill Selection - Hides after submitting */}
        {showSkills && (
          <div className="p-4 border rounded shadow">
            <h4>What can you teach?</h4>
            <div className="d-flex flex-wrap">
              {skillsList.map((skill, index) => (
                <label key={index} className="btn btn-outline-primary m-1">
                  <input
                    type="checkbox"
                    value={skill}
                    onChange={() => handleSkillChange(skill)}
                    checked={selectedSkills.includes(skill)}
                    className="me-2"
                  />
                  {skill}
                </label>
              ))}
            </div>
            <button className="btn btn-primary w-100 mt-3" onClick={handleSubmit}>
              Find Mentees
            </button>
          </div>
        )}

        {/* Display Matched Users */}
        {matchedUsers.length > 0 && showMatches && (
          <div className="mt-4">
            <h3>Matched Mentees</h3>
            <ul className="list-group">
              {matchedUsers.map((user, index) => (
                <li key={index} className="list-group-item">
                  <strong>{user.name}</strong> - {user.bio} <br />
                  <strong>Skills:</strong> {user.skills.join(", ")}
                  <br />
                  <button className="btn btn-success mt-2" onClick={handleConnect}>Connect</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Meeting Link */}
        {meetLink && (
          <div className="mt-3">
            <h3>Join Meeting</h3>
            <a href={meetLink} target="_blank" rel="noopener noreferrer" className="btn btn-success">
             Join Meet
            </a>
          </div>
        )}

        {/* Chat Section */}
        {meetLink && (
          <div className="mt-4 border rounded p-3">
            <h3>Chat with Mentees</h3>
            <div className="chatbox border p-2 mb-2" style={{ height: "200px", overflowY: "scroll" }}>
              {chatMessages.map((msg, index) => (
                <div key={index} className={`p-2 ${msg.sender === "You" ? "text-end" : ""}`}>
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              ))}
            </div>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    );
}
