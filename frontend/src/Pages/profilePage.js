const React = require("react");
const ReactRouter = require("react-router-dom");
const axios = require("axios");

// Components
import { ProfileHeader } from "../Components/profilePage/profileHeader/profileHeader";
import { UploadList } from "../Components/profilePage/uploadList/uploadList";
import { TopBar } from "../Components/topBar/topBar";
import { useAuth } from "../Utils/Authentication/auth";
import { useTheme } from "../Utils/Themes/theme";
import "./Styles/profilePage.css";


export const ProfilePage = () => {
    // URLs
    const frontendURL = process.env.frontendURL;
    const backendURL = process.env.backendURL;

    // Utils
    const theme = useTheme().theme;
    const auth = useAuth();
    const navigate = ReactRouter.useNavigate();

    // States
    const {username} = ReactRouter.useParams();
    const [user, setUser] = React.useState(null);

    const getUser = () => {
    
        axios.get(`${backendURL}/users/username/${username}`, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(user => {
            setUser(user.data);
        }, err => {
            console.error(err);
            navigate("/");
        });

    };

    React.useEffect(() => {
        getUser();
    }, []);

    return (
        <div className="profilePage">
            <TopBar/>
            {user && <ProfileHeader user={user}/>}
            {user && <UploadList user={user}/> }
        </div>
    );
};