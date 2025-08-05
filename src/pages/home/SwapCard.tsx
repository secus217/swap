import {useState, useEffect} from "react"
import {message} from "antd"
import {LuArrowUpDown, LuTrendingUp, LuDollarSign} from "react-icons/lu";
import {useAccount, useBalance} from "wagmi";
import {contractPort} from "../../contracts";
import {formatEther} from "viem";
import {ModalSelectTokens} from "./components/ModalSelectTokens.tsx";
import CardTitleBar from "./components/CardHeader.tsx";
import {TokenInput} from "./components/TokenInput.tsx";
import {SwapButton} from "./components/SwapButton.tsx";
import {QuoteDetails} from "./components/QuoteDetails.tsx";
import {ActionButton} from "./components/ActionButton.tsx";
import {FaWallet} from "react-icons/fa";

const tokens = [
    {
        symbol: "CT360",
        name: "CT360",
        address: "0xe0913De625481c2FF6d575bE00d1036205c925B2",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png",
        isNative: false,
    },
    {
        symbol: "USDT",
        name: "Tether",
        address: "0x6732D93C835744368930B0dD5633Fe676e207c32",
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
]

const SwapCard: React.FC = () => {
    const [fromToken, setFromToken] = useState(tokens[0])
    const [toToken, setToToken] = useState(tokens[1])
    const [fromAmount, setFromAmount] = useState("")
    const [toAmount, setToAmount] = useState("")
    const [selecting, setSelecting] = useState<"from" | "to">("from")
    const [modalVisible, setModalVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [swapLoading, setSwapLoading] = useState(false)
    const [quote, setQuote] = useState<any>(null)
    const [balances, setBalances] = useState<{ [key: string]: string }>({})
    const [isSwapping, setIsSwapping] = useState(false)
    const [slippageTolerance, setSlippageTolerance] = useState(0.5)

    const account = useAccount()
    const {data: nativeBalance, refetch} = useBalance({address: account.address});

    const loadBalances = async () => {
        setLoading(true)
        try {
            if (account.address) {
                const data: { [key: string]: string } = {}
                if (nativeBalance) {
                    data["ASD"] = formatEther(nativeBalance.value);
                }
                for (const token of tokens) {
                    if (!token.isNative && token.address) {
                        const balance = await contractPort.erc20.getTokenBalance(token.address);
                        data[token.symbol] = formatEther(balance);
                    }
                }
                setBalances(data)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchQuote = async () => {
        if (!fromAmount || parseFloat(fromAmount) <= 0) {
            setToAmount("")
            setQuote(null)
            return
        }

        try {
            const q = await contractPort.pumpFun.getSwapQuote(
                fromToken.address,
                toToken.address,
                parseFloat(fromAmount)
            )

            const expectedOut = Number(q.expectedAmountOut)
            if (!isNaN(expectedOut)) {
                setQuote(q)
                setToAmount(expectedOut.toFixed(4))
            } else {
                setQuote(null)
                setToAmount("")
            }
        } catch (err) {
            console.error("Failed to fetch quote:", err)
            setQuote(null)
            setToAmount("")
        }
    }


    const handleSwap = async () => {
        if (!fromAmount || parseFloat(fromAmount) <= 0) {
            return message.error("Invalid amount");
        }

        const fromBalance = parseFloat(balances[fromToken.symbol] || "0");
        if (parseFloat(fromAmount) > fromBalance) {
            return message.error("Insufficient balance");
        }

        setSwapLoading(true);
        setIsSwapping(true);

        try {
            let txHash: string;

            const isFromNative = fromToken.isNative;
            const isToNative = toToken.isNative;

            if (isFromNative && !isToNative) {
                txHash = await contractPort.pumpFun.swapExactETHForTokens(
                    toToken.address,
                    parseFloat(fromAmount),
                    slippageTolerance
                );
                refetch()

            } else if (!isFromNative && isToNative) {
                txHash = await contractPort.pumpFun.swapExactTokensForETH(
                    fromToken.address,
                    parseFloat(fromAmount),
                    slippageTolerance
                );
                refetch()
            } else if (!isFromNative && !isToNative) {
                txHash = await contractPort.pumpFun.swapExactTokensForTokens(
                    fromToken.address,
                    toToken.address,
                    parseFloat(fromAmount),
                    slippageTolerance
                );
            } else {
                throw new Error("Invalid swap: Cannot swap native to native");
            }

            message.success(`Swap successful! Hash: ${txHash}`);
            setFromAmount("");
            setToAmount("");
            setQuote(null);
            await loadBalances();

        } catch (err: any) {
            const msg = err?.message?.toLowerCase();

            if (msg && msg.includes("user rejected")) {
                message.warning("You rejected the transaction.");
            } else {
                message.error(err.message || "Swap failed");
            }

        } finally {
            setSwapLoading(false);
            setIsSwapping(false);
        }
    };

    const handleTokenSelect = (token: typeof tokens[0]) => {
        if (selecting === "from") {
            if (token.symbol === toToken.symbol) {
                setToToken(fromToken)
            }
            setFromToken(token)
        } else {
            if (token.symbol === fromToken.symbol) {
                setFromToken(toToken)
            }
            setToToken(token)
        }

        setFromAmount("")
        setToAmount("")
        setQuote(null)
        setModalVisible(false)
    }

    const swapPositions = () => {
        setFromToken(toToken)
        setToToken(fromToken)
        setFromAmount(toAmount)
        setToAmount(fromAmount)
    }

    const handleSlippageChange = (newSlippage: number) => {
        setSlippageTolerance(newSlippage)
        message.success(`Slippage tolerance updated to ${newSlippage}%`)
    }

    // Get available tokens for selection (exclude the currently selected token)
    const getAvailableTokensForSelection = () => {
        if (selecting === "from") {
            return tokens.filter(token => token.symbol !== toToken.symbol)
        } else {
            return tokens.filter(token => token.symbol !== fromToken.symbol)
        }
    }

    useEffect(() => {
        loadBalances()
    }, [account.isConnected, nativeBalance])

    useEffect(() => {
        const timer = setTimeout(fetchQuote, 500)
        return () => clearTimeout(timer)
    }, [fromAmount, fromToken, toToken])

    const expectedOut = Number(quote?.expectedAmountOut)

    return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 
                       to-slate-900 rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-purple-500/20 
                       w-full max-w-xl mx-auto ${!isNaN(expectedOut) && expectedOut > 0 && "mb-6"}`}
        >

            <div className="relative z-10">
                <CardTitleBar
                    title="Token Swap"
                    description="Trade tokens instantly"
                    loading={loading}
                    onRefresh={loadBalances}
                    slippageTolerance={slippageTolerance}
                    onSlippageChange={handleSlippageChange}
                />

                {/* From Token */}
                <TokenInput
                    token={fromToken}
                    amount={fromAmount}
                    balance={balances[fromToken.symbol] || "0"}
                    label="From"
                    labelIcon={<LuTrendingUp className="text-purple-400"/>}
                    onAmountChange={setFromAmount}
                    onTokenSelect={() => {
                        setSelecting("from");
                        setModalVisible(true);
                    }}
                    gradient="from-slate-800/50 to-purple-800/30"
                    borderColor="border-purple-500/20"
                />

                {/* Swap Button */}
                <SwapButton
                    onClick={swapPositions}
                    isLoading={isSwapping}
                    icon={(<LuArrowUpDown size={20}/>)}
                />

                {/* To Token */}
                <TokenInput
                    token={toToken}
                    amount={toAmount}
                    balance={balances[toToken.symbol] || "0"}
                    label="To"
                    labelIcon={<LuDollarSign className="text-blue-400"/>}
                    onAmountChange={() => {
                    }}
                    onTokenSelect={() => {
                        setSelecting("to");
                        setModalVisible(true);
                    }}
                    disabled={true}
                    gradient="from-slate-800/50 to-blue-800/30"
                    borderColor="border-blue-500/20"
                    className="mb-4 sm:mb-6"
                />

                {!isNaN(expectedOut) && expectedOut > 0 && (
                    <QuoteDetails
                        expectedOutput={expectedOut}
                        toTokenSymbol={toToken.symbol}
                        slippageTolerance={slippageTolerance}
                        minAmountOut={expectedOut * (1 - slippageTolerance / 100)}
                    />
                )}

                <ActionButton
                    onClick={handleSwap}
                    loading={swapLoading}
                    disabled={!fromAmount || parseFloat(fromAmount) <= 0}
                    loadingText="Processing Swap..."
                    icon={<FaWallet/>}
                >
                    Swap Tokens
                </ActionButton>
            </div>

            {/* Token Selection Modal */}
            <ModalSelectTokens
                open={modalVisible}
                setOpen={setModalVisible}
                tokens={getAvailableTokensForSelection()}
                balances={balances}
                onSelect={handleTokenSelect}
            />
        </div>
    )
}

export default SwapCard