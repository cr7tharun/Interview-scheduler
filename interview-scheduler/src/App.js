import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import moment from 'moment-timezone';


const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  max-width: 1000px;
  margin: auto;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-around;
  padding: 15px;
  background: linear-gradient(90deg, #002f4b, #0056b3);
  color: white;
  border-radius: 5px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  transition: background 0.3s;

  a {
    color: white;
    text-decoration: none;
    font-weight: bold;
    padding: 10px 15px;
    border-radius: 5px;
    transition: background-color 0.3s, transform 0.2s;
  }

  a:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`;

const Button = styled.button`
  padding: 10px 15px;
  margin: 5px;
  cursor: pointer;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s, transform 0.2s;
  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }
`;

const FormContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const FormField = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }

  input, select {
    width: calc(100% - 22px);
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1em;
  }
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const ListItem = styled.li`
  background: #f9f9f9;
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Dashboard = () => {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    const storedInterviews = JSON.parse(localStorage.getItem('interviews')) || [];
    setInterviews(storedInterviews);
  }, []);

  const moveEvent = ({ event, start, end }) => {
    const updatedInterviews = interviews.map((existingEvent) => {
      return existingEvent.id === event.id
        ? { ...existingEvent, start, end }
        : existingEvent;
    });
    setInterviews(updatedInterviews);
    localStorage.setItem('interviews', JSON.stringify(updatedInterviews));
  };

  const resizeEvent = ({ event, start, end }) => {
    const updatedInterviews = interviews.map((existingEvent) => {
      return existingEvent.id === event.id
        ? { ...existingEvent, start, end }
        : existingEvent;
    });
    setInterviews(updatedInterviews);
    localStorage.setItem('interviews', JSON.stringify(updatedInterviews));
  };

  const deleteInterview = (id) => {
    const updatedInterviews = interviews.filter(interview => interview.id !== id);
    setInterviews(updatedInterviews);
    localStorage.setItem('interviews', JSON.stringify(updatedInterviews));
  };

  return (
    <Container>
      <h2>Interview Dashboard</h2>
      <DnDCalendar
        localizer={localizer}
        events={interviews}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, background: 'white', padding: '20px', borderRadius: '10px' }}
        onEventDrop={moveEvent}
        onEventResize={resizeEvent}
        resizable
      />
      <List>
        {interviews.map((interview) => (
          <ListItem key={interview.id}>
            <span>{interview.candidate} - {interview.interviewer} - {moment(interview.start).format('LLLL')}</span>
            <div>
              <Button onClick={() => deleteInterview(interview.id)}>Delete</Button>
              <Link to={`/edit/${interview.id}`}><Button>Edit</Button></Link>
            </div>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

const ScheduleInterview = () => {
  const [candidate, setCandidate] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [type, setType] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    const storedInterviews = JSON.parse(localStorage.getItem('interviews')) || [];
    setInterviews(storedInterviews);
    if (isEditing) {
      const interviewToEdit = storedInterviews.find(interview => interview.id === parseInt(id));
      if (interviewToEdit) {
        setCandidate(interviewToEdit.candidate);
        setInterviewer(interviewToEdit.interviewer);
        setDateTime(moment(interviewToEdit.start).format('YYYY-MM-DDTHH:mm'));
        setType(interviewToEdit.type);
      }
    }
  }, [id, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newInterview = {
      id: isEditing ? parseInt(id) : Date.now(),
      candidate,
      interviewer,
      start: new Date(dateTime),
      end: new Date(new Date(dateTime).getTime() + 30 * 6000),
      type,
    };

    const hasConflict = interviews.some(interview =>
      interview.interviewer === interviewer &&
      ((new Date(dateTime) >= new Date(interview.start) && new Date(dateTime) < new Date(interview.end)) ||
      (new Date(new Date(dateTime).getTime() + 30 * 6000) > new Date(interview.start) && new Date(new Date(dateTime).getTime() + 30 * 6000) <= new Date(interview.end)))
    );

    if (hasConflict) {
      alert('Scheduling conflict detected for the selected interviewer.');
      return;
    }

    const updatedInterviews = isEditing
      ? interviews.map(interview => interview.id === parseInt(id) ? newInterview : interview)
      : [...interviews, newInterview];

    setInterviews(updatedInterviews);
    localStorage.setItem('interviews', JSON.stringify(updatedInterviews));
    navigate('/');
  };

  return (
    <Container>
      <h2>{isEditing ? 'Edit Interview' : 'Schedule Interview'}</h2>
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Candidate Name:</label>
            <input
              type="text"
              value={candidate}
              onChange={(e) => setCandidate(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Interviewer Name:</label>
            <input
              type="text"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Date and Time:</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Interview Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value)} required>
              <option value="">Select Type</option>
              <option value="Technical">Technical</option>
              <option value="HR">HR</option>
              <option value="Behavioral">Behavioral</option>
            </select>
          </div>
          <Button type="submit">{isEditing ? 'Update Interview' : 'Schedule Interview'}</Button>
        </form>
      </FormContainer>
    </Container>
  );
};

const App = () => {
  return (
    <Router>
      <Container>
        <Navbar>
          <Link to="/">Dashboard</Link>
          <Link to="/schedule">Schedule Interview</Link>
        </Navbar>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<ScheduleInterview />} />
          <Route path="/edit/:id" element={<ScheduleInterview />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
