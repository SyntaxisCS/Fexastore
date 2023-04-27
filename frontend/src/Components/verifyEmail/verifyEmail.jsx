const React = require("react");
const axios = require("axios");

// Components
const {useNavigate} = require("react-router-dom");
import { useTheme } from "../../Utils/Themes/theme";
import "./verifyEmail.css";

export const VerifyEmailComponent = (props) => {
    // URLs
    const frontendURL = process.env.frontendURL;
    const backendURL = process.env.backendURL;

    // props
    const token = props.token;

    // Utils
    const theme = useTheme().theme;
    const navigate = useNavigate();

    // States
    const [statusState, setStatusState] = React.useState(false);
    const [statusMessage, setStatusMessage] = React.useState("");

    const changeStatus = (change) => {
        if (change === "good") {
            setStatusState(true);
            setStatusMessage("Your email has been verified! You may now close this page!");
        } else if (change === "bad") {
            setStatusState(false);
            setStatusMessage("Unfortunately we could not verify your email. We are working to fix this issue as fast as we can. Please try again later!");
        } else if (change === "good") {
            setStatusState(true);
            setStatusMessage("Your email has already been verified! You may close this page!");
        } else {
            setStatusState(false);
            setStatusMessage("Server Error");
        }
    };

    const apiCall = (token) => {
        let callBody = {
            token: token
        };

        axios.post(`${backendURL}/users/verifyemail`, callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            changeStatus("good");
        }, err => {
            let errResponse = err.response;

            if (errResponse.status === 400) {
                if (errResponse.data.error === "You have already verified your email!") {
                    changeStatus("done");
                } else if (errResponse.data.error === "Token has expired") {
                    changeStatus("bad");
                } else if (errResponse.data.error === "Token does not exist") {
                    navigate("/");
                }
            } else {
                changeStatus("bad");
            }
        });
    };

    React.useEffect(() => {
        apiCall(token);
    }, []);

    return (
        <div className={`verifyEmail ${theme}`}>
            <h1 className={`status ${statusState ? "good" : "bad"}`}><i className={`bx ${statusState ? "bx-check-circle" : "bx-x-circle"}`}/></h1>
            <p className="statusMessage">{statusMessage}</p>
        </div>
    )
};