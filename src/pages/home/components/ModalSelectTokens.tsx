import {AppModal} from "../../../components";
import {Avatar} from "antd";

interface Token {
    symbol: string;
    name: string;
    address: string;
    logo: string;
    isNative: boolean;
}

interface ModalSelectTokensProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    tokens: Token[];
    balances: { [key: string]: string };
    onSelect: (token: Token) => void;
}

export const ModalSelectTokens: React.FC<ModalSelectTokensProps> = ({
                                                                        open,
                                                                        setOpen,
                                                                        tokens,
                                                                        balances,
                                                                        onSelect,
                                                                    }) => {
    return (
        <AppModal
            title="Select token"
            open={open}
            setOpen={setOpen}
            width={500}
        >
            <div className="max-h-md">
                {tokens.map((token) => (
                    <div
                        key={token.symbol}
                        onClick={() => onSelect(token)}
                        className="flex justify-between items-center p-4 hover:bg-purple-500/20 cursor-pointer rounded-xl
                           transition-all duration-300 transform hover:scale-102 border border-transparent hover:border-purple-500/30"
                    >
                        <div className="flex gap-4 items-center">
                            <Avatar src={token.logo} size={40} className="shadow-lg"/>
                            <div>
                                <div className="text-white font-semibold text-lg">{token.symbol}</div>
                                <div className="text-sm text-gray-400">{token.name}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-white font-medium">
                                {(parseFloat(balances[token.symbol]) || 0).toFixed(4)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AppModal>
    );
};
