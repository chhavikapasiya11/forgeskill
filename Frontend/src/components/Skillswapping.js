import React, { useState } from "react";

const hardSkills = [
  "React", "Node.js", "Python", "Django", "Java", 
  "Spring Boot", "SQL", "MongoDB", "Machine Learning", "CSS"
];

const softSkills = [
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

export default function SkillSwapping() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [meetLink, setMeetLink] = useState("https://meet.google.com/");
  const [showSkills, setShowSkills] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  
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
  };

  const handleConnect = (user) => {
    setActiveChat(user);
    setMatchedUsers([]); // Hide matched users list
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      setChatMessages([...chatMessages, { sender: "You", receiver: activeChat.name, text: newMessage }]);
      setNewMessage("");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Skill Swapping</h2>

      {showSkills && (
        <div className="p-4 border rounded shadow">
          <h4>Select Your Skills</h4>
          <div className="d-flex justify-content-between">
            <div className="d-flex flex-column me-4">
              <h5 className="text-primary">Hard Skills</h5>
              {hardSkills.map((skill, index) => (
                <label key={index} className="btn btn-outline-primary my-1">
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

            <div className="d-flex flex-column">
              <h5 className="text-success">Soft Skills</h5>
              {softSkills.map((skill, index) => (
                <label key={index} className="btn btn-outline-success my-1">
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
          </div>
          <button className="btn btn-primary w-100 mt-3" onClick={handleSubmit}>
            Find Matches
          </button>
        </div>
      )}

      {matchedUsers.length > 0 && !activeChat && (
        <div className="mt-4">
          <h3>Matched Users</h3>
          <ul className="list-group">
            {matchedUsers.map((user, index) => (
              <li key={index} className="list-group-item">
                <strong>{user.name}</strong> - Skills: {user.skills.join(", ")}
                <p>{user.bio}</p>
                <button className="btn btn-outline-info ms-3" onClick={() => handleConnect(user)}>
                  Connect
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeChat && (
        <div>
          <div className="mb-3">
            <h3>Join Meeting</h3>
            <a href={meetLink} target="_blank" rel="noopener noreferrer" className="btn btn-success w-20">
              Join Meet
            </a>
          </div>
          <div className="mt-4 border rounded p-3">
            <h3>Chat with {activeChat.name}</h3>
            <div className="chatbox border p-2 mb-2" style={{ height: "200px", overflowY: "scroll" }}>
              {chatMessages.filter(msg => msg.receiver === activeChat.name || msg.sender === activeChat.name)
                .map((msg, index) => (
                  <div key={index} className={`p-2 ${msg.sender === "You" ? "text-end" : ""}`}>
                    <strong>{msg.sender}:</strong> {msg.text}
                  </div>
                ))}
            </div>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
              <button className="btn btn-primary" onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
