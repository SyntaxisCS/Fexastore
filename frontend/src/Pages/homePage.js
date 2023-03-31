const React = require("react");

// Components
import { SideBar } from "../Components/sideBar/sideBar";
import "./Styles/homePage.css";

export const HomePage = (props) => {

    return (
        <div className="homePage">
            <SideBar/>
        </div>
    );
};