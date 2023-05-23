const React = require("react");
const axios = require("axios");

// Components
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../Utils/Authentication/auth";
import {useTheme} from "../../../Utils/Themes/theme";
import "./privacySettings.css";

export const PrivacySettings = (props) => {
    // URLs
    const backendURL = process.env.backendURL;

    // Utils
    const theme = useTheme().theme;
    const navigate = useNavigate();
    const auth = useAuth();

    // States
    const [toggleState, setToggleState] = React.useState({nameToggle: true});
    const [apiState, setApiState] = React.useState({nameToggle: true}); 

    // Functions
    const disclosureClick = () => {
        navigate("/settings/privacy/disclosure");
    };

    const handleInputChange = (event) => {
        const {id, checked} = event.target;

        let newEdit = {...toggleState};

        newEdit[id] = checked;

        setToggleState(newEdit);

        makeAPICalls(id);
    };

    const makeAPICalls = (input) => {
        if (input === "nameToggle") {
            changeNameVisibility();
        }
    };

    const changeNameVisibility = () => {
        let callBody = {
            newVis: toggleState.nameToggle
        };

        // Flip nameToggle (I have no idea why, I just have to)
        if (toggleState.nameToggle) {
            callBody.newVis = false;
        } else {
            callBody.newVis = true;
        }

        axios.put(`${backendURL}/users/change/namevisibility`, callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            // Do nothing
        }, err => {
            console.warn(err);
        });
    };

    const getUserPrivacyInfo = () => {
        axios.get(`${backendURL}/users/id/${auth.user.uuid}`, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(user => {
            
            // modify toggle states
            let newEdit = {...toggleState};

            newEdit.nameToggle = user.data.name_visibility;

            setToggleState(newEdit);
        }, err => {
            console.warn(err);
        });
    };

    React.useEffect(() => {
        getUserPrivacyInfo();
    }, []);

    return (
        <div className={`privacySettings ${theme}`}>
            <div className="toggleWrapper">
                <div className="toggleContainer">
                    <div className="toggleTitle">Display name on profile?</div>
                    <div className="toggleSwitch">
                        <input type="checkbox" id="nameToggle" onChange={handleInputChange} checked={toggleState.nameToggle}/>
                        <label htmlFor="nameToggle"></label>
                    </div>
                </div>
                <p className="description">Display name on profile publically. If checked your name (first and last) will be display on your profile under your username. This can help increase discoverability. If left unchecked your name will still display on your profile for you, but no one else.</p>
            </div>

            <div className="privacyDisclosureWrapper" onClick={disclosureClick}>
                <p className="text">Privacy Disclosure</p><i className='bx bx-chevron-right'/>
            </div>
        </div>
    )
};