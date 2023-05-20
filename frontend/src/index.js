const React = require("react");
const ReactDOM = require("react-dom");
const {BrowserRouter, Routes, Route} = require("react-router-dom");

// Utils
import { AuthProvider } from "./Utils/Authentication/auth";
import { ThemeProvider } from "./Utils/Themes/theme";
import {RequireAuth} from "./Utils/Authentication/requireAuth";
import "./index.css";

// Pages
import { HomePage } from "./Pages/homePage";
import { LoginPage } from "./Pages/loginPage";
import { ProfilePage } from "./Pages/profilePage";
import { AccountSettingsPage } from "./Pages/Settings/accountSettings";
import { PrivacySettingsPage } from "./Pages/Settings/privacySettings";
import { ThemeSettingsPage } from "./Pages/Settings/themeSettings";
import { SignUpPage } from "./Pages/signUpPage";
import { UploadPage } from "./Pages/uploadPage";
import { VerifyEmailPage } from "./Pages/verifyEmailPage";
import { AboutSettingsPage} from "./Pages/Settings/aboutSettings";
import { NotificationSettingsPage } from "./Pages/Settings/notificationSettings";
import { PrivacyDisclosureSettingsPage} from "./Pages/Settings/privacyDisclosureSettings";
import { PrivacyDisclosureDigitalOceanPage } from "./Pages/Settings/disclosures/privacyDisclosureDigitalOceanPage";
import { PrivacyDisclosureOAuthPage } from "./Pages/Settings/disclosures/privacyDisclosureOauth";

// Replace this with completed pages
// from pages directory: single react components that envelope several components into a single page

// Errors
// Put error pages under this for better organization
// import {FourOhFourErrorPage} from "./Pages/404";
// import {FiveHundredErrorPage} from "./Pages/500";

// /profile/username

ReactDOM.render((
    <AuthProvider>
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/upload" element={<RequireAuth><UploadPage/></RequireAuth>}/>
                    <Route path="/profile/:username" element={<ProfilePage/>}/>

                    {/*Settings*/}
                    <Route path="/settings/account" element={<RequireAuth><AccountSettingsPage/></RequireAuth>}/>
                    <Route path="/settings/theme" element={<RequireAuth><ThemeSettingsPage/></RequireAuth>}/>
                    <Route path="/settings/privacy" element={<RequireAuth><PrivacySettingsPage/></RequireAuth>}/>
                        <Route path="/settings/privacy/disclosure" element={<RequireAuth><PrivacyDisclosureSettingsPage/></RequireAuth>}/>
                            <Route path="/settings/privacy/disclosure/digitalocean" element={<RequireAuth><PrivacyDisclosureDigitalOceanPage/></RequireAuth>}/>
                            <Route path="/settings/privacy/disclosure/oauth" element={<RequireAuth><PrivacyDisclosureOAuthPage/></RequireAuth>}/>
                    <Route path="/settings/notifications" element={<RequireAuth><NotificationSettingsPage/></RequireAuth>}/>
                    <Route path="/settings/about" element={<RequireAuth><AboutSettingsPage/></RequireAuth>}/>

                    {/*Authentication*/}
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/signup" element={<SignUpPage/>}/>

                    {/*Verify Email*/}
                    <Route path="/verify/:token" element={<VerifyEmailPage/>}/>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    </AuthProvider>
), document.getElementById("root"));