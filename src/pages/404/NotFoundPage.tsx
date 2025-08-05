import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white relative">
            <div className="z-10 text-center">
                <h1 className="text-[100px] font-bold  text-indigo-500 leading-none">
                    404
                </h1>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Oops, page not found.
                </h2>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-indigo-500 hover:brightness-110 rounded-full text-white font-bold text-lg transition"
                >
                    Back to home page
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
