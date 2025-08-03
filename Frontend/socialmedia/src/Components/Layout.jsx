import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useState } from "react";

export default function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => setIsCollapsed(prev => !prev);

    return (
        <>
            <Navbar  />
            <Outlet context={{ isCollapsed, toggleSidebar }} />
        </>
    );
}
