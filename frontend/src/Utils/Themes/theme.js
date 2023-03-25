const React = require("react");
import Cookies from "universal-cookie";

const ThemeContext = React.createContext(null);
const cookies = new Cookies();

export const ThemeProvider = ({children}) => {
    const [theme, setTheme] = React.useState(null);

    const changeTheme = (newTheme) => {
        switch(newTheme) {
            case "light":
                break;

            case "dark":
                break;

            default:
                this.setState({ theme: "darkTheme"});
                break;
        }
    };

    React.useEffect(() => {
        let savedTheme = cookies.get("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa");
        if (savedTheme) {
            this.changeTheme(savedTheme);
        } else {
            this.changeTheme("dark");
        }
    }, []);

    return (
        <ThemeContext.Provider value={{theme: theme, changeTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    return React.useContext(ThemeContext);
};

