import { Routes, Route } from "react-router-dom"; 
import Home from "./pages/Home";
import MyPage from "./pages/MyPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Pest from "./pages/Pest"
import Community from "./pages/Community"
import CommunityDetail from "./pages/CommunityDetail";  // ⬅️ 추가
import Reservation from "./pages/Reservation";


function App() {
    return (
    <Routes>
      <Route path = "/" element = {<Home/>}/> 
      <Route path = "/MyPage" element = {<MyPage/>}/>
      <Route path = "/Register" element = {<Register/>}/>
      <Route path = "/Login" element = {<Login/>}/>
      <Route path = "/Pest" element = {<Pest/>}/>
      <Route path = "/Community" element = {<Community/>}/>
      <Route path="/Community/:id" element={<CommunityDetail/>}/>       {/* 상세+댓글 */}
      <Route path = "/Reservation" element = {<Reservation/>}/>
    </Routes>
  )
}

export default App
