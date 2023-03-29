const React = require("react");
import Cookies from "universal-cookie";

const ThemeContext = React.createContext(null);
const cookies = new Cookies();

export const ThemeProvider = ({children}) => {
    const [theme, setTheme] = React.useState(null);
    const cookieName = "$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa"

    const changeTheme = (newTheme) => {
        switch(newTheme) {
            case "light":
                setTheme("lightTheme");
                cookies.remove(cookieName);
                cookies.set(cookieName, "light");
                break;

            case "dark":
                setTheme("darkTheme");
                cookies.remove(cookieName);
                cookies.set(cookieName, "dark");
                break;

            default:
                setTheme("darkTheme");
                cookies.remove(cookieName);
                cookies.set(cookieName, "dark");
                break;
        }
    };

    React.useEffect(() => {
        let savedTheme = cookies.get(cookieName);
        if (savedTheme) {
           setTheme(savedTheme);
        } else {
            setTheme("dark");
        }
    }, []);

    return (
        <ThemeContext.Provider value={{theme, changeTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    return React.useContext(ThemeContext);
};

