const React = require("react");
import { Link } from "react-router-dom";

// Utils

// Components
import "./sideBar.css";

export const SideBar = () => {
    const [isOpen, setIsOpen] = React.useState(true);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`sideBar ${!isOpen ? "hidden" : ""}`}>
            <div className="sideBarToggle" onClick={handleToggle}>
                <i className={`bx bx-${!isOpen ? "menu-alt-left" : "menu-alt-right"}`}/>
            </div>
            
            <nav className="sideBarNav">
                <ul>
                    <li>
                        <Link to="/">
                            <i className='bx bxs-file-find'/>
                            <p>Search Files</p>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};