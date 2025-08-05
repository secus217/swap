import {
    getAccount,
    readContract,
    waitForTransactionReceipt,
    writeContract
} from "@wagmi/core";
import {wagmiConfig} from "../configs.ts";
import ERC20_ABI from "./abis/erc20.json";
import {formatEther, parseEther} from "viem";
import swapRouter from "./abis/swapRouter.json";

export const contractPort = {
    pumpFun: {
        addLiquidity: async (
            tokenAAddress: string,
            tokenBAddress: string,
            amountA: string,
            amountB: string
        ) => {
            const account = getAccount(wagmiConfig);
            const slippage = 80n; // 80%

            if (!account.isConnected || !account.address) {
                throw new Error('Please connect wallet first');
            }
            if (!tokenAAddress || !tokenBAddress) {
                throw new Error('Invalid token addresses');
            }
            if (tokenAAddress === tokenBAddress) {
                throw new Error('Cannot add liquidity with the same token');
            }

            const ROUTER_ADDRESS = import.meta.env.VITE_ROUTER_CONTRACT_ADDRESS;
            const amountABn = parseEther(amountA);
            const amountBBn = parseEther(amountB);
            const amountAMin = (amountABn * (100n - slippage)) / 100n;
            const amountBMin = (amountBBn * (100n - slippage)) / 100n;

            const tokenAAllowanceRaw = await readContract(wagmiConfig, {
                abi: ERC20_ABI,
                address: tokenAAddress as `0x${string}`,
                functionName: "allowance",
                args: [account.address, ROUTER_ADDRESS],
            }) as bigint;

            if (tokenAAllowanceRaw < amountABn) {
                const approveTokenAHash = await writeContract(wagmiConfig, {
                    abi: ERC20_ABI,
                    address: tokenAAddress as `0x${string}`,
                    functionName: 'approve',
                    args: [ROUTER_ADDRESS, amountABn]
                });
                await waitForTransactionReceipt(wagmiConfig, {hash: approveTokenAHash});
            }
            const tokenBAllowanceRaw = await readContract(wagmiConfig, {
                abi: ERC20_ABI,
                address: tokenBAddress as `0x${string}`,
                functionName: "allowance",
                args: [account.address, ROUTER_ADDRESS],
            }) as bigint;

            if (tokenBAllowanceRaw < amountBBn) {
                const approveTokenBHash = await writeContract(wagmiConfig, {
                    abi: ERC20_ABI,
                    address: tokenBAddress as `0x${string}`,
                    functionName: 'approve',
                    args: [ROUTER_ADDRESS, amountBBn]
                });
                await waitForTransactionReceipt(wagmiConfig, {hash: approveTokenBHash});
            }
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 10);
            const addLiquidityHash = await writeContract(wagmiConfig, {
                abi: swapRouter,
                address: ROUTER_ADDRESS as `0x${string}`,
                functionName: 'addLiquidity',
                args: [
                    tokenAAddress as `0x${string}`,
                    tokenBAddress as `0x${string}`,
                    amountABn,
                    amountBBn,
                    amountAMin,
                    amountBMin,
                    account.address as `0x${string}`,
                    deadline
                ]
            });
            await waitForTransactionReceipt(wagmiConfig, {hash: addLiquidityHash});
            console.log(`Liquidity added successfully: ${addLiquidityHash}`);
            return addLiquidityHash;
        },
        addLiquidityASDWithToken: async (
            tokenAddress: string,
            amountToken: string,
            amountASD: string
        ) => {
            const account = getAccount(wagmiConfig);
            if (!account.isConnected || !account.address) {
                throw new Error('Please connect wallet first');
            }

            const ROUTER_ADDRESS = import.meta.env.VITE_ROUTER_CONTRACT_ADDRESS;
            const amountTokenBn = parseEther(amountToken);
            const amountASDBn = parseEther(amountASD);
            const slippage = 80n;
            const amountTokenMin = (amountTokenBn * (100n - slippage)) / 100n;
            const amountASDMin = (amountASDBn * (100n - slippage)) / 100n;

            // Approve token
            const tokenAllowance = await readContract(wagmiConfig, {
                abi: ERC20_ABI,
                address: tokenAddress as `0x${string}`,
                functionName: "allowance",
                args: [account.address, ROUTER_ADDRESS],
            }) as bigint;

            if (tokenAllowance < amountTokenBn) {
                const approveTx = await writeContract(wagmiConfig, {
                    abi: ERC20_ABI,
                    address: tokenAddress as `0x${string}`,
                    functionName: "approve",
                    args: [ROUTER_ADDRESS, amountTokenBn]
                });
                await waitForTransactionReceipt(wagmiConfig, {hash: approveTx});
            }
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 10);
            const addLiquidityTx = await writeContract(wagmiConfig, {
                abi: swapRouter,
                address: ROUTER_ADDRESS,
                functionName: "addLiquidityETH",
                args: [
                    tokenAddress,
                    amountTokenBn,
                    amountTokenMin,
                    amountASDMin,
                    account.address,
                    deadline
                ],
                value: amountASDBn
            });
            await waitForTransactionReceipt(wagmiConfig, {hash: addLiquidityTx});
            return addLiquidityTx;
        },
        swapExactTokensForTokens: async (fromToken: `0x${string}`,
                     toToken: `0x${string}`,
                     amountIn: number,
                     slippageTolerance: number
        ) => {
            const account = getAccount(wagmiConfig);
            if (!account.isConnected || !account.address) {
                throw new Error('Please connect wallet first');
            }
            const ROUTER_ADDRESS = import.meta.env.VITE_ROUTER_CONTRACT_ADDRESS;
            const amountInBn = parseEther(amountIn.toString());
            const path = [fromToken, toToken];
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 10);

            try {
                const amountsOut = await readContract(wagmiConfig, {
                    abi: swapRouter,
                    address: ROUTER_ADDRESS,
                    functionName: 'getAmountsOut',
                    args: [amountInBn, path]
                }) as bigint[];

                // 2. Tính amount out minimum với slippage tolerance
                const expectedAmountOut = amountsOut[amountsOut.length - 1];
                const amountOutMin = expectedAmountOut * BigInt(Math.floor((100 - slippageTolerance) * 100)) / BigInt(10000);
                const allowanceRaw = await readContract(wagmiConfig, {
                    abi: ERC20_ABI,
                    address: fromToken,
                    functionName: "allowance",
                    args: [account.address, ROUTER_ADDRESS],
                }) as bigint;

                if (allowanceRaw < amountInBn) {
                    const approveHash = await writeContract(wagmiConfig, {
                        abi: ERC20_ABI,
                        address: fromToken,
                        functionName: 'approve',
                        args: [ROUTER_ADDRESS, amountInBn]
                    });
                    await waitForTransactionReceipt(wagmiConfig, {hash: approveHash});
                }

                const swapHash = await writeContract(wagmiConfig, {
                    abi: swapRouter,
                    address: ROUTER_ADDRESS,
                    functionName: 'swapExactTokensForTokens',
                    args: [
                        amountInBn,
                        amountOutMin,
                        path,
                        account.address,
                        deadline
                    ]
                });
                await waitForTransactionReceipt(wagmiConfig, {hash: swapHash});
                return swapHash;
            } catch (error) {
                console.error("Swap error:", error);
                throw error;
            }
        },

        swapExactETHForTokens: async (toToken: `0x${string}`,
                                      amountIn: number,
                                      slippageTolerance: number
        ) => {
            const account = getAccount(wagmiConfig);
            if (!account.isConnected || !account.address) {
                throw new Error('Please connect wallet first');
            }
            const ROUTER_ADDRESS = import.meta.env.VITE_ROUTER_CONTRACT_ADDRESS;
            const WASD = import.meta.env.VITE_WASD_ADDRESS
            const amountInBn = parseEther(amountIn.toString());
            const path = [WASD, toToken];
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 10);

            try {
                const amountsOut = await readContract(wagmiConfig, {
                    abi: swapRouter,
                    address: ROUTER_ADDRESS,
                    functionName: 'getAmountsOut',
                    args: [amountInBn, path]
                }) as bigint[];
                // 2. Tính amount out minimum với slippage tolerance
                const expectedAmountOut = amountsOut[amountsOut.length - 1];
                const amountOutMin = expectedAmountOut * BigInt(Math.floor((100 - slippageTolerance) * 100)) / BigInt(10000);
                const txHash = await writeContract(wagmiConfig, {
                    abi: swapRouter,
                    address: ROUTER_ADDRESS,
                    functionName: 'swapExactETHForTokens',
                    args: [amountOutMin, path, account.address, deadline],
                    value: amountInBn
                });
                await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
                return txHash;
            } catch (error) {
                console.error("Swap error:", error);
                throw error;
            }
        },

        swapExactTokensForETH : async (
            fromToken: `0x${string}`,
            amountIn: number,
            slippageTolerance: number
        ) => {
            const account = getAccount(wagmiConfig);
            if (!account.isConnected || !account.address) throw new Error("Please connect wallet first");

            const amountInBn = parseEther(amountIn.toString());
            const WASD = import.meta.env.VITE_WASD_ADDRESS;
            const ROUTER_ADDRESS = import.meta.env.VITE_ROUTER_CONTRACT_ADDRESS;
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
            const path = [fromToken, WASD];

            const amountsOut = await readContract(wagmiConfig, {
                abi: swapRouter,
                address: ROUTER_ADDRESS,
                functionName: 'getAmountsOut',
                args: [amountInBn, path]
            }) as bigint[];

            const expectedAmountOut = amountsOut[amountsOut.length - 1];
            const amountOutMin = expectedAmountOut * BigInt(10000 - slippageTolerance * 100) / 10000n;

            const allowance = await readContract(wagmiConfig, {
                abi: ERC20_ABI,
                address: fromToken,
                functionName: "allowance",
                args: [account.address, ROUTER_ADDRESS]
            }) as bigint;

            if (allowance < amountInBn) {
                const approveTx = await writeContract(wagmiConfig, {
                    abi: ERC20_ABI,
                    address: fromToken,
                    functionName: "approve",
                    args: [ROUTER_ADDRESS, amountInBn]
                });
                await waitForTransactionReceipt(wagmiConfig, { hash: approveTx });
            }
            const txHash = await writeContract(wagmiConfig, {
                abi: swapRouter,
                address: ROUTER_ADDRESS,
                functionName: 'swapExactTokensForETH',
                args: [amountInBn, amountOutMin, path, account.address, deadline]
            });
            await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
            return txHash;
        },

        getSwapQuote: async (fromToken: string, toToken: string, amountIn: number) => {
            const ROUTER_ADDRESS = import.meta.env.VITE_ROUTER_CONTRACT_ADDRESS;
            const amountInBn = parseEther(amountIn.toString());
            const path = [fromToken, toToken];
            try {
                const amountsOut = await readContract(wagmiConfig, {
                    abi: swapRouter,
                    address: ROUTER_ADDRESS,
                    functionName: 'getAmountsOut',
                    args: [amountInBn, path]
                }) as bigint[];
                const expectedAmountOut = amountsOut[amountsOut.length - 1];
                return {
                    amountIn: formatEther(amountInBn),
                    expectedAmountOut: formatEther(expectedAmountOut),
                    path: path,
                };
            } catch (error) {
                console.error("Get quote error:", error);
                throw error;
            }
        },
    },

    erc20: {
        symbol(address: string): Promise<string> {
            return readContract(wagmiConfig, {
                abi: ERC20_ABI,
                address: address as `0x${string}`,
                functionName: 'symbol'
            }) as Promise<string>
        },
        getTokenBalance: async (tokenAdrress: string) => {
            const account = getAccount(wagmiConfig);
            return await readContract(wagmiConfig, {
                abi: ERC20_ABI,
                address: tokenAdrress as `0x${string}`,
                functionName: 'balanceOf',
                args: [account.address]
            }) as bigint;
        }
    }
}
