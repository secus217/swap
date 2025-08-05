import React from 'react';
import {Input, Button, Avatar} from 'antd';

interface TokenInputProps {
    token: {
        symbol: string;
        logo: string;
        address: string;
    };
    amount: string;
    balance: string;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    labelIcon?: React.ReactNode;
    onAmountChange: (value: string) => void;
    onTokenSelect?: () => void;
    gradient?: string;
    borderColor?: string;
    className?: string;
}

export const TokenInput: React.FC<TokenInputProps> = ({
                                                          token,
                                                          amount,
                                                          balance,
                                                          placeholder = "0.0000",
                                                          disabled = false,
                                                          label,
                                                          labelIcon,
                                                          onAmountChange,
                                                          onTokenSelect,
                                                          gradient = "from-slate-800/50 to-purple-800/30",
                                                          borderColor = "border-purple-500/20",
                                                          className = ""
                                                      }) => {
    return (
        <div className={`relative bg-gradient-to-r ${gradient} rounded-2xl p-5 
                        border ${borderColor} backdrop-blur-sm ${className}`}>
            {/* Label and Balance */}
            <div className="flex justify-between text-sm mb-3">
                {label ? (
                    <div className="flex items-center gap-2">
                        <span className="text-purple-300 font-bold">{label}</span>
                        {labelIcon}
                    </div>
                ) : (
                    <div></div>
                )}
                <div className="flex gap-4 items-center text-gray-300 max-[400px]:hidden">
                    <span className="text-xs font-bold">
                         Balance:
                         <span className="text-white font-medium ml-1">
                            {Number(balance).toFixed(4)} {token.symbol}
                         </span>
                    </span>
                </div>
            </div>

            {/* Input and Token Button */}
            <div className="flex gap-2 items-center">
                <Input
                    type="number"
                    size="large"
                    placeholder={placeholder}
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    disabled={disabled}
                    variant="borderless"
                    className="custom-white-input"
                />
                    <Button
                        size="large"
                        className="custom-button"
                        onClick={onTokenSelect}
                    >
                        <Avatar
                            src={token.logo}
                            size={25}
                            className="!w-6 !h-6 !min-w-[1.5rem] !min-h-[1.5rem] rounded-full"
                        />
                        <span>{token.symbol}</span>
                        <span className="ml-1 text-sm opacity-80">▼</span>
                    </Button>
            </div>
        </div>
    );
};