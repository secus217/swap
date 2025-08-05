import WalletButton from "./WalletButton.tsx";
import {useNavigate} from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    return (
        <header className="w-full flex items-center justify-between gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-white shadow-lg">
            <div className="flex items-center gap-1 sm:gap-1.5 text-sm sm:text-base md:text-lg font-bold min-w-0">
                <img
                    src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png"
                    alt="PancakeSwap"
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0"
                />
                <span className="truncate cursor-pointer"
                      onClick={() => navigate("/")}
                >
                   Swap
                </span>
            </div>

            <div className="flex-shrink-0">
                <WalletButton />
            </div>
        </header>
    );
};

export default Header;
