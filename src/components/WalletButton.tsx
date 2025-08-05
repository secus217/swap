import React, { useEffect } from "react";
import { minimizeAddress } from "../utils.ts";
import { useAccountModal, useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const WalletButton: React.FC = () => {
    const { openConnectModal } = useConnectModal();
    const { openAccountModal } = useAccountModal();
    const { openChainModal } = useChainModal();
    const account = useAccount();

    const getButtonAction = () => {
        if (!account.isConnected) return openConnectModal;
        if (account.chainId !== +import.meta.env.VITE_ASD_CHAIN_ID) return openChainModal;
        return openAccountModal;
    };

    useEffect(() => {
        if (account.isConnected && account.chainId !== +import.meta.env.VITE_ASD_CHAIN_ID) {
            openChainModal?.();
        }
    }, [account, openChainModal]);

    const getButtonText = () => {
        if (!account.isConnected || !account.address) return "Connect Wallet";
        if (account.chainId !== +import.meta.env.VITE_ASD_CHAIN_ID) return "Wrong Network";
        return minimizeAddress(account.address);
    };

    return (
        <button
            className={`cursor-pointer p-2 bg-indigo-500 rounded-full border-t-2 border-r-2 border-l-2 border-b-6 border-black transition duration-300 hover:opacity-90 ${
                account.isConnected && account.chainId !== +import.meta.env.VITE_ASD_CHAIN_ID
                    ? "text-red-500"
                    : "text-black font-semibold"
            }`}
            onClick={getButtonAction()}
        >
            {getButtonText()}
        </button>
    );
};

export default WalletButton;
