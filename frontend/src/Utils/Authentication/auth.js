const React = require("react");
const axios = require("axios");

const AuthContext = React.createContext(null);

export const AuthProvider = ({children}) => {
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState(null);

    const login = (userObject) => {
        setUser(userObject);
    };

    const logout = () => {
        axios.delete("", {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            setUser(null);
        }, err => {
            console.error("Could not log out user");
        });
    };

    React.useEffect(() => {
        axios.get("", {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            if (response.status === 200) {
                setUser(response.data);
                setLoading(false);
            } else {
                setLoading(false);
            }
        }, err => {
            // Nothing
            console.warn(err);
            setLoading(false);
        });
    }, []);

    return (
        <AuthContext.Provider value={{user, login, logout}}>
            {!loading && children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    return React.useContext(AuthContext);
}