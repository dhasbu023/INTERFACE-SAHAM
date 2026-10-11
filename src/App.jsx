import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import MainLayout from "./layouts/MainLayout"

import Dashboard from "./pages/Dashboard"
import ForwardTest0930 from "./pages/ForwardTest0930"
import ForwardTest1000 from "./pages/ForwardTest1000"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>

          <Route path="/" element={<Dashboard />} />

          <Route
            path="/forward-test-0930"
            element={<ForwardTest0930 />}
          />

          <Route
            path="/forward-test-1000"
            element={<ForwardTest1000 />}
          />

        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App