import { Routes, Route } from "react-router-dom"; 
import Home from "./pages/Home";
import MyPage from "./pages/MyPage";
import Register from "./pages/Register";

function App() {
    return (
    <Routes>
      <Route path = "/" element = {<Home/>}/> 
      <Route path = "/MyPage" element = {<MyPage/>}/>
      <Route path = "/Register" element = {<Register/>}/>
    </Routes>
  )
}

export default App
