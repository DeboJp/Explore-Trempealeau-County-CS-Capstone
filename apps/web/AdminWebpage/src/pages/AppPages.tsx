import { Outlet } from "react-router";

function AppPages() {
  return (
    <main className="main-content">
      <Outlet />
    </main>
  )
}

export default AppPages;