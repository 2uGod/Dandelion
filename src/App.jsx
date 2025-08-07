import { Routes, Route } from "react-router-dom"; 
import Home from "./pages/Home";
import MyPage from "./pages/MyPage";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
    return (
    <Routes>
      <Route path = "/" element = {<Home/>}/> 
      <Route path = "/MyPage" element = {<MyPage/>}/>
      <Route path = "/Register" element = {<Register/>}/>
      <Route path = "/Login" element = {<Login/>}/>
    </Routes>
  )
}

export default App
