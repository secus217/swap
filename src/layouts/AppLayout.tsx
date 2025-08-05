import {Route, Routes} from "react-router-dom";
import {Footer, Header} from "../components";
import { HomePage} from "../pages";
import NotFoundPage from "../pages/404/NotFoundPage.tsx";

const AppLayout: React.FC = () => {

    return (
        <div className="bg-[#160f1e] relative overflow-hidden">
            <div className="relative z-10">
                <Header />
                <div className="min-h-screen">
                    <Routes>
                        <Route index element={<HomePage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </div>
    );
}
export default AppLayout;