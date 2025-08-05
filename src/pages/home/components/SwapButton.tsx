import React from 'react';

interface SwapButtonProps {
    onClick?: () => void;
    isLoading?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

export const SwapButton: React.FC<SwapButtonProps> = ({
                                                          onClick,
                                                          isLoading = false,
                                                          icon,
                                                          className = "-my-2"
                                                      }) => {
    return (
        <div className={`flex justify-center z-20 relative ${className}`}>
            <span
                onClick={onClick ? () => onClick() : undefined}
                className={`w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500 
                          cursor-pointer transition hover:scale-105`}
            >
                <div className={`${isLoading ? 'animate-spin' : ''} text-white`}>
                    {icon}
                </div>
            </span>
        </div>
    );
};
