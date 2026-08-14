import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import SupportWidget from "../components/SupportWidget";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <SupportWidget />
    </div>
  );
}
