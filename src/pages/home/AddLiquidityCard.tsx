import React, {useEffect, useState} from "react";
import {message} from "antd";
import {contractPort} from "../../contracts";
import {TbLink} from "react-icons/tb"
import {formatEther} from "viem";
import CardTitleBar from "./components/CardHeader.tsx";
import {TokenInput} from "./components/TokenInput.tsx";
import {SwapButton} from "./components/SwapButton.tsx";
import {ActionButton} from "./components/ActionButton.tsx";
import {ModalSelectTokens} from "./components/ModalSelectTokens.tsx";
import {useAccount, useBalance} from "wagmi";
import {LuInfo} from "react-icons/lu";
import {FaWallet} from "react-icons/fa";

const tokens = [
    {
        symbol: "CT360",
        name: "CT360",
        address: import.meta.env.VITE_CT360_ADDRESS,
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png",
        isNative: false,
    },
    {
        symbol: "USDT",
        name: "Tether",
        address: import.meta.env.VITE_USDT_ADDRESS,
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png",
        isNative: false,
    },
    {
        symbol: "ASD",
        name: "ASD Token",
        address: import.meta.env.VITE_WASD_ADDRESS,
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png",
        isNative: true,
    }
];

const AddLiquidityCard: React.FC = () => {
    const [tokenA, setTokenA] = useState(tokens[0]);
    const [tokenB, setTokenB] = useState(tokens[1]);
    const [amountA, setAmountA] = useState("");
    const [amountB, setAmountB] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [balances, setBalances] = useState<{ [key: string]: string }>({});
    const [selecting, setSelecting] = useState<"tokenA" | "tokenB">("tokenA");
    const [modalVisible, setModalVisible] = useState(false);
    const account = useAccount();
    const { data: nativeBalance, refetch } = useBalance({ address: account.address });

    const loadBalances = async () => {
        if (!account.isConnected) return;

        setIsLoading(true);
        try {
            const newBalances: { [key: string]: string } = {};
            if (nativeBalance) {
                newBalances["ASD"] = formatEther(nativeBalance.value);
            }
            for (const token of tokens) {
                if (!token.isNative && token.address) {
                    const balance = await contractPort.erc20.getTokenBalance(token.address);
                    newBalances[token.symbol] = formatEther(balance);
                }
            }

            setBalances(newBalances);
        } catch (err) {
            console.error("Error loading balances:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBalances();
    }, [account.isConnected, nativeBalance]);

    const handleTokenSelect = (token: typeof tokens[0]) => {
        if (selecting === "tokenA") {
            if (token.symbol === tokenB.symbol) {
                setTokenB(tokenA);
            }
            setTokenA(token);
        } else {
            if (token.symbol === tokenA.symbol) {
                setTokenA(tokenB);
            }
            setTokenB(token);
        }

        setAmountA("");
        setAmountB("");
        setModalVisible(false);
    };

    const getAvailableTokens = () => {
        const otherToken = selecting === "tokenA" ? tokenB : tokenA;
        return tokens.filter(token => token.symbol !== otherToken.symbol);
    };

    const isNativePair = tokenA.isNative || tokenB.isNative;

    const handleAddLiquidity = async () => {
        if (!amountA || !amountB || Number(amountA) <= 0 || Number(amountB) <= 0) {
            message.error("Please enter valid amounts");
            return;
        }
        if (Number(amountA) > Number(balances[tokenA.symbol] || "0")) {
            message.error(`Insufficient ${tokenA.symbol} balance`);
            return;
        }
        if (Number(amountB) > Number(balances[tokenB.symbol] || "0")) {
            message.error(`Insufficient ${tokenB.symbol} balance`);
            return;
        }
        setIsLoading(true);
        try {
            let txHash: string;

            if (isNativePair) {
                const erc20Token = tokenA.isNative ? tokenB : tokenA;
                const nativeAmount = tokenA.isNative ? amountA : amountB;
                const erc20Amount = tokenA.isNative ? amountB : amountA;

                txHash = await contractPort.pumpFun.addLiquidityASDWithToken(
                    erc20Token.address,
                    erc20Amount,
                    nativeAmount
                );
                refetch()
            } else {
                txHash = await contractPort.pumpFun.addLiquidity(
                    tokenA.address,
                    tokenB.address,
                    amountA,
                    amountB
                );
            }

            message.success(`Liquidity added successfully: ${txHash}`);
            setAmountA("");
            setAmountB("");
            loadBalances();
        } catch (error: any) {
            const msg = error?.message?.toLowerCase();
            if (msg && msg.includes("user rejected")) {
                message.warning("You rejected the transaction.");
            } else {
                message.error(error.message || "Add liquidity failed");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isValidAmount = amountA && amountB &&
        Number(amountA) > 0 && Number(amountB) > 0 &&
        Number(amountA) <= Number(balances[tokenA.symbol] || "0") &&
        Number(amountB) <= Number(balances[tokenB.symbol] || "0");

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900
                       to-slate-900 rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-purple-500/20
                       w-full max-w-xl mx-auto"
        >
            <CardTitleBar
                title="Add Liquidity"
                description={"Earn rewards by providing liquidity"}
                loading={isLoading}
                onRefresh={loadBalances}
                icon={(<TbLink className="text-white text-xl"/>)}
            />

            {/* Token A */}
            <TokenInput
                token={tokenA}
                amount={amountA}
                balance={balances[tokenA.symbol] || "0"}
                onAmountChange={setAmountA}
                onTokenSelect={() => {
                    setSelecting("tokenA");
                    setModalVisible(true);
                }}
                gradient="from-slate-800/50 to-purple-800/30"
                borderColor="border-purple-500/20"
                label={'First Token'}
            />

            <SwapButton
                isLoading={isLoading}
                icon={(<TbLink size={20}/>)}
            />

            {/* Token B */}
            <TokenInput
                token={tokenB}
                amount={amountB}
                balance={balances[tokenB.symbol] || "0"}
                onAmountChange={setAmountB}
                onTokenSelect={() => {
                    setSelecting("tokenB");
                    setModalVisible(true);
                }}
                className="mb-6"
                label={'Second Token'}
            />

            {
                amountA && amountB && (
                    <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-4
                       mb-4 border border-slate-600/30 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-3">
                                <LuInfo  className="text-yellow-400"/>
                            <span className="text-sm font-bold text-yellow-400">Add liquidity Details</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400 font-bold">first token:</span>
                                <span className="text-white font-medium">
                        {amountA} {tokenA.symbol}
                    </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 font-bold">second token:</span>
                                <span className="text-white">
                            {amountB} {tokenB.symbol}
                        </span>
                            </div>
                            <div className="border-t border-white/10 pt-3 text-xs text-white/60">
                                You are depositing <strong>{amountA || "0"} {tokenA.symbol}</strong> and
                                <strong>{amountB || "0"} {tokenB.symbol}</strong> to create liquidity on the exchange.
                            </div>
                        </div>
                    </div>
                )
            }

            <ActionButton
                onClick={handleAddLiquidity}
                loading={isLoading}
                disabled={!isValidAmount}
                loadingText="Adding Liquidity..."
                icon={<FaWallet/>}
            >
                Add Liquidity
            </ActionButton>

            <ModalSelectTokens
                open={modalVisible}
                setOpen={setModalVisible}
                tokens={getAvailableTokens()}
                balances={balances}
                onSelect={handleTokenSelect}
            />
        </div>
    );
};

export default AddLiquidityCard;