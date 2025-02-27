import React, { useState } from "react";

const skillsList = [
  "React", "Node.js", "Python", "Django", "Java", 
  "Spring Boot", "SQL", "MongoDB", "Machine Learning", "CSS",
  "Dancing", "Singing", "Debating", "Public Speaking", "Teamwork",
  "Leadership", "Communication", "Creativity", "Problem Solving", "Time Management"
];

const mentorsDatabase = [
  { name: "Rohan", expertise: ["React", "CSS"], bio: "A CS student passionate about web development." },
  { name: "Bob", expertise: ["Python", "Django"], bio: "An AI enthusiast who loves teaching beginners." },
  { name: "Samay", expertise: ["Java", "Public Speaking"], bio: "An engineer interested in guiding students in coding and communication." },
  { name: "Ananya", expertise: ["Machine Learning", "Teamwork"], bio: "A data science enthusiast eager to mentor learners." },
  { name: "Karan", expertise: ["SQL", "Leadership"], bio: "A software engineer helping students with databases and leadership." }
];

export default function LearningPlatform() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [matchedMentors, setMatchedMentors] = useState([]);
  const [activeMentor, setActiveMentor] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showSkills, setShowSkills] = useState(true);
  const meetLink = "https://meet.google.com/";
  
  const handleSkillChange = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = () => {
    const matches = mentorsDatabase.filter((mentor) =>
      mentor.expertise.some((skill) => selectedSkills.includes(skill))
    );
    setMatchedMentors(matches);
    setShowSkills(false); // Hide skill selection card
  };

  const handleConnect = (mentor) => {
    setActiveMentor(mentor);
    setMatchedMentors([]); // Hide matched mentors list
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      setChatMessages([...chatMessages, { sender: "You", receiver: activeMentor.name, text: newMessage }]);
      setNewMessage("");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Find a Mentor</h2>
      {showSkills && (
        <div className="p-4 border rounded shadow">
          <h4>Select Skills You Want to Learn</h4>
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
            Find Mentors
          </button>
        </div>
      )}
      
      {matchedMentors.length > 0 && !activeMentor && (
        <div className="mt-4">
          <h3>Available Mentors</h3>
          <ul className="list-group">
            {matchedMentors.map((mentor, index) => (
              <li key={index} className="list-group-item">
                <strong>{mentor.name}</strong> - Expertise: {mentor.expertise.join(", ")}
                <p>{mentor.bio}</p>
                <button className="btn btn-outline-info" onClick={() => handleConnect(mentor)}>
                  Connect
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeMentor && (
        <div>
          <h3>Join Meeting</h3>
          <a href={meetLink} target="_blank" rel="noopener noreferrer" className="btn btn-success w-30 my-2">
            Join Meet
          </a>
          <div className="mt-4 p-3 border rounded">
            <h3>Chat with {activeMentor.name}</h3>
            <p>{activeMentor.bio}</p>
            <div className="mt-3 border p-2" style={{ height: "200px", overflowY: "scroll" }}>
              {chatMessages.filter(msg => msg.receiver === activeMentor.name || msg.sender === activeMentor.name)
                .map((msg, index) => (
                  <div key={index} className={`p-2 ${msg.sender === "You" ? "text-end" : ""}`}>
                    <strong>{msg.sender}:</strong> {msg.text}
                  </div>
                ))}
            </div>
            <div className="input-group mt-2">
              <input type="text" className="form-control" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
              <button className="btn btn-primary" onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}