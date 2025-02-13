import "./App.css";
import Chat from "./components/Chat";
import Login from "./components/Login";
import { useState } from "react";

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      <Login setUser={setUser} user={user} />
      {user && <Chat user={user} />}
    </div>
  );
}

export default App;
