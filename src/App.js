// import React from 'react';
// import logo from './logo.svg';
// import './App.css';
// import { Amplify } from 'aws-amplify';
// import { withAuthenticator } from '@aws-amplify/ui-react';
// import '@aws-amplify/ui-react/styles.css';
// import awsExports from './aws-exports';
// Amplify.configure(awsExports);


// function App({ signOut, user }) {
//   return (
 //   <div>
 //     <img src={logo} className="App-logo" alt="logo" />
 //     <h1>Hello! Agora com autenticação de usuário!!! Que tal!? {user.username}</h1>
 //     <button onClick={signOut}>Sign out</button>
 //     </div>
 // );
//}

// export default withAuthenticator(App);

import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { listTodos as listNotes } from './graphql/queries';
import { createTodo as createNoteMutation, deleteTodo as deleteNoteMutation } from './graphql/mutations';
import { withAuthenticator } from '@aws-amplify/ui-react';


var x = document.getElementById("demo");


function getLocation() { 
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
    console.log("a")
  } else { 
    x = document.getElementById("demo")
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  x = document.getElementById("demo")
  x.innerHTML = `Latitude: ${position.coords.latitude} <br>Longitude: ${position.coords.longitude}`
}





const initialFormState = { name: '', description: '' }

function App({ signOut, user }) {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    setNotes(apiData.data.listTodos.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }

  return (
    <div className="App">
      
      <div>
        <button onClick={() => getLocation()}>Show my coordinates!</button>
      </div>

      <div id="demo"></div>

      <h1>My Notes App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Note description"
        value={formData.description}
      />
      <button onClick={createNote}>Create Note</button>
      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name}>
              <h2>{note.name}</h2>
              <p>{note.description}</p>
              <button onClick={() => deleteNote(note)}>Delete note</button>
            </div>
          ))
        }
      </div>
      <button onClick={signOut}>Click here to Sign out, {user.username}</button>

    </div>
  );
}

export default withAuthenticator(App);